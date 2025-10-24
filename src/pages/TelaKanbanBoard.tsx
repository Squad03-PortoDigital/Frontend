import React, { useEffect, useState } from "react";
import "./TelaKanbanBoard.css";
import { Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../services/api";
import logoFlap from "../images/Logo-azul-FLAP 1.png";

// ✅ EXPORTAR O TIPO
export type StatusTarefa = "A_FAZER" | "EM_PROGRESSO" | "EM_REVISAO" | "CONCLUIDA" | string;

// ✅ EXPORTAR A CONSTANTE
export const COLUMNS = [
  { id: 1, status: "A_FAZER" as StatusTarefa, title: "To Do" },
  { id: 2, status: "EM_PROGRESSO" as StatusTarefa, title: "In Progress" },
  { id: 3, status: "EM_REVISAO" as StatusTarefa, title: "Review" },
  { id: 4, status: "CONCLUIDA" as StatusTarefa, title: "Closed" },
];

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

const prioridadeCores: { [key: string]: string } = {
  BAIXA: "green",
  MEDIA: "yellow",
  ALTA: "orange",
  CRITICA: "red",
};

export default function TelaKanbanBoard() {
  const [tarefas, setTarefas] = useState<TarefaDTO[]>([]);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [statusSelecionado, setStatusSelecionado] = useState<StatusTarefa | null>(null);
  const [boards, setBoards] = useState([
    { id: 1, status: "A_FAZER" as StatusTarefa, label: "To Do", isDeletable: false },
    { id: 2, status: "EM_PROGRESSO" as StatusTarefa, label: "In Progress", isDeletable: false },
    { id: 3, status: "EM_REVISAO" as StatusTarefa, label: "Review", isDeletable: false },
    { id: 4, status: "CONCLUIDA" as StatusTarefa, label: "Closed", isDeletable: false },
  ]);
  const [editingBoardId, setEditingBoardId] = useState<number | null>(null);
  const navigate = useNavigate();

  const getSaudacao = () => {
    const agora = new Date();
    const horaBrasilia = agora.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "numeric", hour12: false });
    const hora = parseInt(horaBrasilia);

    if (hora >= 5 && hora < 12) return "Bom dia";
    if (hora >= 12 && hora < 18) return "Boa tarde";
    return "Boa noite";
  };

  useEffect(() => {
    const carregarTarefas = async () => {
      try {
        const res = await api.get<TarefaDTO[]>("/tarefas");
        setTarefas(res.data);
      } catch {
        console.warn("Falha ao buscar tarefas. Usando mock local.");
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
      posicao: tarefas.filter((t) => t.status === statusSelecionado).length,
      tags: [],
      empresa: "Nova Empresa",
    };

    try {
      const res = await api.post<TarefaDTO>("/tarefas", novaTarefa);
      setTarefas((prev) => [...prev, res.data]);
      navigate(`/detalhamento/${res.data.id}`);
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
      alert("Erro ao adicionar tarefa.");
    } finally {
      setNovoTitulo("");
      setStatusSelecionado(null);
    }
  };

  const adicionarBoard = () => {
    const novoBoard = {
      id: Date.now(),
      status: `CUSTOM_${boards.length + 1}`,
      label: "Novo board",
      isDeletable: true,
    };
    setBoards((prev) => [...prev, novoBoard]);
  };

  const deletarBoard = (boardId: number, boardLabel: string) => {
    const tarefasNoBoard = tarefas.filter(t => {
      const board = boards.find(b => b.id === boardId);
      return board && t.status === board.status;
    });

    if (tarefasNoBoard.length > 0) {
      alert(`Não é possível deletar o board "${boardLabel}" pois ele contém ${tarefasNoBoard.length} tarefa(s).`);
      return;
    }

    const confirmar = window.confirm(
      `Tem certeza que deseja deletar o board "${boardLabel}"?`
    );

    if (confirmar) {
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
    }
  };

  const onDragEnd = async (result: any) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const tarefaId = Number(draggableId);
    const tarefa = tarefas.find((t) => t.id === tarefaId);
    if (!tarefa) return;

    const novoStatus = destination.droppableId as StatusTarefa;
    const tarefasAtualizadas = tarefas.map((t) =>
      t.id === tarefaId ? { ...t, status: novoStatus } : t
    );
    setTarefas(tarefasAtualizadas);

    try {
      await api.patch(`/tarefas/${tarefaId}/mover`, {
        status: novoStatus,
        posicao: destination.index
      });
    } catch {
      console.error("Erro ao atualizar status da tarefa");
    }
  };

  const abrirDetalhamento = (tarefa: TarefaDTO) => {
    navigate(`/detalhamento/${tarefa.id}`);
  };

  return (
    <div className="kanban-wrapper">
      <div className="kanban-top">
        <div className="kanban-card-top">
          <h3>Tarefas perto do vencimento:</h3>
          <div className="kanban-number">
            {tarefas.filter((t) => t.dtEntrega && new Date(t.dtEntrega) < new Date()).length}
          </div>
        </div>
        <div className="kanban-card-top">
          <h3>Tarefas totais:</h3>
          <div className="kanban-number">{tarefas.length}</div>
        </div>
        <div className="kanban-card-top kanban-card-welcome">
          <div className="welcome-content">
            <div className="welcome-text">
              <h3>{getSaudacao()}, User!</h3>
              <p>
                Você tem {tarefas.filter((t) => t.status !== "CONCLUIDA").length} tarefas pendentes.
              </p>
            </div>
            <img src={logoFlap} alt="FLAP Logo" className="flap-logo" />
          </div>
          <div className="kanban-actions">
            <button className="filter-btn">
              <span>☰</span> Filtrar
            </button>
            <button className="new-board-btn" onClick={adicionarBoard}>
              <Plus size={18} /> Novo board
            </button>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-columns">
          {boards.map((board) => (
            <Droppable droppableId={board.status} key={board.id}>
              {(provided) => (
                <div className="kanban-column" ref={provided.innerRef} {...provided.droppableProps}>
                  <div className="kanban-column-header">
                    {editingBoardId === board.id ? (
                      <input
                        type="text"
                        value={board.label}
                        onChange={(e) => {
                          const novoLabel = e.target.value;
                          setBoards((prev) =>
                            prev.map((b) =>
                              b.id === board.id ? { ...b, label: novoLabel } : b
                            )
                          );
                        }}
                        onBlur={() => setEditingBoardId(null)}
                        autoFocus
                      />
                    ) : (
                      <h4 onDoubleClick={() => setEditingBoardId(board.id)}>{board.label}</h4>
                    )}

                    <div className="column-header-actions">
                      <div
                        className="column-icons"
                        onClick={() => setStatusSelecionado(board.status as StatusTarefa)}
                      >
                        <Plus size={16} />
                      </div>

                      {board.isDeletable && (
                        <div
                          className="column-icons delete-icon"
                          onClick={() => deletarBoard(board.id, board.label)}
                        >
                          <Trash2 size={16} />
                        </div>
                      )}
                    </div>
                  </div>

                  {statusSelecionado === board.status && (
                    <div className="nova-tarefa">
                      <input
                        type="text"
                        value={novoTitulo}
                        placeholder="Nova tarefa..."
                        onChange={(e) => setNovoTitulo(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && adicionarTarefa()}
                      />
                      <button className="new-board-btn" onClick={adicionarTarefa}>
                        Adicionar
                      </button>
                    </div>
                  )}

                  {tarefas
                    .filter((t) => t.status === board.status)
                    .sort((a, b) => a.posicao - b.posicao)
                    .map((tarefa, index) => (
                      <Draggable draggableId={tarefa.id.toString()} index={index} key={tarefa.id}>
                        {(provided) => (
                          <div
                            className="kanban-card"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => abrirDetalhamento(tarefa)}
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
                                  ? new Date(tarefa.dtEntrega).toLocaleDateString("pt-BR")
                                  : "Sem prazo"}
                              </span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

const mockTarefas: TarefaDTO[] = [
  {
    id: 1,
    titulo: "Campanha Internet Fibra 500 Mega",
    status: "A_FAZER",
    prioridade: "MEDIA",
    posicao: 0,
    tags: ["RA", "HG"],
    dtEntrega: "2025-10-18",
    empresa: "Netiz",
  },
  {
    id: 2,
    titulo: "Anúncio Google Ads",
    status: "EM_PROGRESSO",
    prioridade: "ALTA",
    posicao: 1,
    tags: ["KT", "HG"],
    dtEntrega: "2025-10-20",
    empresa: "Celi",
  },
];
