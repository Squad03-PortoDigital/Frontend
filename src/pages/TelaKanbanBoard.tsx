import React, { useEffect, useState } from "react";
import "./TelaKanbanBoard.css";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

type StatusTarefa = "A_FAZER" | "EM_PROGRESSO" | "EM_REVISAO" | "CONCLUIDA";

interface TarefaDTO {
  id: number;
  titulo: string;
  status: StatusTarefa;
  prioridade: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
  posicao: number;
  tags: string[];
  dtEntrega?: string;
  empresa: string;
}

const API_URL = "http://localhost:8080/api/tarefas";

const mockTarefas: TarefaDTO[] = [
  {
    id: 1,
    titulo: "Criar campanha “Internet Fibra 500 Mega”",
    status: "A_FAZER",
    prioridade: "MEDIA",
    posicao: 0,
    tags: ["RA", "HG", "LM", "NL"],
    dtEntrega: "2025-10-16",
    empresa: "Netiz",
  },
  {
    id: 2,
    titulo: "Redigir texto para anúncio no Google Ads",
    status: "EM_PROGRESSO",
    prioridade: "CRITICA",
    posicao: 0,
    tags: ["HG", "LM", "NL"],
    dtEntrega: "2025-10-08",
    empresa: "Celi",
  },
  {
    id: 3,
    titulo: "Aprovar layout de banner institucional",
    status: "EM_REVISAO",
    prioridade: "ALTA",
    posicao: 0,
    tags: ["KT", "LM"],
    dtEntrega: "2025-10-10",
    empresa: "Casa Alemã",
  },
  {
    id: 4,
    titulo: "Campanha “Aniversário da Cidade” finalizada",
    status: "CONCLUIDA",
    prioridade: "BAIXA",
    posicao: 0,
    tags: ["RA", "HG"],
    dtEntrega: "2025-10-01",
    empresa: "Celi",
  },
  {
    id: 5,
    titulo: "Planejar campanha de Black Friday",
    status: "A_FAZER",
    prioridade: "ALTA",
    posicao: 1,
    tags: ["RA", "KT"],
    dtEntrega: "2025-10-25",
    empresa: "Netiz",
  },
  {
    id: 6,
    titulo: "Escrever roteiro para vídeo institucional",
    status: "EM_PROGRESSO",
    prioridade: "MEDIA",
    posicao: 1,
    tags: ["LM", "IP"],
    dtEntrega: "2025-10-15",
    empresa: "Celi",
  },
  {
    id: 7,
    titulo: "Revisar conteúdo do blog sobre segurança digital",
    status: "EM_REVISAO",
    prioridade: "BAIXA",
    posicao: 1,
    tags: ["HG", "NL"],
    dtEntrega: "2025-10-12",
    empresa: "Casa Alemã",
  },
  {
    id: 8,
    titulo: "Finalizar artes para campanha de outubro",
    status: "CONCLUIDA",
    prioridade: "MEDIA",
    posicao: 1,
    tags: ["RA", "KT"],
    dtEntrega: "2025-10-05",
    empresa: "Netiz",
  },
  {
    id: 9,
    titulo: "Definir estratégia de mídia paga para novembro",
    status: "A_FAZER",
    prioridade: "CRITICA",
    posicao: 2,
    tags: ["IP", "LM"],
    dtEntrega: "2025-10-20",
    empresa: "Celi",
  },
  {
    id: 10,
    titulo: "Ajustar layout da página de planos",
    status: "EM_PROGRESSO",
    prioridade: "ALTA",
    posicao: 2,
    tags: ["KT", "HG"],
    dtEntrega: "2025-10-18",
    empresa: "Casa Alemã",
  },
  {
    id: 11,
    titulo: "Revisar texto de campanha de fidelidade",
    status: "EM_REVISAO",
    prioridade: "MEDIA",
    posicao: 2,
    tags: ["RA", "NL"],
    dtEntrega: "2025-10-11",
    empresa: "Netiz",
  },
  {
    id: 12,
    titulo: "Publicar post sobre cobertura em Alagoas",
    status: "CONCLUIDA",
    prioridade: "BAIXA",
    posicao: 2,
    tags: ["LM", "IP"],
    dtEntrega: "2025-10-06",
    empresa: "Celi",
  },
];

