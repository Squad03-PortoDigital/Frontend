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
      // Cria FormData para enviar como application/x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("senha", senha);

      // Faz login usando o endpoint configurado no Spring Security
      const loginResponse = await fetch("http://localhost:8080/usuarios/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        credentials: "include", // Importante para manter a sessão
      });

      if (loginResponse.ok) {
        // Login bem-sucedido, agora busca os dados do usuário
        const usuarioResponse = await fetch("http://localhost:8080/usuarios/me", {
          method: "GET",
          credentials: "include", // Mantém a sessão autenticada
        });

        if (usuarioResponse.ok) {
          const usuario = await usuarioResponse.json();

          // Armazena dados do usuário
          localStorage.setItem("usuario", JSON.stringify(usuario));
          localStorage.setItem("authenticated", "true");

          navigate("/perfil", { replace: true });
        } else {
          setErro("Erro ao carregar dados do usuário.");
        }
      } else if (loginResponse.status === 401) {
        setErro("E-mail ou senha incorretos. Verifique e tente novamente.");
      } else {
        setErro("Erro inesperado no login. Tente novamente mais tarde.");
      }
    } catch (error) {
      console.error("Falha na requisição:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        setErro(
          "Não foi possível conectar ao servidor. " +
          "Verifique se ele está rodando em http://localhost:8080"
        );
      } else {
        setErro("Erro ao processar a requisição. Tente novamente.");
      }
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