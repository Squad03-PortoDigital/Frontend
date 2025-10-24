import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./TelaEmpresaDetalhes.css";

interface Empresa {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  contato: string;
  atuacao: string;
  observacao: string;
  foto?: string;
}

export default function EmpresaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Carregar empresa
  useEffect(() => {
    const carregarEmpresa = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/empresas/${id}`);
        setEmpresa(res.data);
      } catch (error) {
        console.error("Erro ao carregar empresa:", error);
        alert("Erro ao carregar empresa");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      carregarEmpresa();
    }
  }, [id]);

  // Deletar empresa
  const handleDelete = async () => {
    if (!empresa) return;

    const confirmar = window.confirm(
      `Tem certeza que deseja deletar a empresa "${empresa.nome}"?`
    );

    if (!confirmar) return;

    setDeleting(true);
    try {
      await api.delete(`/empresas/${empresa.id}`);
      alert("Empresa deletada com sucesso!");
      navigate("/ajustes");
    } catch (error: any) {
      console.error("Erro ao deletar:", error);

      if (error.response?.status === 405) {
        alert("Operação não permitida. O endpoint de exclusão não está disponível no backend.");
      } else {
        alert("Erro ao deletar a empresa. Tente novamente.");
      }
    } finally {
      setDeleting(false);
    }
  };

  // Salvar edição
  const handleSave = async () => {
    if (!empresa) return;
    setSaving(true);
    try {
      await api.put(`/empresas/${empresa.id}`, empresa);
      alert("Empresa atualizada com sucesso!");
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro ao atualizar a empresa. Verifique os dados e tente novamente.");
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
                value={empresa.cnpj}
                onChange={(e) => setEmpresa({ ...empresa, cnpj: e.target.value })}
              />
            ) : (
              <div className="empresa-detalhe-value">{empresa.cnpj}</div>
            )}
          </div>
          <div>
            <label className="empresa-detalhe-label">Área de atuação</label>
            {isEditing ? (
              <input
                className="empresa-detalhe-value"
                value={empresa.atuacao}
                onChange={(e) => setEmpresa({ ...empresa, atuacao: e.target.value })}
              />
            ) : (
              <div className="empresa-detalhe-value">{empresa.atuacao}</div>
            )}
          </div>
        </div>

        <div className="empresa-detalhe-row">
          <div>
            <label className="empresa-detalhe-label">Email</label>
            {isEditing ? (
              <input
                className="empresa-detalhe-value"
                type="email"
                value={empresa.email}
                onChange={(e) => setEmpresa({ ...empresa, email: e.target.value })}
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
                value={empresa.contato}
                onChange={(e) => setEmpresa({ ...empresa, contato: e.target.value })}
              />
            ) : (
              <div className="empresa-detalhe-value">{empresa.contato}</div>
            )}
          </div>
        </div>

        <div className="empresa-detalhe-row">
          <div style={{ flex: 1 }}>
            <label className="empresa-detalhe-label">Observações</label>
            {isEditing ? (
              <textarea
                className="empresa-detalhe-value"
                value={empresa.observacao}
                onChange={(e) => setEmpresa({ ...empresa, observacao: e.target.value })}
                rows={4}
                style={{ resize: "vertical", width: "100%" }}
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
                  onClick={handleDelete}
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
        `}
      </style>
    </div>
  );
}