const statusLabels: { [key in StatusTarefa]: string } = {
  A_FAZER: "To Do",
  EM_PROGRESSO: "In Progress",
  EM_REVISAO: "Review",
  CONCLUIDA: "Closed",
};

const prioridadeCores: { [key: string]: string } = {
  BAIXA: "green",
  MEDIA: "yellow",
  ALTA: "orange",
  CRITICA: "red",
};

const TelaKanbanBoard: React.FC = () => {
  const [tarefas, setTarefas] = useState<TarefaDTO[]>([]);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [statusSelecionado, setStatusSelecionado] = useState<StatusTarefa | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const carregarTarefas = async () => {
      try {
        const res = await fetch(API_URL);
        const tarefasApi: TarefaDTO[] = await res.json();
        setTarefas([...mockTarefas, ...tarefasApi]);
      } catch {
        setTarefas(mockTarefas);
      }
    };
    carregarTarefas();
  }, []);

  const adicionarTarefa = async () => {
    if (!statusSelecionado || !novoTitulo.trim()) return;

    const novaTarefa = {
      titulo: novoTitulo,
      status: statusSelecionado,
      prioridade: "MEDIA",
      posicao: tarefas.filter(t => t.status === statusSelecionado).length,
      tags: [],
      empresa: "Nova Empresa",
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaTarefa),
      });
      const tarefaCriada: TarefaDTO = await res.json();
      setTarefas(prev => [...prev, tarefaCriada]);
      setNovoTitulo("");
      setStatusSelecionado(null);
    } catch {
      alert("Erro ao adicionar tarefa.");
    }
  };

  // 🚀 Drag-and-drop seguro
  const onDragEnd = (result: any) => {
    const destination = result.destination;
    const draggableId = result.draggableId;

    if (!destination) return;

    const tarefaArrastada = tarefas.find(t => t.id === Number(draggableId));
    if (!tarefaArrastada) return;

    const novasTarefas = tarefas.map(t =>
      t.id === tarefaArrastada.id
        ? { ...t, status: destination.droppableId as StatusTarefa }
        : t
    );

    setTarefas(novasTarefas);
  };

  return (
    <div className="kanban-wrapper">
      <div className="kanban-top">
        <div className="kanban-card-top">
          <h3>Tarefas perto do vencimento:</h3>
          <div className="kanban-number">8</div>
        </div>
        <div className="kanban-card-top">
          <h3>Comentários Recentes:</h3>
          <div className="kanban-number">16</div>
        </div>
        <div className="kanban-card-top">
          <h3>Eventos Próximos:</h3>
          <div className="kanban-number">1</div>
        </div>
        <div className="kanban-card-top">
          <h3>Boa Noite, Hugo!</h3>
          <p>Você tem 2 tarefas para concluir e 1 próxima do prazo de entrega.</p>
          <div className="kanban-actions">
            <button className="filter-btn">Filtrar</button>
            <button className="new-board-btn">+ Novo board</button>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-columns">
          {Object.entries(statusLabels).map(([status, label]) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  className="kanban-column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <div className="kanban-column-header">
                    <h4>{label}</h4>
                    <div
                      className="column-icons"
                      onClick={() =>
                        setStatusSelecionado(status as StatusTarefa)
                      }
                    >
                      <Plus size={16} />
                    </div>
                  </div>

                  {tarefas
                    .filter((t) => t.status === status)
                    .map((tarefa, index) => (
                      <Draggable
                        draggableId={tarefa.id.toString()}
                        index={index}
                        key={tarefa.id}
                      >
                        {(provided) => (
                          <div
                            className="kanban-card"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              if (tarefa.id === 1) {
                                navigate("/detalhamento", {
                                  state: { tarefa },
                                });
                              }
                            }}
                          >
                            <div className="kanban-dots">
                              {[...Array(3)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`dot ${prioridadeCores[tarefa.prioridade]}`}
                                ></div>
                              ))}
                            </div>
                            <div className="kanban-text">{tarefa.titulo}</div>
                            <div className="kanban-tags">
                              {tarefa.tags.map((tag) => (
                                <span className="tag" key={tag}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="kanban-footer">
                              <span>{tarefa.empresa}</span>
                              <span>
                                {tarefa.dtEntrega
                                  ? new Date(
                                      tarefa.dtEntrega
                                    ).toLocaleDateString("pt-BR")
                                  : "Sem prazo"}
                              </span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}

                  {statusSelecionado === status && (
                    <div style={{ marginTop: "12px" }}>
                      <input
                        type="text"
                        placeholder="Nova tarefa..."
                        value={novoTitulo}
                        onChange={(e) => setNovoTitulo(e.target.value)}
                        style={{
                          padding: "6px",
                          width: "100%",
                          marginBottom: "8px",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                        }}
                      />
                      <button className="new-board-btn" onClick={adicionarTarefa}>
                        Adicionar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default TelaKanbanBoard;




/*{
  id: 1,
  titulo: "Criar campanha “Internet Fibra 500 Mega”",
  status: "A_FAZER",
  prioridade: "MEDIA",
  posicao: 0,
  tags: ["RA", "HG", "LM", "NL"],
  dtEntrega: "2025-10-16",
  empresa: "Netiz",
},
{
  id: 2,
  titulo: "Redigir texto para anúncio no Google Ads",
  status: "EM_PROGRESSO",
  prioridade: "CRITICA",
  posicao: 0,
  tags: ["HG", "LM", "NL"],
  dtEntrega: "2025-10-08",
  empresa: "Celi",
},
{
  id: 3,
  titulo: "Aprovar layout de banner institucional",
  status: "EM_REVISAO",
  prioridade: "ALTA",
  posicao: 0,
  tags: ["KT", "LM"],
  dtEntrega: "2025-10-10",
  empresa: "Casa Alemã",
},
{
  id: 4,
  titulo: "Campanha “Aniversário da Cidade” finalizada",
  status: "CONCLUIDA",
  prioridade: "BAIXA",
  posicao: 0,
  tags: ["RA", "HG"],
  dtEntrega: "2025-10-01",
  empresa: "Celi",
},
{
  id: 5,
  titulo: "Planejar campanha de Black Friday",
  status: "A_FAZER",
  prioridade: "ALTA",
  posicao: 1,
  tags: ["RA", "KT"],
  dtEntrega: "2025-10-25",
  empresa: "Netiz",
},
{
  id: 6,
  titulo: "Escrever roteiro para vídeo institucional",
  status: "EM_PROGRESSO",
  prioridade: "MEDIA",
  posicao: 1,
  tags: ["LM", "IP"],
  dtEntrega: "2025-10-15",
  empresa: "Celi",
},
{
  id: 7,
  titulo: "Revisar conteúdo do blog sobre segurança digital",
  status: "EM_REVISAO",
  prioridade: "BAIXA",
  posicao: 1,
  tags: ["HG", "NL"],
  dtEntrega: "2025-10-12",
  empresa: "Casa Alemã",
},
{
  id: 8,
  titulo: "Finalizar artes para campanha de outubro",
  status: "CONCLUIDA",
  prioridade: "MEDIA",
  posicao: 1,
  tags: ["RA", "KT"],
  dtEntrega: "2025-10-05",
  empresa: "Netiz",
},
{
  id: 9,
  titulo: "Definir estratégia de mídia paga para novembro",
  status: "A_FAZER",
  prioridade: "CRITICA",
  posicao: 2,
  tags: ["IP", "LM"],
  dtEntrega: "2025-10-20",
  empresa: "Celi",
},
{
  id: 10,
  titulo: "Ajustar layout da página de planos",
  status: "EM_PROGRESSO",
  prioridade: "ALTA",
  posicao: 2,
  tags: ["KT", "HG"],
  dtEntrega: "2025-10-18",
  empresa: "Casa Alemã",
},
{
  id: 11,
  titulo: "Revisar texto de campanha de fidelidade",
  status: "EM_REVISAO",
  prioridade: "MEDIA",
  posicao: 2,
  tags: ["RA", "NL"],
  dtEntrega: "2025-10-11",
  empresa: "Netiz",
},
{
  id: 12,
  titulo: "Publicar post sobre cobertura em Alagoas",
  status: "CONCLUIDA",
  prioridade: "BAIXA",
  posicao: 2,
  tags: ["LM", "IP"],
  dtEntrega: "2025-10-06",
  empresa: "Celi",
}, */