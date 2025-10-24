import React, { useState, useEffect, ChangeEvent } from "react";
import "./TelaPerfil.css";
import userAvatar from "../images/fotoperfil.png";
import {
  User,
  UserMinus,
  UserPlus,
  Plus,
  Mail,
  PenLine,
  ChevronDown,
  Dot,
  Upload,
  Save,
} from "lucide-react";

export interface UserProfile {
  id?: number;
  nome: string;
  email: string;
  telefone?: string;
  areaAtuacao?: string;
  bio?: string;
  avatarUrl?: string;
  projetos?: string[];
  role?: string;
  cargo?: {
    nome: string;
  };
}

const TelaPerfil: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [avatar, setAvatar] = useState<string>(userAvatar);
  const [editable, setEditable] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isEmpresaDropdownOpen, setEmpresaDropdownOpen] = useState(false);

  const options = ["Membro", "Admin", "Visitante"];
  const empresaOptions = ["Netiz", "Celi", "Apple"];

  // Carrega usuário logado do localStorage
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    if (usuarioSalvo) {
      const dados: UserProfile = JSON.parse(usuarioSalvo);
      setUser(dados);
      if (dados.foto) {
        setAvatar(dados.foto);
      }
    }
  }, []);

  // Manipula upload do avatar
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const avatarURL = URL.createObjectURL(file);
    setAvatar(avatarURL);
    if (user) {
      setUser({ ...user, avatarUrl: avatarURL });
    }
  };

  // Controle dos campos
  const handleChange = (field: keyof UserProfile, value: string) => {
    if (user) {
      setUser((prev) => (prev ? { ...prev, [field]: value } : prev));
    }
  };

  const handleSave = () => {
    if (!user) return;
    localStorage.setItem("usuario", JSON.stringify(user));
    setEditable(false);
    alert("Perfil atualizado com sucesso!");
  };

  if (!user) {
    return <p style={{ textAlign: "center" }}>Carregando informações do usuário...</p>;
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <h1 className="profile-title">Perfil</h1>
        <div className="profile-wrapper">
          {/* Painel principal */}
          <div className="profile-left">
            <h2 className="edit-title">
              Informações{" "}
              {editable ? (
                <Save
                  size={24}
                  color="#1E1E1E"
                  style={{ opacity: 0.5, cursor: "pointer" }}
                  onClick={handleSave}
                />
              ) : (
                <PenLine
                  size={24}
                  color="#1E1E1E"
                  style={{ opacity: 0.5, cursor: "pointer" }}
                  onClick={() => setEditable(true)}
                />
              )}
            </h2>

            <div className="profile-main-content">
              <div className="profile-header">
                <div className="profile-avatar">
                  <img src={avatar || userAvatar} alt="avatar" />
                  <span className="status-dot"></span>
                </div>
                {editable && (
                  <label className="avatar-upload">
                    <Upload size={18} />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                  </label>
                )}
              </div>

              <form className="profile-form">
                <label>Nome</label>
                <input
                  type="text"
                  value={user.nome}
                  onChange={(e) => handleChange("nome", e.target.value)}
                  readOnly={!editable}
                />

                <label>Email</label>
                <div className="input-icon">
                  <Mail size={20} color="#717680" />
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    readOnly={!editable}
                  />
                </div>

                <label>Cargo</label>
                <input type="text" value={user.cargo?.nome || "—"} readOnly />

                <label>Role</label>
                <input type="text" value={user.role || "—"} readOnly />

                <label>Bio</label>
                <textarea
                  value={user.bio || ""}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  readOnly={!editable}
                />
              </form>
            </div>
          </div>

          {/* Barra lateral */}
          <div className="profile-side">
            <div className="card">
              <h3>Projetos Relacionados</h3>
              <ul>
                {user.projetos?.map((proj) => (
                  <li key={proj}>
                    <Dot size={20} color="#717680" fill="#717680" /> {proj}
                  </li>
                )) || <p>Nenhum projeto associado</p>}
              </ul>
              <button
                className="btn-link"
                onClick={() => alert("Funcionalidade de adicionar projeto em breve!")}
              >
                <Plus size={32} color="#1E1E1E" style={{ opacity: 0.3 }} />
              </button>
            </div>

            <div className="card">
              <h3>Administrar Usuários</h3>
              {/* Escolha de membro */}
              <div className="custom-select-wrapper">
                <label>Email:</label>
                <div
                  className="input-icon"
                  onClick={() => setDropdownOpen(!isDropdownOpen)}
                >
                  <User size={20} color="#717680" />
                  <input type="text" placeholder="Pesquisar membro" readOnly />
                  <ChevronDown size={20} color="#717680" />
                </div>
                {isDropdownOpen && (
                  <ul className="dropdown">
                    {options.map((opt) => (
                      <li key={opt} onClick={() => setDropdownOpen(false)}>
                        {opt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Escolha de empresa */}
              <div className="custom-select-wrapper">
                <label>Empresa:</label>
                <div
                  className="input-icon"
                  onClick={() => setEmpresaDropdownOpen(!isEmpresaDropdownOpen)}
                >
                  <User size={20} color="#717680" />
                  <input type="text" placeholder="Empresa" readOnly />
                  <ChevronDown size={20} color="#717680" />
                </div>
                {isEmpresaDropdownOpen && (
                  <ul className="dropdown">
                    {empresaOptions.map((empresa) => (
                      <li key={empresa} onClick={() => setEmpresaDropdownOpen(false)}>
                        {empresa}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Ações */}
              <div className="user-actions">
                <button className="btn-remove" onClick={() => alert("Usuário removido!")}>
                  <UserMinus size={22} /> Retirar
                </button>
                <button className="btn-invite" onClick={() => alert("Convite enviado!")}>
                  <UserPlus size={22} /> Convidar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelaPerfil;
