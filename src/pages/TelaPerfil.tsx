import React, { useState, useEffect, ChangeEvent } from "react";
import "./TelaPerfil.css";
import {
  User,
  Mail,
  PenLine,
  Upload,
  Save,
  Loader2,
  X,
} from "lucide-react";
import { Toast } from "./Toast";
import { usuarioApi } from "../services/api";
import { dispatchUserUpdate } from "../utils/userEvents";

export interface UserProfile {
  id?: number;
  nome: string;
  email: string;
  telefone?: string;
  areaAtuacao?: string;
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
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'success',
    show: false
  });

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

        // ✅ DISPARAR EVENTO PARA ATUALIZAR MENU
        dispatchUserUpdate();

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

  // ✅ Salvar alterações COM ENVIO PARA O BACKEND E LOADING
  const handleSave = async () => {
    if (!user || isSaving) return;

    setIsSaving(true);

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

      // ✅ DISPARAR EVENTO PARA ATUALIZAR MENU
      dispatchUserUpdate();

      setEditable(false);

      showToast("Perfil atualizado com sucesso!", "success");
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      showToast("Erro ao salvar perfil no servidor", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditable(false);
  };

  if (!user) {
    return <p style={{ textAlign: "center", marginTop: "20px" }}>Carregando informações do usuário...</p>;
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
              <div className="edit-title-section">
                <h2 className="edit-title">Informações</h2>
                {!editable ? (
                  <button
                    className="edit-btn"
                    onClick={() => setEditable(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      backgroundColor: '#f0f0f0',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1E1E1E',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e0e0e0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                    }}
                  >
                    <PenLine size={18} />
                    Editar
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* ✅ BOTÃO SALVAR COM LOADING */}
                    <button
                      className="save-btn"
                      onClick={handleSave}
                      disabled={isSaving}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 18px',
                        backgroundColor: isSaving ? '#ccc' : '#1E52A5',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'white',
                        transition: 'all 0.3s',
                        opacity: isSaving ? 0.8 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSaving) {
                          e.currentTarget.style.backgroundColor = '#164399';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSaving) {
                          e.currentTarget.style.backgroundColor = '#1E52A5';
                        }
                      }}
                    >
                      {isSaving ? (
                        <>
                          <Loader2
                            size={18}
                            style={{
                              animation: 'spin 1s linear infinite'
                            }}
                          />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Salvar
                        </>
                      )}
                    </button>

                    {/* ✅ BOTÃO CANCELAR */}
                    <button
                      className="cancel-btn"
                      onClick={handleCancel}
                      disabled={isSaving}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 18px',
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1E1E1E',
                        transition: 'all 0.3s',
                        opacity: isSaving ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSaving) {
                          e.currentTarget.style.backgroundColor = '#e0e0e0';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSaving) {
                          e.currentTarget.style.backgroundColor = '#f0f0f0';
                        }
                      }}
                    >
                      <X size={18} />
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

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
                    <button
                      className="avatar-upload-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        const fileInput = document.getElementById('avatar-file-input') as HTMLInputElement;
                        fileInput?.click();
                      }}
                      disabled={isUploading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        backgroundColor: isUploading ? '#ccc' : '#1E52A5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.3s',
                        opacity: isUploading ? 0.7 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isUploading) {
                          e.currentTarget.style.backgroundColor = '#164399';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isUploading) {
                          e.currentTarget.style.backgroundColor = '#1E52A5';
                        }
                      }}
                    >
                      {isUploading ? (
                        <>
                          <Loader2
                            size={18}
                            style={{ animation: 'spin 1s linear infinite' }}
                          />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          Mudar foto
                        </>
                      )}
                    </button>
                  )}
                  <input
                    id="avatar-file-input"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    disabled={isUploading}
                    hidden
                  />
                </div>

                <form className="profile-form">
                  <label>Nome</label>
                  <input
                    type="text"
                    value={user.nome || ""}
                    onChange={(e) => handleChange("nome", e.target.value)}
                    readOnly={!editable || isSaving}
                    style={{
                      backgroundColor: editable && !isSaving ? '#fff' : '#f5f5f5',
                      cursor: editable && !isSaving ? 'text' : 'default',
                    }}
                  />

                  <label>Email</label>
                  <div className="input-icon">
                    <Mail size={20} color="#717680" />
                    <input
                      type="email"
                      value={user.email || ""}
                      readOnly
                      style={{
                        backgroundColor: '#f5f5f5',
                        cursor: 'default',
                      }}
                    />
                  </div>

                  <label>Cargo</label>
                  <input
                    type="text"
                    value={user.cargo?.nome || "—"}
                    readOnly
                    style={{
                      backgroundColor: '#f5f5f5',
                      cursor: 'default',
                    }}
                  />

                  <label>Role</label>
                  <input
                    type="text"
                    value={user.role || "—"}
                    readOnly
                    style={{
                      backgroundColor: '#f5f5f5',
                      cursor: 'default',
                    }}
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .edit-title-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .profile-form input:disabled {
          opacity: 0.7;
        }
      `}</style>
    </>
  );
};

export default TelaPerfil;
