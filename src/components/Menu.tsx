import { Link } from "react-router-dom";
import { Archive, Bell, Calendar, ChartPie, House, Info, Settings, SquareCheckBig, Users } from "lucide-react";
import "../styles/menu.css";

interface User {
  nome: string;
  avatarUrl: string;
}

interface MenuProps {
  user: User;
}

export default function Menu({ user }: MenuProps) {
  return (
    <aside className="menu-container">
      <div className="menu">
        
        <Link to="/perfil" className="menu-perfil-item">
          <div className="menu-perfil-imagem">
            <img src={user.avatarUrl} alt={user.nome} />
          </div>
          <div className="menu-perfil-nome">{user.nome}</div>
        </Link>

        <div className="menu-section">
          <h2 className="menu-item-titulo">Kanban:</h2>
          <Link to="/home" className="menu-item">
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
          <Link to="/ajustes" className="menu-item">
            <Settings size={22} />
            <div className="menu-item-nome">Ajustes</div>
          </Link>
          <Link to="/ajuda" className="menu-item">
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