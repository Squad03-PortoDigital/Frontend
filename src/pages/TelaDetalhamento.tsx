import { useWebSocket } from '../contexts/WebSocketContext';
import { Button } from "@mui/material";
import "./TelaDetalhamento.css";
import agentegpt from "../images/agentegpt-logo.png";
import { MoveLeft, Trash, Pencil, Check } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Toast } from "./Toast";
import MentionTextarea from "../components/MentionTextarea.tsx";
import DropboxFiles from "../components/DropboxFiles";
import { usePermissao } from "../contexts/PermissaoContext";


interface Item {
  id: number;
  nome: string;
  status: boolean;
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
  dtEntrega?: string | null;
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


interface FormatacaoAtiva {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  insertUnorderedList: boolean;
  formatBlock: boolean;
}


export default function TelaDetalhamento() {
  const { subscribe } = useWebSocket();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const membrosDropdownRef = useRef<HTMLDivElement>(null);
  const descricaoRef = useRef<HTMLDivElement>(null);
  const comentariosContainerRef = useRef<HTMLDivElement>(null);
  const [tarefa, setTarefa] = useState<Tarefa | null>(null);
  const [loading, setLoading] = useState(true);
  const { temPermissao } = usePermissao();


  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [isEditingDescricao, setIsEditingDescricao] = useState(false);
  const [status, setStatus] = useState("A_FAZER");
  const [prioridade, setPrioridade] = useState("MEDIA");
  const [dtEntrega, setDtEntrega] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [novoLink, setNovoLink] = useState("");

  const [prioridadeOpen, setPrioridadeOpen] = useState(false);
  const [membrosDropdownOpen, setMembrosDropdownOpen] = useState(false);
  const [mostrarModalArquivar, setMostrarModalArquivar] = useState(false);


  const progresso = tarefa?.progresso || 0;


  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [novoChecklistTitulo, setNovoChecklistTitulo] = useState("");
  const [novoItemNome, setNovoItemNome] = useState("");
  const [checklistSelecionada, setChecklistSelecionada] = useState<number | null>(null);
  const [editingChecklistId, setEditingChecklistId] = useState<number | null>(null);
  const [editingChecklistNome, setEditingChecklistNome] = useState("");



  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [novoComentario, setNovoComentario] = useState("");


  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', show: false });
  const [todosUsuarios, setTodosUsuarios] = useState<Usuario[]>([]);
  const [membrosSelecionados, setMembrosSelecionados] = useState<number[]>([]);
  const [pesquisaMembros, setPesquisaMembros] = useState("");
  const [salvandoMembro, setSalvandoMembro] = useState(false);


  const [formatacaoAtiva, setFormatacaoAtiva] = useState<FormatacaoAtiva>({
    bold: false,
    italic: false,
    underline: false,
    insertUnorderedList: false,
    formatBlock: false
  });

  const salvarTituloAuto = async () => {
    if (!titulo.trim()) {
      showToast("O título não pode estar vazio!", "warning");
      setTitulo(tarefa?.titulo || "");
      return;
    }

    if (titulo === tarefa?.titulo) return;

    const auth = getAuth();
    if (!auth) return;

    try {
      let dtEntregaFormatada = null;
      if (dtEntrega) {
        dtEntregaFormatada = `${dtEntrega}T00:00:00`;
      }

      const payload = {
        titulo,
        descricao,
        prioridade,
        dtEntrega: dtEntregaFormatada,
        links,
        membroIds: membrosSelecionados,
      };

      await api.put(`/tarefas/${id}`, payload, {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
          'Accept-Encoding': 'gzip, deflate'
        },
        withCredentials: true,
        timeout: 30000,
      });

      showToast("Título salvo", "success");

      if (tarefa) {
        setTarefa({ ...tarefa, titulo });
      }

    } catch (error: any) {
      console.error("❌ Erro ao salvar título:", error);
      if (error.response?.status === 401) {
        handleSessionExpired();
      } else {
        showToast("Erro ao salvar título.", "error");
      }
    }
  };

