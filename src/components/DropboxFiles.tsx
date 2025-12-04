import { useState, useEffect } from "react";
import { Folder, File, FileText, Image, FileVideo, Music, Download, ExternalLink, Grid3x3, List, Upload, Trash2, Edit2, Plus } from "lucide-react";
import api from "../services/api";
import "../styles/DropboxFiles.css";
import { ConfirmModal } from "../pages/ConfirmModal";

interface DropboxFile {
  id: string;
  name: string;
  type: "folder" | "file";
  size?: number;
  modified?: string;
  path: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
  previewUrl?: string;
}

const DropboxLogo = () => (
  <svg width="24" height="24" viewBox="0 0 235 224" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M58.8 0L0 37.2L58.8 74.3L117.5 37.2L58.8 0Z" fill="#0061FF" />
    <path d="M117.5 37.2L176.3 0L235 37.2L176.3 74.3L117.5 37.2Z" fill="#0061FF" />
    <path d="M0 111.4L58.8 148.6L117.5 111.4L58.8 74.3L0 111.4Z" fill="#0061FF" />
    <path d="M117.5 111.4L176.3 148.6L235 111.4L176.3 74.3L117.5 111.4Z" fill="#0061FF" />
    <path d="M58.8 160.8L117.5 198L176.3 160.8L117.5 123.6L58.8 160.8Z" fill="#0061FF" />
  </svg>
);

interface DropboxFilesProps {
  dropboxPath: string;
}

const NEW_FOLDER_DEFAULT_NAME = "nova-pasta";

