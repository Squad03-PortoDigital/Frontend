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
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("senha", senha);

      const loginResponse = await fetch("http://3.233.245.239:8080/usuarios/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        credentials: "include",
      });

      if (loginResponse.ok) {
        // ✅ CRIA TOKEN BASIC AUTH
        const token = btoa(`${email}:${senha}`);
        
        // ✅ SALVA O TOKEN NO localStorage (AQUI!)
        localStorage.setItem("auth", token);
        localStorage.setItem("authenticated", "true");
        
        try {
          // ✅ CARREGA OS DADOS DO USUÁRIO
          const usuarioResponse = await fetch("http://3.233.245.239:8080/usuarios/me", {
            method: "GET",
            headers: {
              "Authorization": `Basic ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          if (usuarioResponse.ok) {
            const usuario = await usuarioResponse.json();
            // ✅ SALVA OS DADOS DO USUÁRIO
            localStorage.setItem("usuario", JSON.stringify(usuario));
            
            // ✅ DISPARA EVENTO PARA ATUALIZAR A APLICAÇÃO
            window.dispatchEvent(new Event('user-updated'));
            
            // ✅ REDIRECIONA PARA O DASHBOARD
            navigate("/Dashboard", { replace: true });
          } else {
            setErro("Erro ao carregar dados do usuário.");
          }
        } catch (meError) {
          console.error("Erro ao buscar dados do usuário:", meError);
          // Mesmo se /me falhar, o login foi bem-sucedido, redirecionar
          navigate("/Dashboard", { replace: true });
        }
      } else if (loginResponse.status === 401) {
        setErro("E-mail ou senha incorretos. Verifique e tente novamente.");
      } else {
        setErro("Erro inesperado no login. Tente novamente mais tarde.");
      }
    } catch (error) {
      console.error("Falha na requisição:", error);
      setErro("Erro ao processar a requisição. Tente novamente.");
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
        </form>
      </div>
    </div>
  );
};

export default Login;
