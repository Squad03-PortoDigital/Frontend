import React from "react";
import "../pages/TelaAjuda.css";
import LogoAzulFlap from "../images/Logo-azul-FLAP 1.png";

export default function Ajuda() {
  return (
    <div className="ajuda-container">
      <h1 className="ajuda-title">Ajuda</h1>

      <div className="ajuda-card">
        <h2>Suporte Técnico e Ajuda</h2>
        <p>
          Para dúvidas a respeito do sistema, sugestões de melhorias e
          correções e suporte técnico, entre em contato conosco!
        </p>
        <hr />
        <p><strong>Email:</strong> DevelopmentSquad03@Gmail.com</p>
        <p><strong>Telefone para contato:</strong> (79) 99999-9999</p>
      </div>

      <div className="ajuda-logo-container">
        <img src={LogoAzulFlap} alt="Logo Flap" className="ajuda-logo-bg" />
      </div>
    </div>
  );
}
