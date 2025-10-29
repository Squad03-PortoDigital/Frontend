import { Link, useLocation } from "react-router-dom"; 
import { Archive, Bell, Calendar, ChartPie, House, Info, Settings, SquareCheckBig, Users, User } from "lucide-react";
import { useState, useEffect } from "react";
import "../styles/menu.css";

interface UserProfile {
  id?: number;
  nome: string;
  email: string;
  foto?: string;
  role?: string;
  cargo?: {
    nome: string;
  };
}

interface MenuProps {
  user?: UserProfile; // Opcional, caso queira passar de fora
}

export default function Menu({ user: userProp }: MenuProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [user, setUser] = useState<UserProfile | null>(userProp || null);

  // ✅ Carregar usuário do localStorage se não vier por props
  useEffect(() => {
    if (!userProp) {
      const usuarioSalvo = localStorage.getItem("usuario");
      if (usuarioSalvo) {
        const dados: UserProfile = JSON.parse(usuarioSalvo);
        setUser(dados);
      }
    }
  }, [userProp]);

  const isActive = (path: string) => currentPath === path ? 'active' : '';

  return (
    <aside className="menu-container">
      <div className="menu">

        <Link to="/perfil" className="menu-perfil-item">
          <div className="menu-perfil-imagem">
            {/* ✅ Se tiver foto, mostra a foto. Se não, mostra ícone User */}
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
          {/* ✅ Nome do usuário */}
          <div className="menu-perfil-nome">{user?.nome || "Usuário"}</div>
        </Link>

        <div className="menu-section">
          <h2 className="menu-item-titulo">Kanban:</h2>

          <Link to="/home" className={`menu-item ${isActive('/home')}`}>
            <House size={22} />
            <div className="menu-item-nome">Tela inicial</div>
          </Link>

          <Link to="/arquivados" className="menu-item">
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
          <div className="menu-item">
            <Calendar size={22} />
            <div className="menu-item-nome">Calendário</div>
          </div>
          <div className="menu-item">
            <Bell size={22} />
            <div className="menu-item-nome">Notificações</div>
          </div>
        </div>

        <div className="menu-section">
          <h2 className="menu-item-titulo">Gestor:</h2>
          <div className="menu-item">
            <ChartPie size={22} />
            <div className="menu-item-nome">Dashboard</div>
          </div>
          <div className="menu-item">
            <Users size={22} />
            <div className="menu-item-nome">Equipe</div>
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

        <div className="menu-final">
          Flap - All Rights Reserved © 2025
        </div>
      </div>
    </aside>
  );
}
