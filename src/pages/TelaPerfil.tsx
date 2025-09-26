import React, { useState } from 'react';
import './TelaPerfil.css';
import userAvatar from '../images/fotoperfil.png';
import { User, UserMinus, UserPlus, Plus, Mail, PenLine, ChevronDown, Dot } from "lucide-react";

interface UserProfile {
  nome: string;
  email: string;
  telefone: string;
  areaAtuacao: string;
  bio: string;
  avatarUrl: string;
  projetos: string[];
}

const initialUser: UserProfile = {
  nome: 'Hugo Gomes',
  email: 'hugo_ficticio@email.com',
  telefone: '(79) 98765-4321',
  areaAtuacao: 'UX/UI Designer',
  bio: 'Eu sou um Designer de Produto baseado em Aracaju, Sergipe. Sou especializado em design UX/UI, estratégia de marca e desenvolvimento em Webflow.',
  avatarUrl: userAvatar, // troque pelo caminho real
  projetos: ['Netiz', 'Celi', 'Apple'],
};

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const options = ["Membro", "Admin", "Visitante"]; // Opções de exemplo
  const [isEmpresaDropdownOpen, setEmpresaDropdownOpen] = useState(false);
  const empresaOptions = ["Netiz", "Celi", "Apple"]; // Opções de exemplo
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const handleChange = (field: keyof UserProfile, value: string) => {
    setUser({ ...user, [field]: value });
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">Perfil</h1>

      <div className="profile-wrapper">
        {/* Avatar + Form */}
        <div className="profile-left">
          <h2 className="edit-title">Editar informações <PenLine size={27} color="#1E1E1E" style={{opacity: 0.3}}/></h2>
          <div className="profile-main-content"> 
            <div className="profile-header">
              <div className="profile-avatar">
                <img src={user.avatarUrl} alt="Avatar" />
                <span className="status-dot"></span>
              </div>
              
            </div>

            <form className="profile-form">
              <label>Nome</label>
              <input
                type="text"
                value={user.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
              />

              <label>Email</label>
              <div className="input-icon">
                <Mail size={20} color="#717680" />
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>

              <label>Telefone</label>
              <input
                type="text"
                value={user.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
              />

              <label>Área de Atuação</label>
              <input
                type="text"
                value={user.areaAtuacao}
                onChange={(e) => handleChange('areaAtuacao', e.target.value)}
              />

              <label>Bio</label>
              <textarea
                value={user.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
              />

              <div className="profile-actions">
                <button type="button" className="btn-cancel">
                  Cancelar
                </button>
                <button type="button" className="btn-save">
                  Salvar alterações
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="profile-side">
          <div className="card">
            <h3>Projetos Relacionados</h3>
            <ul>
              {user.projetos.map((proj) => (
                <li key={proj}>
                  <Dot size={20} color="#717680" fill="#717680" />  
                 {proj}</li>
              ))}
            </ul>
            <button className="btn-link">
              <Plus size={32} color="#1E1E1E" style={{opacity:0.3}}/>
            </button>
          </div>

          <div className="card">
            <h3>Administrar usuários </h3>
            <div className="custom-select-wrapper">
              <label>Email:</label>
              <div className="input-icon" onClick={() => setDropdownOpen(!isDropdownOpen)}>
                <User size={20} color="#717680" />
                <input type="text" placeholder="Pesquisar membro" color='#717680'/>
                <ChevronDown size={20} color="#6b7280" />
              </div>

              {isDropdownOpen && (
                <ul className="dropdown-menu">
                  {options.map(option => (
                    <li 
                      key={option} 
                      onClick={() => {
                        setSelectedOption(option);
                        setDropdownOpen(false);
                      }}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="custom-select-wrapper">
              <label>Empresa:</label>
              <div className="input-icon" onClick={() => setEmpresaDropdownOpen(!isEmpresaDropdownOpen)}>
                <User size={20} color="#717680" />
                <input type="text" placeholder="Empresa" className="select-display-input" />
                <ChevronDown size={20} color="#717680" />
              </div>

              {isEmpresaDropdownOpen && (
                <ul className="dropdown-menu">
                  {empresaOptions.map(option => (
                    <li 
                      key={option} 
                      onClick={() => setEmpresaDropdownOpen(false)}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
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

export default ProfilePage;
