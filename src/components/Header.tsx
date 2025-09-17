import "../styles/header.css";
import LogoBrancaFlap from "../images/LogoBrancaFlap.png";

export default function Header() {
    return (
        <div className="header-container">
            <div className="header">
                <div className="logo-header-flap"><img src={LogoBrancaFlap} alt="Logo" /></div>
                <div className="pesquisa-header"></div>
                <div className="logout-header"></div>
            </div>
        </div>
    );
};