export default function DropboxFiles({ dropboxPath }: DropboxFilesProps) {
  const [files, setFiles] = useState<DropboxFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(dropboxPath);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [uploading, setUploading] = useState(false);

  // Preview modal states
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);

  // Rename states
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renamingFileName, setRenamingFileName] = useState("");

  // Confirm modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<DropboxFile | null>(null);

  // Load files
  const loadFiles = async (path: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/dropbox/files`, {
        params: { path: path || dropboxPath }
      });
      setFiles(response.data);
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dropboxPath) {
      setCurrentPath(dropboxPath);
      loadFiles(dropboxPath);
    }
  }, [dropboxPath]);

  // File icons
  const getFileIcon = (fileName: string, type: string) => {
    if (type === "folder") return <Folder size={20} color="#667eea" />;

    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileText size={20} color="#EF4444" />;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return <Image size={20} color="#10B981" />;
      case "mp4":
      case "mov":
      case "avi":
        return <FileVideo size={20} color="#F59E0B" />;
      case "mp3":
      case "wav":
        return <Music size={20} color="#8B5CF6" />;
      default:
        return <File size={20} color="#6B7280" />;
    }
  };

  // File click handler
  const handleFileClick = (file: DropboxFile) => {
    if (file.type === "folder") {
      if (!file.path.startsWith(dropboxPath)) {
        alert("Navegar para essa pasta não é permitido.");
        return;
      }
      setCurrentPath(file.path);
      loadFiles(file.path);
    } else {
      setSelectedFile(file.id);
      handlePreview(file);
    }
  };

  // Preview handler
  const handlePreview = async (file: DropboxFile) => {
    try {
      const response = await api.get(`/dropbox/preview`, { params: { path: file.path } });
      setPreviewUrl(response.data.url);
      setPreviewType(file.name.split('.').pop()?.toLowerCase() || 'file');
    } catch (error) {
      console.error("Erro ao gerar preview:", error);
    }
  };

  // Download handler
  const handleDownload = async (file: DropboxFile) => {
    try {
      const response = await api.get(`/dropbox/download`, {
        params: { path: file.path },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
    }
  };

  // Upload handler
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      await api.post(`/dropbox/upload`, formData, {
        params: { path: currentPath },
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      loadFiles(currentPath);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    } finally {
      setUploading(false);
    }
  };

  // Request delete opens confirm modal
  const onRequestDelete = (file: DropboxFile) => {
    setFileToDelete(file);
    setConfirmOpen(true);
  };

  // Confirm delete inside modal
  const onConfirmDelete = () => {
    if (fileToDelete) {
      handleDelete(fileToDelete);
      setConfirmOpen(false);
      setFileToDelete(null);
    }
  };

  // Cancel delete inside modal
  const onCancelDelete = () => {
    setConfirmOpen(false);
    setFileToDelete(null);
  };

  // Actual delete logic
  const handleDelete = async (file: DropboxFile) => {
    try {
      await api.delete(`/dropbox/delete`, { params: { path: file.path } });
      loadFiles(currentPath);
    } catch (error) {
      console.error("Erro ao deletar arquivo:", error);
    }
  };

  // Create new folder with default name and rename mode enabled
  const handleCreateFolder = async () => {
    try {
      await api.post('/dropbox/folder', {}, { params: { path: `${currentPath}/${NEW_FOLDER_DEFAULT_NAME}` }});
      loadFiles(currentPath).then(() => {
        const novaPasta = files.find(f => f.name === NEW_FOLDER_DEFAULT_NAME && f.type === "folder");
        if (novaPasta) {
          setRenamingFileId(novaPasta.id);
          setRenamingFileName(novaPasta.name);
        }
      });
    } catch (error) {
      console.error("Erro ao criar pasta:", error);
      alert("Erro ao criar pasta.");
    }
  };

  // Rename start
  const startRenaming = (file: DropboxFile) => {
    setRenamingFileId(file.id);
    setRenamingFileName(file.name);
  };

  // Rename cancel
  const cancelRenaming = () => {
    setRenamingFileId(null);
    setRenamingFileName('');
  };

  // Rename confirm
  const confirmRename = async (file: DropboxFile) => {
    if (!renamingFileName.trim()) {
      alert("O nome não pode ser vazio.");
      return;
    }
    try {
      const newPath = `${currentPath}/${renamingFileName}`;
      await api.patch('/dropbox/rename', { fromPath: file.path, toPath: newPath });
      setRenamingFileId(null);
      setRenamingFileName('');
      loadFiles(currentPath);
    } catch(error) {
      console.error("Erro ao renomear arquivo/pasta:", error);
      alert("Erro ao renomear arquivo ou pasta.");
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes/1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb/1024;
    return `${mb.toFixed(1)} MB`;
  };

  const getBreadcrumb = () => {
    if(!currentPath || currentPath === dropboxPath) return [];
    const relativePath = currentPath.replace(dropboxPath, '');
    return relativePath.split('/').filter(p => p);
  };

  return (
    <>
      <div className="dropbox-files-container">
        <div className="dropbox-files-header">
          <div className="dropbox-files-title">
            <DropboxLogo />
            <h3>Dropbox</h3>
          </div>
          <div className="dropbox-header-actions">
            <label className="dropbox-upload-btn" title="Upload">
              <Upload size={18} />
              <input type="file" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
            </label>

            <button className="dropbox-btn" title="Nova Pasta" onClick={handleCreateFolder}>
              <Plus size={18} />
            </button>

            <div className="view-toggle">
              <button className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>
                <List size={16} />
              </button>
              <button className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>
                <Grid3x3 size={16} />
              </button>
            </div>

            <a href="https://www.dropbox.com" target="_blank" rel="noopener noreferrer" className="dropbox-open-btn" title="Abrir no Dropbox">
              <ExternalLink size={18} />
            </a>
          </div>
        </div>

        {getBreadcrumb().length > 0 && (
          <div className="dropbox-breadcrumb">
            <button onClick={() => { setCurrentPath(dropboxPath); loadFiles(dropboxPath); }}>Tarefa</button>
            {getBreadcrumb().map((part, index, arr) => (
              <span key={index}>
                {' / '}
                <button onClick={() => {
                  const newPath = dropboxPath + '/' + arr.slice(0, index+1).join('/');
                  setCurrentPath(newPath);
                  loadFiles(newPath);
                }}>
                  {part}
                </button>
              </span>
            ))}
          </div>
        )}

        {loading ? (
          <div className="dropbox-loading">Carregando...</div>
        ) : (
          <div className={`dropbox-files-${viewMode}`}>
            {files.length > 0 ? (
              files.map(file => (
                <div key={file.id} className={`dropbox-file-item ${selectedFile === file.id ? "selected" : ""}`}>
                  <div className="file-icon">{getFileIcon(file.name, file.type)}</div>

                  {renamingFileId === file.id ? (
                    <input
                      type="text"
                      value={renamingFileName}
                      onChange={e => setRenamingFileName(e.target.value)}
                      onKeyDown={e => {
                        if(e.key === 'Enter') confirmRename(file);
                        if(e.key === 'Escape') cancelRenaming();
                      }}
                      onClick={e => e.stopPropagation()}
                      autoFocus
                      className="rename-input"
                    />
                  ) : (
                    <div className="file-info" onClick={() => handleFileClick(file)}>
                      <div className="file-name">{file.name}</div>
                      {viewMode === "list" && (
                        <div className="file-meta">
                          {file.size && <span>{formatSize(file.size)}</span>}
                          {file.size && file.modified && <span>•</span>}
                          {file.modified && <span>{new Date(file.modified).toLocaleDateString("pt-BR")}</span>}
                        </div>
                      )}
                    </div>
                  )}

                  {file.type === "file" && renamingFileId !== file.id && (
                    <div className="file-actions">
                      <button className="file-action-btn" onClick={e => { e.stopPropagation(); handleDownload(file); }} title="Baixar">
                        <Download size={16} />
                      </button>
                      <button className="file-action-btn" onClick={e => { e.stopPropagation(); onRequestDelete(file); }} title="Deletar">
                        <Trash2 size={16} />
                      </button>
                      <button className="file-action-btn" onClick={e => { e.stopPropagation(); startRenaming(file); }} title="Renomear">
                        <Edit2 size={16} />
                      </button>
                    </div>
                  )}

                  {file.type === "folder" && renamingFileId !== file.id && (
                    <div className="file-actions">
                      <button className="file-action-btn" onClick={e => { e.stopPropagation(); onRequestDelete(file); }} title="Deletar">
                        <Trash2 size={16} />
                      </button>
                      <button className="file-action-btn" onClick={e => { e.stopPropagation(); startRenaming(file); }} title="Renomear">
                        <Edit2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="dropbox-empty">
                <Folder size={48} color="#9ca3af" />
                <p>Nenhum arquivo nesta tarefa</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmação */}
      <ConfirmModal
        isOpen={confirmOpen}
        title="Confirmação de exclusão"
        message={`Deseja realmente excluir "${fileToDelete?.name}"? Essa ação não pode ser desfeita.`}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
        variant="danger"
      />

      {/* Modal de preview */}
      {previewUrl && (
        <div className="dropbox-modal" onClick={() => setPreviewUrl(null)}>
          <div className="dropbox-modal-content" onClick={e => e.stopPropagation()}>
            {previewType && ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(previewType) ? (
              <img src={previewUrl} alt="Preview" style={{ maxWidth: '90vw', maxHeight: '80vh' }} />
            ) : previewType === 'pdf' ? (
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(previewUrl)}&embedded=true`}
                title="Preview PDF"
                style={{ width: '45vw', height: '90vh', border: 'none' }}
              />
            ) : (
              <a href={previewUrl} target="_blank" rel="noopener noreferrer">Abrir arquivo</a>
            )}
            <button onClick={() => setPreviewUrl(null)} style={{ marginTop: 10 }}>Fechar</button>
          </div>
        </div>
      )}
    </>
  );
}