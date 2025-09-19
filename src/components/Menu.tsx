import "../styles/menu.css";

export default function Menu() {
    return (
        <div className="menu-container">
            <div className="menu">
                <div className="menu-perfil">
                    <div className="menu-perfil-imagem"></div>
                    <div className="menu-perfil-nome"></div>
                </div>
                <div className="menu-kanban">
                    <div className="menu-tela-inicial"></div>
                    <div className="menu-tela-arquivados"></div>
                    <div className="menu-tela-finalizados"></div>
                </div>
                <div className="menu-informacoes">
                    <div className="menu-calendario"></div>
                    <div className="menu-notificacoes"></div>
                </div>
                <div className="menu-gestor">
                    <div className="menu-tela-dashboard"></div>
                    <div className="menu-tela-equipe"></div>
                </div>
                <div className="menu-mais">
                    <div className="menu-configuracoes"></div>
                    <div className="menu-ajuda"></div>
                </div>
            </div>
        </div>
    );
}