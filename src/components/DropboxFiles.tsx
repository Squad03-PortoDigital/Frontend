import { useState } from "react";
import { Folder, File, FileText, Image, FileVideo, Music, Download, ExternalLink, Grid3x3, List } from "lucide-react";
import "../styles/DropboxFiles.css";

interface DropboxFile {
  id: string;
  name: string;
  type: "folder" | "file";
  size?: string;
  modified?: string;
  path: string;
  thumbnail?: string;
}

const DropboxLogo = () => (
  <svg width="24" height="24" viewBox="0 0 235 224" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M58.8 0L0 37.2L58.8 74.3L117.5 37.2L58.8 0Z" fill="#0061FF"/>
    <path d="M117.5 37.2L176.3 0L235 37.2L176.3 74.3L117.5 37.2Z" fill="#0061FF"/>
    <path d="M0 111.4L58.8 148.6L117.5 111.4L58.8 74.3L0 111.4Z" fill="#0061FF"/>
    <path d="M117.5 111.4L176.3 148.6L235 111.4L176.3 74.3L117.5 111.4Z" fill="#0061FF"/>
    <path d="M58.8 160.8L117.5 198L176.3 160.8L117.5 123.6L58.8 160.8Z" fill="#0061FF"/>
  </svg>
);

export default function DropboxFiles() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // 📁 DADOS ESTÁTICOS - Apenas arquivos da pasta da tarefa
  const mockFiles: DropboxFile[] = [
    { id: "1", name: "Design", type: "folder", path: "/Projeto FLAP/Design", modified: "14/11/2025" },
    { id: "2", name: "Documentos", type: "folder", path: "/Projeto FLAP/Documentos", modified: "13/11/2025" },
    { id: "3", name: "Apresentacao.pdf", type: "file", size: "2.4 MB", path: "/Projeto FLAP/Apresentacao.pdf", modified: "12/11/2025" },
    { id: "4", name: "Logo.png", type: "file", size: "856 KB", path: "/Projeto FLAP/Logo.png", modified: "11/11/2025" },
    { id: "5", name: "Briefing.docx", type: "file", size: "145 KB", path: "/Projeto FLAP/Briefing.docx", modified: "10/11/2025" },
    { id: "6", name: "Wireframes.fig", type: "file", size: "1.2 MB", path: "/Projeto FLAP/Wireframes.fig", modified: "09/11/2025" },
    { id: "7", name: "Fotos", type: "folder", path: "/Projeto FLAP/Fotos", modified: "08/11/2025" },
    { id: "8", name: "Contrato.pdf", type: "file", size: "324 KB", path: "/Projeto FLAP/Contrato.pdf", modified: "07/11/2025" },
  ];

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

  const handleFileClick = (file: DropboxFile) => {
    if (file.type === "folder") {
      // TODO: Navegar para subpasta quando integrar com API
      console.log("Navegando para:", file.path);
    } else {
      setSelectedFile(file.id);
    }
  };

  const handleDownload = (file: DropboxFile) => {
    console.log("Download:", file.name);
  };

  const handleOpenInDropbox = (file: DropboxFile) => {
    console.log("Abrir no Dropbox:", file.name);
  };

  return (
    <div className="dropbox-files-container">
      <div className="dropbox-files-header">
        <div className="dropbox-files-title">
          <DropboxLogo />
          <h3>Dropbox</h3>
        </div>
        <div className="dropbox-header-actions">
          {/* Toggle de visualização */}
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title="Visualização em Lista"
            >
              <List size={16} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Visualização em Grade"
            >
              <Grid3x3 size={16} />
            </button>
          </div>
          {/* ✅ Botão com tooltip */}
          <a 
            href="https://www.dropbox.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="dropbox-open-btn"
            data-tooltip="Abrir no Dropbox"
          >
            <ExternalLink size={18} />
          </a>
        </div>
      </div>

      {/* ✅ REMOVIDO: breadcrumb de navegação */}

      <div className={`dropbox-files-${viewMode}`}>
        {mockFiles.length > 0 ? (
          mockFiles.map((file) => (
            <div
              key={file.id}
              className={`dropbox-file-item ${selectedFile === file.id ? "selected" : ""}`}
              onClick={() => handleFileClick(file)}
            >
              <div className="file-icon">
                {getFileIcon(file.name, file.type)}
              </div>
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                {viewMode === "list" && (
                  <div className="file-meta">
                    {file.size && <span>{file.size}</span>}
                    {file.size && file.modified && <span>•</span>}
                    {file.modified && <span>{file.modified}</span>}
                  </div>
                )}
              </div>
              {file.type === "file" && (
                <div className="file-actions">
                  <button
                    className="file-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(file);
                    }}
                    title="Baixar"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    className="file-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInDropbox(file);
                    }}
                    title="Abrir no Dropbox"
                  >
                    <ExternalLink size={16} />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="dropbox-empty">
            <Folder size={48} color="#9ca3af" />
            <p>Nenhum arquivo encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
