import React, { useEffect, useState } from "react";
import "./TelaKanbanBoard.css";
import { Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../services/api";
import logoFlap from "../images/Logo-azul-FLAP 1.png";

export type StatusTarefa = "A_FAZER" | "EM_PROGRESSO" | "EM_REVISAO" | "CONCLUIDA" | string;

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
  empresaId?: number;
}

interface Empresa {
  id: number;
  nome: string;
}

interface Lista {
  id: number;
  nome: string;
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
  const [listas, setListas] = useState<Lista[]>([]); // ⭐ NOVO
  const [novoTitulo, setNovoTitulo] = useState("");
  const [empresaSelecionada, setEmpresaSelecionada] = useState<number | null>(null);
  const [listaSelecionada, setListaSelecionada] = useState<number | null>(null); // ⭐ NOVO
  const [statusSelecionado, setStatusSelecionado] = useState<StatusTarefa | null>(null);
  const [boards, setBoards] = useState([
    { id: 1, status: "A_FAZER" as StatusTarefa, label: "To Do", isDeletable: false },
    { id: 2, status: "EM_PROGRESSO" as StatusTarefa, label: "In Progress", isDeletable: false },
    { id: 3, status: "EM_REVISAO" as StatusTarefa, label: "Review", isDeletable: false },
    { id: 4, status: "CONCLUIDA" as StatusTarefa, label: "Closed", isDeletable: false },
  ]);
  const [editingBoardId, setEditingBoardId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

        // ⭐ CARREGAR TAREFAS, EMPRESAS E LISTAS
        const [tarefasRes, empresasRes, listasRes] = await Promise.all([
          api.get("/tarefas", {
            headers: { Authorization: `Basic ${auth}` },
            withCredentials: true,
          }),
          api.get("/empresas", {
            headers: { Authorization: `Basic ${auth}` },
            withCredentials: true,
          }),
          api.get("/listas", { // ⭐ BUSCAR LISTAS
            headers: { Authorization: `Basic ${auth}` },
            withCredentials: true,
          }),
        ]);

        console.log("📊 Tarefas recebidas:", tarefasRes.data);
        console.log("🏢 Empresas recebidas:", empresasRes.data);
        console.log("📋 Listas recebidas:", listasRes.data);

        // Processar tarefas
        if (Array.isArray(tarefasRes.data)) {
          setTarefas(tarefasRes.data);
        } else if (tarefasRes.data.tarefas && Array.isArray(tarefasRes.data.tarefas)) {
          setTarefas(tarefasRes.data.tarefas);
        } else {
          console.error("❌ Formato inesperado de tarefas:", tarefasRes.data);
          setTarefas(mockTarefas);
        }

        // Processar empresas
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

        // ⭐ Processar listas
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

      } catch (error: any) {
        console.error("❌❌❌ ERRO CAPTURADO NO CATCH ❌❌❌");
        console.error("❌ Erro completo:", error);

        if (error.response?.status === 401) {
          alert("Sessão expirada. Faça login novamente.");
          localStorage.removeItem("auth");
          localStorage.removeItem("usuario");
          navigate("/login", { replace: true });
        } else {
          console.warn("⚠️ Usando dados mock como fallback.");
          setTarefas(mockTarefas);
          setEmpresas([]);
          setListas([]);
        }
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [navigate]);

  const adicionarTarefa = async () => {
    console.log("🆕 Tentando adicionar tarefa...");
    console.log("🆕 Empresa selecionada:", empresaSelecionada);
    console.log("🆕 Lista selecionada:", listaSelecionada); // ⭐ DEBUG

    if (!statusSelecionado || !novoTitulo.trim()) {
      alert("Digite o título da tarefa!");
      return;
    }

    if (empresas.length === 0) {
      alert("Cadastre pelo menos uma empresa antes de criar tarefas!");
      navigate("/ajustes");
      return;
    }

    if (!empresaSelecionada) {
      alert("Selecione uma empresa para a tarefa!");
      return;
    }

    // ⭐ VALIDAR LISTA
    if (listas.length === 0) {
      alert("Nenhuma lista disponível. Contate o administrador.");
      return;
    }

    if (!listaSelecionada) {
      alert("Selecione uma lista para a tarefa!");
      return;
    }

    const novaTarefa = {
      titulo: novoTitulo,
      status: statusSelecionado,
      prioridade: "MEDIA",
      posicao: tarefas.filter((t) => t.status === statusSelecionado).length,
      dtEntrega: null,
      empresaId: empresaSelecionada,
      listaId: listaSelecionada, // ⭐ INCLUIR listaId
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

      navigate(`/detalhamento/${res.data.id}`);
    } catch (error: any) {
      console.error("❌ Erro ao adicionar tarefa:", error);
      console.error("❌ Resposta do servidor:", error.response?.data);

      if (error.response?.status === 400) {
        alert("Erro ao criar tarefa: " + (error.response.data.message || "Dados inválidos"));
      } else if (error.response?.status === 401) {
        alert("Sessão expirada. Faça login novamente.");
        navigate("/login", { replace: true });
      } else if (error.response?.status === 500) {
        alert("Erro interno no servidor. Verifique se todos os campos obrigatórios estão preenchidos.");
      } else {
        alert("Erro ao adicionar tarefa. Tente novamente.");
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
      alert(
        `Não é possível deletar o board "${boardLabel}" pois ele contém ${tarefasNoBoard.length} tarefa(s).`
      );
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
      t.id === tarefaId ? { ...t, status: novoStatus, posicao: destination.index } : t
    );
    setTarefas(tarefasAtualizadas);

    try {
      const auth = localStorage.getItem("auth");

      await api.patch(
        `/tarefas/${tarefaId}/mover`,
        {
          status: novoStatus,
          posicao: destination.index,
        },
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Erro ao atualizar status da tarefa:", error);
      setTarefas(tarefas);
      alert("Erro ao mover tarefa. Tente novamente.");
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

  return (
    <div className="kanban-wrapper">
      <div className="kanban-top">
        <div className="kanban-card-top">
          <h3>Tarefas perto do vencimento:</h3>
          <div className="kanban-number">
            {tarefasSeguras.filter(
              (t) => t.dtEntrega && new Date(t.dtEntrega) < new Date()
            ).length}
          </div>
        </div>
        <div className="kanban-card-top">
          <h3>Tarefas totais:</h3>
          <div className="kanban-number">{tarefasSeguras.length}</div>
        </div>
        <div className="kanban-card-top kanban-card-welcome">
          <div className="welcome-content">
            <div className="welcome-text">
              <h3>{getSaudacao()}, User!</h3>
              <p>
                Você tem{" "}
                {tarefasSeguras.filter((t) => t.status !== "CONCLUIDA").length} tarefas
                pendentes.
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

                      {/* ⭐ Select de empresa */}
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

                      {/* ⭐ NOVO: Select de lista */}
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

                  {tarefasSeguras
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
    </div>
  );
}