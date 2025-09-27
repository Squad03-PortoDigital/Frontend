import React from 'react';
import '../pages/TelaAjustes.css'; 
import LogoAzulFlap from "../images/Logo-azul-FLAP 1.png";

const empresasCadastradas = [
    "Netiz",
    "Pio Décimo",
    "Celi",
    "Casa Alemã", 
    "Banese",
    "Apple"
];

export default function AjustesEmpresas() {
    return (
        <div className="ajustes-empresas-container">
            <h1 className="ajustes-empresas-title">Ajustes &gt; Empresas</h1>

            <div className="ajustes-empresas-content">
                
                <div className="cadastro-empresa-card">
                    <h2>Cadastro de Empresa</h2>
                    <form className="cadastro-form">
                        
                        <div className="form-group-row">
                            <div className="form-group">
                                <label htmlFor="nome">Nome</label>
                                <input type="text" id="nome" placeholder=" " />
                            </div>
                            <div className="form-group">
                                <label htmlFor="areaAtuacao">Área de atuação</label>
                                <input type="text" id="areaAtuacao" placeholder=" " />
                            </div>
                        </div>

                        <div className="form-group-row">
                            <div className="form-group">
                                <label htmlFor="cnpj">CNPJ</label>
                                <input type="text" id="cnpj" placeholder=" " />
                            </div>
                            <div className="form-group">
                                <label htmlFor="observacoes">Observações</label>
                                <input type="text" id="observacoes" placeholder=" " />
                            </div>
                        </div>

                        <div className="form-group-row">
                            <div className="form-group">
                                <label htmlFor="contato">Contato</label>
                                <input type="text" id="contato" placeholder=" " />
                            </div>
                            <div className="form-group empty-placeholder"></div>
                        </div>

                        <div className="form-group-row image-upload-row">
                            <div className="form-group email-field">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" placeholder=" " />
                            </div>

                            <div className="image-upload-area">
                                <div className="image-placeholder">
                                </div>
                                <button type="button" className="upload-button">
                                    Fazer upload de imagem
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="cadastro-button">
                            Cadastrar
                        </button>
                    </form>
                </div>

                <div className="empresas-cadastradas-card">
                    <h2>Empresas cadastradas</h2>
                    <ul className="empresas-list">
                        {empresasCadastradas.map((empresa, index) => (
                            <li 
                                key={index} 
                                className={`empresa-item ${empresa === 'Casa Alemã' ? 'selected' : ''}`}
                            >
                                {empresa}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="ajuda-logo-container">
                <img src={LogoAzulFlap} alt="Logo Flap" className="ajuda-logo-bg" />
            </div>
        </div>
        
    );
}