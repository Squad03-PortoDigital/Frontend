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
        {/* Perfil */}
        <Link to="/perfil" className="menu-perfil-item">
          <div className="menu-perfil-imagem">
            <img src={user.avatarUrl} alt={user.nome} />
          </div>
          <div className="menu-perfil-nome">{user.nome}</div>
        </Link>

        {/* Menu normal */}
        <div className="menu-section">
          <h2 className="menu-item-titulo">Kanban:</h2>
          <Link to="/home" className="menu-item">
            <House size={22} />
            <div className="menu-item-nome">Tela inicial</div>
          </Link>
          <div className="menu-item">
            <Archive size={22} />
            <div className="menu-item-nome">Arquivados</div>
          </div>
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
          <div className="menu-item">
            <Settings size={22} />
            <div className="menu-item-nome">Ajustes</div>
          </div>
          <div className="menu-item">
            <Info size={22} />
            <div className="menu-item-nome">Ajuda</div>
          </div>
        </div>

        <div className="menu-final">
          Flap - All Rights Reserved © 2025
        </div>
      </div>
    </aside>
  );
}