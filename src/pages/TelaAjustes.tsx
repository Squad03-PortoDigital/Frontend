import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../pages/TelaAjustes.css";
import LogoAzulFlap from "../images/Logo-azul-FLAP 1.png";

interface FormData {
  nome: string;
  atuacao: string;
  cnpj: string;
  observacao: string;
  contato: string;
  email: string;
  agenteLink: string; // ⭐ NOVO CAMPO
}

interface BuscaEmpresa {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  contato: string;
  atuacao: string;
  observacao: string;
  foto?: string;
  agenteLink?: string; // ⭐ NOVO CAMPO
}

export default function AjustesEmpresas() {
  const [empresas, setEmpresas] = useState<BuscaEmpresa[]>([]);
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    atuacao: "",
    cnpj: "",
    observacao: "",
    contato: "",
    email: "",
    agenteLink: "", // ⭐ NOVO CAMPO
  });
  const [loading, setLoading] = useState(false);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    if (!auth) {
      navigate("/login", { replace: true });
      return;
    }

    const carregarEmpresas = async () => {
      try {
        setLoading(true);
        const res = await api.get("/empresas", {
          headers: {
            Authorization: `Basic ${auth}`,
          },
          withCredentials: true,
        });

        console.log("Empresas recebidas:", res.data);

        if (Array.isArray(res.data)) {
          setEmpresas(res.data);
        } else if (res.data.empresas && Array.isArray(res.data.empresas)) {
          setEmpresas(res.data.empresas);
        } else {
          console.error("Formato inesperado de dados:", res.data);
          setEmpresas([]);
        }
      } catch (err: any) {
        console.error("Erro ao buscar empresas:", err);
        setEmpresas([]);

        if (err.response?.status === 401) {
          localStorage.removeItem("auth");
          localStorage.removeItem("usuario");
          navigate("/login", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    carregarEmpresas();
  }, [navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validações
    if (!formData.nome.trim()) {
      alert("O nome da empresa é obrigatório!");
      return;
    }

    if (!formData.email.trim()) {
      alert("O email da empresa é obrigatório!");
      return;
    }

    if (!formData.agenteLink.trim()) {
      alert("O link do agente é obrigatório!");
      return;
    }

    setLoading(true);
    try {
      const auth = localStorage.getItem("auth");
      const res = await api.post<BuscaEmpresa>("/empresas", formData, {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      setEmpresas((prev) => [...prev, res.data]);

      // Limpar formulário
      setFormData({
        nome: "",
        atuacao: "",
        cnpj: "",
        observacao: "",
        contato: "",
        email: "",
        agenteLink: "", // ⭐ LIMPAR TAMBÉM
      });

      alert("Empresa cadastrada com sucesso!");
    } catch (err: any) {
      console.error("Erro no cadastro:", err);
      console.error("Resposta do servidor:", err.response?.data);

      if (err.response?.status === 400) {
        alert("Erro ao cadastrar: " + (err.response.data.message || "Dados inválidos"));
      } else if (err.response?.status === 401) {
        alert("Sessão expirada. Faça login novamente.");
        localStorage.removeItem("auth");
        localStorage.removeItem("usuario");
        navigate("/login", { replace: true });
      } else if (err.response?.status === 500) {
        alert("Erro interno no servidor. Verifique os dados e tente novamente.");
      } else {
        alert("Erro ao cadastrar empresa. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const empresasSeguras = Array.isArray(empresas) ? empresas : [];

  return (
    <div className="ajustes-empresas-container">
      <h1 className="ajustes-empresas-title">Empresas</h1>

      {loading && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}

      <div className="ajustes-empresas-content">
        {/* Card de cadastro */}
        <div className="cadastro-empresa-card">
          <h2>Cadastro de Empresa</h2>
          <form className="cadastro-form" onSubmit={handleSubmit}>
            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="nome">Nome *</label>
                <input
                  type="text"
                  id="nome"
                  placeholder="Nome da empresa"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="atuacao">Área de atuação</label>
                <input
                  type="text"
                  id="atuacao"
                  placeholder="Ex: Tecnologia"
                  value={formData.atuacao}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="cnpj">CNPJ</label>
                <input
                  type="text"
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="observacao">Observações</label>
                <input
                  type="text"
                  id="observacao"
                  placeholder="Informações adicionais"
                  value={formData.observacao}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* ⭐ NOVO: Campo Agente Link */}
            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="agenteLink">Link do Agente *</label>
                <input
                  type="url"
                  id="agenteLink"
                  placeholder="https://exemplo.com/agente"
                  value={formData.agenteLink}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="contato">Contato</label>
                <input
                  type="text"
                  id="contato"
                  placeholder="(00) 00000-0000"
                  value={formData.contato}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group-row image-upload-row">
              <div className="form-group email-field">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  placeholder="empresa@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="image-upload-area">
                <div className="image-placeholder">
                  <span style={{ color: "#999", fontSize: "0.9rem" }}>Logo</span>
                </div>
                <button type="button" className="upload-button">
                  Fazer upload de imagem
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="cadastro-button"
              disabled={loading}
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>
        </div>

        {/* Lista de empresas */}
        <div className="empresas-cadastradas-card">
          <h2>Empresas cadastradas</h2>

          {loading && empresasSeguras.length === 0 ? (
            <p style={{ textAlign: "center", color: "#999" }}>Carregando...</p>
          ) : empresasSeguras.length === 0 ? (
            <p style={{ textAlign: "center", color: "#999" }}>
              Nenhuma empresa cadastrada ainda.
            </p>
          ) : (
            <ul className="empresas-list">
              {empresasSeguras.map((empresa) => (
                <li
                  key={empresa.id}
                  className={`empresa-item ${
                    selectedEmpresaId === empresa.id ? "selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedEmpresaId(empresa.id);
                    navigate(`/empresa/${empresa.id}`);
                  }}
                >
                  <span className="dot">•</span>
                  {empresa.nome}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="ajuda-logo-container">
        <img src={LogoAzulFlap} alt="Logo Flap" className="ajuda-logo-bg" />
      </div>

      {/* CSS Spinner */}
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
          .empresa-item {
            transition: all 0.2s ease;
          }
          .empresa-item:hover {
            background-color: #f0f8ff;
            transform: translateX(2px);
          }
          .empresa-item.selected {
            background-color: #e0e7ff;
            color: #1E52A5;
            font-weight: 500;
          }
          .empty-placeholder {
            visibility: hidden;
          }
        `}
      </style>
    </div>
  );
}