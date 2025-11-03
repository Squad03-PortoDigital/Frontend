import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./components/Login";
import CadastroUsuario from './components/CadastroUsuario';
import Menu from "./components/Menu";
import Header from "./components/Header";
import TelaPerfil from "./pages/TelaPerfil";
import Ajuda from "./pages/TelaAjuda";
import TelaAjustes from "./pages/TelaAjustes";
import EmpresaDetalhes from "./pages/TelaEmpresaDetalhes";
import KanbanBoard from "./pages/TelaKanbanBoard";
import TelaDetalhamento from "./pages/TelaDetalhamento";
import TelaDashboard from "./pages/TelaDashboard";
import TelaCalendario from "./pages/TelaCalendario";
import TelaArquivadas from "./pages/TelaArquivadas"; // ✅ ADICIONAR
import "./App.css";

// Tipo para o usuário
interface Usuario {
  id?: number;
  nome: string;
  email: string;
  foto?: string | null;
  cargo?: {
    id: number;
    nome: string;
  };
  role?: string;
}

export default function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // ✅ Função para carregar usuário do localStorage
  const loadUser = () => {
    const usuarioSalvo = localStorage.getItem("usuario");
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  };

  // ✅ Carrega o usuário logado do localStorage quando o app inicializa
  useEffect(() => {
    loadUser();
  }, []);

  // ✅ Escuta o evento 'user-updated' para atualizar o estado
  useEffect(() => {
    window.addEventListener('user-updated', loadUser);

    return () => {
      window.removeEventListener('user-updated', loadUser);
    };
  }, []);

  return (
    <Routes>
      {/* Tela de login */}
      <Route path="/" element={<Login />} />

      {/* Tela de cadastro de usuário (admin) */}
      <Route
        path="/cadastrar-usuario"
        element={
          <div className="app-grid">
            <Header />
            <Menu user={usuario} />
            <main className="app-content">
              <CadastroUsuario />
            </main>
          </div>
        }
      />

      {/* Home - Kanban Board */}
      <Route
        path="/home"
        element={
          <div className="app-grid">
            <Header />
            <Menu user={usuario} />
            <main className="app-content kanban-area">
              <KanbanBoard />
            </main>
          </div>
        }
      />

      {/* Tela de detalhamento - COM PARÂMETRO :id */}
      <Route
        path="/detalhamento/:id"
        element={
          <div className="app-grid">
            <Header />
            <Menu user={usuario} />
            <main className="app-content">
              <TelaDetalhamento />
            </main>
          </div>
        }
      />

      {/* ✅ NOVO: Tela de tarefas arquivadas */}
      <Route
        path="/arquivadas"
        element={
          <div className="app-grid">
            <Header />
            <Menu user={usuario} />
            <main className="app-content">
              <TelaArquivadas />
            </main>
          </div>
        }
      />

      {/* Tela de perfil */}
      <Route
        path="/perfil"
        element={
          <div className="app-grid">
            <Header />
            <Menu user={usuario} />
            <main className="app-content">
              <TelaPerfil />
            </main>
          </div>
        }
      />

      {/* Tela de dashboard */}
      <Route
        path="/dashboard"
        element={
          <div className="app-grid">
            <Header />
            <Menu user={usuario} />
            <main className="app-content">
              <TelaDashboard />
            </main>
          </div>
        }
      />

      {/* Tela de calendário */}
      <Route
        path="/calendario"
        element={
          <div className="app-grid">
            <Header />
            <Menu user={usuario} />
            <main className="app-content">
              <TelaCalendario />
            </main>
          </div>
        }
      />

      {/* Tela de ajuda */}
      <Route
        path="/ajuda"
        element={
          <div className="app-grid">
            <Header />
            <Menu user={usuario} />
            <main className="app-content">
              <Ajuda />
            </main>
          </div>
        }
      />

      {/* Tela de ajustes */}
      <Route
        path="/ajustes"
        element={
          <div className="app-grid">
            <Header />
            <Menu user={usuario} />
            <main className="app-content">
              <TelaAjustes />
            </main>
          </div>
        }
      />

      {/* Tela de detalhes de empresa */}
      <Route
        path="/empresa/:id"
        element={
          <div className="app-grid">
            <Header />
            <Menu user={usuario} />
            <main className="app-content">
              <EmpresaDetalhes />
            </main>
          </div>
        }
      />
    </Routes>
  );
}
