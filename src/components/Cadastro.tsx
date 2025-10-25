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

    // Validações no frontend
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (nome.length < 3) {
      setErro("O nome deve ter pelo menos 3 caracteres.");
      return;
    }

    try {
      setLoading(true);

      // Envia dados para cadastro
      const response = await fetch("http://localhost:8080/usuarios/cadastro", {
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

      const contentType = response.headers.get("content-type");

      // Verifica se a resposta é JSON
      if (!contentType || !contentType.includes("application/json")) {
        const textoResposta = await response.text();
        console.error("Resposta não é JSON:", textoResposta.substring(0, 500));
        setErro("Erro de comunicação com o servidor. Verifique o console.");
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setSucesso("Usuário cadastrado com sucesso!");

        // Aguarda 1 segundo para mostrar mensagem de sucesso
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Faz login automático após cadastro
        const loginResponse = await fetch("http://localhost:8080/usuarios/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, senha }),
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();

          // Armazena dados do usuário
          localStorage.setItem("usuario", JSON.stringify(loginData));
          localStorage.setItem("authenticated", "true");
          localStorage.setItem("userEmail", email);

          navigate("/home", { replace: true });
        } else {
          // Se login falhar, redireciona para tela de login
          setErro("Cadastro realizado! Redirecionando para login...");
          setTimeout(() => navigate("/"), 2000);
        }
      } else if (response.status === 400) {
        // Erro de validação
        setErro(data.message || "Dados inválidos. Verifique as informações.");
      } else if (response.status === 409) {
        // Conflito (email já existe)
        setErro("Este e-mail já está cadastrado. Tente fazer login.");
      } else {
        // Outros erros
        setErro(data.message || "Erro ao realizar cadastro. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        setErro(
          "Não foi possível conectar ao servidor. " +
          "Verifique se ele está rodando em http://localhost:8080"
        );
      } else if (error instanceof SyntaxError) {
        setErro(
          "O servidor retornou uma resposta inválida. " +
          "Verifique se o endpoint /usuarios/cadastro está configurado corretamente."
        );
      } else {
        setErro("Falha na conexão com o servidor. Tente novamente.");
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
              minLength={3}
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
              placeholder="Digite uma senha (mínimo 6 caracteres)"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              minLength={6}
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
              minLength={6}
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