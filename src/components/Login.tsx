import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import LogoFlap from "../images/Logo-azul-FLAP 1.png";
import FundoLogin from "../images/imagem-fundo-azul-login.png";

const Login: React.FC = () => { 
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // galera na hora da integração podemos colocar validação de login aqui // ass: hugogomes
    navigate("/home"); 
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
            <input type="email" id="email" placeholder="Digite o seu email" required />
          </div>

          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <input type="password" id="password" placeholder="Digite sua senha" required />
          </div>

          <div className="options">
            <label>
              <input type="checkbox" /> Lembrar de mim
            </label>
            <a href="/" className="forgot-link">Esqueci a senha</a>
          </div>

          <button type="submit" className="login-button">Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default Login;