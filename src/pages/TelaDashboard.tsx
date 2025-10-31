import React, { useEffect, useState } from "react";
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
  Menu as MenuIcon // ✅ ADICIONAR
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
  tags: string[];
  dtEntrega?: string;
  dtCriacao?: string;
  dtConclusao?: string;
  empresa: string;
  empresaId?: number;
  membroIds?: number[];
  listaId?: number;
}

interface Empresa {
  id: number;
  nome: string;
}

interface Membro {
  id: number;
  nome: string;
  username: string;
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
        const headers = { headers: { Authorization: `Basic ${auth}` }, withCredentials: true };

        const [tarefasRes, empresasRes, membrosRes, listasRes] = await Promise.all([
          api.get("/tarefas", headers),
          api.get("/empresas", headers),
          api.get("/usuarios", headers),
          api.get("/listas", headers),
        ]);

        setTarefas(Array.isArray(tarefasRes.data) ? tarefasRes.data : []);
        setEmpresas(Array.isArray(empresasRes.data) ? empresasRes.data : []);
        setMembros(Array.isArray(membrosRes.data) ? membrosRes.data : []);
        setListas(Array.isArray(listasRes.data) ? listasRes.data : []);
      } catch (error: any) {
        setTarefas([]);
        setEmpresas([]);
        setMembros([]);
        setListas([]);
        if (error.response?.status === 401) {
          showToast("Sessão expirada. Faça login novamente.", "error");
          localStorage.removeItem("auth");
          localStorage.removeItem("usuario");
          setTimeout(() => navigate("/login", { replace: true }), 1500);
        } else {
          showToast("Erro ao carregar dados do dashboard.", "error");
        }
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, [navigate]);

  // ✅ CÁLCULOS DE MÉTRICAS
  const totalTarefas = tarefas.length;
  const tarefasConcluidas = tarefas.filter((t) =>
    t.status?.toLowerCase().includes("conclu") ||
    t.status?.toLowerCase().includes("finaliz")
  ).length;

  const tarefasVencidas = tarefas.filter((t) =>
    t.dtEntrega && new Date(t.dtEntrega) < new Date() &&
    !t.status?.toLowerCase().includes("conclu")
  ).length;

  const tarefasPendentes = totalTarefas - tarefasConcluidas;

  const taxaConclusao = totalTarefas > 0
    ? Math.round((tarefasConcluidas / totalTarefas) * 100)
    : 0;

  // Tarefas por prioridade
  const tarefasPorPrioridade = {
    CRITICA: tarefas.filter(t => t.prioridade === "CRITICA").length,
    ALTA: tarefas.filter(t => t.prioridade === "ALTA").length,
    MEDIA: tarefas.filter(t => t.prioridade === "MEDIA").length,
    BAIXA: tarefas.filter(t => t.prioridade === "BAIXA").length,
  };

  // Tarefas por empresa
  const tarefasPorEmpresa = empresas.map(empresa => ({
    nome: empresa.nome,
    total: tarefas.filter(t => t.empresaId === empresa.id).length,
    concluidas: tarefas.filter(t =>
      t.empresaId === empresa.id &&
      (t.status?.toLowerCase().includes("conclu") || t.status?.toLowerCase().includes("finaliz"))
    ).length,
  })).sort((a, b) => b.total - a.total).slice(0, 5);

  // Tarefas por lista/board
  const tarefasPorLista = listas.map(lista => ({
    nome: lista.nome,
    total: tarefas.filter(t => t.listaId === lista.id).length,
  })).sort((a, b) => b.total - a.total);

  // Performance dos membros
  const performanceMembros = membros.map(membro => ({
    nome: membro.nome,
    total: tarefas.filter(t => t.membroIds?.includes(membro.id)).length,
    concluidas: tarefas.filter(t =>
      t.membroIds?.includes(membro.id) &&
      (t.status?.toLowerCase().includes("conclu") || t.status?.toLowerCase().includes("finaliz"))
    ).length,
  })).filter(m => m.total > 0)
    .sort((a, b) => b.concluidas - a.concluidas)
    .slice(0, 5);

  // Tarefas próximas do vencimento (próximos 7 dias)
  const proximasVencer = tarefas.filter(t => {
    if (!t.dtEntrega || t.status?.toLowerCase().includes("conclu")) return false;
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
                <p className="empty-state">Nenhuma empresa com tarefas</p>
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
                performanceMembros.map((membro, index) => (
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
                <p className="empty-state">Nenhum membro com tarefas atribuídas</p>
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
                <p className="empty-state">Nenhuma tarefa próxima do vencimento</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
