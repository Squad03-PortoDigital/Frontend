import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import LogoFlap from "../images/Logo-azul-FLAP 1.png";
import FundoLogin from "../images/imagem-fundo-azul-login.png";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      const authHeader = "Basic " + btoa(email + ":" + senha);

      const response = await fetch("http://localhost:8080/usuarios/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      });

      if (response.ok) {
        const usuario = await response.json();

        // Armazena dados do usuárioe credenciais
        localStorage.setItem("usuario", JSON.stringify(usuario));
        localStorage.setItem("auth", btoa(email + ":" + senha));

        navigate("/home", { replace: true });
      } else if (response.status === 401) {
        setErro("E-mail ou senha incorretos. Verifique e tente novamente.");
      } else {
        setErro("Erro inesperado no login. Tente novamente mais tarde.");
      }
    } catch (error) {
      console.error("Falha na requisição:", error);
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-container"
      style={{
        backgroundImage: `url(${FundoLogin})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="login-box">
        <div className="logo-login-flap">
          <img src={LogoFlap} alt="Logo Flap" className="login-logo" />
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              placeholder="Digite o seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {erro && <p className="erro-login">{erro}</p>}

          <div className="options">
            <label>
              <input type="checkbox" /> Lembrar de mim
            </label>
            <a href="/" className="forgot-link">
              Esqueci a senha
            </a>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {/* Botão para cadastro */}
          <div className="register-section">
            <p style={{ marginTop: "20px", textAlign: "center" }}>
              Ainda não tem uma conta?
            </p>
            <button
              type="button"
              className="register-button"
              onClick={() => navigate("/cadastro")}
            >
              Cadastrar-se
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
