import React, { useState, useEffect } from "react";
import "./TelaEquipe.css";
import { Users, Plus, Edit2, Trash2, Shield, Search, X, Lock } from "lucide-react";
import { Toast } from "./Toast";
import { ConfirmModal } from "./ConfirmModal";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  foto?: string;
  role?: {
    id: number;
    nome: string;
  };
  dataCriacao?: string;
}

interface Permissao {
  id: number;
  nome: string;
}

interface Role {
  id: number;
  nome: string;
  permissoes: Permissao[];
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning';
  show: boolean;
}

// ===== MAPA DE PERMISSÕES - NOMES LEGÍVEIS PARA USUÁRIO =====
const PERMISSOES_NOMES_LEGÍVEIS: { [key: string]: string } = {
  "USUARIO_CADASTRAR": "Cadastrar Usuários",
  "USUARIO_LER": "Visualizar Usuários",
  "USUARIO_EDITAR_PERMISSAO": "Editar Usuários",
  "ROLE_GERENCIAR": "Gerenciar Cargos",
  "EMPRESA_CRIAR": "Criar Empresas",
  "EMPRESA_EDITAR": "Editar Empresas",
  "LISTA_GERENCIAR": "Gerenciar Listas",
  "TAREFA_CRIAR": "Criar Tarefas",
  "TAREFA_LER": "Visualizar Tarefas",
  "TAREFA_EDITAR_GERAL": "Editar Tarefas",
  "TAREFA_MOVER": "Mover Tarefas",
  "TAREFA_DELETAR": "Deletar Tarefas",
  "COMENTARIO_CRIAR": "Criar Comentários",
  "CHECKLIST_GERENCIAR": "Gerenciar Checklists",
};

