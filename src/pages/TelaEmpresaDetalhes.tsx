import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../pages/TelaEmpresaDetalhes.css"; 

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
    setLoading(true);
    axios
      .get(`http://localhost:8080/empresas/${id}`)
      .then((res) => setEmpresa(res.data))
      .catch(() => alert("Erro ao carregar empresa"))
      .finally(() => setLoading(false));
  }, [id]);

  // Deletar empresa
  const handleDelete = async () => {
    if (!empresa) return;
    const confirm = window.confirm("Deseja realmente apagar esta empresa?");
    if (!confirm) return;

    setDeleting(true);
    try {
      await axios.delete(`http://localhost:8080/empresas/${empresa.id}`);
      alert("Empresa deletada com sucesso!");
      navigate("/ajustes");
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar a empresa");
    } finally {
      setDeleting(false);
    }
  };

  // Salvar edição
  const handleSave = async () => {
    if (!empresa) return;
    setSaving(true);
    try {
      await axios.put(`http://localhost:8080/empresas/${empresa.id}`, empresa);
      alert("Empresa atualizada com sucesso!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar a empresa");
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

  if (!empresa) return <p>Empresa não encontrada.</p>;

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
          <div>
            <label className="empresa-detalhe-label">Observações</label>
            {isEditing ? (
              <textarea
                className="empresa-detalhe-value"
                value={empresa.observacao}
                onChange={(e) => setEmpresa({ ...empresa, observacao: e.target.value })}
              />
            ) : (
              <div className="empresa-detalhe-value">{empresa.observacao}</div>
            )}
          </div>
          <div>
            {empresa.foto && (
              <img
                src={empresa.foto}
                alt="Foto empresa"
                className="company-image"
              />
            )}
          </div>
        </div>

        {/* BOTÕES LADO A LADO */}
        <div className="card-footer">
          <div className="action-buttons">
            <button
              className="edit-button"
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={saving}
            >
              {isEditing ? (saving ? "Salvando..." : "Salvar") : "Editar"}
            </button>

            <button
              className="delete-button"
              onClick={handleDelete}
              disabled={deleting || isEditing}
            >
              {deleting ? "Deletando..." : "Apagar empresa"}
            </button>
          </div>
        </div>
      </div>

      {/* Spinner para loading */}
      <style>
        {`
          .spinner-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }
          .spinner {
            border: 6px solid #f3f3f3;
            border-top: 6px solid #007bff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