  const salvarPrioridadeAuto = async (novaPrioridade: string) => {
    setPrioridade(novaPrioridade);
    setPrioridadeOpen(false);

    const auth = getAuth();
    if (!auth) return;

    try {
      let dtEntregaFormatada = null;
      if (dtEntrega) {
        dtEntregaFormatada = `${dtEntrega}T00:00:00`;
      }

      const payload = {
        titulo,
        descricao,
        status: tarefa?.status || "A_FAZER",
        prioridade: novaPrioridade, // ✅ Usa a nova prioridade
        dtEntrega: dtEntregaFormatada,
        links,
        membroIds: membrosSelecionados,
      };

      await api.put(`/tarefas/${id}`, payload, {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
          'Accept-Encoding': 'gzip, deflate'
        },
        withCredentials: true,
        timeout: 30000,
      });

      showToast("Prioridade atualizada!", "success");

      if (tarefa) {
        setTarefa({ ...tarefa, prioridade: novaPrioridade });
      }

    } catch (error: any) {
      console.error("❌ Erro ao salvar prioridade:", error);
      if (error.response?.status === 401) {
        handleSessionExpired();
      } else {
        showToast("Erro ao salvar prioridade.", "error");
      }
    }
  };

  const salvarDataEntregaAuto = async (novaData: string) => {
    setDtEntrega(novaData);

    const auth = getAuth();
    if (!auth) return;

    try {
      let dtEntregaFormatada = null;
      if (novaData) {
        dtEntregaFormatada = `${novaData}T00:00:00`;
      }

      const payload = {
        titulo,
        descricao,
        status: tarefa?.status || "A_FAZER",
        prioridade,
        dtEntrega: dtEntregaFormatada, // ✅ Usa a nova data
        links,
        membroIds: membrosSelecionados,
      };

      await api.put(`/tarefas/${id}`, payload, {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
          'Accept-Encoding': 'gzip, deflate'
        },
        withCredentials: true,
        timeout: 30000,
      });

      showToast("Data de entrega atualizada!", "success");

      if (tarefa) {
        setTarefa({ ...tarefa, dtEntrega: dtEntregaFormatada });
      }

    } catch (error: any) {
      console.error("❌ Erro ao salvar data de entrega:", error);
      if (error.response?.status === 401) {
        handleSessionExpired();
      } else {
        showToast("Erro ao salvar data de entrega.", "error");
      }
    }
  };



  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ message, type, show: true });
  };


  const handleSessionExpired = () => {
    showToast("Sessão expirada. Faça login novamente.", "error");
    localStorage.removeItem("auth");
    localStorage.removeItem("usuario");
    localStorage.removeItem("authenticated");
    setTimeout(() => navigate("/", { replace: true }), 1500);
  };


  const getAuth = (): string | null => {
    const auth = localStorage.getItem("auth");
    if (!auth) {
      navigate("/", { replace: true });
      return null;
    }
    return auth;
  };


  const atualizarFormatacaoAtiva = () => {
    if (!descricaoRef.current) return;

    setFormatacaoAtiva({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      formatBlock: (document.queryCommandState('formatBlock') as any) === 'h2'
    });
  };


  // ✅ NOVO: Event handlers para atualizar formatação
  const handleDescricaoMouseUp = () => {
    atualizarFormatacaoAtiva();
  };

  const handleDescricaoKeyUp = () => {
    atualizarFormatacaoAtiva();
  };

  const handleDescricaoKeyDown = () => {
    atualizarFormatacaoAtiva();
  };


  const salvarDescricaoAuto = async () => {
    const auth = getAuth();
    if (!auth) return;

    try {
      let dtEntregaFormatada = null;
      if (dtEntrega) {
        dtEntregaFormatada = `${dtEntrega}T00:00:00`;
      }

      let htmlBruto = descricaoRef.current?.innerHTML || '';
      htmlBruto = htmlBruto.replace(/\s+/g, ' ').trim();

      if (!htmlBruto || htmlBruto === '<br>' || htmlBruto === '<div><br></div>') {
        htmlBruto = '';
      }

      const payload = {
        titulo,
        descricao: htmlBruto,
        prioridade,
        dtEntrega: dtEntregaFormatada,
        links,
        membroIds: membrosSelecionados,
      };

      await api.put(`/tarefas/${id}`, payload, {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
          'Accept-Encoding': 'gzip, deflate'
        },
        withCredentials: true,
        timeout: 30000,
      });

      setDescricao(htmlBruto);
      setIsEditingDescricao(false);
      showToast("Descrição salva com sucesso!", "success");

    } catch (error: any) {
      console.error("❌ Erro ao salvar descrição:", error);
      if (error.response?.status === 401) {
        handleSessionExpired();
      } else {
        showToast("Erro ao salvar descrição.", "error");
      }
    }
  };


  const handleEditarClick = () => {
    if (isEditingDescricao) {
      salvarDescricaoAuto();
    } else {
      setIsEditingDescricao(true);
      setTimeout(() => {
        if (descricaoRef.current) {
          descricaoRef.current.innerHTML = '';
          descricaoRef.current.innerHTML = descricao;
          descricaoRef.current.focus();
          atualizarFormatacaoAtiva();
        }
      }, 10);
    }
  };


  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();


    const carregarTarefa = async () => {
      if (!id) {
        navigate("/home", { replace: true });
        return;
      }


      const auth = getAuth();
      if (!auth) return;


      try {
        setLoading(true);


        const headers = {
          headers: {
            Authorization: `Basic ${auth}`
          },
          withCredentials: true,
          timeout: 30000,
          signal: controller.signal
        };


        const res = await api.get(`/tarefas/${id}`, headers);


        if (!isSubscribed) return;


        let tarefaData = res.data;


        if (tarefaData.empresaId || tarefaData.empresa?.id) {
          try {
            const empresaId = tarefaData.empresaId || tarefaData.empresa?.id;
            const empresaRes = await api.get(`/empresas/${empresaId}`, headers);


            if (isSubscribed) {
              tarefaData.empresa = {
                id: empresaRes.data.id,
                nome: empresaRes.data.nome,
                logoUrl: empresaRes.data.foto || null,
                agenteLink: empresaRes.data.agenteLink || null,
              };
            }
          } catch (err) {
            console.warn("⚠️ Não foi possível carregar dados da empresa:", err);
          }
        }


        try {
          const usuariosRes = await api.get("/usuarios", headers);


          if (isSubscribed) {
            const usuarios = Array.isArray(usuariosRes.data)
              ? usuariosRes.data.map((u: any) => ({
                ...u,
                username: u.email
              }))
              : [];
            setTodosUsuarios(usuarios);
          }
        } catch (err) {
          console.warn("⚠️ Erro ao carregar usuários:", err);
          if (isSubscribed) setTodosUsuarios([]);
        }


        if (!isSubscribed) return;
        try {
          const checklistsRes = await api.get(`/checklists/tarefa/${id}`, headers);

          const checklistsComItens = (checklistsRes.data || []).map((c: any) => {
            return {
              ...c,
              itens: Array.isArray(c.itens) ? c.itens : []
            };
          });

          setChecklists(checklistsComItens);
        } catch (err) {
          console.error("❌ Erro ao carregar checklists:", err);
          setChecklists([]);
        }


        try {
          const comentariosRes = await api.get(`/comentarios/tarefa/${id}`, headers);

          const comentariosProcessados = (comentariosRes.data || []).map((c: any) => {
            return {
              ...c,
              usuario: c.usuario || {}
            };
          });

          setComentarios(comentariosProcessados);
        } catch (err) {
          console.error("❌ Erro ao carregar comentários:", err);
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
        if (!isSubscribed) return;


        if (error.name === 'AbortError') {
          console.log("📋 Requisição cancelada");
          return;
        }


        console.error("❌ Erro ao carregar tarefa:", error);


        if (error.response?.status === 401) {
          handleSessionExpired();
        } else if (error.response?.status === 404) {
          showToast("Tarefa não encontrada.", "error");
          setTimeout(() => navigate("/home"), 1500);
        } else if (error.code === 'ECONNABORTED') {
          showToast("Tempo limite de requisição excedido. Tente novamente.", "error");
        } else {
          showToast("Erro ao carregar tarefa.", "error");
        }
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };


    carregarTarefa();

    const unsubscribe = subscribe((evento) => {
      if (!isSubscribed) return;
      if (evento.tarefaId === Number(id)) {
        switch (evento.tipo) {
          case 'ATUALIZADA':
            if (evento.tarefa) {
              console.log('✅ Atualizando tarefa via WebSocket:', evento.tarefa);

              setTarefa(evento.tarefa as any);
              setTitulo(evento.tarefa.titulo || "");
              setDescricao(evento.tarefa.descricao || "");
              setStatus(evento.tarefa.status || "A_FAZER");
              setPrioridade(evento.tarefa.prioridade || "MEDIA");

              if (evento.tarefa.dtEntrega) {
                const dataEntrega = evento.tarefa.dtEntrega.split('T')[0];
                setDtEntrega(dataEntrega);
              }

              setLinks(evento.tarefa.links || []);

              showToast("Tarefa atualizada em tempo real!", "success");
            }
            break;

          case 'DELETADA':
            showToast("Esta tarefa foi deletada!", "warning");
            setTimeout(() => navigate("/home"), 1500);
            break;
        }
      }
    });

    return () => {
      isSubscribed = false;
      controller.abort();
      unsubscribe();
    };
  }, [id, navigate, subscribe]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        membrosDropdownRef.current &&
        !membrosDropdownRef.current.contains(event.target as Node)
      ) {
        setMembrosDropdownOpen(false);
      }
    };

    if (membrosDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }


    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [membrosDropdownOpen]);

  useEffect(() => {
    if (comentariosContainerRef.current) {
      setTimeout(() => {
        if (comentariosContainerRef.current) {
          comentariosContainerRef.current.scrollTop = comentariosContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [comentarios]);


  const adicionarMembroAuto = async (usuarioId: number) => {
    const auth = getAuth();
    if (!auth) return;

    try {
      setSalvandoMembro(true);

      const estaRemovendo = membrosSelecionados.includes(usuarioId);

      const novosMembros = estaRemovendo
        ? membrosSelecionados.filter((id) => id !== usuarioId)
        : [...membrosSelecionados, usuarioId];

      setMembrosSelecionados(novosMembros);

      setTimeout(async () => {
        try {
          const payload = {
            titulo,
            descricao,
            prioridade,
            dtEntrega: dtEntrega ? `${dtEntrega}T00:00:00` : null,
            links,
            membroIds: novosMembros,
          };

          await api.put(`/tarefas/${id}`, payload, {
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/json",
              'Accept-Encoding': 'gzip, deflate'
            },
            withCredentials: true,
            timeout: 30000,
          });

          showToast(
            estaRemovendo ? "Membro removido!" : "Membro adicionado!",
            "success"
          );

          setMembrosDropdownOpen(false);
        } catch (error: any) {
          console.error("❌ Erro ao salvar membro:", error);
          if (error.response?.status === 401) {
            handleSessionExpired();
          } else {
            showToast("Erro ao salvar membro.", "error");
          }
        } finally {
          setSalvandoMembro(false);
        }
      }, 300);
    } catch (error) {
      console.error("Erro ao processar membro:", error);
      setSalvandoMembro(false);
    }
  };


  const membrosFiltrados = todosUsuarios.filter((u) =>
    u.nome.toLowerCase().includes(pesquisaMembros.toLowerCase())
  );

  const arquivarTarefa = async () => {
    const auth = getAuth();
    if (!auth) return;


    try {
      await api.patch(`/tarefas/${id}/arquivar`, {}, {
        headers: {
          Authorization: `Basic ${auth}`,
          'Accept-Encoding': 'gzip, deflate'
        },
        withCredentials: true,
        timeout: 30000,
      });


      showToast("Tarefa arquivada com sucesso!", "success");
      setTimeout(() => navigate("/home"), 1000);
    } catch (error: any) {
      console.error("❌ Erro ao arquivar:", error);


      if (error.response?.status === 401) {
        handleSessionExpired();
      } else {
        showToast("Erro ao arquivar tarefa.", "error");
      }
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
        headers: {
          Authorization: `Basic ${auth}`,
          'Accept-Encoding': 'gzip, deflate'
        },
        withCredentials: true,
        timeout: 30000,
      });


      setChecklists([...checklists, { ...res.data, itens: res.data.itens || [] }]);
      setNovoChecklistTitulo("");
      showToast("Checklist criada!", "success");
    } catch (error) {
      console.error("❌ Erro ao criar checklist:", error);
      showToast("Erro ao criar checklist.", "error");
    }
  };


  const adicionarItem = async (checklistId: number) => {
    if (!novoItemNome.trim()) return;


    try {
      const auth = localStorage.getItem("auth");


      const payload = {
        nome: novoItemNome,
        tarefaId: Number(id),
        checklistId: checklistId
      };


      const res = await api.post(`/itens`, payload, {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
          'Accept-Encoding': 'gzip, deflate'
        },
        withCredentials: true,
        timeout: 30000,
      });


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
      showToast("Erro ao adicionar item.", "error");
    }
  };


  const toggleItem = async (checklistId: number, itemId: number) => {
    const checklistAtual = checklists.find(c => c.id === checklistId);
    const itemAtual = checklistAtual?.itens?.find(i => i.id === itemId);


    if (!itemAtual) return;


    const statusAnterior = itemAtual.status;


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


    try {
      const auth = localStorage.getItem("auth");
      await api.patch(`/itens/${itemId}/toggle-status`, {}, {
        headers: {
          Authorization: `Basic ${auth}`,
          'Accept-Encoding': 'gzip, deflate'
        },
        withCredentials: true,
        timeout: 30000,
      });


    } catch (error) {
      console.error("❌ Erro ao atualizar item:", error);


      setChecklists(checklists.map(c =>
        c.id === checklistId
          ? {
            ...c,
            itens: (c.itens || []).map(i =>
              i.id === itemId ? { ...i, status: statusAnterior } : i
            )
          }
          : c
      ));


      showToast("Erro ao atualizar item. Tente novamente.", "error");
    }
  };

  const salvarNomeChecklist = async (checklistId: number) => {
    if (!editingChecklistNome.trim()) {
      showToast("O nome não pode estar vazio!", "warning");
      return;
    }

    try {
      const auth = localStorage.getItem("auth");
      await api.put(`/checklists/${checklistId}`, {
        titulo: editingChecklistNome,
      }, {
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json",
          "Accept-Encoding": "gzip, deflate"
        },
        withCredentials: true,
        timeout: 30000,
      });

      setChecklists(checklists.map(c =>
        c.id === checklistId ? { ...c, titulo: editingChecklistNome } : c
      ));

      setEditingChecklistId(null);
      setEditingChecklistNome("");
      showToast("Nome atualizado!", "success");
    } catch (error: any) {
      console.error("Erro ao salvar nome da checklist:", error);
      if (error.response?.status === 401) {
        handleSessionExpired();
      } else {
        showToast("Erro ao salvar nome.", "error");
      }
    }
  };

  const excluirChecklist = async (checklistId: number) => {
    const confirmar = window.confirm("Tem certeza que deseja excluir esta checklist?");
    if (!confirmar) return;

    try {
      const auth = localStorage.getItem("auth");
      await api.delete(`/checklists/${checklistId}`, {
        headers: {
          "Authorization": `Basic ${auth}`,
          "Accept-Encoding": "gzip, deflate"
        },
        withCredentials: true,
        timeout: 30000,
      });

      setChecklists(checklists.filter(c => c.id !== checklistId));
      setEditingChecklistId(null);
      showToast("Checklist excluída!", "success");
    } catch (error: any) {
      console.error("Erro ao excluir checklist:", error);
      if (error.response?.status === 401) {
        handleSessionExpired();
      } else {
        showToast("Erro ao excluir checklist.", "error");
      }
    }
  };

  const excluirItem = async (checklistId: number, itemId: number) => {
    try {
      const auth = localStorage.getItem("auth");
      await api.delete(`/itens/${itemId}`, {
        headers: {
          "Authorization": `Basic ${auth}`,
          "Accept-Encoding": "gzip, deflate"
        },
        withCredentials: true,
        timeout: 30000,
      });

      setChecklists(checklists.map(c =>
        c.id === checklistId
          ? { ...c, itens: c.itens.filter(i => i.id !== itemId) }
          : c
      ));

      showToast("Item excluído!", "success");
    } catch (error: any) {
      console.error("Erro ao excluir item:", error);
      if (error.response?.status === 401) {
        handleSessionExpired();
      } else {
        showToast("Erro ao excluir item.", "error");
      }
    }
  };




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
          "Content-Type": "application/json",
          'Accept-Encoding': 'gzip, deflate'
        },
        withCredentials: true,
        timeout: 30000,
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
      <div className="detalhamento-loading">
        <p>Carregando tarefa...</p>
      </div>
    );
  }


  if (!tarefa) {
    return (
      <div className="detalhamento-not-found">
        <p>Tarefa não encontrada.</p>
        <Button onClick={() => navigate("/home")}>Voltar</Button>
      </div>
    );
  }

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
              <button onClick={() => navigate("/home")} className="return-button">
                <MoveLeft size={18} />
              </button>


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
                onBlur={salvarTituloAuto}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
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
              <div className="detalhamento-title-info-usuarios" ref={membrosDropdownRef}>
                {getMembrosAtribuidos().slice(0, 3).map((membro) => (
                  <div
                    key={membro.id}
                    className="user-avatar"
                    title={membro.nome}
                  >
                    {membro.foto ? (
                      <img
                        src={membro.foto}
                        alt={membro.nome}
                      />
                    ) : (
                      getInitials(membro.nome)
                    )}
                  </div>
                ))}


                <div
                  className="add-member-button"
                  onClick={() => setMembrosDropdownOpen(!membrosDropdownOpen)}
                  title="Adicionar membros"
                >
                  {salvandoMembro ? "⏳" : "+"}
                </div>


                {membrosDropdownOpen && (
                  <div className="membros-dropdown">
                    <div className="membros-dropdown-header">
                      <div className="membros-dropdown-title">Membros</div>
                      <input
                        type="text"
                        placeholder="🔍 Pesquisar..."
                        value={pesquisaMembros}
                        onChange={(e) => setPesquisaMembros(e.target.value)}
                        className="membros-search-input"
                        autoFocus
                      />
                    </div>
                    <div className="membros-dropdown-content">
                      {membrosFiltrados.length > 0 ? (
                        membrosFiltrados.map((usuario) => (
                          <div
                            key={usuario.id}
                            onClick={() => adicionarMembroAuto(usuario.id)}
                            className={`membros-dropdown-item ${membrosSelecionados.includes(usuario.id) ? 'selected' : ''
                              }`}
                          >
                            <div className="membros-dropdown-avatar">
                              {usuario.foto ? (
                                <img
                                  src={usuario.foto}
                                  alt={usuario.nome}
                                />
                              ) : (
                                getInitials(usuario.nome)
                              )}
                            </div>
                            <span className="membros-dropdown-name">{usuario.nome}</span>
                            {membrosSelecionados.includes(usuario.id) && (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="membros-dropdown-empty">
                          Nenhum membro encontrado
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="detalhamento-title-info dropdown-container" onClick={() => setPrioridadeOpen(!prioridadeOpen)}>
                <span>Prioridade: {prioridadeLabels[prioridade] || prioridade} ▼</span>
                {prioridadeOpen && (
                  <ul className="dropdown">
                    {Object.entries(prioridadeLabels).map(([key, label]) => (
                      <li
                        key={key}
                        onClick={(e) => {
                          e.stopPropagation();
                          salvarPrioridadeAuto(key); // ✅ MUDANÇA AQUI
                        }}
                      >
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
                    onChange={(e) => salvarDataEntregaAuto(e.target.value)} // ✅ MUDANÇA AQUI
                    className="date-input"
                  />
                </label>
              </div>

            </div>
          </div>


          <div className="detalhamento-body">
            {/* DESCRIÇÃO COM FORMATAÇÃO ATIVA */}
            <div className="detalhamento-body-item descricao-item">
              <div className="descricao-header">
                <h2>Descrição</h2>
                {temPermissao('TAREFA_EDITAR_GERAL') && (
                  <button
                    onClick={handleEditarClick}
                    className="descricao-edit-btn"
                  >
                    {isEditingDescricao ? '✓ Pronto' : '✏️ Editar'}
                  </button>
                )}
              </div>

              {isEditingDescricao && (
                <div className="descricao-toolbar">
                  <button
                    className={`toolbar-btn ${formatacaoAtiva.bold ? 'ativo' : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      document.execCommand('bold', false);
                      atualizarFormatacaoAtiva();
                      descricaoRef.current?.focus();
                    }}
                    title="Negrito (Ctrl+B)"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    className={`toolbar-btn ${formatacaoAtiva.italic ? 'ativo' : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      document.execCommand('italic', false);
                      atualizarFormatacaoAtiva();
                      descricaoRef.current?.focus();
                    }}
                    title="Itálico (Ctrl+I)"
                  >
                    <em>I</em>
                  </button>
                  <div className="toolbar-separator"></div>
                  <button
                    className={`toolbar-btn ${formatacaoAtiva.insertUnorderedList ? 'ativo' : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      document.execCommand('insertUnorderedList', false);
                      atualizarFormatacaoAtiva();
                      descricaoRef.current?.focus();
                    }}
                    title="Lista"
                  >
                    ≡
                  </button>
                  <button
                    className={`toolbar-btn ${formatacaoAtiva.formatBlock ? 'ativo' : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      document.execCommand('formatBlock', false, 'h2');
                      atualizarFormatacaoAtiva();
                      descricaoRef.current?.focus();
                    }}
                    title="Título (H2)"
                  >
                    H
                  </button>
                  <div className="toolbar-separator"></div>
                  <button
                    className={`toolbar-btn`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const url = prompt('Digite a URL:', 'https://');
                      if (url) {
                        document.execCommand('createLink', false, url);
                        atualizarFormatacaoAtiva();
                      }
                      descricaoRef.current?.focus();
                    }}
                    title="Link"
                  >
                    🔗
                  </button>
                </div>
              )}

              {isEditingDescricao ? (
                <div
                  ref={descricaoRef}
                  key={`editing-${isEditingDescricao}`}
                  contentEditable
                  suppressContentEditableWarning
                  className="descricao-contenteditable"
                  onMouseUp={handleDescricaoMouseUp}
                  onKeyUp={handleDescricaoKeyUp}
                  onKeyDown={handleDescricaoKeyDown}
                />
              ) : (
                <div className="descricao-view" key={`viewing-${descricao}`}>
                  {descricao && descricao.trim() !== '' ? (
                    <div dangerouslySetInnerHTML={{ __html: descricao }} />
                  ) : (
                    <span className="descricao-vazia">Nenhuma descrição adicionada</span>
                  )}
                </div>
              )}
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
              {temPermissao('TAREFA_EDITAR_GERAL') && (
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
              )}


              {checklists.length > 0 ? (
                checklists.map((checklist) => (
                  <div key={checklist.id} className="checklist-item">

                    {/* ✅ Header com lápis discreto */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      {editingChecklistId === checklist.id ? (
                        // Modo de edição do nome
                        <input
                          type="text"
                          value={editingChecklistNome}
                          onChange={(e) => setEditingChecklistNome(e.target.value)}
                          onBlur={() => salvarNomeChecklist(checklist.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              salvarNomeChecklist(checklist.id);
                            }
                            if (e.key === 'Escape') {
                              setEditingChecklistId(null);
                              setEditingChecklistNome("");
                            }
                          }}
                          autoFocus
                          style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            border: '2px solid #667eea',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            outline: 'none',
                            flex: 1
                          }}
                        />
                      ) : (
                        // Modo normal
                        <h3 style={{ margin: 0, color: checklist.cor || "#667eea", flex: 1 }}>
                          {checklist.titulo}
                        </h3>
                      )}

                      {/* ✅ Lápis discreto (hover effect) */}
                      <button
                        onClick={() => {
                          if (editingChecklistId === checklist.id) {
                            setEditingChecklistId(null);
                            setEditingChecklistNome("");
                          } else {
                            setEditingChecklistId(checklist.id);
                            setEditingChecklistNome(checklist.titulo);
                          }
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          opacity: editingChecklistId === checklist.id ? 1 : 0.3,
                          transition: 'opacity 0.2s ease',
                          padding: '4px',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => {
                          if (editingChecklistId !== checklist.id) {
                            e.currentTarget.style.opacity = '0.3';
                          }
                        }}
                        title={editingChecklistId === checklist.id ? "Sair do modo de edição" : "Editar checklist"}
                      >
                        {editingChecklistId === checklist.id ? <Check size={15} /> : <Pencil size={15} />}
                      </button>
                      <button
                        onClick={() => excluirChecklist(checklist.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          opacity: 0.3,
                          transition: 'opacity 0.2s ease',
                          padding: '4px',
                          color: '#dc3545'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.3'}
                        title="Excluir checklist"
                      >
                        <Trash size={15} />
                      </button>
                    </div>

                    {/* ✅ Botões de ação (só aparecem no modo de edição) */}
                    {editingChecklistId === checklist.id && (
                      <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
                      </div>
                    )}

                    {/* ✅ Lista de itens */}
                    {Array.isArray(checklist.itens) && checklist.itens.length > 0 ? (
                      <ul className="task-list">
                        {checklist.itens.map((item) => (
                          <li key={item.id} className={`task-item ${item.status ? "done" : ""}`}>
                            <div className="task-content" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                              <input
                                type="checkbox"
                                checked={item.status}
                                onChange={() => toggleItem(checklist.id, item.id)}
                              />
                              <span
                                onClick={() => toggleItem(checklist.id, item.id)}
                                style={{ flex: 1, cursor: 'pointer' }}
                              >
                                {item.nome}
                              </span>

                              {/* ✅ Botão de excluir item (só aparece no modo de edição) */}
                              {editingChecklistId === checklist.id && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    excluirItem(checklist.id, item.id);
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    opacity: 0.3,
                                    transition: 'opacity 0.2s ease',
                                    padding: '4px',
                                    color: '#dc3545'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.3'}
                                  title="Excluir item"
                                >
                                  <Trash size={15}></Trash>
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="empty-message">Nenhum item nesta checklist.</p>
                    )}

                    {/* ✅ Adicionar item (fica igual ao atual) */}
                    <div className="add-item-container">
                      {checklistSelecionada === checklist.id ? (
                        <>
                          <input
                            type="text"
                            placeholder="Novo item"
                            value={novoItemNome}
                            onChange={(e) => setNovoItemNome(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                adicionarItem(checklist.id);
                              }
                            }}
                            className="add-item-input"
                          />
                          <button onClick={() => adicionarItem(checklist.id)} className="add-item-button">
                            Adicionar
                          </button>
                          <button
                            onClick={() => {
                              setChecklistSelecionada(null);
                              setNovoItemNome("");
                            }}
                            className="cancel-button"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button onClick={() => setChecklistSelecionada(checklist.id)} className="add-item-button">
                          + Adicionar Item
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-message">Nenhuma checklist criada ainda.</p>
              )}

            </div>
          </div>


          <div className="detalhamento-footer">
            <div className="detalhamento-footer-left">
              <Button
                variant="outlined"
                color="warning"
                onClick={() => setMostrarModalArquivar(true)}
                className="btn-arquivar"
              >
                📦 Arquivar
              </Button>
            </div>
          </div>
        </div>


        <div className="detalhamento-sections">
          <div className="detalhamento-historico">
            <h2 className="detalhamento-historico-title">Histórico</h2>
            <p>Tarefa criada: {tarefa.dtCriacao ? new Date(tarefa.dtCriacao).toLocaleString("pt-BR") : "Data não disponível"}</p>
          </div>


          <div className="detalhamento-comentarios">
            <h2 className="detalhamento-comentarios-title">Comentários</h2>

            {/* LISTA DE COMENTÁRIOS COM SCROLL */}
            <div
              ref={comentariosContainerRef}
              className="detalhamento-comentarios-list-container"
            >
              {comentarios.length > 0 ? (
                <>
                  {/* ✅ INVERTE A ORDEM: MAIS ANTIGOS PRIMEIRO, NOVOS EMBAIXO */}
                  {[...comentarios].reverse().map((c) => {
                    if (!c.usuario) {
                      console.warn("Comentário sem objeto usuario:", c);
                      return null;
                    }
                    return (
                      <div key={c.id} className="detalhamento-comentarios-item">
                        <div className="comentario-avatar">
                          {c.usuario.foto ? (
                            <img src={c.usuario.foto} alt={c.usuario.nome} />
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
                  })}
                </>
              ) : (
                <p className="empty-message-comentarios">Nenhum comentário ainda.</p>
              )}
            </div>

            {/* INPUT COM AUTOCOMPLETE DE MENÇÕES */}
            <MentionTextarea
              value={novoComentario}
              onChange={setNovoComentario}
              usuarios={todosUsuarios}
              placeholder="Adicione um comentário"
              onSubmit={adicionarComentario}
            />

          </div>
          <DropboxFiles />
        </div>
      </div>


      {mostrarModalArquivar && (
        <div
          className="modal-overlay"
          onClick={() => setMostrarModalArquivar(false)}
        >
          <div
            className="modal-arquivar"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Arquivar Tarefa?</h3>
            <p>
              Tem certeza que deseja arquivar esta tarefa? Ela será movida para a seção de tarefas arquivadas.
            </p>
            <div className="modal-arquivar-actions">
              <Button
                variant="outlined"
                onClick={() => setMostrarModalArquivar(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                className="btn-arquivar-confirm"
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