export default function TelaEquipe() {
  // Estados para dados
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);

  // Modal de Cadastro de Usuário
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  const [formCadastroNome, setFormCadastroNome] = useState("");
  const [formCadastroEmail, setFormCadastroEmail] = useState("");
  const [formCadastroSenha, setFormCadastroSenha] = useState("");
  const [formCadastroConfirmarSenha, setFormCadastroConfirmarSenha] = useState("");
  const [formCadastroRoleId, setFormCadastroRoleId] = useState<number | "">("");
  const [loadingCadastro, setLoadingCadastro] = useState(false);

  // Modal de Role
  const [modalRoleAberto, setModalRoleAberto] = useState(false);
  const [roleEditando, setRoleEditando] = useState<Role | null>(null);
  const [formRoleNome, setFormRoleNome] = useState("");
  const [formPermissoesSelecionadas, setFormPermissoesSelecionadas] = useState<number[]>([]);
  const [modalPermissoesAberto, setModalPermissoesAberto] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);

  // Estados de UI
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', show: false });
  const [abaAtiva, setAbaAtiva] = useState<'usuarios' | 'roles'>('usuarios');
  const [busca, setBusca] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemParaDeletar, setItemParaDeletar] = useState<{ tipo: 'usuario' | 'role', id: number, nome: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ message, type, show: true });
  };

  // ===== FUNÇÕES DE AUTENTICAÇÃO =====
  const handleSessionExpired = () => {
    showToast("Sessão expirada. Faça login novamente.", "error");
    localStorage.removeItem("auth");
    localStorage.removeItem("usuario");
    localStorage.removeItem("authenticated");
    setTimeout(() => window.location.href = "/", 1500);
  };

  const getAuth = (): string | null => {
    const auth = localStorage.getItem("auth");
    if (!auth) {
      handleSessionExpired();
      return null;
    }
    return auth;
  };

  // ===== CARREGAMENTO INICIAL DE DADOS =====
  useEffect(() => {
    let isSubscribed = true;

    const carregarDados = async () => {
      const auth = getAuth();
      if (!auth) return;

      try {
        setLoading(true);

        // Carregar usuários
        const usuariosRes = await fetch("http://3.233.245.239:8080/usuarios", {
          headers: { Authorization: `Basic ${auth}` },
          credentials: "include",
        });

        if (usuariosRes.status === 401) {
          handleSessionExpired();
          return;
        }

        if (usuariosRes.ok && isSubscribed) {
          const contentType = usuariosRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const usuariosData = await usuariosRes.json();
            console.log("Usuários carregados:", usuariosData);
            setUsuarios(usuariosData);
          }
        }

        // Carregar roles
        const rolesRes = await fetch("http://3.233.245.239:8080/roles", {
          headers: { Authorization: `Basic ${auth}` },
          credentials: "include",
        });

        if (rolesRes.ok && isSubscribed) {
          const contentType = rolesRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const rolesData = await rolesRes.json();
            setRoles(rolesData);
          }
        }

        // Carregar permissões
        const permissoesRes = await fetch("http://3.233.245.239:8080/permissoes", {
          headers: { Authorization: `Basic ${auth}` },
          credentials: "include",
        });

        if (permissoesRes.ok && isSubscribed) {
          const contentType = permissoesRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const permissoesData = await permissoesRes.json();
            setPermissoes(permissoesData);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        if (isSubscribed) {
          showToast("Erro ao carregar dados. Tente novamente.", "error");
        }
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    carregarDados();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const getInitials = (nome: string) => {
    if (!nome) return "??";
    const words = nome.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  const getNomePermissaoLegivel = (nomePermissao: string): string => {
    return PERMISSOES_NOMES_LEGÍVEIS[nomePermissao] || nomePermissao;
  };

  // ===== MODAL CADASTRO USUÁRIO =====
  const abrirModalCadastro = () => {
    setModalCadastroAberto(true);
    setFormCadastroNome("");
    setFormCadastroEmail("");
    setFormCadastroSenha("");
    setFormCadastroConfirmarSenha("");
    setFormCadastroRoleId(roles[0]?.id || "");
  };

  const salvarCadastroUsuario = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCadastroNome.trim()) {
      showToast("O nome é obrigatório!", "warning");
      return;
    }

    if (formCadastroNome.length < 3) {
      showToast("O nome deve ter pelo menos 3 caracteres!", "warning");
      return;
    }

    if (!formCadastroEmail.trim()) {
      showToast("O email é obrigatório!", "warning");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formCadastroEmail)) {
      showToast("Email inválido!", "warning");
      return;
    }

    if (formCadastroSenha !== formCadastroConfirmarSenha) {
      showToast("As senhas não coincidem!", "warning");
      return;
    }

    if (formCadastroSenha.length < 6) {
      showToast("A senha deve ter pelo menos 6 caracteres!", "warning");
      return;
    }

    if (!formCadastroRoleId) {
      showToast("Selecione uma role!", "warning");
      return;
    }

    try {
      setLoadingCadastro(true);
      const auth = getAuth();
      if (!auth) return;

      const response = await fetch("http://3.233.245.239:8080/usuarios/cadastro", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`
        },
        credentials: "include",
        body: JSON.stringify({
          nome: formCadastroNome.trim(),
          email: formCadastroEmail.trim(),
          senha: formCadastroSenha,
          foto: null,
          roleId: Number(formCadastroRoleId),
        }),
      });

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      const data = await response.json();

      if (response.ok) {
        showToast("Usuário cadastrado com sucesso!", "success");
        setModalCadastroAberto(false);
        setFormCadastroNome("");
        setFormCadastroEmail("");
        setFormCadastroSenha("");
        setFormCadastroConfirmarSenha("");
        setFormCadastroRoleId("");
        
        // Recarrega usuários
        const auth = getAuth();
        if (auth) {
          const usuariosRes = await fetch("http://3.233.245.239:8080/usuarios", {
            headers: { Authorization: `Basic ${auth}` },
            credentials: "include",
          });
          if (usuariosRes.ok) {
            const usuariosData = await usuariosRes.json();
            setUsuarios(usuariosData);
          }
        }
      } else if (response.status === 400) {
        showToast(data.message || "Dados inválidos.", "error");
      } else if (response.status === 409) {
        showToast("Este email já está cadastrado.", "error");
      } else if (response.status === 403) {
        showToast("Você não tem permissão para cadastrar usuários.", "error");
      } else {
        showToast(data.message || "Erro ao cadastrar usuário.", "error");
      }
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      showToast("Falha na conexão com o servidor.", "error");
    } finally {
      setLoadingCadastro(false);
    }
  };

  // ===== FUNÇÕES DE ROLE =====
  const abrirModalNovoRole = () => {
    setRoleEditando(null);
    setFormRoleNome("");
    setFormPermissoesSelecionadas([]);
    setModalRoleAberto(true);
  };

  const abrirModalEditarRole = (role: Role) => {
    setRoleEditando(role);
    setFormRoleNome(role.nome);
    setFormPermissoesSelecionadas(role.permissoes.map(p => p.id));
    setModalRoleAberto(true);
  };

  const abrirModalPermissoes = () => {
    if (!formRoleNome.trim()) {
      showToast("Digite o nome da role primeiro!", "warning");
      return;
    }
    setModalPermissoesAberto(true);
  };

  const togglePermissao = (permissaoId: number) => {
    setFormPermissoesSelecionadas(prev =>
      prev.includes(permissaoId)
        ? prev.filter(id => id !== permissaoId)
        : [...prev, permissaoId]
    );
  };

  const salvarRole = async () => {
    if (!formRoleNome.trim()) {
      showToast("O nome da role é obrigatório!", "warning");
      return;
    }

    if (formPermissoesSelecionadas.length === 0) {
      showToast("Selecione pelo menos uma permissão!", "warning");
      return;
    }

    try {
      setLoadingRole(true);
      const auth = getAuth();
      if (!auth) return;

      if (roleEditando) {
        // Atualizar role
        const response = await fetch(`http://3.233.245.239:8080/roles/${roleEditando.id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`
          },
          credentials: "include",
          body: JSON.stringify({
            nome: formRoleNome,
            permissoesIds: formPermissoesSelecionadas,
          }),
        });

        if (response.status === 401) {
          handleSessionExpired();
          return;
        }

        if (response.ok) {
          showToast("Cargo atualizado com sucesso!", "success");
          setModalRoleAberto(false);
          setModalPermissoesAberto(false);
          
          // Recarrega roles
          const rolesRes = await fetch("http://3.233.245.239:8080/roles", {
            headers: { Authorization: `Basic ${auth}` },
            credentials: "include",
          });
          if (rolesRes.ok) {
            const rolesData = await rolesRes.json();
            setRoles(rolesData);
          }
        } else {
          showToast("Erro ao atualizar cargo.", "error");
        }
      } else {
        // Criar novo role
        const response = await fetch("http://3.233.245.239:8080/roles", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`
          },
          credentials: "include",
          body: JSON.stringify({
            nome: formRoleNome,
            permissoesIds: formPermissoesSelecionadas,
          }),
        });

        if (response.status === 401) {
          handleSessionExpired();
          return;
        }

        if (response.ok) {
          showToast("Cargo criado com sucesso!", "success");
          setModalRoleAberto(false);
          setModalPermissoesAberto(false);
          
          // Recarrega roles
          const rolesRes = await fetch("http://3.233.245.239:8080/roles", {
            headers: { Authorization: `Basic ${auth}` },
            credentials: "include",
          });
          if (rolesRes.ok) {
            const rolesData = await rolesRes.json();
            setRoles(rolesData);
          }
        } else {
          const data = await response.json();
          showToast(data.message || "Erro ao criar cargo.", "error");
        }
      }
    } catch (error) {
      console.error("Erro ao salvar role:", error);
      showToast("Falha na conexão com o servidor.", "error");
    } finally {
      setLoadingRole(false);
    }
  };

  const confirmarDeletarRole = (role: Role) => {
    setItemParaDeletar({ tipo: 'role', id: role.id, nome: role.nome });
    setShowDeleteModal(true);
  };

  const deletarRole = async () => {
    if (itemParaDeletar?.tipo !== 'role') return;

    try {
      const auth = getAuth();
      if (!auth) return;

      const response = await fetch(`http://3.233.245.239:8080/roles/${itemParaDeletar.id}`, {
        method: "DELETE",
        headers: { Authorization: `Basic ${auth}` },
        credentials: "include",
      });

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      if (response.ok) {
        showToast("Cargo deletado com sucesso!", "success");
        setRoles(prev => prev.filter(r => r.id !== itemParaDeletar.id));
      } else {
        showToast("Erro ao deletar cargo.", "error");
      }
    } catch (error) {
      console.error("Erro ao deletar role:", error);
      showToast("Falha na conexão com o servidor.", "error");
    } finally {
      setShowDeleteModal(false);
      setItemParaDeletar(null);
    }
  };

  const confirmarDeletarUsuario = (usuario: Usuario) => {
    setItemParaDeletar({ tipo: 'usuario', id: usuario.id, nome: usuario.nome });
    setShowDeleteModal(true);
  };

  const deletarUsuario = async () => {
    if (itemParaDeletar?.tipo !== 'usuario') return;

    try {
      const auth = getAuth();
      if (!auth) return;

      const response = await fetch(`http://3.233.245.239:8080/usuarios/${itemParaDeletar.id}`, {
        method: "DELETE",
        headers: { Authorization: `Basic ${auth}` },
        credentials: "include",
      });

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      if (response.ok) {
        showToast("Usuário deletado com sucesso!", "success");
        setUsuarios(prev => prev.filter(u => u.id !== itemParaDeletar.id));
      } else {
        showToast("Erro ao deletar usuário.", "error");
      }
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      showToast("Falha na conexão com o servidor.", "error");
    } finally {
      setShowDeleteModal(false);
      setItemParaDeletar(null);
    }
  };

  // Filtros
  const usuariosFiltrados = usuarios.filter(u =>
    u.nome.toLowerCase().includes(busca.toLowerCase()) ||
    u.email.toLowerCase().includes(busca.toLowerCase()) ||
    u.role?.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const rolesFiltradas = roles.filter(r =>
    r.nome.toLowerCase().includes(busca.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        fontSize: "18px",
        color: "#6B7280"
      }}>
        Carregando...
      </div>
    );
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

      <ConfirmModal
        isOpen={showDeleteModal}
        title={`Deletar ${itemParaDeletar?.tipo === 'usuario' ? 'Usuário' : 'Cargo'}`}
        message={`Tem certeza que deseja deletar ${itemParaDeletar?.tipo === 'usuario' ? 'o usuário' : 'o cargo'} "${itemParaDeletar?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={itemParaDeletar?.tipo === 'usuario' ? deletarUsuario : deletarRole}
        onCancel={() => {
          setShowDeleteModal(false);
          setItemParaDeletar(null);
        }}
      />

      <div className="equipe-wrapper">
        <div className="equipe-header">
          <div className="equipe-titulo">
            <Users size={28} color="#1E52A5" />
            <h1>Gestão de Equipe</h1>
          </div>
          <p className="equipe-subtitulo">
            Gerencie usuários e cargos da plataforma
          </p>
        </div>

        <div className="equipe-actions">
          <div className="search-box">
            <Search size={20} color="#6B7280" />
            <input
              type="text"
              placeholder="Buscar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            {busca && (
              <X 
                size={18} 
                color="#6B7280" 
                style={{ cursor: 'pointer' }}
                onClick={() => setBusca("")}
              />
            )}
          </div>

          <div className="tabs">
            <button
              className={`tab ${abaAtiva === 'usuarios' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('usuarios')}
            >
              <Users size={18} />
              Usuários ({usuarios.length})
            </button>
            <button
              className={`tab ${abaAtiva === 'roles' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('roles')}
            >
              <Shield size={18} />
              Cargos ({roles.length})
            </button>
          </div>

          <button
            className="btn-novo"
            onClick={abaAtiva === 'usuarios' ? abrirModalCadastro : abrirModalNovoRole}
          >
            <Plus size={18} />
            Novo {abaAtiva === 'usuarios' ? 'Usuário' : 'Cargo'}
          </button>
        </div>

        {abaAtiva === 'usuarios' ? (
          <div className="usuarios-grid">
            {usuariosFiltrados.length > 0 ? (
              usuariosFiltrados.map(usuario => (
                <div key={usuario.id} className="usuario-card">
                  <div className="usuario-header">
                    <div className="usuario-avatar">
                      <div className="avatar-placeholder" style={{ backgroundColor: '#667eea' }}>
                        {getInitials(usuario.nome)}
                      </div>
                    </div>
                    <div className="usuario-info">
                      <h3>{usuario.nome}</h3>
                      <p>{usuario.email}</p>
                      <div className="usuario-badges">
                        {usuario.role && (
                          <span 
                            className="cargo-badge"
                            style={{ backgroundColor: '#3B82F6' }}
                          >
                            {usuario.role.nome}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="usuario-footer">
                    <span className="data-criacao">
                      Criado em {usuario.dataCriacao ? new Date(usuario.dataCriacao).toLocaleDateString('pt-BR') : 'N/A'}
                    </span>
                    <div className="usuario-acoes">
                      <button
                        className="btn-icon delete"
                        onClick={() => confirmarDeletarUsuario(usuario)}
                        title="Deletar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Users size={64} color="#ccc" />
                <h3>Nenhum usuário encontrado</h3>
                <p>{busca ? 'Tente outra busca' : 'Crie o primeiro usuário'}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="cargos-list">
            {rolesFiltradas.length > 0 ? (
              rolesFiltradas.map(role => (
                <div key={role.id} className="cargo-item">
                  <div className="cargo-info">
                    <div className="cargo-cor" style={{ backgroundColor: '#3B82F6' }}></div>
                    <div className="cargo-details">
                      <div>
                        <h3>{role.nome}</h3>
                        <span className="cargo-usuarios">
                          {role.permissoes.length} permissão{role.permissoes.length !== 1 ? 'ões' : ''}
                        </span>
                      </div>
                      {role.permissoes && role.permissoes.length > 0 && (
                        <div className="cargo-permissoes-preview">
                          <Lock size={14} />
                          <span>
                            {role.permissoes
                              .map(p => getNomePermissaoLegivel(p.nome))
                              .join(', ')
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="cargo-acoes">
                    <button
                      className="btn-icon edit"
                      onClick={() => abrirModalEditarRole(role)}
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => confirmarDeletarRole(role)}
                      title="Deletar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Shield size={64} color="#ccc" />
                <h3>Nenhum cargo encontrado</h3>
                <p>{busca ? 'Tente outra busca' : 'Crie o primeiro cargo'}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Cadastro de Usuário */}
      {modalCadastroAberto && (
        <div className="modal-overlay" onClick={() => setModalCadastroAberto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cadastrar Novo Usuário</h2>
              <button className="close-btn" onClick={() => setModalCadastroAberto(false)}>
                <X size={20} />
              </button>
            </div>

            <form className="modal-body" onSubmit={salvarCadastroUsuario}>
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  value={formCadastroNome}
                  onChange={(e) => setFormCadastroNome(e.target.value)}
                  placeholder="Digite o nome completo"
                  minLength={3}
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formCadastroEmail}
                  onChange={(e) => setFormCadastroEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="form-group">
                <label>Cargo *</label>
                <select 
                  value={formCadastroRoleId} 
                  onChange={(e) => setFormCadastroRoleId(Number(e.target.value) || "")}
                >
                  <option value="">Selecione um cargo</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Senha *</label>
                <input
                  type="password"
                  value={formCadastroSenha}
                  onChange={(e) => setFormCadastroSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label>Confirmar Senha *</label>
                <input
                  type="password"
                  value={formCadastroConfirmarSenha}
                  onChange={(e) => setFormCadastroConfirmarSenha(e.target.value)}
                  placeholder="Confirme a senha"
                  minLength={6}
                />
              </div>
            </form>

            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setModalCadastroAberto(false)}>
                Cancelar
              </button>
              <button 
                className="btn-salvar" 
                onClick={salvarCadastroUsuario}
                disabled={loadingCadastro}
              >
                {loadingCadastro ? 'Cadastrando...' : 'Cadastrar Usuário'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Role */}
      {modalRoleAberto && !modalPermissoesAberto && (
        <div className="modal-overlay" onClick={() => setModalRoleAberto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{roleEditando ? 'Editar Cargo' : 'Novo Cargo'}</h2>
              <button className="close-btn" onClick={() => setModalRoleAberto(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Nome do Cargo *</label>
                <input
                  type="text"
                  value={formRoleNome}
                  onChange={(e) => setFormRoleNome(e.target.value)}
                  placeholder="Ex: Administrador, Moderador"
                />
              </div>

              <div className="form-group">
                <label>Permissões</label>
                <button 
                  className="btn-adicionar-permissoes"
                  type="button"
                  onClick={abrirModalPermissoes}
                >
                  <Lock size={16} />
                  Configurar Permissões ({formPermissoesSelecionadas.length})
                </button>
              </div>

              {formPermissoesSelecionadas.length > 0 && (
                <div className="permissoes-selecionadas">
                  <h4>Permissões selecionadas:</h4>
                  <div className="permissoes-tags">
                    {formPermissoesSelecionadas.map(permId => {
                      const perm = permissoes.find(p => p.id === permId);
                      return (
                        <span key={permId} className="permissao-tag">
                          {getNomePermissaoLegivel(perm?.nome || "")}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setModalRoleAberto(false)}>
                Cancelar
              </button>
              <button className="btn-salvar" onClick={salvarRole} disabled={loadingRole}>
                {loadingRole ? 'Salvando...' : roleEditando ? 'Atualizar' : 'Criar'} Cargo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Permissões */}
      {modalPermissoesAberto && (
        <div className="modal-overlay" onClick={() => setModalPermissoesAberto(false)}>
          <div className="modal-content-permissoes" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Selecionar Permissões - {formRoleNome}</h2>
              <button className="close-btn" onClick={() => setModalPermissoesAberto(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body-permissoes">
              <div className="permissoes-grid">
                {permissoes.map(permissao => (
                  <label key={permissao.id} className="permissao-checkbox">
                    <input
                      type="checkbox"
                      checked={formPermissoesSelecionadas.includes(permissao.id)}
                      onChange={() => togglePermissao(permissao.id)}
                    />
                    <div className="permissao-label">
                      <span className="permissao-nome">
                        {getNomePermissaoLegivel(permissao.nome)}
                      </span>
                      <span className="permissao-code">{permissao.nome}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancelar" 
                onClick={() => setModalPermissoesAberto(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-salvar"
                onClick={() => {
                  salvarRole();
                }}
              >
                Confirmar Permissões
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
