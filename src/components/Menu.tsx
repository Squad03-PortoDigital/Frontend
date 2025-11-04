import { Link, useLocation } from "react-router-dom";
import { Archive, Bell, Calendar, ChartPie, House, Info, Settings, SquareCheckBig, Users, User, X, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import "../styles/menu.css";

interface UserProfile {
  id?: number;
  nome: string;
  email: string;
  foto?: string;
  role?: string;
  cargo?: {
    id: number;
    nome: string;
  };
}

interface MenuProps {
  user?: UserProfile;
}

export default function Menu({ user: userProp }: MenuProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [user, setUser] = useState<UserProfile | null>(userProp || null);
  const [isOpen, setIsOpen] = useState(true);

  const loadUser = () => {
    const usuarioSalvo = localStorage.getItem("usuario");
    if (usuarioSalvo) {
      const dados: UserProfile = JSON.parse(usuarioSalvo);
      setUser(dados);
    }
  };

  useEffect(() => {
    if (userProp) {
      setUser(userProp);
    } else {
      loadUser();
    }
  }, [userProp]);

  useEffect(() => {
    window.addEventListener('user-updated', loadUser);

    return () => {
      window.removeEventListener('user-updated', loadUser);
    };
  }, []);

  useEffect(() => {
    const handleToggle = () => {
      setIsOpen(prev => !prev);
    };

    window.addEventListener('toggle-menu', handleToggle);

    return () => {
      window.removeEventListener('toggle-menu', handleToggle);
    };
  }, []);

  const isActive = (path: string) => currentPath === path ? 'active' : '';
  const isAdminMaster = user?.role === "ADMINISTRADOR_MASTER";

  return (
    <aside className={`menu-container ${isOpen ? 'menu-open' : 'menu-closed'}`}>
      <div className="menu">
        <button className="menu-close-btn" onClick={() => setIsOpen(false)}>
          <X size={24} color="#717680" />
        </button>

        <Link to="/perfil" className="menu-perfil-item">
          <div className="menu-perfil-imagem">
            {user?.foto ? (
              <img src={user.foto} alt={user.nome} />
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
                <User size={32} color="#717680" />
              </div>
            )}
          </div>
          <div className="menu-perfil-nome">{user?.nome || "Usuário"}</div>
        </Link>

        <div className="menu-section">
          <h2 className="menu-item-titulo">Kanban:</h2>

          <Link to="/home" className={`menu-item ${isActive('/home')}`}>
            <House size={22} />
            <div className="menu-item-nome">Kanban</div>
          </Link>

          <Link to="/arquivadas" className="menu-item">
            <Archive size={22} />
            <div className="menu-item-nome">Arquivados</div>
          </Link>

          <div className="menu-item">
            <SquareCheckBig size={22} />
            <div className="menu-item-nome">Finalizados</div>
          </div>
        </div>

        <div className="menu-section">
          <h2 className="menu-item-titulo">Informações:</h2>
          <Link to="/calendario" className={`menu-item ${isActive('/calendario')}`}>
            <Calendar size={22} />
            <div className="menu-item-nome">Calendário</div>
          </Link>
          <div className="menu-item">
            <Bell size={22} />
            <div className="menu-item-nome">Notificações</div>
          </div>
        </div>

        <div className="menu-section">
          <h2 className="menu-item-titulo">Gestor:</h2>
          <Link to="/dashboard" className={`menu-item ${isActive('/dashboard')}`}>
            <ChartPie size={22} />
            <div className="menu-item-nome">Dashboard</div>
          </Link>
          <div className="menu-item">
          <Link to="/equipe" className={`menu-item ${isActive('/equipe')}`}>
            <Users size={22} />
            <div className="menu-item-nome">Equipe</div>
          </Link>
          </div>
        </div>

        <div className="menu-section">
          <h2 className="menu-item-titulo">Mais:</h2>
          <Link to="/ajustes" className={`menu-item ${isActive('/ajustes')}`}>
            <Settings size={22} />
            <div className="menu-item-nome">Empresas</div>
          </Link>
          <Link to="/ajuda" className={`menu-item ${isActive('/ajuda')}`}>
            <Info size={22} />
            <div className="menu-item-nome">Ajuda</div>
          </Link>
        </div>

        {isAdminMaster && (
          <div className="menu-section">
            <h2 className="menu-item-titulo">Administração:</h2>
            <Link to="/cadastrar-usuario" className={`menu-item ${isActive('/cadastrar-usuario')}`}>
              <UserPlus size={22} />
              <div className="menu-item-nome">Cadastrar Usuário</div>
            </Link>
          </div>
        )}

        <div className="menu-final">
          Flap - All Rights Reserved © 2025
        </div>
      </div>
    </aside>
  );
}
