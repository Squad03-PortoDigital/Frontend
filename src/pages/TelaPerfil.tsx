import React, { useState, useEffect, ChangeEvent } from "react";
import "./TelaPerfil.css";
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
import { Toast } from "./Toast";
import { usuarioApi } from "../services/api";

export interface UserProfile {
  id?: number;
  nome: string;
  email: string;
  telefone?: string;
  areaAtuacao?: string;
  bio?: string;
  foto?: string;
  projetos?: string[];
  role?: string;
  cargo?: {
    id?: number;
    nome: string;
  };
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning';
  show: boolean;
}

const TelaPerfil: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [editable, setEditable] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isEmpresaDropdownOpen, setEmpresaDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'success',
    show: false
  });

  const options = ["Membro", "Admin", "Visitante"];
  const empresaOptions = ["Netiz", "Celi", "Apple"];

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ message, type, show: true });
  };

  // ✅ Carregar dados do BACKEND
  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('Carregando dados do usuário...');
        const userData = await usuarioApi.getMe();
        console.log('Dados recebidos:', userData);

        setUser(userData);

        // Carregar foto se existir
        if (userData.foto) {
          setAvatar(userData.foto);
        }

        // Salvar também no localStorage como backup
        localStorage.setItem("usuario", JSON.stringify(userData));
      } catch (error: any) {
        console.error('Erro ao carregar usuário do backend:', error);
        showToast('Erro ao carregar dados do servidor', 'error');

        // Fallback: tentar localStorage
        const usuarioSalvo = localStorage.getItem("usuario");
        if (usuarioSalvo) {
          const dados: UserProfile = JSON.parse(usuarioSalvo);
          setUser(dados);
          if (dados.foto) {
            setAvatar(dados.foto);
          }
        }
      }
    };

    loadUserData();
  }, []);

  // ✅ Manipular mudança de avatar COM ENVIO PARA O BACKEND
  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Ler arquivo como base64
    const reader = new FileReader();

    reader.onload = async () => {
      const base64 = reader.result as string;

      try {
        console.log('Enviando foto para o backend...');

        // ✅ ENVIAR PARA O BACKEND
        const updatedUser = await usuarioApi.updateMyProfile({
          nome: user?.nome,
          foto: base64,
        });

        console.log('Resposta do backend:', updatedUser);

        // ✅ Atualizar estado local
        setAvatar(base64);
        setUser(updatedUser);
        localStorage.setItem("usuario", JSON.stringify(updatedUser));

        setIsUploading(false);
        showToast("Foto atualizada com sucesso!", "success");
      } catch (error: any) {
        console.error('Erro ao enviar foto:', error);
        setIsUploading(false);
        showToast("Erro ao atualizar foto no servidor", "error");

        // Reverter
        if (user?.foto) {
          setAvatar(user.foto);
        } else {
          setAvatar(null);
        }
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      showToast("Erro ao ler arquivo", "error");
    };

    reader.readAsDataURL(file);
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    if (user) {
      setUser((prev) => (prev ? { ...prev, [field]: value } : prev));
    }
  };

  // ✅ Salvar alterações COM ENVIO PARA O BACKEND
  const handleSave = async () => {
    if (!user) return;

    try {
      console.log('Salvando perfil no backend...');

      // ✅ ENVIAR PARA O BACKEND
      const updatedUser = await usuarioApi.updateMyProfile({
        nome: user.nome,
        foto: user.foto,
      });

      console.log('Perfil atualizado:', updatedUser);

      setUser(updatedUser);
      localStorage.setItem("usuario", JSON.stringify(updatedUser));
      setEditable(false);

      showToast("Perfil atualizado com sucesso!", "success");
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      showToast("Erro ao salvar perfil no servidor", "error");
    }
  };

  if (!user) {
    return <p style={{ textAlign: "center" }}>Carregando informações do usuário...</p>;
  }

  return (
    <>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <div className="profile-container">
        <div className="profile-content">
          <h1 className="profile-title">Perfil</h1>
          <div className="profile-wrapper">
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
                  <div className="profile-avatar" style={{ position: 'relative' }}>
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="avatar"
                        style={{
                          opacity: isUploading ? 0.5 : 1,
                          transition: 'opacity 0.3s'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '50%',
                      }}>
                        <User size={48} color="#717680" />
                      </div>
                    )}
                    <span className="status-dot"></span>

                    {isUploading && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textShadow: '0 0 4px rgba(0,0,0,0.8)',
                      }}>
                        Enviando...
                      </div>
                    )}
                  </div>

                  {editable && (
                    <label
                      className="avatar-upload"
                      style={{
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                        opacity: isUploading ? 0.5 : 1
                      }}
                    >
                      <Upload size={18} />
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleAvatarChange}
                        disabled={isUploading}
                        hidden
                      />
                    </label>
                  )}
                </div>

                <form className="profile-form">
                  <label>Nome</label>
                  <input
                    type="text"
                    value={user.nome || ""}
                    onChange={(e) => handleChange("nome", e.target.value)}
                    readOnly={!editable}
                  />

                  <label>Email</label>
                  <div className="input-icon">
                    <Mail size={20} color="#717680" />
                    <input
                      type="email"
                      value={user.email || ""}
                      readOnly
                    />
                  </div>

                  <label>Cargo</label>
                  <input
                    type="text"
                    value={user.cargo?.nome || "—"}
                    readOnly
                  />

                  <label>Role</label>
                  <input
                    type="text"
                    value={user.role || "—"}
                    readOnly
                  />

                  <label>Bio</label>
                  <textarea
                    value={user.bio || ""}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    readOnly={!editable}
                  />
                </form>
              </div>
            </div>

            <div className="profile-side">
              <div className="card">
                <h3>Projetos Relacionados</h3>
                <ul>
                  {user.projetos && user.projetos.length > 0 ? (
                    user.projetos.map((proj, index) => (
                      <li key={index}>
                        <Dot size={20} color="#717680" fill="#717680" /> {proj}
                      </li>
                    ))
                  ) : (
                    <p>Nenhum projeto associado</p>
                  )}
                </ul>
                <button
                  className="btn-link"
                  onClick={() => showToast("Funcionalidade de adicionar projeto em breve!", "warning")}
                >
                  <Plus size={32} color="#1E1E1E" style={{ opacity: 0.3 }} />
                </button>
              </div>

              <div className="card">
                <h3>Administrar Usuários</h3>
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

                <div className="user-actions">
                  <button
                    className="btn-remove"
                    onClick={() => showToast("Usuário removido!", "success")}
                  >
                    <UserMinus size={22} /> Retirar
                  </button>
                  <button
                    className="btn-invite"
                    onClick={() => showToast("Convite enviado!", "success")}
                  >
                    <UserPlus size={22} /> Convidar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TelaPerfil;
