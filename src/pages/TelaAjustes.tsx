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
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Verifica login e busca empresas
  useEffect(() => {
    const auth = localStorage.getItem("auth");
    if (!auth) {
      navigate("/login", { replace: true });
      return;
    }

    const carregarEmpresas = async () => {
      try {
        setLoading(true);
        const res = await api.get<BuscaEmpresa[]>("/empresas");
        setEmpresas(res.data);
      } catch (err: any) {
        console.error("Erro ao buscar empresas:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("auth");
          navigate("/login", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    carregarEmpresas();
  }, [navigate]);

  // Atualiza formulário
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Submete novo cadastro
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<BuscaEmpresa>("/empresas", formData);
      setEmpresas((prev) => [...prev, res.data]);
      setFormData({
        nome: "",
        atuacao: "",
        cnpj: "",
        observacao: "",
        contato: "",
        email: "",
      });
    } catch (err: any) {
      console.error("Erro no cadastro:", err);
      alert("Erro ao cadastrar empresa. Verifique suas credenciais.");
      if (err.response?.status === 401) {
        localStorage.removeItem("auth");
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

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
                <label htmlFor="nome">Nome</label>
                <input
                  type="text"
                  id="nome"
                  value={formData.nome}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="atuacao">Área de atuação</label>
                <input
                  type="text"
                  id="atuacao"
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
                  value={formData.cnpj}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="observacao">Observações</label>
                <input
                  type="text"
                  id="observacao"
                  value={formData.observacao}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="contato">Contato</label>
                <input
                  type="text"
                  id="contato"
                  value={formData.contato}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group empty-placeholder"></div>
            </div>

            <div className="form-group-row image-upload-row">
              <div className="form-group email-field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="image-upload-area">
                <div className="image-placeholder"></div>
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
          {empresas.length === 0 && !loading && (
            <p>Nenhuma empresa cadastrada.</p>
          )}
          <ul className="empresas-list">
            {empresas.map((empresa) => (
              <li
                key={empresa.id}
                className="empresa-item"
                onClick={() => navigate(`/empresa/${empresa.id}`)}
                style={{ cursor: "pointer" }}
              >
                {empresa.nome}
              </li>
            ))}
          </ul>
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
          .empresa-item:hover {
            background-color: #f0f8ff;
            transition: background 0.2s;
          }
        `}
      </style>
    </div>
  );
}
