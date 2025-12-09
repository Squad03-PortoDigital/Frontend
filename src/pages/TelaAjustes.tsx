import React, { useState, useEffect } from "react";
import "./TelaAjustes.css";
import { Building2, Plus, Edit2, Archive, Search, X, Upload, RotateCcw, Trash2 } from "lucide-react";
import { Toast } from "./Toast";
import { ConfirmModal } from "./ConfirmModal";

interface Empresa {
  id: number;
  nome: string;
  email: string;
  cnpj?: string;
  atuacao?: string;
  observacao?: string;
  contato?: string;
  agenteLink?: string;
  foto?: string;
  arquivada?: boolean;
  dataCriacao?: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning';
  show: boolean;
}

export default function AjustesEmpresas() {
  // Estados para dados
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresasArquivadas, setEmpresasArquivadas] = useState<Empresa[]>([]);

  // Modal de Cadastro/Edição de Empresa
  const [modalAberto, setModalAberto] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | null>(null);
  const [formNome, setFormNome] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCnpj, setFormCnpj] = useState("");
  const [formAtuacao, setFormAtuacao] = useState("");
  const [formObservacao, setFormObservacao] = useState("");
  const [formContato, setFormContato] = useState("");
  const [formAgenteLink, setFormAgenteLink] = useState("");
  const [formFoto, setFormFoto] = useState<string | null>(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [empresaParaDeletar, setEmpresaParaDeletar] = useState<Empresa | null>(null);


  // Estados de UI
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', show: false });
  const [abaAtiva, setAbaAtiva] = useState<'ativas' | 'arquivadas'>('ativas');
  const [busca, setBusca] = useState("");
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [empresaParaArquivar, setEmpresaParaArquivar] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ message, type, show: true });
  };

  // ===== FUNÇÕES DE AUTENTICAÇÃO =====
  const handleSessionExpired = () => {
    showToast("Sessão expirada. Faça login novamente.", "error");
    localStorage.removeItem("auth");
    localStorage.removeItem("usuario");
    localStorage.removeItem("authenticated");
    setTimeout(() => window.location.href = "/", 1500);
  };

  const getAuth = (): string | null => {
    const auth = localStorage.getItem("auth");
    if (!auth) {
      handleSessionExpired();
      return null;
    }
    return auth;
  };

  // ===== CARREGAMENTO INICIAL DE DADOS =====
  useEffect(() => {
    let isSubscribed = true;

    const carregarEmpresas = async () => {
      const auth = getAuth();
      if (!auth) return;

      try {
        setLoading(true);

        const response = await fetch("http://3.233.245.239:8080/empresas", {
          headers: { Authorization: `Basic ${auth}` },
          credentials: "include",
        });

        if (response.status === 401) {
          handleSessionExpired();
          return;
        }

        if (response.ok && isSubscribed) {
          const data = await response.json();

          // Separar empresas ativas e arquivadas
          const ativas = data.filter((e: Empresa) => !e.arquivada);
          const arquivadas = data.filter((e: Empresa) => e.arquivada);

          setEmpresas(ativas);
          setEmpresasArquivadas(arquivadas);
        }
      } catch (error) {
        console.error("Erro ao carregar empresas:", error);
        if (isSubscribed) {
          showToast("Erro ao carregar empresas. Tente novamente.", "error");
        }
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    carregarEmpresas();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const getInitials = (nome: string) => {
    if (!nome) return "??";
    const words = nome.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  // ===== MODAL CADASTRO/EDIÇÃO EMPRESA =====
  const abrirModalNova = () => {
    setEmpresaEditando(null);
    setFormNome("");
    setFormEmail("");
    setFormCnpj("");
    setFormAtuacao("");
    setFormObservacao("");
    setFormContato("");
    setFormAgenteLink("");
    setFormFoto(null);
    setModalAberto(true);
  };

  const abrirModalEditar = (empresa: Empresa) => {
    setEmpresaEditando(empresa);
    setFormNome(empresa.nome);
    setFormEmail(empresa.email);
    setFormCnpj(empresa.cnpj || "");
    setFormAtuacao(empresa.atuacao || "");
    setFormObservacao(empresa.observacao || "");
    setFormContato(empresa.contato || "");
    setFormAgenteLink(empresa.agenteLink || "");
    setFormFoto(empresa.foto || null);
    setModalAberto(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Aqui você pode implementar o upload real
      // Por enquanto, vou só criar uma URL local
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const salvarEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNome.trim()) {
      showToast("O nome da empresa é obrigatório!", "warning");
      return;
    }

    if (!formEmail.trim()) {
      showToast("O email é obrigatório!", "warning");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEmail)) {
      showToast("Email inválido!", "warning");
      return;
    }

    try {
      setLoadingModal(true);
      const auth = getAuth();
      if (!auth) return;

      const payload = {
        nome: formNome.trim(),
        email: formEmail.trim(),
        cnpj: formCnpj.trim() || null,
        atuacao: formAtuacao.trim() || null,
        observacao: formObservacao.trim() || null,
        contato: formContato.trim() || null,
        agenteLink: formAgenteLink.trim() || null,
        foto: formFoto,
      };

      if (empresaEditando) {
        // Atualizar empresa
        const response = await fetch(`http://3.233.245.239:8080/empresas/${empresaEditando.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (response.status === 401) {
          handleSessionExpired();
          return;
        }

        if (response.ok) {
          showToast("Empresa atualizada com sucesso!", "success");
          setModalAberto(false);

          // Recarregar empresas
          const empresasRes = await fetch("http://3.233.245.239:8080/empresas", {
            headers: { Authorization: `Basic ${auth}` },
            credentials: "include",
          });
          if (empresasRes.ok) {
            const data = await empresasRes.json();
            const ativas = data.filter((e: Empresa) => !e.arquivada);
            const arquivadas = data.filter((e: Empresa) => e.arquivada);
            setEmpresas(ativas);
            setEmpresasArquivadas(arquivadas);
          }
        } else {
          const error = await response.json();
          showToast(error.message || "Erro ao atualizar empresa.", "error");
        }
      } else {
        // Criar nova empresa
        const response = await fetch("http://3.233.245.239:8080/empresas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (response.status === 401) {
          handleSessionExpired();
          return;
        }

        if (response.ok) {
          showToast("Empresa cadastrada com sucesso!", "success");
          setModalAberto(false);

          // Recarregar empresas
          const empresasRes = await fetch("http://3.233.245.239:8080/empresas", {
            headers: { Authorization: `Basic ${auth}` },
            credentials: "include",
          });
          if (empresasRes.ok) {
            const data = await empresasRes.json();
            const ativas = data.filter((e: Empresa) => !e.arquivada);
            const arquivadas = data.filter((e: Empresa) => e.arquivada);
            setEmpresas(ativas);
            setEmpresasArquivadas(arquivadas);
          }
        } else {
          const error = await response.json();
          showToast(error.message || "Erro ao cadastrar empresa.", "error");
        }
      }
    } catch (error) {
      console.error("Erro ao salvar empresa:", error);
      showToast("Falha na conexão com o servidor.", "error");
    } finally {
      setLoadingModal(false);
    }
  };

  // ===== ARQUIVAR/DESARQUIVAR EMPRESA =====
  const confirmarArquivar = (empresa: Empresa) => {
    setEmpresaParaArquivar(empresa);
    setShowArchiveModal(true);
  };

  const arquivarEmpresa = async () => {
    if (!empresaParaArquivar) return;

    try {
      const auth = getAuth();
      if (!auth) return;

      const novoStatus = !empresaParaArquivar.arquivada;

      const response = await fetch(`http://3.233.245.239:8080/empresas/${empresaParaArquivar.id}/arquivar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        credentials: "include",
        body: JSON.stringify({ arquivada: novoStatus }),
      });

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      if (response.ok) {
        showToast(
          novoStatus ? "Empresa arquivada com sucesso!" : "Empresa restaurada com sucesso!",
          "success"
        );

        // Atualizar listas localmente
        if (novoStatus) {
          setEmpresas(prev => prev.filter(e => e.id !== empresaParaArquivar.id));
          setEmpresasArquivadas(prev => [...prev, { ...empresaParaArquivar, arquivada: true }]);
        } else {
          setEmpresasArquivadas(prev => prev.filter(e => e.id !== empresaParaArquivar.id));
          setEmpresas(prev => [...prev, { ...empresaParaArquivar, arquivada: false }]);
        }
      } else {
        showToast("Erro ao arquivar empresa.", "error");
      }
    } catch (error) {
      console.error("Erro ao arquivar empresa:", error);
      showToast("Falha na conexão com o servidor.", "error");
    } finally {
      setShowArchiveModal(false);
      setEmpresaParaArquivar(null);
    }
  };

  const confirmarExcluir = (empresa: Empresa) => {
    setEmpresaParaDeletar(empresa);
    setShowDeleteModal(true);
  };

  const excluirEmpresaPermanentemente = async () => {
    if (!empresaParaDeletar) return;

    try {
      const auth = getAuth();
      if (!auth) return;

      const response = await fetch(`http://3.233.245.239:8080/empresas/${empresaParaDeletar.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${auth}`,
        },
        credentials: "include",
      });

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      if (response.ok || response.status === 204) {
        showToast("Empresa excluída permanentemente!", "success");

        // Remove da lista de arquivadas
        setEmpresasArquivadas(prev => prev.filter(e => e.id !== empresaParaDeletar.id));
      } else {
        showToast("Erro ao excluir empresa.", "error");
      }
    } catch (error) {
      console.error("Erro ao excluir empresa:", error);
      showToast("Falha na conexão com o servidor.", "error");
    } finally {
      setShowDeleteModal(false);
      setEmpresaParaDeletar(null);
    }
  };


  // Filtros
  const empresasFiltradas = empresas.filter(e =>
    e.nome.toLowerCase().includes(busca.toLowerCase()) ||
    e.email.toLowerCase().includes(busca.toLowerCase()) ||
    e.cnpj?.toLowerCase().includes(busca.toLowerCase()) ||
    e.atuacao?.toLowerCase().includes(busca.toLowerCase())
  );

  const empresasArquivadasFiltradas = empresasArquivadas.filter(e =>
    e.nome.toLowerCase().includes(busca.toLowerCase()) ||
    e.email.toLowerCase().includes(busca.toLowerCase()) ||
    e.cnpj?.toLowerCase().includes(busca.toLowerCase()) ||
    e.atuacao?.toLowerCase().includes(busca.toLowerCase())
  );

  const empresasExibidas = abaAtiva === 'ativas' ? empresasFiltradas : empresasArquivadasFiltradas;

  if (loading) {
    return (
      <div className="loading-container">
        Carregando...
      </div>
    );
  }

  return (
    <>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <ConfirmModal
        isOpen={showArchiveModal}
        title={empresaParaArquivar?.arquivada ? "Restaurar Empresa" : "Arquivar Empresa"}
        message={
          empresaParaArquivar?.arquivada
            ? `Tem certeza que deseja restaurar a empresa "${empresaParaArquivar?.nome}"?`
            : `Tem certeza que deseja arquivar a empresa "${empresaParaArquivar?.nome}"? Ela ficará oculta mas poderá ser restaurada depois.`
        }
        confirmText={empresaParaArquivar?.arquivada ? "Restaurar" : "Arquivar"}
        cancelText="Cancelar"
        variant="warning" // ✅ FIXO como "warning"
        onConfirm={arquivarEmpresa}
        onCancel={() => {
          setShowArchiveModal(false);
          setEmpresaParaArquivar(null);
        }}
      />

      <ConfirmModal
      isOpen={showDeleteModal}
      title="Excluir Empresa Permanentemente"
      message={`Tem certeza que deseja EXCLUIR PERMANENTEMENTE a empresa "${empresaParaDeletar?.nome}"? Esta ação NÃO PODE ser desfeita!`}
      confirmText="Excluir Permanentemente"
      cancelText="Cancelar"
      variant="danger"
      onConfirm={excluirEmpresaPermanentemente}
      onCancel={() => {
        setShowDeleteModal(false);
        setEmpresaParaDeletar(null);
      }}
    />

      <div className="empresas-wrapper">
        <div className="empresas-header">
          <div className="empresas-titulo">
            <Building2 size={28} color="#1E52A5" />
            <h1>Gestão de Empresas</h1>
          </div>
          <p className="empresas-subtitulo">
            Gerencie as empresas cadastradas na plataforma
          </p>
        </div>

        <div className="empresas-actions">
          <div className="search-box">
            <Search size={20} color="#6B7280" />
            <input
              type="text"
              placeholder="Buscar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            {busca && (
              <X
                size={18}
                color="#6B7280"
                className="clear-search"
                onClick={() => setBusca("")}
              />
            )}
          </div>

          <div className="tabs">
            <button
              className={`tab ${abaAtiva === 'ativas' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('ativas')}
            >
              <Building2 size={18} />
              Empresas ({empresas.length})
            </button>
            <button
              className={`tab ${abaAtiva === 'arquivadas' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('arquivadas')}
            >
              <Archive size={18} />
              Arquivadas ({empresasArquivadas.length})
            </button>
          </div>

          <button className="btn-novo" onClick={abrirModalNova}>
            <Plus size={18} />
            Nova Empresa
          </button>
        </div>

        <div className="empresas-grid">
          {empresasExibidas.length > 0 ? (
            empresasExibidas.map(empresa => (
              <div
                key={empresa.id}
                className={`empresa-card ${empresa.arquivada ? 'arquivada' : ''}`}
              >
                <div className="empresa-header">
                  <div className="empresa-logo">
                    {empresa.foto ? (
                      <img src={empresa.foto} alt={empresa.nome} />
                    ) : (
                      <div className="logo-placeholder">
                        {getInitials(empresa.nome)}
                      </div>
                    )}
                  </div>
                  <div className="empresa-info">
                    <h3>{empresa.nome}</h3>
                    <p>{empresa.email}</p>
                    <div className="empresa-badges">
                      {empresa.atuacao && (
                        <span className="atuacao-badge">
                          {empresa.atuacao}
                        </span>
                      )}
                      {empresa.arquivada && (
                        <span className="status-badge-arquivada">
                          Arquivada
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {empresa.cnpj && (
                  <div className="empresa-detail">
                    <strong>CNPJ:</strong> {empresa.cnpj}
                  </div>
                )}

                {empresa.contato && (
                  <div className="empresa-detail">
                    <strong>Contato:</strong> {empresa.contato}
                  </div>
                )}

                <div className="empresa-footer">
                  <span className="data-criacao">
                    Criado em {empresa.dataCriacao ? new Date(empresa.dataCriacao).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                  <div className="empresa-acoes">
                    {/* Botão de Editar (sempre visível) */}
                    <button
                      className="btn-icon edit"
                      onClick={() => abrirModalEditar(empresa)}
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>

                    {/* Se estiver ARQUIVADA: botão Restaurar + Excluir Permanentemente */}
                    {empresa.arquivada ? (
                      <>
                        <button
                          className="btn-icon restore"
                          onClick={() => confirmarArquivar(empresa)}
                          title="Restaurar"
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => confirmarExcluir(empresa)}
                          title="Excluir Permanentemente"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      /* Se estiver ATIVA: botão Arquivar */
                      <button
                        className="btn-icon archive"
                        onClick={() => confirmarArquivar(empresa)}
                        title="Arquivar"
                      >
                        <Archive size={16} />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="empty-state">
              <Building2 size={64} color="#ccc" />
              <h3>Nenhuma empresa encontrada</h3>
              <p>{busca ? 'Tente outra busca' : abaAtiva === 'ativas' ? 'Crie a primeira empresa' : 'Nenhuma empresa arquivada'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cadastro/Edição */}
      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{empresaEditando ? 'Editar Empresa' : 'Cadastrar Nova Empresa'}</h2>
              <button className="close-btn" onClick={() => setModalAberto(false)}>
                <X size={20} />
              </button>
            </div>

            <form className="modal-body" onSubmit={salvarEmpresa}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nome *</label>
                  <input
                    type="text"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    placeholder="Nome da empresa"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="empresa@email.com"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>CNPJ</label>
                  <input
                    type="text"
                    value={formCnpj}
                    onChange={(e) => setFormCnpj(e.target.value)}
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div className="form-group">
                  <label>Área de Atuação</label>
                  <input
                    type="text"
                    value={formAtuacao}
                    onChange={(e) => setFormAtuacao(e.target.value)}
                    placeholder="Ex: Tecnologia"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contato</label>
                  <input
                    type="text"
                    value={formContato}
                    onChange={(e) => setFormContato(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="form-group">
                  <label>Link do Agente</label>
                  <input
                    type="url"
                    value={formAgenteLink}
                    onChange={(e) => setFormAgenteLink(e.target.value)}
                    placeholder="https://exemplo.com/agente"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Observações</label>
                <textarea
                  value={formObservacao}
                  onChange={(e) => setFormObservacao(e.target.value)}
                  placeholder="Informações adicionais"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Logo da Empresa</label>
                <div className="upload-area">
                  {formFoto ? (
                    <div className="preview-image">
                      <img src={formFoto} alt="Preview" />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => setFormFoto(null)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="upload-label">
                      <Upload size={24} />
                      <span>Clique para fazer upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        hidden
                      />
                    </label>
                  )}
                </div>
              </div>
            </form>

            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setModalAberto(false)}>
                Cancelar
              </button>
              <button
                className="btn-salvar"
                onClick={salvarEmpresa}
                disabled={loadingModal}
              >
                {loadingModal ? 'Salvando...' : empresaEditando ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
