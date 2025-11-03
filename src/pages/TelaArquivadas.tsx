import React, { useEffect, useState } from "react";
import "./TelaArquivadas.css";
import { useNavigate } from "react-router-dom";
import { Archive, Eye, RotateCcw, Trash2 } from "lucide-react";
import api from "../services/api";
import { Toast } from "./Toast";

interface TarefaArquivada {
  id: number;
  titulo: string;
  descricao?: string;
  prioridade: string;
  dtCriacao?: string;
  empresa?: string;
  empresaId?: number;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning';
  show: boolean;
}

const prioridadeCores: { [key: string]: string } = {
  BAIXA: "#36B37E",
  MEDIA: "#FFAB00",
  ALTA: "#fd7e14",
  CRITICA: "#FF5630",
};

export default function TelaArquivadas() {
  const [tarefas, setTarefas] = useState<TarefaArquivada[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', show: false });
  const navigate = useNavigate();

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ message, type, show: true });
  };

  useEffect(() => {
    carregarTarefasArquivadas();
  }, []);

  const carregarTarefasArquivadas = async () => {
    try {
      setLoading(true);
      const auth = localStorage.getItem("auth");
      const headers = { headers: { Authorization: `Basic ${auth}` }, withCredentials: true };

      const res = await api.get("/tarefas/arquivadas", headers);
      setTarefas(Array.isArray(res.data) ? res.data : []);
    } catch (error: any) {
      setTarefas([]);
      if (error.response?.status === 401) {
        showToast("Sessão expirada. Faça login novamente.", "error");
        localStorage.removeItem("auth");
        localStorage.removeItem("usuario");
        setTimeout(() => navigate("/", { replace: true }), 1500);
      } else {
        showToast("Erro ao carregar tarefas arquivadas.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const desarquivarTarefa = async (id: number, titulo: string) => {
    const confirmar = window.confirm(`Deseja restaurar a tarefa "${titulo}"?`);
    if (!confirmar) return;

    try {
      const auth = localStorage.getItem("auth");
      await api.patch(`/tarefas/${id}/desarquivar`, {}, {
        headers: { Authorization: `Basic ${auth}` },
        withCredentials: true,
      });
      showToast("Tarefa restaurada!", "success");
      await carregarTarefasArquivadas();
    } catch (error) {
      showToast("Erro ao restaurar tarefa.", "error");
    }
  };

  const deletarTarefa = async (id: number, titulo: string) => {
    const confirmar = window.confirm(`Tem certeza que deseja DELETAR permanentemente a tarefa "${titulo}"?`);
    if (!confirmar) return;

    try {
      const auth = localStorage.getItem("auth");
      await api.delete(`/tarefas/${id}`, {
        headers: { Authorization: `Basic ${auth}` },
        withCredentials: true,
      });
      showToast("Tarefa deletada permanentemente!", "success");
      await carregarTarefasArquivadas();
    } catch (error) {
      showToast("Erro ao deletar tarefa.", "error");
    }
  };

  const visualizarTarefa = (id: number) => {
    navigate(`/detalhamento/${id}`);
  };

  if (loading) {
    return (
      <div className="arquivadas-wrapper" style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}>
        <p>Carregando tarefas arquivadas...</p>
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

      <div className="arquivadas-wrapper">
        <div className="arquivadas-header">
          <div className="arquivadas-titulo">
            <Archive size={28} color="#FF9800" />
            <h1>Tarefas Arquivadas</h1>
          </div>
          <p className="arquivadas-subtitulo">
            {tarefas.length} {tarefas.length === 1 ? 'tarefa arquivada' : 'tarefas arquivadas'}
          </p>
        </div>

        {tarefas.length > 0 ? (
          <div className="arquivadas-grid">
            {tarefas.map((tarefa) => (
              <div key={tarefa.id} className="tarefa-arquivada-card">
                <div className="tarefa-header">
                  <div className="tarefa-prioridade" style={{ backgroundColor: prioridadeCores[tarefa.prioridade] }}>
                    {tarefa.prioridade}
                  </div>
                  <div className="tarefa-acoes">
                    <button
                      className="btn-icon"
                      onClick={() => visualizarTarefa(tarefa.id)}
                      title="Visualizar"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className="btn-icon restore"
                      onClick={() => desarquivarTarefa(tarefa.id, tarefa.titulo)}
                      title="Restaurar"
                    >
                      <RotateCcw size={18} />
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => deletarTarefa(tarefa.id, tarefa.titulo)}
                      title="Deletar Permanentemente"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="tarefa-titulo">{tarefa.titulo}</h3>

                {tarefa.descricao && (
                  <p className="tarefa-descricao">{tarefa.descricao}</p>
                )}

                <div className="tarefa-footer">
                  {tarefa.empresa && (
                    <span className="tarefa-empresa">{tarefa.empresa}</span>
                  )}
                  {tarefa.dtCriacao && (
                    <span className="tarefa-data">
                      Criada em {new Date(tarefa.dtCriacao).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Archive size={64} color="#ccc" />
            <h3>Nenhuma tarefa arquivada</h3>
            <p>As tarefas arquivadas aparecerão aqui</p>
          </div>
        )}
      </div>
    </>
  );
}
