import { Archive, Bell, Calendar, ChartPie, House, Info, Settings, SquareCheckBig, Users } from "lucide-react";
import "../styles/menu.css";

export default function Menu() {
    return (
        <div className="menu-container">
            <div className="menu">
                <div className="menu-perfil">
                    <div className="menu-perfil-item">
                        <div className="menu-perfil-imagem"></div>
                        <div className="menu-perfil-nome">Perfil</div>
                    </div>
                </div>

                <div className="menu-section">
                    <h2 className="menu-item-titulo">Kanban</h2>
                    <div className="menu-item">
                        <House size={28} />
                        <div className="menu-item-nome">Tela inicial</div>
                    </div>
                    <div className="menu-item">
                        <Archive size={28} />
                        <div className="menu-item-nome">Arquivados</div>
                    </div>
                    <div className="menu-item">
                        <SquareCheckBig size={28} />
                        <div className="menu-item-nome">Finalizados</div>
                    </div>
                </div>

                <div className="menu-section">
                    <h2 className="menu-item-titulo">Informações</h2>
                    <div className="menu-item">
                        <Calendar size={24} />
                        <div className="menu-item-nome">Calendário</div>
                    </div>
                    <div className="menu-item">
                        <Bell size={24} />
                        <div className="menu-item-nome">Notificações</div>
                    </div>
                </div>

                <div className="menu-section">
                    <h2 className="menu-item-titulo">Gestor</h2>
                    <div className="menu-item">
                        <ChartPie size={24} />
                        <div className="menu-item-nome">Dashboard</div>
                    </div>
                    <div className="menu-item">
                        <Users size={24} />
                        <div className="menu-item-nome">Equipe</div>
                    </div>
                </div>

                <div className="menu-section">
                    <h2 className="menu-item-titulo">Mais</h2>
                    <div className="menu-item">
                        <Settings size={24} />
                        <div className="menu-item-nome">Configurações</div>
                    </div>
                    <div className="menu-item">
                        <Info size={24} />
                        <div className="menu-item-nome">Ajuda</div>
                    </div>
                </div>

                <div className="menu-final">
                    Flap - All Rights Reserved © 2025
                </div>
            </div>
        </div>
    );
}