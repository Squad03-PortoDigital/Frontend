import React, { useEffect, useState } from "react";
import "./TelaCalendario.css";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  X,
  Plus,
  Edit2,
  Trash2,
  Users,
  MapPin
} from "lucide-react";
import api from "../services/api";
import { Toast } from "./Toast";

interface EventoDTO {
  id: number;
  titulo: string;
  descricao?: string;
  data: string; // formato ISO: "2025-12-10"
  horario?: string; // formato: "14:30"
  local?: string;
  participantes?: string[];
  cor?: string;
  tipo: "ANIVERSARIO" | "REUNIAO" | "FERIADO" | "OUTRO";
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning';
  show: boolean;
}

const tipoEventoCores: { [key: string]: string } = {
  ANIVERSARIO: "#FF6B9D",
  REUNIAO: "#1E52A5",
  FERIADO: "#36B37E",
  OUTRO: "#FFAB00",
};

const mesesNomes = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function TelaCalendario() {
  const [eventos, setEventos] = useState<EventoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesAtual, setMesAtual] = useState(new Date().getMonth());
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoEditando, setEventoEditando] = useState<EventoDTO | null>(null);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', show: false });

  // Form states
  const [formTitulo, setFormTitulo] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formData, setFormData] = useState("");
  const [formHorario, setFormHorario] = useState("");
  const [formLocal, setFormLocal] = useState("");
  const [formTipo, setFormTipo] = useState<"ANIVERSARIO" | "REUNIAO" | "FERIADO" | "OUTRO">("OUTRO");

  const navigate = useNavigate();

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ message, type, show: true });
  };

  useEffect(() => {
    carregarEventos();
  }, []);

  const carregarEventos = async () => {
    try {
      setLoading(true);
      const auth = localStorage.getItem("auth");
      const headers = { headers: { Authorization: `Basic ${auth}` }, withCredentials: true };

      const eventosRes = await api.get("/eventos", headers);
      setEventos(Array.isArray(eventosRes.data) ? eventosRes.data : []);
    } catch (error: any) {
      setEventos([]);
      if (error.response?.status === 401) {
        showToast("Sessão expirada. Faça login novamente.", "error");
        localStorage.removeItem("auth");
        localStorage.removeItem("usuario");
        setTimeout(() => navigate("/login", { replace: true }), 1500);
      } else {
        showToast("Erro ao carregar eventos.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const getDiasDoMes = () => {
    const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0).getDate();
    const dias: (number | null)[] = [];

    for (let i = primeiroDia - 1; i >= 0; i--) {
      dias.push(null);
    }

    for (let i = 1; i <= ultimoDia; i++) {
      dias.push(i);
    }

    return dias;
  };

  const isHoje = (dia: number) => {
    const hoje = new Date();
    return (
      dia === hoje.getDate() &&
      mesAtual === hoje.getMonth() &&
      anoAtual === hoje.getFullYear()
    );
  };

  const getEventosDoDia = (dia: number) => {
    return eventos.filter(e => {
      const dataEvento = new Date(e.data);
      return (
        dataEvento.getDate() === dia &&
        dataEvento.getMonth() === mesAtual &&
        dataEvento.getFullYear() === anoAtual
      );
    });
  };

  const mesAnterior = () => {
    if (mesAtual === 0) {
      setMesAtual(11);
      setAnoAtual(anoAtual - 1);
    } else {
      setMesAtual(mesAtual - 1);
    }
    setDiaSelecionado(null);
  };

  const proximoMes = () => {
    if (mesAtual === 11) {
      setMesAtual(0);
      setAnoAtual(anoAtual + 1);
    } else {
      setMesAtual(mesAtual + 1);
    }
    setDiaSelecionado(null);
  };

  const abrirModalNovoEvento = (dia?: number) => {
    const diaEscolhido = dia || diaSelecionado || new Date().getDate();
    const dataFormatada = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(diaEscolhido).padStart(2, '0')}`;

    setFormData(dataFormatada);
    setFormTitulo("");
    setFormDescricao("");
    setFormHorario("");
    setFormLocal("");
    setFormTipo("OUTRO");
    setEventoEditando(null);
    setModalAberto(true);
  };

  const abrirModalEditarEvento = (evento: EventoDTO) => {
    setFormTitulo(evento.titulo);
    setFormDescricao(evento.descricao || "");
    setFormData(evento.data);
    setFormHorario(evento.horario || "");
    setFormLocal(evento.local || "");
    setFormTipo(evento.tipo);
    setEventoEditando(evento);
    setModalAberto(true);
  };

  const salvarEvento = async () => {
    if (!formTitulo.trim() || !formData) {
      showToast("Preencha o título e a data do evento!", "warning");
      return;
    }

    const eventoData = {
      titulo: formTitulo,
      descricao: formDescricao,
      data: formData,
      horario: formHorario,
      local: formLocal,
      tipo: formTipo,
      cor: tipoEventoCores[formTipo],
    };

    try {
      const auth = localStorage.getItem("auth");
      const headers = {
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
        withCredentials: true
      };

      if (eventoEditando) {
        await api.put(`/eventos/${eventoEditando.id}`, eventoData, headers);
        showToast("Evento atualizado!", "success");
      } else {
        await api.post("/eventos", eventoData, headers);
        showToast("Evento criado!", "success");
      }

      setModalAberto(false);
      await carregarEventos();
    } catch (error) {
      showToast("Erro ao salvar evento.", "error");
    }
  };

  const deletarEvento = async (id: number, titulo: string) => {
    const confirmar = window.confirm(`Tem certeza que deseja deletar o evento "${titulo}"?`);
    if (!confirmar) return;

    try {
      const auth = localStorage.getItem("auth");
      await api.delete(`/eventos/${id}`, {
        headers: { Authorization: `Basic ${auth}` },
        withCredentials: true,
      });
      showToast("Evento deletado!", "success");
      await carregarEventos();
    } catch (error) {
      showToast("Erro ao deletar evento.", "error");
    }
  };

  const eventosDiaSelecionado = diaSelecionado ? getEventosDoDia(diaSelecionado) : [];

  if (loading) {
    return (
      <div className="calendario-wrapper" style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}>
        <p>Carregando calendário...</p>
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

      <div className="calendario-wrapper">
        {/* HEADER DO CALENDÁRIO */}
        <div className="calendario-header">
          <div className="calendario-titulo">
            <CalendarIcon size={28} color="#1E52A5" />
            <h1>Calendário de Eventos</h1>
          </div>

          <div className="calendario-acoes">
            <div className="calendario-navegacao">
              <button className="nav-btn" onClick={mesAnterior}>
                <ChevronLeft size={20} />
              </button>
              <h2>{mesesNomes[mesAtual]} {anoAtual}</h2>
              <button className="nav-btn" onClick={proximoMes}>
                <ChevronRight size={20} />
              </button>
            </div>
            <button className="btn-novo-evento" onClick={() => abrirModalNovoEvento()}>
              <Plus size={18} /> Novo Evento
            </button>
          </div>
        </div>

        {/* LEGENDA */}
        <div className="calendario-legenda">
          <div className="legenda-item">
            <div className="legenda-cor" style={{ background: tipoEventoCores.ANIVERSARIO }}></div>
            <span>Aniversário</span>
          </div>
          <div className="legenda-item">
            <div className="legenda-cor" style={{ background: tipoEventoCores.REUNIAO }}></div>
            <span>Reunião</span>
          </div>
          <div className="legenda-item">
            <div className="legenda-cor" style={{ background: tipoEventoCores.FERIADO }}></div>
            <span>Feriado</span>
          </div>
          <div className="legenda-item">
            <div className="legenda-cor" style={{ background: tipoEventoCores.OUTRO }}></div>
            <span>Outro</span>
          </div>
        </div>

        <div className="calendario-content">
          {/* CALENDÁRIO */}
          <div className="calendario-grid-container">
            <div className="calendario-dias-semana">
              {diasSemana.map(dia => (
                <div key={dia} className="dia-semana">{dia}</div>
              ))}
            </div>

            <div className="calendario-grid">
              {getDiasDoMes().map((dia, index) => {
                if (dia === null) {
                  return <div key={`empty-${index}`} className="dia-vazio"></div>;
                }

                const eventosDia = getEventosDoDia(dia);

                return (
                  <div
                    key={dia}
                    className={`dia-card ${isHoje(dia) ? 'hoje' : ''} ${diaSelecionado === dia ? 'selecionado' : ''}`}
                    onClick={() => setDiaSelecionado(dia)}
                    onDoubleClick={() => abrirModalNovoEvento(dia)}
                  >
                    <div className="dia-numero">{dia}</div>
                    {eventosDia.length > 0 && (
                      <div className="eventos-mini">
                        {eventosDia.slice(0, 3).map(evento => (
                          <div
                            key={evento.id}
                            className="evento-mini"
                            style={{ backgroundColor: evento.cor }}
                            title={evento.titulo}
                          ></div>
                        ))}
                        {eventosDia.length > 3 && (
                          <span className="mais-eventos">+{eventosDia.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* PAINEL LATERAL DE EVENTOS */}
          {diaSelecionado !== null && (
            <div className="tarefas-panel">
              <div className="panel-header">
                <h3>
                  {diaSelecionado} de {mesesNomes[mesAtual]}
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-adicionar-evento"
                    onClick={() => abrirModalNovoEvento(diaSelecionado)}
                    title="Adicionar evento"
                  >
                    <Plus size={18} />
                  </button>
                  <button className="close-btn" onClick={() => setDiaSelecionado(null)}>
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="panel-content">
                {eventosDiaSelecionado.length > 0 ? (
                  <div className="tarefas-lista">
                    {eventosDiaSelecionado.map(evento => (
                      <div
                        key={evento.id}
                        className="evento-card"
                        style={{ borderLeft: `4px solid ${evento.cor}` }}
                      >
                        <div className="evento-header">
                          <h4>{evento.titulo}</h4>
                          <div className="evento-acoes">
                            <button
                              className="btn-icon"
                              onClick={() => abrirModalEditarEvento(evento)}
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="btn-icon delete"
                              onClick={() => deletarEvento(evento.id, evento.titulo)}
                              title="Deletar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {evento.descricao && (
                          <p className="evento-descricao">{evento.descricao}</p>
                        )}

                        <div className="evento-detalhes">
                          {evento.horario && (
                            <div className="evento-info">
                              <Clock size={14} />
                              <span>{evento.horario}</span>
                            </div>
                          )}
                          {evento.local && (
                            <div className="evento-info">
                              <MapPin size={14} />
                              <span>{evento.local}</span>
                            </div>
                          )}
                        </div>

                        <div className="evento-tipo-badge" style={{ backgroundColor: evento.cor }}>
                          {evento.tipo.replace('_', ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <CalendarIcon size={48} color="#ccc" />
                    <p>Nenhum evento para este dia</p>
                    <button
                      className="btn-criar-evento"
                      onClick={() => abrirModalNovoEvento(diaSelecionado)}
                    >
                      <Plus size={16} /> Criar Evento
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE CRIAR/EDITAR EVENTO */}
      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{eventoEditando ? 'Editar Evento' : 'Novo Evento'}</h2>
              <button className="close-btn" onClick={() => setModalAberto(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Título *</label>
                <input
                  type="text"
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  placeholder="Ex: Aniversário do José"
                />
              </div>

              <div className="form-group">
                <label>Tipo *</label>
                <select value={formTipo} onChange={(e) => setFormTipo(e.target.value as any)}>
                  <option value="ANIVERSARIO">Aniversário</option>
                  <option value="REUNIAO">Reunião</option>
                  <option value="FERIADO">Feriado</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Data *</label>
                  <input
                    type="date"
                    value={formData}
                    onChange={(e) => setFormData(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Horário</label>
                  <input
                    type="time"
                    value={formHorario}
                    onChange={(e) => setFormHorario(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Local</label>
                <input
                  type="text"
                  value={formLocal}
                  onChange={(e) => setFormLocal(e.target.value)}
                  placeholder="Ex: Sala de reuniões"
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  placeholder="Detalhes sobre o evento..."
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setModalAberto(false)}>
                Cancelar
              </button>
              <button className="btn-salvar" onClick={salvarEvento}>
                {eventoEditando ? 'Atualizar' : 'Criar'} Evento
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
