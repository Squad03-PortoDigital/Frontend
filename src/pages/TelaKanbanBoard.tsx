import React, { useEffect, useState } from "react";
import "./TelaKanbanBoard.css";
import { Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../services/api";
import logoFlap from "../images/Logo-azul-FLAP 1.png";
import FiltroModal, { type FiltrosAtivos } from "./FiltroModal";
import { Toast } from "./Toast"; 

export type StatusTarefa = string;

interface Membro {
  id: number;
  nome: string;
  username: string;
}

interface TarefaDTO {
  id: number;
  titulo: string;
  status: StatusTarefa;
  prioridade: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
  posicao: number;
  tags: string[];
  dtEntrega?: string;
  empresa: string;
  empresaId?: number;
  membroIds?: number[];
  listaId?: number;
}

interface Empresa {
  id: number;
  nome: string;
}

interface Lista {
  id: number;
  nome: string;
  posicao: number;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning';
  show: boolean;
}

const prioridadeCores: { [key: string]: string } = {
  BAIXA: "green",
  MEDIA: "yellow",
  ALTA: "orange",
  CRITICA: "red",
};

export default function TelaKanbanBoard() {
  const [tarefas, setTarefas] = useState<TarefaDTO[]>([]);
  const [tarefasPorLista, setTarefasPorLista] = useState<{ [listaId: number]: TarefaDTO[] }>({});
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [listas, setListas] = useState<Lista[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [empresaSelecionada, setEmpresaSelecionada] = useState<number | null>(null);
  const [listaSelecionada, setListaSelecionada] = useState<number | null>(null);
  const [statusSelecionado, setStatusSelecionado] = useState<StatusTarefa | null>(null);
  const [editingBoardId, setEditingBoardId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltrosAtivos>({
    membros: [],
    empresas: [],
  });
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', show: false });
  const navigate = useNavigate();

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ message, type, show: true });
  };

  const getSaudacao = () => {
    const agora = new Date();
    const horaBrasilia = agora.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "numeric",
      hour12: false
    });
    const hora = parseInt(horaBrasilia);
    if (hora >= 5 && hora < 12) return "Bom dia";
    if (hora >= 12 && hora < 18) return "Boa tarde";
    return "Boa noite";
  };

  // Carregamento inicial: todas tarefas (para estatística), todas listas
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const auth = localStorage.getItem("auth");
        const headers = { headers: { Authorization: `Basic ${auth}` }, withCredentials: true };

        const [tarefasRes, empresasRes, listasRes, membrosRes] = await Promise.all([
          api.get("/tarefas", headers),
          api.get("/empresas", headers),
          api.get("/listas", headers),
          api.get("/usuarios", headers),
        ]);

        setTarefas(Array.isArray(tarefasRes.data) ? tarefasRes.data : []);
        setEmpresas(Array.isArray(empresasRes.data) ? empresasRes.data : []);
        if (Array.isArray(empresasRes.data) && empresasRes.data.length > 0)
          setEmpresaSelecionada(empresasRes.data[0].id);

        setListas(Array.isArray(listasRes.data) ? listasRes.data : []);
        if (Array.isArray(listasRes.data) && listasRes.data.length > 0)
          setListaSelecionada(listasRes.data[0].id);

        setMembros(Array.isArray(membrosRes.data) ? membrosRes.data : []);

        // Carrega tarefas de cada board para exibição separada (por lista)
        if (Array.isArray(listasRes.data)) {
          const tarefasBoard: { [listaId: number]: TarefaDTO[] } = {};
          await Promise.all(listasRes.data.map(async (lista: Lista) => {
            try {
              // Rota de busca correta para tarefas por lista
              const res = await api.get(`/tarefas/lista/${lista.id}`, headers);
              tarefasBoard[lista.id] = res.data;
            } catch (e) {
              tarefasBoard[lista.id] = [];
            }
          }));
          setTarefasPorLista(tarefasBoard);
        }
      } catch (error: any) {
        setTarefas([]);
        setListas([]);
        setEmpresas([]);
        setMembros([]);
        setTarefasPorLista({});
        if (error.response?.status === 401) {
          showToast("Sessão expirada. Faça login novamente.", "error");
          localStorage.removeItem("auth");
          localStorage.removeItem("usuario");
          setTimeout(() => navigate("/login", { replace: true }), 1500);
        } else {
          showToast("Erro ao carregar dados.", "error");
        }
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, [navigate]);

  const aplicarFiltros = (filtros: FiltrosAtivos) => {
    setFiltrosAtivos(filtros);
  };

  const boards = listas.map((lista) => ({
    id: lista.id,
    status: `CUSTOM_${lista.id}`,
    label: lista.nome,
    isDeletable: true,
  }));

  // Sempre recarrega tarefas da lista específica após alteração em board/tarefa
  const recarregarTarefasLista = async (listaId: number) => {
    try {
      const auth = localStorage.getItem("auth");
      // Usa a rota correta para listar por lista
      const res = await api.get(`/tarefas/lista/${listaId}`, {
        headers: { Authorization: `Basic ${auth}` }, withCredentials: true,
      });
      setTarefasPorLista(prev => ({
        ...prev,
        [listaId]: res.data,
      }));
      
      const todasTarefasRes = await api.get("/tarefas", {
        headers: { Authorization: `Basic ${auth}` }, withCredentials: true,
      });
      setTarefas(Array.isArray(todasTarefasRes.data) ? todasTarefasRes.data : []);
    } catch (e) {}
  };

  const adicionarBoard = async () => {
    try {
      const auth = localStorage.getItem("auth");
      const novoNome = "Novo board";
      const novaPosicao = listas.length + 1;
      const res = await api.post("/listas", { nome: novoNome, posicao: novaPosicao, cor: "#ccc" }, { // Adicionando cor padrão para evitar null
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
        withCredentials: true,
      });
      setListas((prev) => [...prev, res.data]);
      setListaSelecionada(res.data.id);
      showToast("Board criado!", "success");
      await recarregarTarefasLista(res.data.id);
    } catch (error) {
      showToast("Erro ao criar board.", "error");
    }
  };

  const editarBoard = async (listaId: number, novoNome: string) => {
    try {
      const auth = localStorage.getItem("auth");
      // Necessário enviar todos os campos obrigatórios do DTO de atualização
      const listaAtual = listas.find(l => l.id === listaId);
      if (!listaAtual) return;

      await api.put(`/listas/${listaId}`, { nome: novoNome, posicao: listaAtual.posicao, cor: listaAtual.cor }, {
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
        withCredentials: true,
      });
      setListas((prev) => prev.map(l => l.id === listaId ? { ...l, nome: novoNome } : l));
      showToast("Board editado!", "success");
    } catch (error) {
      showToast("Erro ao editar board.", "error");
    }
  };

  const deletarBoard = async (listaId: number, listaNome: string) => {
    const tarefasNoBoard = tarefasPorLista[listaId] || [];
    if (tarefasNoBoard.length > 0) {
      showToast(
        `Não é possível deletar o board "${listaNome}" pois ele contém ${tarefasNoBoard.length} tarefa(s).`,
        "warning"
      );
      return;
    }
    const confirmar = window.confirm(`Tem certeza que deseja deletar o board "${listaNome}"?`);
    if (!confirmar) return;

    try {
      const auth = localStorage.getItem("auth");
      await api.delete(`/listas/${listaId}`, {
        headers: { Authorization: `Basic ${auth}` },
        withCredentials: true,
      });
      setListas((prev) => prev.filter((l) => l.id !== listaId));
      showToast("Board deletado!", "success");
    } catch (error) {
      showToast("Erro ao deletar board.", "error");
    }
  };

  const adicionarTarefa = async () => {
    if (!listaSelecionada || !novoTitulo.trim()) {
      showToast("Digite o título da tarefa!", "warning");
      return;
    }
    if (empresas.length === 0) {
      showToast("Cadastre pelo menos uma empresa antes de criar tarefas!", "warning");
      setTimeout(() => navigate("/ajustes"), 1500);
      return;
    }
    if (!empresaSelecionada) {
      showToast("Selecione uma empresa para a tarefa!", "warning");
      return;
    }
    if (listas.length === 0) {
      showToast("Nenhuma lista disponível. Contate o administrador.", "error");
      return;
    }

    // Enviamos apenas o essencial. Backend calcula status/posicao.
    const novaTarefa = {
      titulo: novoTitulo,
      empresaId: empresaSelecionada,
      listaId: listaSelecionada,
      prioridade: "MEDIA", // Valor default para a prioridade
    };

    try {
      const auth = localStorage.getItem("auth");
      const res = await api.post<TarefaDTO>("/tarefas", novaTarefa, {
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
        withCredentials: true,
      });
      setNovoTitulo("");
      setStatusSelecionado(null);
      showToast("Tarefa criada com sucesso!", "success");
      await recarregarTarefasLista(listaSelecionada);
      setTimeout(() => navigate(`/detalhamento/${res.data.id}`), 800);
    } catch (error: any) {
      showToast("Erro ao adicionar tarefa. Tente novamente.", "error");
    }
  };

  // DnD: Após mover, recarrega só as duas listas envolvidas (origem e destino)
  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
      
    const tarefaId = Number(draggableId);
    const novoListaId = Number(destination.droppableId.replace("CUSTOM_", ""));

    const tarefasDestino = (tarefasPorLista[novoListaId] || []).filter((tarefa) => {
    // Filtra igual à renderização
    const passaFiltroEmpresa =
      filtrosAtivos.empresas.length === 0 ||
      (tarefa.empresaId && filtrosAtivos.empresas.includes(tarefa.empresaId));
    const passaFiltroMembro =
      filtrosAtivos.membros.length === 0 ||
      (tarefa.membroIds && tarefa.membroIds.some((id: number) => filtrosAtivos.membros.includes(id)));
    return passaFiltroEmpresa && passaFiltroMembro;
    }).sort((a, b) => a.posicao - b.posicao);

    const anterior = tarefasDestino[destination.index - 1] || null;
    const posterior = tarefasDestino[destination.index + 1] || null;
    const posicaoVizinhoAnterior = anterior ? anterior.posicao : null;
    const posicaoVizinhoPosterior = posterior ? posterior.posicao : null;

    try {
      const auth = localStorage.getItem("auth");
      
      await api.patch( 
        `/tarefas/${tarefaId}/mover`, 
        { 
          posicaoVizinhoAnterior,
          posicaoVizinhoPosterior,
          novoListaId },
        {
          headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      showToast("Tarefa movida com sucesso!", "success");
      await recarregarTarefasLista(novoListaId);
      
      // Recarrega a lista de origem
      if (source.droppableId !== destination.droppableId) {
        const origemId = Number(source.droppableId.replace("CUSTOM_", ""));
        await recarregarTarefasLista(origemId);
      }
    } catch (error: any) {
      showToast("Erro ao mover tarefa. Tente novamente.", "error");
    }
  };

  const abrirDetalhamento = (tarefa: TarefaDTO) => {
    navigate(`/detalhamento/${tarefa.id}`);
  };

  if (loading) {
    return (
      <div className="kanban-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p>Carregando tarefas...</p>
      </div>
    );
  }

  // Estatísticas globais (com base no array global de tarefas, para manter tudo funcionando)
  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (filtrosAtivos.membros.length === 0 && filtrosAtivos.empresas.length === 0) {
      return true;
    }
    const passaFiltroEmpresa =
      filtrosAtivos.empresas.length === 0 ||
      (tarefa.empresaId && filtrosAtivos.empresas.includes(tarefa.empresaId));
    const passaFiltroMembro =
      filtrosAtivos.membros.length === 0 ||
      (tarefa.membroIds && tarefa.membroIds.some((id: number) => filtrosAtivos.membros.includes(id)));
    return passaFiltroEmpresa && passaFiltroMembro;
  });

  const tarefasVencidas = tarefasFiltradas.filter(
    (t) => t.dtEntrega && new Date(t.dtEntrega) < new Date()
  ).length;
  const tarefasPendentes = tarefasFiltradas.filter(
    (t) => t.status !== `CUSTOM_CONCLUIDA` // Assume que a lista concluída tem este status/label
  ).length;

  return (
    <>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      <div className="kanban-wrapper">
        <div className="kanban-top">
          <div className="kanban-card-top">
            <h3>Tarefas perto do vencimento:</h3>
            <div className="kanban-number">{tarefasVencidas}</div>
          </div>
          <div className="kanban-card-top">
            <h3>Tarefas totais:</h3>
            <div className="kanban-number">{tarefasFiltradas.length}</div>
          </div>
          <div className="kanban-card-top kanban-card-welcome">
            <div className="welcome-content">
              <div className="welcome-text">
                <h3>{getSaudacao()}, User!</h3>
                <p>
                  Você tem{" "}
                  {tarefasPendentes} tarefas pendentes.
                </p>
              </div>
              <img src={logoFlap} alt="FLAP Logo" className="flap-logo" />
            </div>
            <div className="kanban-actions">
              <button className="filter-btn" onClick={() => setFiltroAberto(true)}>
                <span>☰</span> Filtrar
                {(filtrosAtivos.membros.length > 0 || filtrosAtivos.empresas.length > 0) && (
                  <span className="filtro-badge">
                    {filtrosAtivos.membros.length + filtrosAtivos.empresas.length}
                  </span>
                )}
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
                  <div
                    className="kanban-column"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <div className="kanban-column-header">
                      {editingBoardId === board.id ? (
                        <input
                          type="text"
                          value={board.label}
                          onChange={(e) => {
                            const novoLabel = e.target.value;
                            setListas((prev) =>
                              prev.map((l) =>
                                l.id === board.id ? { ...l, nome: novoLabel } : l
                              )
                            );
                          }}
                          onBlur={() => {
                            if (editingBoardId !== null) {
                              editarBoard(board.id, board.label);
                            }
                            setEditingBoardId(null);
                          }}
                          autoFocus
                        />
                      ) : (
                        <h4 onDoubleClick={() => setEditingBoardId(board.id)}>
                          {board.label}
                        </h4>
                      )}
                      <div className="column-header-actions">
                        <div
                          className="column-icons"
                          onClick={() => {
                            setStatusSelecionado(board.status);
                            setListaSelecionada(board.id);
                          }}
                        >
                          <Plus size={16} />
                        </div>
                        <div
                          className="column-icons delete-icon"
                          onClick={() => deletarBoard(board.id, board.label)}
                        >
                          <Trash2 size={16} />
                        </div>
                      </div>
                    </div>
                    {statusSelecionado === board.status && (
                      <div
                        className="nova-tarefa"
                        style={{
                          padding: "12px",
                          backgroundColor: "#f9f9f9",
                          borderRadius: "8px",
                          marginBottom: "10px",
                        }}
                      >
                        <input
                          type="text"
                          value={novoTitulo}
                          placeholder="Título da tarefa..."
                          onChange={(e) => setNovoTitulo(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && empresaSelecionada && listaSelecionada) {
                              adicionarTarefa();
                            }
                          }}
                          style={{
                            width: "100%",
                            padding: "10px",
                            marginBottom: "8px",
                            borderRadius: "6px",
                            border: "1px solid #ddd",
                            fontSize: "0.95rem",
                          }}
                        />
                        {empresas.length > 0 ? (
                          <select
                            value={empresaSelecionada || ""}
                            onChange={(e) => setEmpresaSelecionada(Number(e.target.value))}
                            style={{
                              width: "100%",
                              padding: "10px",
                              marginBottom: "8px",
                              borderRadius: "6px",
                              border: "1px solid #ddd",
                              fontSize: "0.95rem",
                              backgroundColor: "white",
                              cursor: "pointer",
                            }}
                          >
                            <option value="" disabled>
                              Selecione uma empresa *
                            </option>
                            {empresas.map((empresa) => (
                              <option key={empresa.id} value={empresa.id}>
                                {empresa.nome}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div
                            style={{
                              padding: "10px",
                              marginBottom: "8px",
                              backgroundColor: "#fff3cd",
                              border: "1px solid #ffc107",
                              borderRadius: "6px",
                              fontSize: "0.85rem",
                              color: "#856404",
                            }}
                          >
                            ⚠️ Nenhuma empresa cadastrada.
                          </div>
                        )}
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="new-board-btn"
                            onClick={adicionarTarefa}
                            disabled={!novoTitulo.trim() || !empresaSelecionada || !listaSelecionada}
                            style={{
                              flex: 1,
                              opacity: !novoTitulo.trim() || !empresaSelecionada || !listaSelecionada ? 0.6 : 1,
                              cursor: !novoTitulo.trim() || !empresaSelecionada || !listaSelecionada ? "not-allowed" : "pointer",
                            }}
                          >
                            Adicionar
                          </button>
                          <button
                            onClick={() => {
                              setStatusSelecionado(null);
                              setNovoTitulo("");
                            }}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#6c757d",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "0.9rem",
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                    {/* FILTRAGEM E RENDERIZAÇÃO AQUI */}
                    {(tarefasPorLista[board.id] || [])
                      .filter((tarefa) => {
                            // 1. Filtra por Membros
                            const passaFiltroMembro =
                                filtrosAtivos.membros.length === 0 ||
                                (tarefa.membroIds && tarefa.membroIds.some((id: number) => filtrosAtivos.membros.includes(id)));
                            
                            // 2. Filtra por Empresas
                            const passaFiltroEmpresa =
                                filtrosAtivos.empresas.length === 0 ||
                                (tarefa.empresaId && filtrosAtivos.empresas.includes(tarefa.empresaId));
                            
                            return passaFiltroMembro && passaFiltroEmpresa;
                        })
                      .sort((a, b) => a.posicao - b.posicao)
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
                                {tarefa.tags &&
                                  tarefa.tags.map((tag) => (
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
        <FiltroModal
          isOpen={filtroAberto}
          onClose={() => setFiltroAberto(false)}
          membros={membros}
          empresas={empresas}
          onAplicar={aplicarFiltros}
          filtrosAtuais={filtrosAtivos}
        />
      </div>
    </>
  );
}