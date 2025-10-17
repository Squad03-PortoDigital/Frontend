import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import LogoFlap from "../images/Logo-azul-FLAP 1.png";
import FundoLogin from "../images/imagem-fundo-azul-login.png";

const Login: React.FC = () => {
  const navigate = useNavigate();

  // estados para armazenar email e senha
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    try {
      const response = await fetch("http://localhost:8080/usuarios/me", {
        method: "GET",
        headers: {
          Authorization: "Basic " + btoa(email + ":" + senha),
        },
      });

      if (response.ok) {
        const usuario = await response.json();

        // salva o usuário no localStorage
        localStorage.setItem("usuario", JSON.stringify(usuario));
        localStorage.setItem("auth", btoa(email + ":" + senha)); // salva credenciais codificadas (opcional)

        // redireciona pra home
        navigate("/home");
      } else if (response.status === 401) {
        setErro("Email ou senha incorretos");
      } else {
        setErro("Erro ao tentar fazer login");
      }
    } catch (err) {
      console.error(err);
      setErro("Falha de conexão com o servidor");
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
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Digite o seu email"
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

          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;