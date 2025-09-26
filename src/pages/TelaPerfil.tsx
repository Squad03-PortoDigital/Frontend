import React, { useState } from "react";
import "./TelaPerfil.css";
import userAvatar from "../images/fotoperfil.png";
import { User, UserMinus, UserPlus, Plus, Mail, PenLine, ChevronDown, Dot } from "lucide-react";

export interface UserProfile {
  nome: string;
  email: string;
  telefone: string;
  areaAtuacao: string;
  bio: string;
  avatarUrl: string;
  projetos: string[];
}

// Dados estáticos
export const initialUser: UserProfile = {
  nome: "Hugo Gomes",
  email: "hugo_ficticio@email.com",
  telefone: "(79) 98765-4321",
  areaAtuacao: "UX/UI Designer",
  bio: "Designer de Produto baseado em Aracaju, Sergipe. Especialista em UX/UI e Webflow.",
  avatarUrl: userAvatar,
  projetos: ["Netiz", "Celi", "Apple"],
};

const TelaPerfil: React.FC = () => {
  // Avatar dinâmico
  const [avatar, setAvatar] = useState<string>(userAvatar);

  const options = ["Membro", "Admin", "Visitante"];
  const empresaOptions = ["Netiz", "Celi", "Apple"];
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isEmpresaDropdownOpen, setEmpresaDropdownOpen] = useState(false);

  return (
    <div className="profile-container">
      <h1 className="profile-title">Perfil</h1>
      <div className="profile-wrapper">
      
        <div className="profile-left">
          <h2 className="edit-title">
            Informações <PenLine size={27} color="#1E1E1E" style={{ opacity: 0.3 }} />
          </h2>
          <div className="profile-main-content">
            <div className="profile-header">
              <div className="profile-avatar">
                <img src={avatar} alt="Avatar" />
                <span className="status-dot"></span>
              </div>
            </div>

            <form className="profile-form">
              <label>Nome</label>
              <input type="text" value={initialUser.nome} readOnly />

              <label>Email</label>
              <div className="input-icon">
                <Mail size={20} color="#717680" />
                <input type="email" value={initialUser.email} readOnly />
              </div>

              <label>Telefone</label>
              <input type="text" value={initialUser.telefone} readOnly />

              <label>Área de Atuação</label>
              <input type="text" value={initialUser.areaAtuacao} readOnly />

              <label>Bio</label>
              <textarea value={initialUser.bio} readOnly />
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="profile-side">
          <div className="card">
            <h3>Projetos Relacionados</h3>
            <ul>
              {initialUser.projetos.map((proj) => (
                <li key={proj}>
                  <Dot size={20} color="#717680" fill="#717680" /> {proj}
                </li>
              ))}
            </ul>
            <button className="btn-link">
              <Plus size={32} color="#1E1E1E" style={{ opacity: 0.3 }} />
            </button>
          </div>

          <div className="card">
            <h3>Administrar usuários</h3>

            <div className="custom-select-wrapper">
              <label>Email:</label>
              <div className="input-icon" onClick={() => setDropdownOpen(!isDropdownOpen)}>
                <User size={20} color="#717680" />
                <input type="text" placeholder="Pesquisar membro" readOnly />
                <ChevronDown size={20} color="#717680" />
              </div>
            </div>

            <div className="custom-select-wrapper">
              <label>Empresa:</label>
              <div className="input-icon" onClick={() => setEmpresaDropdownOpen(!isEmpresaDropdownOpen)}>
                <User size={20} color="#717680" />
                <input type="text" placeholder="Empresa" readOnly />
                <ChevronDown size={20} color="#717680" />
              </div>
            </div>

            <div className="user-actions">
              <button className="btn-remove">
                <UserMinus size={22} /> Retirar
              </button>
              <button className="btn-invite">
                <UserPlus size={22} /> Convidar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelaPerfil;