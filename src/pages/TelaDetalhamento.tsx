import { Button } from "@mui/material";
import "./TelaDetalhamento.css";
import agentegpt from "../images/agentegpt-logo.png";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Toast } from "./Toast";

interface Item {
  id: number;
  nome: string;
  status: boolean;  // ✅ Mudado de 'concluido' para 'status'
}

interface Checklist {
  id: number;
  titulo: string;
  cor: string;
  itens: Item[];
}

interface Comentario {
  id: number;
  usuario: {
    id: number;
    nome: string;
    email: string;
    foto?: string;
  };
  texto: string;
  dataCriacao: string;
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
  foto?: string;
  username?: string;
}

interface MembroDTO {
  membroId: number;
  usuarioId: number;
  nome: string;
  username: string;
  foto?: string;
}

interface Tarefa {
  id: number;
  titulo: string;
  descricao?: string;
  status: string;
  prioridade: string;
  dtEntrega?: string;
  dtCriacao?: string;
  empresa?: {
    id: number;
    nome: string;
    logoUrl?: string;
    agenteLink?: string;
  };
  empresaId?: number;
  links?: string[];
  progresso?: number;
  checklists?: Checklist[];
  comentarios?: Comentario[];
  membros?: MembroDTO[];
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning';
  show: boolean;
}

