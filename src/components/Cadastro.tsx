import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import LogoFlap from "../images/Logo-azul-FLAP 1.png";
import FundoLogin from "../images/imagem-fundo-azul-login.png";

const Cadastro: React.FC = () => {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:8080/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          senha,
          foto: null,
          cargoId: 1,
        }),
      });

      if (response.ok) {
        setSucesso("Usuário cadastrado com sucesso!");

        // Faz login automático após cadastro
        const authHeader = "Basic " + btoa(email + ":" + senha);
        const me = await fetch("http://localhost:8080/usuarios/me", {
          headers: { Authorization: authHeader },
          credentials: "include",
        });

        if (me.ok) {
          const usuario = await me.json();
          localStorage.setItem("usuario", JSON.stringify(usuario));
          localStorage.setItem("auth", btoa(email + ":" + senha));
          navigate("/ajustes", { replace: true });
        } else {
          navigate("/");
        }
      } else if (response.status === 400) {
        setErro("Dados inválidos. Verifique as informações e tente novamente.");
      } else {
        setErro("Erro ao realizar cadastro. Tente novamente mais tarde.");
      }
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      setErro("Falha na conexão com o servidor.");
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

        <form className="login-form" onSubmit={handleCadastro}>
          <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
            Criar nova conta
          </h2>

          <div className="input-group">
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              placeholder="Digite seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              placeholder="Digite uma senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmarSenha">Confirmar senha</label>
            <input
              type="password"
              id="confirmarSenha"
              placeholder="Confirme sua senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
          </div>

          {erro && <p className="erro-login">{erro}</p>}
          {sucesso && <p className="sucesso-login">{sucesso}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>

          <p style={{ textAlign: "center", marginTop: "15px" }}>
            Já possui uma conta?{" "}
            <span
              style={{ color: "#007bff", cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              Entrar
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Cadastro;
