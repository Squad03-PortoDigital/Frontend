import { useEffect, useState } from "react";
import "./TelaDashboard.css";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Calendar,
} from "lucide-react";
import api from "../services/api";
import logoFlap from "../images/Logo-azul-FLAP 1.png";
import { Toast } from "./Toast";

interface TarefaDTO {
  id: number;
  titulo: string;
  status: string;
  prioridade: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
  posicao: number;
  dtEntrega?: string;
  dtCriacao?: string;
  dtConclusao?: string;
  concluida?: boolean;  // ✅ ADICIONADO
  empresa: string;
  empresaId?: number;
  membros?: Membro[];
  listaId?: number;
}

interface Empresa {
  id: number;
  nome: string;
}

interface Membro {
  id: number; 
  membroId: number;   
  usuarioId: number;  
  nome: string;       
  username?: string; 
  foto?: string;      
}

interface Lista {
  id: number;
  nome: string;
  posicao: number;
  cor?: string;
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

export default function TelaDashboard() {
  const [tarefas, setTarefas] = useState<TarefaDTO[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [listas, setListas] = useState<Lista[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', show: false });
  const navigate = useNavigate();

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
    let isSubscribed = true;
    const controller = new AbortController();

    const carregarDados = async () => {
      const auth = getAuth();
      if (!auth) return;

      try {
        setLoading(true);
        
        console.log("📡 Iniciando carregamento dos dados do dashboard...");

        const [tarefasRes, empresasRes, membrosRes, listasRes] = await Promise.all([
          api.get("/tarefas", { signal: controller.signal }),
          api.get("/empresas", { signal: controller.signal }),
          api.get("/usuarios", { signal: controller.signal }),
          api.get("/listas", { signal: controller.signal }),
        ]);

        if (!isSubscribed) return;

        console.log("✅ Tarefas carregadas:", tarefasRes.data);
        console.log("✅ Empresas carregadas:", empresasRes.data);
        console.log("✅ Membros carregados:", membrosRes.data);
        console.log("✅ Listas carregadas:", listasRes.data);

        const tarefasFiltradas = Array.isArray(tarefasRes.data)
          ? tarefasRes.data.filter((t: TarefaDTO) => t.status !== "ARQUIVADA")
          : [];

        setTarefas(tarefasFiltradas);
        setEmpresas(Array.isArray(empresasRes.data) ? empresasRes.data : []);
        setMembros(Array.isArray(membrosRes.data) ? membrosRes.data : []);
        setListas(Array.isArray(listasRes.data) ? listasRes.data : []);
        
        console.log("✅ Dashboard carregado com sucesso!");
      } catch (error: any) {
        if (!isSubscribed) return;

        if (error.name === 'AbortError') {
          console.log("📋 Requisição cancelada");
          return;
        }

        console.error("❌ Erro ao carregar dados:", error);
        setTarefas([]);
        setEmpresas([]);
        setMembros([]);
        setListas([]);
        
        if (error.response?.status === 401) {
          handleSessionExpired();
        } else if (error.code === 'ECONNABORTED') {
          showToast("Tempo limite de requisição excedido. Tente novamente.", "error");
        } else {
          showToast("Erro ao carregar dados do dashboard.", "error");
        }
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    carregarDados();

    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, []);

  // ✅ ATUALIZADO - USA concluida
  const totalTarefas = tarefas.length;
  const tarefasConcluidas = tarefas.filter(t => t.concluida === true).length;

  // ✅ ATUALIZADO - USA concluida
  const tarefasVencidas = tarefas.filter((t) =>
    t.dtEntrega && 
    new Date(t.dtEntrega) < new Date() &&
    !t.concluida  // ✅ Mudou de status para concluida
  ).length;

  const tarefasPendentes = totalTarefas - tarefasConcluidas;

  const taxaConclusao = totalTarefas > 0
    ? Math.round((tarefasConcluidas / totalTarefas) * 100)
    : 0;

  const tarefasPorPrioridade = {
    CRITICA: tarefas.filter(t => t.prioridade === "CRITICA").length,
    ALTA: tarefas.filter(t => t.prioridade === "ALTA").length,
    MEDIA: tarefas.filter(t => t.prioridade === "MEDIA").length,
    BAIXA: tarefas.filter(t => t.prioridade === "BAIXA").length,
  };

  // ✅ ATUALIZADO - USA concluida
  const tarefasPorEmpresa = empresas.map(empresa => ({
    nome: empresa.nome,
    total: tarefas.filter(t => t.empresaId === empresa.id).length,
    concluidas: tarefas.filter(t =>
      t.empresaId === empresa.id && t.concluida === true  // ✅ Mudou
    ).length,
  })).sort((a, b) => b.total - a.total).slice(0, 5);

  const tarefasPorLista = listas.map(lista => ({
    nome: lista.nome,
    total: tarefas.filter(t => t.listaId === lista.id).length,
  })).sort((a, b) => b.total - a.total);

  // ✅ ATUALIZADO - USA concluida
  const performanceMembros = membros.map(membro => {
    const tarefasDoMembro = tarefas.filter(t => 
      t.membros?.some(m => m.usuarioId === membro.id)
    );
    
    const tarefasConcluidasDoMembro = tarefasDoMembro.filter(t => 
      t.concluida === true  // ✅ Mudou de status para concluida
    );

    return {
      nome: membro.nome,
      total: tarefasDoMembro.length,
      concluidas: tarefasConcluidasDoMembro.length,
    };
  })
    .filter(m => m.total > 0)
    .sort((a, b) => b.concluidas - a.concluidas)
    .slice(0, 5);

  // ✅ ATUALIZADO - USA concluida
  const proximasVencer = tarefas.filter(t => {
    if (!t.dtEntrega || t.concluida) return false;  // ✅ Mudou de status para concluida
    const diff = new Date(t.dtEntrega).getTime() - new Date().getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 7;
  }).sort((a, b) =>
    new Date(a.dtEntrega!).getTime() - new Date(b.dtEntrega!).getTime()
  ).slice(0, 5);

  if (loading) {
    return (
      <div className="dashboard-wrapper" style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}>
        <p>Carregando dashboard...</p>
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

      <div className="dashboard-wrapper">
        {/* ==== CARDS SUPERIORES ==== */}
        <div className="dashboard-top">
          <div className="dashboard-card-top">
            <div className="card-top-header">
              <TrendingUp size={24} color="#1E52A5" />
              <h3>Taxa de Conclusão</h3>
            </div>
            <div className="dashboard-number">{taxaConclusao}%</div>
            <p>{tarefasConcluidas} de {totalTarefas} tarefas</p>
          </div>

          <div className="dashboard-card-top">
            <div className="card-top-header">
              <Clock size={24} color="#fd7e14" />
              <h3>Tarefas Pendentes</h3>
            </div>
            <div className="dashboard-number">{tarefasPendentes}</div>
            <p>{tarefasVencidas} vencidas</p>
          </div>

          <div className="dashboard-card-top dashboard-card-welcome">
            <div className="welcome-content">
              <div className="welcome-text">
                <h3>{getSaudacao()}!</h3>
                <p>Visão geral do seu projeto</p>
              </div>
              <img src={logoFlap} alt="FLAP Logo" className="flap-logo" />
            </div>
            <div className="dashboard-stats">
              <div className="stat-item">
                <Building2 size={18} color="#1E52A5" />
                <span>{empresas.length} empresas</span>
              </div>
              <div className="stat-item">
                <Users size={18} color="#1E52A5" />
                <span>{membros.length} membros</span>
              </div>
            </div>
          </div>
        </div>

        {/* ==== GRID DE MÉTRICAS ==== */}
        <div className="dashboard-grid">
          {/* TAREFAS POR PRIORIDADE */}
          <div className="dashboard-card">
            <div className="card-header">
              <AlertCircle size={20} color="#1E52A5" />
              <h3>Tarefas por Prioridade</h3>
            </div>
            <div className="priority-list">
              {Object.entries(tarefasPorPrioridade).map(([prioridade, count]) => (
                <div key={prioridade} className="priority-item">
                  <div className="priority-label">
                    <div className={`priority-dot ${prioridadeCores[prioridade]}`}></div>
                    <span>{prioridade}</span>
                  </div>
                  <div className="priority-bar">
                    <div
                      className={`priority-fill ${prioridadeCores[prioridade]}`}
                      style={{ width: `${totalTarefas > 0 ? (count / totalTarefas) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="priority-count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TAREFAS POR EMPRESA */}
          <div className="dashboard-card">
            <div className="card-header">
              <Building2 size={20} color="#1E52A5" />
              <h3>Top 5 Empresas</h3>
            </div>
            <div className="empresa-list">
              {tarefasPorEmpresa.length > 0 ? (
                tarefasPorEmpresa.map((empresa, index) => (
                  <div key={empresa.nome} className="empresa-item">
                    <div className="empresa-rank">#{index + 1}</div>
                    <div className="empresa-info">
                      <div className="empresa-nome">{empresa.nome}</div>
                      <div className="empresa-stats">
                        {empresa.concluidas}/{empresa.total} concluídas
                      </div>
                    </div>
                    <div className="empresa-badge">{empresa.total}</div>
                  </div>
                ))
              ) : (
                <div className="empty-state">Nenhuma empresa com tarefas</div>
              )}
            </div>
          </div>

          {/* PERFORMANCE DOS MEMBROS */}
          <div className="dashboard-card">
            <div className="card-header">
              <Users size={20} color="#1E52A5" />
              <h3>Performance da Equipe</h3>
            </div>
            <div className="membro-list">
              {performanceMembros.length > 0 ? (
                performanceMembros.map((membro) => (
                  <div key={membro.nome} className="membro-item">
                    <div className="membro-avatar">
                      {membro.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="membro-info">
                      <div className="membro-nome">{membro.nome}</div>
                      <div className="membro-progress">
                        <div
                          className="membro-progress-bar"
                          style={{
                            width: `${membro.total > 0 ? (membro.concluidas / membro.total) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="membro-stats">
                      <CheckCircle2 size={16} color="#36B37E" />
                      <span>{membro.concluidas}/{membro.total}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">Nenhum membro com tarefas atribuídas</div>
              )}
            </div>
          </div>

          {/* TAREFAS POR LISTA/BOARD */}
          <div className="dashboard-card">
            <div className="card-header">
              <BarChart3 size={20} color="#1E52A5" />
              <h3>Distribuição por Board</h3>
            </div>
            <div className="lista-grid">
              {tarefasPorLista.map((lista) => (
                <div key={lista.nome} className="lista-item">
                  <div className="lista-nome">{lista.nome}</div>
                  <div className="lista-count">{lista.total}</div>
                </div>
              ))}
            </div>
          </div>

          {/* TAREFAS PRÓXIMAS DO VENCIMENTO */}
          <div className="dashboard-card dashboard-card-wide">
            <div className="card-header">
              <Calendar size={20} color="#fd7e14" />
              <h3>Próximas do Vencimento (7 dias)</h3>
            </div>
            <div className="proximas-list">
              {proximasVencer.length > 0 ? (
                proximasVencer.map((tarefa) => (
                  <div
                    key={tarefa.id}
                    className="proxima-item"
                    onClick={() => navigate(`/detalhamento/${tarefa.id}`)}
                  >
                    <div className="proxima-dots">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className={`dot ${prioridadeCores[tarefa.prioridade]}`}></div>
                      ))}
                    </div>
                    <div className="proxima-info">
                      <div className="proxima-titulo">{tarefa.titulo}</div>
                      <div className="proxima-empresa">{tarefa.empresa}</div>
                    </div>
                    <div className="proxima-data">
                      {tarefa.dtEntrega && new Date(tarefa.dtEntrega).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">Nenhuma tarefa próxima do vencimento</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
