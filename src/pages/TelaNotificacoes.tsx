import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, Trash2, Calendar, MessageSquare, UserPlus, Clock } from "lucide-react";
import { useWebSocket } from '../contexts/WebSocketContext';
import api from "../services/api";
import { Toast } from "./Toast";
import "./TelaNotificacoes.css";

interface Notificacao {
    id: number;
    tipo: "MENCAO" | "ATRIBUICAO" | "PRAZO" | "COMENTARIO" | "TAREFA_MOVIDA" | "TAREFA_ATUALIZADA";
    titulo: string;
    mensagem: string;
    tarefaId?: number;
    tarefaTitulo?: string;
    remetente: {
        id: number;
        nome: string;
        foto?: string;
    };
    dataHora: string;
    lida: boolean;
}

interface ToastState {
    message: string;
    type: 'success' | 'error' | 'warning';
    show: boolean;
}

export default function TelaNotificacoes() {
    const navigate = useNavigate();
    const { subscribe } = useWebSocket();
    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [filtro, setFiltro] = useState<"TODAS" | "NAO_LIDAS">("TODAS");
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', show: false });

    const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
        setToast({ message, type, show: true });
    };

    const getAuth = (): string | null => {
        const auth = localStorage.getItem("auth");
        if (!auth) {
            navigate("/", { replace: true });
            return null;
        }
        return auth;
    };

    // ✅ Carregar notificações
    useEffect(() => {
        const carregarNotificacoes = async () => {
            const auth = getAuth();
            if (!auth) return;

            try {
                setLoading(true);
                const response = await api.get("/notificacoes", {
                    headers: { Authorization: `Basic ${auth}` },
                    withCredentials: true,
                });
                setNotificacoes(response.data);
            } catch (error: any) {
                console.error("Erro ao carregar notificações:", error);
                showToast("Erro ao carregar notificações", "error");
            } finally {
                setLoading(false);
            }
        };

        carregarNotificacoes();

        // ✅ Subscribe ao WebSocket
        const unsubscribe = subscribe((evento) => {
            if (evento.tipo === 'NOTIFICACAO') {
                const notif = evento.notificacao;

                // ✅ Type guard
                if (notif && notif.id && notif.titulo && notif.mensagem) {
                    setNotificacoes(prev => [notif as Notificacao, ...prev]);
                    showToast(`Nova notificação: ${notif.titulo}`, 'success');
                }
            }
        });

        return () => unsubscribe();
    }, [subscribe, navigate]);



    const getIcon = (tipo: Notificacao["tipo"]) => {
        switch (tipo) {
            case "ATRIBUICAO":
                return <UserPlus size={20} className="icon-atribuicao" />;
            case "MENCAO":
                return <MessageSquare size={20} className="icon-mencao" />;
            case "PRAZO":
                return <Calendar size={20} className="icon-prazo" />;
            case "COMENTARIO":
                return <MessageSquare size={20} className="icon-comentario" />;
            default:
                return <Bell size={20} />;
        }
    };

    const getInitials = (nome: string) => {
        const words = nome.trim().split(' ');
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return nome.substring(0, 2).toUpperCase();
    };

    const formatarTempo = (dataHora: string) => {
        const agora = new Date();
        const data = new Date(dataHora);
        const diffMs = agora.getTime() - data.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Agora mesmo";
        if (diffMins < 60) return `${diffMins}min atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        if (diffDays === 1) return "Ontem";
        if (diffDays < 7) return `${diffDays} dias atrás`;
        return data.toLocaleDateString("pt-BR");
    };

    const marcarComoLida = async (id: number) => {
        const auth = getAuth();
        if (!auth) return;

        try {
            await api.patch(`/notificacoes/${id}/marcar-lida`, {}, {
                headers: { Authorization: `Basic ${auth}` },
                withCredentials: true,
            });
            setNotificacoes(prev =>
                prev.map(n => n.id === id ? { ...n, lida: true } : n)
            );
        } catch (error) {
            showToast("Erro ao marcar como lida", "error");
        }
    };

    const marcarTodasComoLidas = async () => {
        const auth = getAuth();
        if (!auth) return;

        try {
            await api.patch("/notificacoes/marcar-todas-lidas", {}, {
                headers: { Authorization: `Basic ${auth}` },
                withCredentials: true,
            });
            setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
            showToast("Todas marcadas como lidas", "success");
        } catch (error) {
            showToast("Erro ao marcar todas como lidas", "error");
        }
    };

    const deletarNotificacao = async (id: number) => {
        const auth = getAuth();
        if (!auth) return;

        try {
            await api.delete(`/notificacoes/${id}`, {
                headers: { Authorization: `Basic ${auth}` },
                withCredentials: true,
            });
            setNotificacoes(prev => prev.filter(n => n.id !== id));
            showToast("Notificação deletada", "success");
        } catch (error) {
            showToast("Erro ao deletar notificação", "error");
        }
    };

    const abrirTarefa = (notif: Notificacao) => {
        if (notif.tarefaId) {
            marcarComoLida(notif.id);
            navigate(`/detalhamento/${notif.tarefaId}`);
        }
    };

    const notificacoesFiltradas = notificacoes.filter(n =>
        filtro === "TODAS" ? true : !n.lida
    );

    const naoLidas = notificacoes.filter(n => !n.lida).length;

    if (loading) {
        return (
            <div className="notificacoes-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p>Carregando notificações...</p>
            </div>
        );
    }

    return (
        <>
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            <div className="notificacoes-wrapper">
                <div className="notificacoes-header">
                    <div className="header-left">
                        <Bell size={28} />
                        <h1>Notificações</h1>
                        {naoLidas > 0 && (
                            <span className="badge-nao-lidas">{naoLidas}</span>
                        )}
                    </div>
                    <button
                        className="btn-marcar-todas"
                        onClick={marcarTodasComoLidas}
                        disabled={naoLidas === 0}
                    >
                        <CheckCheck size={18} />
                        Marcar todas como lidas
                    </button>
                </div>

                <div className="notificacoes-filtros">
                    <button
                        className={`filtro-btn ${filtro === "TODAS" ? "active" : ""}`}
                        onClick={() => setFiltro("TODAS")}
                    >
                        Todas ({notificacoes.length})
                    </button>
                    <button
                        className={`filtro-btn ${filtro === "NAO_LIDAS" ? "active" : ""}`}
                        onClick={() => setFiltro("NAO_LIDAS")}
                    >
                        Não lidas ({naoLidas})
                    </button>
                </div>

                <div className="notificacoes-lista">
                    {notificacoesFiltradas.length === 0 ? (
                        <div className="empty-state">
                            <Bell size={64} />
                            <h3>Nenhuma notificação</h3>
                            <p>Você está em dia! 🎉</p>
                        </div>
                    ) : (
                        notificacoesFiltradas.map(notif => (
                            <div
                                key={notif.id}
                                className={`notificacao-card ${!notif.lida ? "nao-lida" : ""}`}
                                onClick={() => abrirTarefa(notif)}
                            >
                                <div className="notificacao-icon">
                                    {getIcon(notif.tipo)}
                                </div>

                                <div className="notificacao-content">
                                    <div className="notificacao-top">
                                        <div className="remetente-avatar">
                                            {notif.remetente?.foto ? (  // ✅ Optional chaining
                                                <img src={notif.remetente.foto} alt={notif.remetente.nome} />
                                            ) : (
                                                <div className="avatar-placeholder">
                                                    {notif.remetente ? getInitials(notif.remetente.nome) : 'S'}  {/* ✅ S = Sistema */}
                                                </div>
                                            )}
                                        </div>
                                        <div className="notificacao-info">
                                            <h4>{notif.titulo}</h4>
                                            <p>{notif.mensagem}</p>
                                            {notif.tarefaTitulo && (
                                                <div className="tarefa-link">
                                                    <Clock size={14} />
                                                    <span>{notif.tarefaTitulo}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="notificacao-footer">
                                        <span className="tempo">{formatarTempo(notif.dataHora)}</span>
                                        <div className="acoes">
                                            {!notif.lida && (
                                                <button
                                                    className="btn-marcar-lida"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        marcarComoLida(notif.id);
                                                    }}
                                                    title="Marcar como lida"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            )}
                                            <button
                                                className="btn-deletar"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deletarNotificacao(notif.id);
                                                }}
                                                title="Deletar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {!notif.lida && <div className="indicador-nao-lida"></div>}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