export default function TelaDetalhamento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tarefa, setTarefa] = useState<Tarefa | null>(null);
  const [loading, setLoading] = useState(true);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState("A_FAZER");
  const [prioridade, setPrioridade] = useState("MEDIA");
  const [dtEntrega, setDtEntrega] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [novoLink, setNovoLink] = useState("");

  const [statusOpen, setStatusOpen] = useState(false);
  const [prioridadeOpen, setPrioridadeOpen] = useState(false);
  const [membrosDropdownOpen, setMembrosDropdownOpen] = useState(false);
  const [mostrarModalArquivar, setMostrarModalArquivar] = useState(false);

  const progresso = tarefa?.progresso || 0;

  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [novoChecklistTitulo, setNovoChecklistTitulo] = useState("");
  const [novoItemNome, setNovoItemNome] = useState("");
  const [checklistSelecionada, setChecklistSelecionada] = useState<number | null>(null);

  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [novoComentario, setNovoComentario] = useState("");

  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', show: false });
  const [todosUsuarios, setTodosUsuarios] = useState<Usuario[]>([]);
  const [membrosSelecionados, setMembrosSelecionados] = useState<number[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ message, type, show: true });
  };

  useEffect(() => {
    const carregarTarefa = async () => {
      try {
        setLoading(true);
        const auth = localStorage.getItem("auth");

        if (!auth) {
          navigate("/", { replace: true });
          return;
        }

        const res = await api.get(`/tarefas/${id}`, {
          headers: { Authorization: `Basic ${auth}` },
          withCredentials: true,
        });

        let tarefaData = res.data;

        if (tarefaData.empresaId || tarefaData.empresa?.id) {
          try {
            const empresaId = tarefaData.empresaId || tarefaData.empresa?.id;
            const empresaRes = await api.get(`/empresas/${empresaId}`, {
              headers: { Authorization: `Basic ${auth}` },
              withCredentials: true,
            });

            tarefaData.empresa = {
              id: empresaRes.data.id,
              nome: empresaRes.data.nome,
              logoUrl: empresaRes.data.foto || null,
              agenteLink: empresaRes.data.agenteLink || null,
            };
          } catch (err) {
            console.warn("⚠️ Não foi possível carregar dados da empresa:", err);
          }
        }

        try {
          const usuariosRes = await api.get("/usuarios", {
            headers: { Authorization: `Basic ${auth}` },
            withCredentials: true,
          });
          const usuarios = Array.isArray(usuariosRes.data)
            ? usuariosRes.data.map((u: any) => ({ ...u, username: u.email }))
            : [];
          setTodosUsuarios(usuarios);
        } catch (err) {
          console.warn("⚠️ Erro ao carregar usuários:", err);
          setTodosUsuarios([]);
        }

        try {
          const checklistsRes = await api.get(`/checklists/tarefa/${id}`, {
            headers: { Authorization: `Basic ${auth}` },
            withCredentials: true,
          });

          const checklistsComItens = (checklistsRes.data || []).map((c: any) => ({
            ...c,
            itens: Array.isArray(c.itens) ? c.itens : []
          }));

          setChecklists(checklistsComItens);
        } catch (err) {
          console.warn("⚠️ Erro ao carregar checklists:", err);
          setChecklists([]);
        }

        try {
          const comentariosRes = await api.get(`/comentarios/tarefa/${id}`, {
            headers: { Authorization: `Basic ${auth}` },
            withCredentials: true,
          });
          setComentarios(comentariosRes.data || []);
        } catch (err) {
          console.warn("⚠️ Erro ao carregar comentários:", err);
          setComentarios([]);
        }

        setTarefa(tarefaData);
        setTitulo(tarefaData.titulo || "");
        setDescricao(tarefaData.descricao || "");
        setStatus(tarefaData.status || "A_FAZER");
        setPrioridade(tarefaData.prioridade || "MEDIA");

        if (tarefaData.dtEntrega) {
          const dataEntrega = tarefaData.dtEntrega.split('T')[0];
          setDtEntrega(dataEntrega);
        } else {
          setDtEntrega("");
        }

        setLinks(tarefaData.links || []);

        if (tarefaData.membros && Array.isArray(tarefaData.membros)) {
          const membroIds = tarefaData.membros.map((m: MembroDTO) => m.usuarioId);
          setMembrosSelecionados(membroIds);
        }

      } catch (error: any) {
        console.error("❌ Erro ao carregar tarefa:", error);
        if (error.response?.status === 401) {
          showToast("Sessão expirada. Faça login novamente.", "error");
          localStorage.removeItem("auth");
          localStorage.removeItem("usuario");
          setTimeout(() => navigate("/", { replace: true }), 1500);
        } else if (error.response?.status === 404) {
          showToast("Tarefa não encontrada.", "error");
          setTimeout(() => navigate("/home"), 1500);
        } else {
          showToast("Erro ao carregar tarefa.", "error");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      carregarTarefa();
    }
  }, [id, navigate]);

  const salvarAlteracoes = async () => {
    if (!titulo.trim()) {
      showToast("O título da tarefa é obrigatório!", "warning");
      return;
    }

    try {
      const auth = localStorage.getItem("auth");

      let dtEntregaFormatada = null;
      if (dtEntrega) {
        dtEntregaFormatada = `${dtEntrega}T00:00:00`;
      }

      const payload = {
        titulo,
        descricao,
        status,
        prioridade,
        dtEntrega: dtEntregaFormatada,
        links,
        membroIds: membrosSelecionados,
      };

      await api.put(`/tarefas/${id}`, payload, {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      showToast("Tarefa atualizada com sucesso!", "success");
      setTimeout(() => navigate("/home"), 1000);
    } catch (error: any) {
      console.error("❌ Erro ao salvar:", error);
      if (error.response?.status === 401) {
        showToast("Sessão expirada. Faça login novamente.", "error");
        localStorage.removeItem("auth");
        localStorage.removeItem("usuario");
        setTimeout(() => navigate("/", { replace: true }), 1500);
      } else {
        showToast("Erro ao salvar alterações.", "error");
      }
    }
  };

  const arquivarTarefa = async () => {
    try {
      const auth = localStorage.getItem("auth");
      await api.patch(`/tarefas/${id}/arquivar`, {}, {
        headers: { Authorization: `Basic ${auth}` },
        withCredentials: true,
      });

      showToast("Tarefa arquivada com sucesso!", "success");
      setTimeout(() => navigate("/home"), 1000);
    } catch (error: any) {
      console.error("❌ Erro ao arquivar:", error);
      showToast("Erro ao arquivar tarefa.", "error");
    } finally {
      setMostrarModalArquivar(false);
    }
  };

  const adicionarChecklist = async () => {
    if (!novoChecklistTitulo.trim()) return;

    try {
      const auth = localStorage.getItem("auth");
      const res = await api.post(`/checklists`, {
        titulo: novoChecklistTitulo,
        cor: "#667eea",
        tarefaId: Number(id)
      }, {
        headers: { Authorization: `Basic ${auth}` },
        withCredentials: true,
      });

      setChecklists([...checklists, { ...res.data, itens: res.data.itens || [] }]);
      setNovoChecklistTitulo("");
      showToast("Checklist criada!", "success");
    } catch (error) {
      console.error("❌ Erro ao criar checklist:", error);
      showToast("Erro ao criar checklist.", "error");
    }
  };

  // ✅ ADICIONAR ITEM - CORRIGIDO COM TAREFAID
  const adicionarItem = async (checklistId: number) => {
    if (!novoItemNome.trim()) return;

    try {
      const auth = localStorage.getItem("auth");

      const payload = {
        nome: novoItemNome,
        tarefaId: Number(id),      // ✅ OBRIGATÓRIO
        checklistId: checklistId,  // ✅ Opcional
        status: false              // ✅ Status inicial
      };

      console.log("📤 Payload do item:", payload);

      const res = await api.post(`/itens`, payload, {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json"
        },
        withCredentials: true,
      });

      console.log("✅ Item criado:", res.data);

      setChecklists(checklists.map(c =>
        c.id === checklistId
          ? { ...c, itens: [...(c.itens || []), res.data] }
          : c
      ));
      setNovoItemNome("");
      setChecklistSelecionada(null);
      showToast("Item adicionado!", "success");
    } catch (error: any) {
      console.error("❌ Erro ao adicionar item:", error);
      console.error("❌ Response:", error.response?.data);
      showToast("Erro ao adicionar item.", "error");
    }
  };

  // ✅ TOGGLE ITEM - CORRIGIDO
  const toggleItem = async (checklistId: number, itemId: number) => {
    try {
      const auth = localStorage.getItem("auth");
      await api.patch(`/itens/${itemId}/toggle-status`, {}, {
        headers: { Authorization: `Basic ${auth}` },
        withCredentials: true,
      });

      setChecklists(checklists.map(c =>
        c.id === checklistId
          ? {
              ...c,
              itens: (c.itens || []).map(i =>
                i.id === itemId ? { ...i, status: !i.status } : i
              )
            }
          : c
      ));
    } catch (error) {
      console.error("❌ Erro ao atualizar item:", error);
      showToast("Erro ao atualizar item.", "error");
    }
  };

  // ✅ ADICIONAR COMENTÁRIO - CORRIGIDO
  const adicionarComentario = async () => {
    if (!novoComentario.trim()) return;

    try {
      const auth = localStorage.getItem("auth");
      const usuarioString = localStorage.getItem("usuario");

      if (!usuarioString) {
        showToast("Usuário não encontrado. Faça login novamente.", "error");
        return;
      }

      const usuario = JSON.parse(usuarioString);

      const payload = {
        texto: novoComentario,
        usuarioId: usuario.id,
        tarefaId: Number(id)
      };

      const res = await api.post(`/comentarios`, payload, {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json"
        },
        withCredentials: true,
      });

      const novoComentarioCompleto = {
        id: res.data.id,
        texto: res.data.texto,
        dataCriacao: res.data.dataCriacao,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          foto: usuario.foto
        }
      };

      setComentarios([novoComentarioCompleto, ...comentarios]);
      setNovoComentario("");
      showToast("Comentário adicionado!", "success");
    } catch (error: any) {
      console.error("❌ Erro ao adicionar comentário:", error);
      showToast("Erro ao adicionar comentário.", "error");
    }
  };

  const toggleMembro = (usuarioId: number) => {
    setMembrosSelecionados((prev) =>
      prev.includes(usuarioId)
        ? prev.filter((id) => id !== usuarioId)
        : [...prev, usuarioId]
    );
  };

  const getMembrosAtribuidos = () => {
    return todosUsuarios.filter((u) => membrosSelecionados.includes(u.id));
  };

  const getInitials = (nome: string) => {
    if (!nome) return "??";
    const words = nome.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  const adicionarLink = () => {
    if (!novoLink.trim()) return;
    setLinks([...links, novoLink]);
    setNovoLink("");
  };

  const removerLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const irParaAgente = () => {
    const link = tarefa?.empresa?.agenteLink;
    if (link && link.trim() !== "") {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      window.open("https://chat.openai.com", "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p>Carregando tarefa...</p>
      </div>
    );
  }

  if (!tarefa) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Tarefa não encontrada.</p>
        <Button onClick={() => navigate("/home")}>Voltar</Button>
      </div>
    );
  }

  const statusLabels: { [key: string]: string } = {
    A_FAZER: "To Do",
    EM_PROGRESSO: "In Progress",
    EM_REVISAO: "Review",
    CONCLUIDA: "Closed",
  };

  const prioridadeLabels: { [key: string]: string } = {
    BAIXA: "Baixa",
    MEDIA: "Média",
    ALTA: "Alta",
    CRITICA: "Crítica",
  };

  return (
    <>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <div className="detalhamento-container">
        <div className="detalhamento-content">
          <div className="detalhamento-header">
            <div className="detalhamento-header-empresa">
              <div className="detalhamento-header-empresa-logo">
                {tarefa?.empresa?.logoUrl ? (
                  <img src={tarefa.empresa.logoUrl} alt={tarefa.empresa.nome} />
                ) : (
                  <div className="empresa-avatar-placeholder">
                    {tarefa?.empresa?.nome?.substring(0, 2).toUpperCase() || "??"}
                  </div>
                )}
              </div>
              <span className="empresa-nome">{tarefa?.empresa?.nome || "Empresa"}</span>
            </div>
            <div className="detalhamento-header-agente" onClick={irParaAgente}>
              <div className="detalhamento-header-agente-logo">
                <img src={agentegpt} alt="Logo do Agente" />
              </div>
              <span>Ir para o ChatGPT</span>
            </div>
          </div>

          <div className="detalhamento-title">
            <div className="detalhamento-title-text">
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título da tarefa"
                className="titulo-input"
              />
            </div>

            <div className="detalhamento-title-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progresso}%` }}></div>
              </div>
              <span className="progress-label">{progresso}%</span>
            </div>

            <div className="detalhamento-title-infos">
              <div className="detalhamento-title-info-usuarios" style={{ position: 'relative' }}>
                {getMembrosAtribuidos().slice(0, 3).map((membro, index) => (
                  <div
                    key={membro.id}
                    className="user-avatar"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#667eea',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginLeft: index > 0 ? '-8px' : '0',
                      border: '2px solid white',
                      cursor: 'pointer',
                      zIndex: 10 - index,
                    }}
                    title={membro.nome}
                  >
                    {membro.foto ? (
                      <img
                        src={membro.foto}
                        alt={membro.nome}
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      getInitials(membro.nome)
                    )}
                  </div>
                ))}

                <div
                  className="add-member-button"
                  onClick={() => setMembrosDropdownOpen(!membrosDropdownOpen)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    marginLeft: getMembrosAtribuidos().length > 0 ? '-8px' : '0',
                    border: '2px solid white',
                    cursor: 'pointer',
                    zIndex: 1,
                  }}
                  title="Adicionar membros"
                >
                  +
                </div>

                {membrosDropdownOpen && (
                  <div
                    className="membros-dropdown"
                    style={{
                      position: 'absolute',
                      top: '40px',
                      left: '0',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      minWidth: '250px',
                      maxHeight: '300px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      padding: '8px 0',
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid #eee', fontWeight: 'bold', fontSize: '14px' }}>
                      Membros
                    </div>
                    {todosUsuarios.map((usuario) => (
                      <div
                        key={usuario.id}
                        onClick={() => toggleMembro(usuario.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          backgroundColor: membrosSelecionados.includes(usuario.id) ? '#f0f0f0' : 'white',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          if (!membrosSelecionados.includes(usuario.id)) {
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!membrosSelecionados.includes(usuario.id)) {
                            e.currentTarget.style.backgroundColor = 'white';
                          }
                        }}
                      >
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: '#667eea',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            marginRight: '10px',
                          }}
                        >
                          {usuario.foto ? (
                            <img
                              src={usuario.foto}
                              alt={usuario.nome}
                              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            getInitials(usuario.nome)
                          )}
                        </div>
                        <span style={{ fontSize: '14px', flex: 1 }}>{usuario.nome}</span>
                        {membrosSelecionados.includes(usuario.id) && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="detalhamento-title-info dropdown-container" onClick={() => setStatusOpen(!statusOpen)}>
                <span>Status: {statusLabels[status] || status} ▼</span>
                {statusOpen && (
                  <ul className="dropdown">
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <li key={key} onClick={(e) => { e.stopPropagation(); setStatus(key); setStatusOpen(false); }}>
                        {label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="detalhamento-title-info dropdown-container" onClick={() => setPrioridadeOpen(!prioridadeOpen)}>
                <span>Prioridade: {prioridadeLabels[prioridade] || prioridade} ▼</span>
                {prioridadeOpen && (
                  <ul className="dropdown">
                    {Object.entries(prioridadeLabels).map(([key, label]) => (
                      <li key={key} onClick={(e) => { e.stopPropagation(); setPrioridade(key); setPrioridadeOpen(false); }}>
                        {label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="detalhamento-title-info">
                <label className="date-label">
                  Entrega:
                  <input
                    type="date"
                    value={dtEntrega}
                    onChange={(e) => setDtEntrega(e.target.value)}
                    className="date-input"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="detalhamento-body">
            <div className="detalhamento-body-item">
              <h2>Descrição</h2>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Adicione uma descrição detalhada da tarefa..."
                className="textarea-input"
              />
            </div>

            <div className="detalhamento-body-item">
              <h2>Links</h2>
              <div className="add-item-container">
                <input
                  type="url"
                  placeholder="Cole o link aqui (https://...)"
                  value={novoLink}
                  onChange={(e) => setNovoLink(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && adicionarLink()}
                  className="add-item-input"
                />
                <button onClick={adicionarLink} className="add-item-button">
                  Adicionar
                </button>
              </div>
              {links.length > 0 ? (
                <ul className="item-list">
                  {links.map((link, index) => (
                    <li key={index} className="item-list-entry">
                      <a href={link} target="_blank" rel="noopener noreferrer" className="link-item">
                        🔗 {link}
                      </a>
                      <button onClick={() => removerLink(index)} className="remove-button">
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-message">Nenhum link adicionado ainda.</p>
              )}
            </div>

            <div className="detalhamento-body-item">
              <h2>Checklists</h2>
              <div className="add-item-container">
                <input
                  type="text"
                  placeholder="Nova checklist"
                  value={novoChecklistTitulo}
                  onChange={(e) => setNovoChecklistTitulo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && adicionarChecklist()}
                  className="add-item-input"
                />
                <button onClick={adicionarChecklist} className="add-item-button">
                  Criar Checklist
                </button>
              </div>

              {checklists.length > 0 ? (
                checklists.map((checklist) => (
                  <div key={checklist.id} style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '8px', color: checklist.cor || '#667eea' }}>{checklist.titulo}</h3>

                    {Array.isArray(checklist.itens) && checklist.itens.length > 0 ? (
                      <ul className="task-list">
                        {checklist.itens.map((item) => (
                          <li key={item.id} className={`task-item ${item.status ? "done" : ""}`}>
                            <div className="task-content" onClick={() => toggleItem(checklist.id, item.id)}>
                              <input type="checkbox" checked={item.status} onChange={() => toggleItem(checklist.id, item.id)} />
                              <span>{item.nome}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="empty-message" style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
                        Nenhum item nesta checklist.
                      </p>
                    )}

                    {checklistSelecionada === checklist.id ? (
                      <div className="add-item-container" style={{ marginTop: '8px' }}>
                        <input
                          type="text"
                          placeholder="Novo item"
                          value={novoItemNome}
                          onChange={(e) => setNovoItemNome(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && adicionarItem(checklist.id)}
                          className="add-item-input"
                        />
                        <button onClick={() => adicionarItem(checklist.id)} className="add-item-button">
                          Adicionar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setChecklistSelecionada(checklist.id)}
                        style={{
                          marginTop: '8px',
                          padding: '6px 12px',
                          backgroundColor: '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        + Adicionar Item
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="empty-message">Nenhuma checklist criada ainda.</p>
              )}
            </div>
          </div>

          <div className="detalhamento-footer">
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outlined" onClick={() => navigate("/home")}>
                Cancelar
              </Button>
              <Button
                variant="outlined"
                color="warning"
                onClick={() => setMostrarModalArquivar(true)}
                style={{ borderColor: "#FF9800", color: "#FF9800" }}
              >
                📦 Arquivar
              </Button>
            </div>
            <Button variant="contained" style={{ backgroundColor: "#264fa2" }} onClick={salvarAlteracoes}>
              Salvar alterações
            </Button>
          </div>
        </div>

        <div className="detalhamento-sections">
          <div className="detalhamento-historico">
            <h2 className="detalhamento-historico-title">Histórico</h2>
            <p>Tarefa criada: {tarefa.dtCriacao ? new Date(tarefa.dtCriacao).toLocaleString("pt-BR") : "Data não disponível"}</p>
          </div>

          <div className="detalhamento-comentarios">
            <h2 className="detalhamento-comentarios-title">Comentários</h2>
            <div className="detalhamento-comentarios-list">
              {comentarios.length > 0 ? (
                comentarios.map((c) => {
                  if (!c.usuario) {
                    console.warn("⚠️ Comentário sem objeto usuario:", c);
                    return null;
                  }

                  return (
                    <div key={c.id} className="detalhamento-comentarios-item">
                      <div className="comentario-avatar" style={{ backgroundColor: '#667eea' }}>
                        {c.usuario.foto ? (
                          <img
                            src={c.usuario.foto}
                            alt={c.usuario.nome}
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          getInitials(c.usuario.nome)
                        )}
                      </div>
                      <div className="comentario-conteudo">
                        <strong>{c.usuario.nome}</strong>
                        <p className="comentario-texto">{c.texto}</p>
                        <span className="comentario-data">
                          {new Date(c.dataCriacao).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="empty-message-comentarios">Nenhum comentário ainda.</p>
              )}
            </div>
            <div className="detalhamento-comentarios-input">
              <input
                type="text"
                placeholder="Adicione um comentário..."
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && adicionarComentario()}
              />
              <button onClick={adicionarComentario}>Enviar</button>
            </div>
          </div>
        </div>
      </div>

      {mostrarModalArquivar && (
        <div
          className="modal-overlay"
          onClick={() => setMostrarModalArquivar(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div
            className="modal-arquivar"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}
          >
            <h3 style={{ marginBottom: '16px', color: '#333' }}>Arquivar Tarefa?</h3>
            <p style={{ marginBottom: '24px', color: '#666', lineHeight: '1.5' }}>
              Tem certeza que deseja arquivar esta tarefa? Ela será movida para a seção de tarefas arquivadas.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => setMostrarModalArquivar(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                style={{ backgroundColor: "#FF9800" }}
                onClick={arquivarTarefa}
              >
                Sim, Arquivar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
