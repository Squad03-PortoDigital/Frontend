import React, { useEffect, useState } from "react";
import "./TelaKanbanBoard.css";
import { Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../services/api";
import logoFlap from "../images/Logo-azul-FLAP 1.png";
import FiltroModal, { type FiltrosAtivos } from "./FiltroModal";
import { Toast } from "./Toast"; 

export type StatusTarefa = "A_FAZER" | "EM_PROGRESSO" | "EM_REVISAO" | "CONCLUIDA" | string;

export const COLUMNS = [
  { id: 1, status: "A_FAZER" as StatusTarefa, title: "To Do" },
  { id: 2, status: "EM_PROGRESSO" as StatusTarefa, title: "In Progress" },
  { id: 3, status: "EM_REVISAO" as StatusTarefa, title: "Review" },
  { id: 4, status: "CONCLUIDA" as StatusTarefa, title: "Closed" },
];

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
}

interface Empresa {
  id: number;
  nome: string;
}

interface Lista {
  id: number;
  nome: string;
}

// ✅ INTERFACE DO TOAST
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

export default function TelaKanbanBoard() {
  const [tarefas, setTarefas] = useState<TarefaDTO[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [listas, setListas] = useState<Lista[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [empresaSelecionada, setEmpresaSelecionada] = useState<number | null>(null);
  const [listaSelecionada, setListaSelecionada] = useState<number | null>(null);
  const [statusSelecionado, setStatusSelecionado] = useState<StatusTarefa | null>(null);
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltrosAtivos>({
    membros: [],
    empresas: [],
  });
  const [boards, setBoards] = useState([
    { id: 1, status: "A_FAZER" as StatusTarefa, label: "To Do", isDeletable: false },
    { id: 2, status: "EM_PROGRESSO" as StatusTarefa, label: "In Progress", isDeletable: false },
    { id: 3, status: "EM_REVISAO" as StatusTarefa, label: "Review", isDeletable: false },
    { id: 4, status: "CONCLUIDA" as StatusTarefa, label: "Closed", isDeletable: false },
  ]);
  const [editingBoardId, setEditingBoardId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ ESTADO DO TOAST
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', show: false });
  
  const navigate = useNavigate();

  // ✅ FUNÇÃO PARA MOSTRAR TOAST
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

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const auth = localStorage.getItem("auth");

        console.log("🔍 Iniciando carregamento de dados...");

        const [tarefasRes, empresasRes, listasRes, membrosRes] = await Promise.all([
          api.get("/tarefas", {
            headers: { Authorization: `Basic ${auth}` },
            withCredentials: true,
          }),
          api.get("/empresas", {
            headers: { Authorization: `Basic ${auth}` },
            withCredentials: true,
          }),
          api.get("/listas", {
            headers: { Authorization: `Basic ${auth}` },
            withCredentials: true,
          }),
          api.get("/usuarios", {
            headers: { Authorization: `Basic ${auth}` },
            withCredentials: true,
          }),
        ]);

        console.log("📊 Tarefas recebidas:", tarefasRes.data);
        console.log("🏢 Empresas recebidas:", empresasRes.data);
        console.log("📋 Listas recebidas:", listasRes.data);
        console.log("👥 Membros recebidos:", membrosRes.data);

        if (Array.isArray(tarefasRes.data)) {
          setTarefas(tarefasRes.data);
        } else if (tarefasRes.data.tarefas && Array.isArray(tarefasRes.data.tarefas)) {
          setTarefas(tarefasRes.data.tarefas);
        } else {
          console.error("❌ Formato inesperado de tarefas:", tarefasRes.data);
          setTarefas(mockTarefas);
        }

        if (Array.isArray(empresasRes.data)) {
          console.log("✅ Empresas carregadas:", empresasRes.data);
          setEmpresas(empresasRes.data);
          if (empresasRes.data.length > 0) {
            setEmpresaSelecionada(empresasRes.data[0].id);
          }
        } else {
          console.error("❌ Formato inesperado de empresas:", empresasRes.data);
          setEmpresas([]);
        }

        if (Array.isArray(listasRes.data)) {
          console.log("✅ Listas carregadas:", listasRes.data);
          setListas(listasRes.data);
          if (listasRes.data.length > 0) {
            setListaSelecionada(listasRes.data[0].id);
          }
        } else {
          console.error("❌ Formato inesperado de listas:", listasRes.data);
          setListas([]);
        }

        if (Array.isArray(membrosRes.data)) {
          console.log("✅ Membros carregados:", membrosRes.data);
          setMembros(membrosRes.data);
        } else {
          console.error("❌ Formato inesperado de membros:", membrosRes.data);
          setMembros([]);
        }

      } catch (error: any) {
        console.error("❌❌❌ ERRO CAPTURADO NO CATCH ❌❌❌");
        console.error("❌ Erro completo:", error);

        if (error.response?.status === 401) {
          showToast("Sessão expirada. Faça login novamente.", "error");
          localStorage.removeItem("auth");
          localStorage.removeItem("usuario");
          setTimeout(() => navigate("/login", { replace: true }), 1500);
        } else {
          console.warn("⚠️ Usando dados mock como fallback.");
          setTarefas(mockTarefas);
          setEmpresas([]);
          setListas([]);
          setMembros([]);
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

  const adicionarTarefa = async () => {
    console.log("🆕 Tentando adicionar tarefa...");
    console.log("🆕 Empresa selecionada:", empresaSelecionada);
    console.log("🆕 Lista selecionada:", listaSelecionada);

    if (!statusSelecionado || !novoTitulo.trim()) {
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

    if (!listaSelecionada) {
      showToast("Selecione uma lista para a tarefa!", "warning");
      return;
    }

    const novaTarefa = {
      titulo: novoTitulo,
      status: statusSelecionado,
      prioridade: "MEDIA",
      posicao: tarefas.filter((t) => t.status === statusSelecionado).length,
      dtEntrega: null,
      empresaId: empresaSelecionada,
      listaId: listaSelecionada,
    };

    console.log("🆕 Payload da nova tarefa:", novaTarefa);

    try {
      const auth = localStorage.getItem("auth");

      const res = await api.post<TarefaDTO>("/tarefas", novaTarefa, {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      console.log("✅ Tarefa criada com sucesso:", res.data);
      setTarefas((prev) => [...prev, res.data]);

      setNovoTitulo("");
      setStatusSelecionado(null);

      showToast("Tarefa criada com sucesso!", "success");
      setTimeout(() => navigate(`/detalhamento/${res.data.id}`), 800);
    } catch (error: any) {
      console.error("❌ Erro ao adicionar tarefa:", error);
      console.error("❌ Resposta do servidor:", error.response?.data);

      if (error.response?.status === 400) {
        showToast("Erro ao criar tarefa: " + (error.response.data.message || "Dados inválidos"), "error");
      } else if (error.response?.status === 401) {
        showToast("Sessão expirada. Faça login novamente.", "error");
        setTimeout(() => navigate("/login", { replace: true }), 1500);
      } else if (error.response?.status === 500) {
        showToast("Erro interno no servidor. Verifique os campos obrigatórios.", "error");
      } else {
        showToast("Erro ao adicionar tarefa. Tente novamente.", "error");
      }
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
    const tarefasNoBoard = tarefas.filter((t) => {
      const board = boards.find((b) => b.id === boardId);
      return board && t.status === board.status;
    });

    if (tarefasNoBoard.length > 0) {
      showToast(`Não é possível deletar o board "${boardLabel}" pois ele contém ${tarefasNoBoard.length} tarefa(s).`, "warning");
      return;
    }

    const confirmar = window.confirm(
      `Tem certeza que deseja deletar o board "${boardLabel}"?`
    );

    if (confirmar) {
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
      showToast("Board deletado com sucesso!", "success");
    }
  };

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const tarefaId = Number(draggableId);
    const novoStatus = destination.droppableId as StatusTarefa;
    
    console.log("🔄 Movendo tarefa:", tarefaId, "para", novoStatus);

    setTarefas(prev => prev.map(t => 
      t.id === tarefaId ? { ...t, status: novoStatus } : t
    ));

    try {
      const auth = localStorage.getItem("auth");

      const response = await api.get(`/tarefas/${tarefaId}`, {
        headers: { Authorization: `Basic ${auth}` },
        withCredentials: true,
      });

      const detalhes = response.data;
      console.log("📋 Detalhes da tarefa:", detalhes);

      const payload = {
        titulo: detalhes.titulo,
        descricao: detalhes.descricao || "",
        status: novoStatus,
        prioridade: detalhes.prioridade,
        dtEntrega: detalhes.dtEntrega,
        links: detalhes.anexos?.map((a: any) => a.url) || [],
        criteriosAceite: detalhes.checklist?.map((c: any) => c.descricao) || [],
        tasks: detalhes.checklist || [],
      };

      console.log("💾 Salvando tarefa com novo status:", payload);

      await api.put(`/tarefas/${tarefaId}`, payload, {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      console.log("✅ Status atualizado com sucesso!");
      showToast("Tarefa movida com sucesso!", "success");
    } catch (error: any) {
      console.error("❌ Erro ao atualizar status:", error);
      console.error("❌ Detalhes:", error.response?.data);
      
      setTarefas(tarefas);
      
      if (error.response?.status === 401) {
        showToast("Sessão expirada. Faça login novamente.", "error");
        localStorage.removeItem("auth");
        localStorage.removeItem("usuario");
        setTimeout(() => navigate("/login", { replace: true }), 1500);
      } else {
        showToast("Erro ao mover tarefa. Tente novamente.", "error");
      }
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

  const tarefasSeguras = Array.isArray(tarefas) ? tarefas : [];

  const tarefasFiltradas = tarefasSeguras.filter((tarefa) => {
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

  return (
    <>
      {/* ✅ TOAST */}
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
            <div className="kanban-number">
              {tarefasFiltradas.filter(
                (t) => t.dtEntrega && new Date(t.dtEntrega) < new Date()
              ).length}
            </div>
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
                  {tarefasFiltradas.filter((t) => t.status !== "CONCLUIDA").length} tarefas
                  pendentes.
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
                        <h4 onDoubleClick={() => setEditingBoardId(board.id)}>
                          {board.label}
                        </h4>
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
                      <div className="nova-tarefa" style={{ padding: "12px", backgroundColor: "#f9f9f9", borderRadius: "8px", marginBottom: "10px" }}>
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
                          <div style={{
                            padding: "10px",
                            marginBottom: "8px",
                            backgroundColor: "#fff3cd",
                            border: "1px solid #ffc107",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            color: "#856404"
                          }}>
                            ⚠️ Nenhuma empresa cadastrada.
                          </div>
                        )}

                        {listas.length > 0 ? (
                          <select
                            value={listaSelecionada || ""}
                            onChange={(e) => setListaSelecionada(Number(e.target.value))}
                            style={{
                              width: "100%",
                              padding: "10px",
                              marginBottom: "10px",
                              borderRadius: "6px",
                              border: "1px solid #ddd",
                              fontSize: "0.95rem",
                              backgroundColor: "white",
                              cursor: "pointer",
                            }}
                          >
                            <option value="" disabled>
                              Selecione uma lista *
                            </option>
                            {listas.map((lista) => (
                              <option key={lista.id} value={lista.id}>
                                {lista.nome}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div style={{
                            padding: "10px",
                            marginBottom: "10px",
                            backgroundColor: "#fff3cd",
                            border: "1px solid #ffc107",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            color: "#856404"
                          }}>
                            ⚠️ Nenhuma lista disponível.
                          </div>
                        )}

                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="new-board-btn"
                            onClick={adicionarTarefa}
                            disabled={!novoTitulo.trim() || !empresaSelecionada || !listaSelecionada}
                            style={{
                              flex: 1,
                              opacity: (!novoTitulo.trim() || !empresaSelecionada || !listaSelecionada) ? 0.6 : 1,
                              cursor: (!novoTitulo.trim() || !empresaSelecionada || !listaSelecionada) ? "not-allowed" : "pointer",
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

                    {tarefasFiltradas
                      .filter((t) => t.status === board.status)
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
                                {tarefa.tags && tarefa.tags.map((tag) => (
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
