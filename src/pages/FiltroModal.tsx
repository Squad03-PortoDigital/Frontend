import React, { useState } from "react";
import "./FiltroModal.css";
import { ChevronDown } from "lucide-react";

interface Membro {
  id: number;
  nome: string;
  username: string;
}

interface Empresa {
  id: number;
  nome: string;
}

interface FiltroModalProps {
  isOpen: boolean;
  onClose: () => void;
  membros: Membro[];
  empresas: Empresa[];
  onAplicar: (filtros: FiltrosAtivos) => void;
  filtrosAtuais: FiltrosAtivos;
}

export interface FiltrosAtivos {
  membros: number[];
  empresas: number[];
}

export default function FiltroModal({
  isOpen,
  onClose,
  membros,
  empresas,
  onAplicar,
  filtrosAtuais,
}: FiltroModalProps) {
  const [membrosSelecionados, setMembrosSelecionados] = useState<number[]>(
    filtrosAtuais.membros || []
  );
  const [empresasSelecionadas, setEmpresasSelecionadas] = useState<number[]>(
    filtrosAtuais.empresas || []
  );
  const [membroDropdownAberto, setMembroDropdownAberto] = useState(true);
  const [empresaDropdownAberto, setEmpresaDropdownAberto] = useState(true);
  const [buscaMembro, setBuscaMembro] = useState("");
  const [buscaEmpresa, setBuscaEmpresa] = useState("");

  if (!isOpen) return null;

  const membrosValidos = Array.isArray(membros) ? membros : [];
  const empresasValidas = Array.isArray(empresas) ? empresas : [];

  const handleMembroToggle = (membroId: number) => {
    setMembrosSelecionados((prev) =>
      prev.includes(membroId)
        ? prev.filter((id) => id !== membroId)
        : [...prev, membroId]
    );
  };

  const handleEmpresaToggle = (empresaId: number) => {
    setEmpresasSelecionadas((prev) =>
      prev.includes(empresaId)
        ? prev.filter((id) => id !== empresaId)
        : [...prev, empresaId]
    );
  };

  const handleAplicar = () => {
    onAplicar({
      membros: membrosSelecionados,
      empresas: empresasSelecionadas,
    });
    onClose();
  };

  const handleCancelar = () => {
    setMembrosSelecionados(filtrosAtuais.membros || []);
    setEmpresasSelecionadas(filtrosAtuais.empresas || []);
    setBuscaMembro("");
    setBuscaEmpresa("");
    onClose();
  };

  const getInitials = (nome: string) => {
    if (!nome) return "??";
    const words = nome.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  const getAvatarGradient = (index: number) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    ];
    return gradients[index % gradients.length];
  };

  const membrosFiltrados = membrosValidos.filter((membro) =>
    (membro.nome?.toLowerCase() || "").includes(buscaMembro.toLowerCase()) ||
    (membro.username?.toLowerCase() || "").includes(buscaMembro.toLowerCase())
  );

  const empresasFiltradas = empresasValidas.filter((empresa) =>
    (empresa.nome?.toLowerCase() || "").includes(buscaEmpresa.toLowerCase())
  );

  return (
    <div className="filtro-overlay-grid" onClick={handleCancelar}>
      <div className="filtro-modal-grid" onClick={(e) => e.stopPropagation()}>
        <div className="filtro-header-grid">
          <button className="filtro-btn-voltar-grid" onClick={handleCancelar}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 className="filtro-titulo-grid">Filtros</h2>
        </div>

        <div className="filtro-body-grid">
          {/* Coluna Esquerda - Membros */}
          <div className="filtro-column">
            <button 
              className="filtro-dropdown-btn"
              onClick={() => setMembroDropdownAberto(!membroDropdownAberto)}
            >
              <div className="filtro-dropdown-title-grid">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Pesquisar membro</span>
              </div>
              <ChevronDown 
                size={18} 
                className={`filtro-chevron-grid ${membroDropdownAberto ? 'open' : ''}`}
              />
            </button>
            
            {membroDropdownAberto && (
              <>
                <div className="filtro-search-container">
                  <svg width="16" height="16" className="filtro-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={buscaMembro}
                    onChange={(e) => setBuscaMembro(e.target.value)}
                    className="filtro-search-input"
                  />
                </div>
                <div className="filtro-items-container">
                  {membrosFiltrados.length > 0 ? (
                    membrosFiltrados.map((membro, index) => (
                      <label key={membro.id} className="filtro-item-grid">
                        <div className="filtro-item-left-grid">
                          <div 
                            className="filtro-avatar-grid"
                            style={{ background: getAvatarGradient(index) }}
                          >
                            {getInitials(membro.nome)}
                          </div>
                          <div className="filtro-user-details">
                            <span className="filtro-user-name-grid">{membro.nome}</span>
                            <span className="filtro-user-username-grid">{membro.username}</span>
                          </div>
                        </div>
                        {membrosSelecionados.includes(membro.id) && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                        <input
                          type="checkbox"
                          checked={membrosSelecionados.includes(membro.id)}
                          onChange={() => handleMembroToggle(membro.id)}
                          style={{ display: 'none' }}
                        />
                      </label>
                    ))
                  ) : (
                    <div className="filtro-empty-state">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                      </svg>
                      <p>Nenhum membro encontrado</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Coluna Direita - Empresas */}
          <div className="filtro-column">
            <button 
              className="filtro-dropdown-btn"
              onClick={() => setEmpresaDropdownAberto(!empresaDropdownAberto)}
            >
              <div className="filtro-dropdown-title-grid">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>Empresa</span>
              </div>
              <ChevronDown 
                size={18} 
                className={`filtro-chevron-grid ${empresaDropdownAberto ? 'open' : ''}`}
              />
            </button>
            
            {empresaDropdownAberto && (
              <>
                <div className="filtro-search-container">
                  <svg width="16" height="16" className="filtro-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={buscaEmpresa}
                    onChange={(e) => setBuscaEmpresa(e.target.value)}
                    className="filtro-search-input"
                  />
                </div>
                <div className="filtro-items-container">
                  {empresasFiltradas.length > 0 ? (
                    empresasFiltradas.map((empresa) => (
                      <label key={empresa.id} className="filtro-item-grid">
                        <span className="filtro-empresa-name-grid">{empresa.nome}</span>
                        {empresasSelecionadas.includes(empresa.id) && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                        <input
                          type="checkbox"
                          checked={empresasSelecionadas.includes(empresa.id)}
                          onChange={() => handleEmpresaToggle(empresa.id)}
                          style={{ display: 'none' }}
                        />
                      </label>
                    ))
                  ) : (
                    <div className="filtro-empty-state">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                      <p>Nenhuma empresa encontrada</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="filtro-footer-grid">
          <button className="filtro-btn-cancelar-grid" onClick={handleCancelar}>
            Cancelar
          </button>
          <button className="filtro-btn-aplicar-grid" onClick={handleAplicar}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
