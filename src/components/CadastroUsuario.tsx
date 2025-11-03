import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import LogoFlap from "../images/Logo-azul-FLAP 1.png";
import FundoLogin from "../images/imagem-fundo-azul-login.png";

interface Role {
  id: number;
  nome: string;
}

interface Cargo {
  id: number;
  nome: string;
}

const CadastroUsuario: React.FC = () => {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [roleId, setRoleId] = useState<number | "">("");
  const [cargoId, setCargoId] = useState<number | "">("");

  const [roles, setRoles] = useState<Role[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);

  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Busca roles e cargos ao carregar o componente
  useEffect(() => {
    const fetchRolesECargos = async () => {
      try {
        // Buscar roles
        const rolesResponse = await fetch("http://localhost:8080/roles");

        if (rolesResponse.ok) {
          const rolesData = await rolesResponse.json();
          setRoles(rolesData);
        }

        // Buscar cargos
        const cargosResponse = await fetch("http://localhost:8080/cargos");

        if (cargosResponse.ok) {
          const cargosData = await cargosResponse.json();
          setCargos(cargosData);
        }
      } catch (error) {
        console.error("Erro ao buscar roles e cargos:", error);
        setErro("Erro ao carregar opções de role e cargo.");
      }
    };

    fetchRolesECargos();
  }, []);

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

    if (!roleId) {
      setErro("Selecione uma role para o usuário.");
      return;
    }

    if (!cargoId) {
      setErro("Selecione um cargo para o usuário.");
      return;
    }

    try {
      setLoading(true);

      // Envia dados para cadastro
      const response = await fetch("http://localhost:8080/usuarios/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ Mantém sessão do admin
        body: JSON.stringify({
          nome,
          email,
          senha,
          foto: null,
          roleId: Number(roleId),
          cargoId: Number(cargoId),
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

        // Limpa os campos do formulário
        setNome("");
        setEmail("");
        setSenha("");
        setConfirmarSenha("");
        setRoleId("");
        setCargoId("");

        // Aguarda 2 segundos e volta para home
        await new Promise((resolve) => setTimeout(resolve, 2000));
        navigate("/home");
      } else if (response.status === 400) {
        setErro(data.message || "Dados inválidos. Verifique as informações.");
      } else if (response.status === 409) {
        setErro("Este e-mail já está cadastrado.");
      } else if (response.status === 403) {
        setErro("Você não tem permissão para cadastrar usuários.");
      } else {
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
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px 0",
      }}
    >
      <div className="login-box" style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <div className="logo-login-flap">
          <img src={LogoFlap} alt="Logo Flap" className="login-logo" />
        </div>

        <form className="login-form" onSubmit={handleCadastro}>
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
            Cadastrar Novo Usuário
          </h2>

          <div className="input-group">
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              placeholder="Digite o nome completo"
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
              placeholder="Digite o e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="roleId">Role (Permissão)</label>
            <select
              id="roleId"
              value={roleId}
              onChange={(e) => setRoleId(Number(e.target.value))}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "14px",
                backgroundColor: "white",
              }}
            >
              <option value="">Selecione uma role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="cargoId">Cargo</label>
            <select
              id="cargoId"
              value={cargoId}
              onChange={(e) => setCargoId(Number(e.target.value))}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "14px",
                backgroundColor: "white",
              }}
            >
              <option value="">Selecione um cargo</option>
              {cargos.map((cargo) => (
                <option key={cargo.id} value={cargo.id}>
                  {cargo.nome}
                </option>
              ))}
            </select>
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
            <label htmlFor="confirmarSenha">Confirmar Senha</label>
            <input
              type="password"
              id="confirmarSenha"
              placeholder="Confirme a senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {erro && <p className="erro-login">{erro}</p>}
          {sucesso && <p className="sucesso-login">{sucesso}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar Usuário"}
          </button>

          <p style={{ textAlign: "center", marginTop: "15px" }}>
            <span
              style={{ color: "#007bff", cursor: "pointer" }}
              onClick={() => navigate("/home")}
            >
              ← Voltar para Home
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default CadastroUsuario;
