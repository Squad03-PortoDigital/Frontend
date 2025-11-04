import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./TelaEmpresaDetalhes.css";
import { Toast } from "./Toast";
import { ConfirmModal } from "./ConfirmModal"; 

interface Empresa {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  contato: string;
  atuacao: string;
  observacao: string;
  foto?: string;
  agenteLink?: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning';
  show: boolean;
}

export default function EmpresaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', show: false });

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ message, type, show: true });
  };

  // ✅ FUNÇÃO CENTRALIZADA PARA LOGOUT
  const handleSessionExpired = () => {
    showToast("Sessão expirada. Faça login novamente.", "error");
    localStorage.removeItem("auth");
    localStorage.removeItem("usuario");
    localStorage.removeItem("authenticated");
    setTimeout(() => navigate("/", { replace: true }), 1500);
  };

  // ✅ FUNÇÃO PARA PEGAR AUTH COM VERIFICAÇÃO
  const getAuth = (): string | null => {
    const auth = localStorage.getItem("auth");
    if (!auth) {
      navigate("/", { replace: true });
      return null;
    }
    return auth;
  };

  useEffect(() => {
    let isSubscribed = true; // ✅ Previne race conditions

    const carregarEmpresa = async () => {
      if (!id) {
        navigate("/ajustes", { replace: true });
        return;
      }

      const auth = getAuth();
      if (!auth) return;

      setLoading(true);
      try {
        const res = await api.get(`/empresas/${id}`, {
          headers: { Authorization: `Basic ${auth}` },
          withCredentials: true,
        });

        if (!isSubscribed) return;

        setEmpresa(res.data);
      } catch (error: any) {
        if (!isSubscribed) return;

        console.error("Erro ao carregar empresa:", error);

        if (error.response?.status === 401) {
          handleSessionExpired();
        } else if (error.response?.status === 404) {
          showToast("Empresa não encontrada.", "error");
          setTimeout(() => navigate("/ajustes"), 1500);
        } else {
          showToast("Erro ao carregar empresa. Tente novamente.", "error");
        }
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    carregarEmpresa();

    return () => {
      isSubscribed = false; // ✅ Cleanup
    };
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!empresa) return;

    const auth = getAuth();
    if (!auth) return;

    setDeleting(true);
    setShowDeleteModal(false);

    try {
      await api.delete(`/empresas/${empresa.id}`, {
        headers: { Authorization: `Basic ${auth}` },
        withCredentials: true,
      });

      showToast("Empresa deletada com sucesso!", "success");
      setTimeout(() => navigate("/ajustes"), 1000);
    } catch (error: any) {
      console.error("Erro ao deletar:", error);

      if (error.response?.status === 401) {
        handleSessionExpired();
      } else if (error.response?.status === 404) {
        showToast("Empresa não encontrada.", "error");
      } else if (error.response?.status === 405) {
        showToast("Operação não permitida. O endpoint de exclusão não está disponível.", "error");
      } else {
        showToast("Erro ao deletar a empresa. Tente novamente.", "error");
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!empresa) return;

    if (!empresa.nome.trim()) {
      showToast("O nome da empresa é obrigatório!", "warning");
      return;
    }

    if (!empresa.email.trim()) {
      showToast("O email da empresa é obrigatório!", "warning");
      return;
    }

    const auth = getAuth();
    if (!auth) return;

    setSaving(true);
    try {
      const res = await api.put(`/empresas/${empresa.id}`, empresa, {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      setEmpresa(res.data);
      showToast("Empresa atualizada com sucesso!", "success");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Erro ao atualizar:", error);

      if (error.response?.status === 400) {
        showToast("Dados inválidos. Verifique os campos e tente novamente.", "error");
      } else if (error.response?.status === 401) {
        handleSessionExpired();
      } else if (error.response?.status === 404) {
        showToast("Empresa não encontrada.", "error");
      } else {
        showToast("Erro ao atualizar a empresa. Tente novamente.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Empresa não encontrada.</p>
        <button onClick={() => navigate("/ajustes")}>Voltar</button>
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

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Deletar Empresa"
        message={`Tem certeza que deseja deletar a empresa "${empresa.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <div className="empresa-detalhe-container">
        <button className="voltar-btn" onClick={() => navigate(-1)}>
          ← Voltar
        </button>

        <div className="empresa-detalhe-card">
          <h2>{empresa.nome}</h2>

          <div className="empresa-detalhe-row">
            <div>
              <label className="empresa-detalhe-label">CNPJ</label>
              {isEditing ? (
                <input
                  className="empresa-detalhe-value"
                  value={empresa.cnpj || ""}
                  onChange={(e) => setEmpresa({ ...empresa, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              ) : (
                <div className="empresa-detalhe-value">{empresa.cnpj || "Não informado"}</div>
              )}
            </div>
            <div>
              <label className="empresa-detalhe-label">Área de atuação</label>
              {isEditing ? (
                <input
                  className="empresa-detalhe-value"
                  value={empresa.atuacao || ""}
                  onChange={(e) => setEmpresa({ ...empresa, atuacao: e.target.value })}
                  placeholder="Ex: Tecnologia"
                />
              ) : (
                <div className="empresa-detalhe-value">{empresa.atuacao || "Não informado"}</div>
              )}
            </div>
          </div>

          <div className="empresa-detalhe-row">
            <div>
              <label className="empresa-detalhe-label">Email *</label>
              {isEditing ? (
                <input
                  className="empresa-detalhe-value"
                  type="email"
                  value={empresa.email || ""}
                  onChange={(e) => setEmpresa({ ...empresa, email: e.target.value })}
                  placeholder="empresa@email.com"
                  required
                />
              ) : (
                <div className="empresa-detalhe-value">{empresa.email}</div>
              )}
            </div>
            <div>
              <label className="empresa-detalhe-label">Contato</label>
              {isEditing ? (
                <input
                  className="empresa-detalhe-value"
                  value={empresa.contato || ""}
                  onChange={(e) => setEmpresa({ ...empresa, contato: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              ) : (
                <div className="empresa-detalhe-value">{empresa.contato || "Não informado"}</div>
              )}
            </div>
          </div>

          <div className="empresa-detalhe-row">
            <div style={{ flex: 1 }}>
              <label className="empresa-detalhe-label">Link do Agente</label>
              {isEditing ? (
                <input
                  className="empresa-detalhe-value"
                  type="url"
                  value={empresa.agenteLink || ""}
                  onChange={(e) => setEmpresa({ ...empresa, agenteLink: e.target.value })}
                  placeholder="https://exemplo.com/agente"
                />
              ) : (
                <div className="empresa-detalhe-value">
                  {empresa.agenteLink ? (
                    <a href={empresa.agenteLink} target="_blank" rel="noopener noreferrer">
                      {empresa.agenteLink}
                    </a>
                  ) : (
                    "Não informado"
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="empresa-detalhe-row">
            <div style={{ flex: 1 }}>
              <label className="empresa-detalhe-label">Observações</label>
              {isEditing ? (
                <textarea
                  className="empresa-detalhe-value"
                  value={empresa.observacao || ""}
                  onChange={(e) => setEmpresa({ ...empresa, observacao: e.target.value })}
                  rows={4}
                  style={{ resize: "vertical", width: "100%" }}
                  placeholder="Informações adicionais sobre a empresa"
                />
              ) : (
                <div className="empresa-detalhe-value">{empresa.observacao || "Sem observações"}</div>
              )}
            </div>
            {empresa.foto && (
              <div>
                <img
                  src={empresa.foto}
                  alt={`Logo ${empresa.nome}`}
                  className="company-image"
                  style={{ maxWidth: "150px", borderRadius: "8px" }}
                />
              </div>
            )}
          </div>

          <div className="card-footer">
            <div className="action-buttons">
              {isEditing ? (
                <>
                  <button
                    className="edit-button"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Salvando..." : "Salvar"}
                  </button>
                  <button
                    className="cancel-button"
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="edit-button"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => setShowDeleteModal(true)}
                    disabled={deleting}
                  >
                    {deleting ? "Deletando..." : "Apagar empresa"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <style>
          {`
            .spinner-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
            }
            .spinner {
              border: 6px solid #f3f3f3;
              border-top: 6px solid #1E52A5;
              border-radius: 50%;
              width: 50px;
              height: 50px;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .cancel-button {
              background: #6c757d;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 500;
              transition: all 0.3s;
            }
            .cancel-button:hover {
              background: #5a6268;
              transform: translateY(-2px);
            }
            .cancel-button:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
            .empresa-detalhe-value a {
              color: #1E52A5;
              text-decoration: none;
            }
            .empresa-detalhe-value a:hover {
              text-decoration: underline;
            }
          `}
        </style>
      </div>
    </>
  );
}
