import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { RotaProtegida } from "./components/RotaProtegida";
import { WebSocketProvider } from './contexts/WebSocketContext';
import TelaNotificacoes from './pages/TelaNotificacoes';
import Login from "./components/Login";
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
import TelaArquivadas from "./pages/TelaArquivadas";
import TelaEquipe from "./pages/TelaEquipe";
import "./App.css";

// Tipo para o usuário
interface UserProfile {
  id?: number;
  nome: string;
  email: string;
  foto?: string;
  role?: string;
  cargo?: {
    id: number;
    nome: string;
    role?: string;
  };
}

// Componente wrapper para rotas autenticadas com WebSocket
const AuthenticatedLayout = ({ 
  children, 
  user,
  className = "app-content"
}: { 
  children: React.ReactNode;
  user?: UserProfile;
  className?: string;
}) => (
  <WebSocketProvider>
    <div className="app-grid">
      <Header />
      <Menu user={user} />
      <main className={className}>
        {children}
      </main>
    </div>
  </WebSocketProvider>
);

export default function App() {
  const [usuario, setUsuario] = useState<UserProfile | null>(null);

  const loadUser = () => {
    const usuarioSalvo = localStorage.getItem("usuario");
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    window.addEventListener('user-updated', loadUser);

    return () => {
      window.removeEventListener('user-updated', loadUser);
    };
  }, []);

  return (
    <Routes>
      {/* Tela de login - SEM WebSocket */}
      <Route path="/" element={<Login />} />

      {/* Home - Kanban Board */}
      <Route
        path="/home"
        element={
          <AuthenticatedLayout user={usuario as UserProfile | undefined} className="app-content kanban-area">
            <KanbanBoard />
          </AuthenticatedLayout>
        }
      />
    
      <Route
        path="/notificacoes"
        element={
          <AuthenticatedLayout user={usuario as UserProfile | undefined}>
            <TelaNotificacoes />
          </AuthenticatedLayout>
        }
      />

      {/* Tela de detalhamento - COM PARÂMETRO :id */}
      <Route
        path="/detalhamento/:id"
        element={
          <AuthenticatedLayout user={usuario as UserProfile | undefined}>
            <TelaDetalhamento />
          </AuthenticatedLayout>
        }
      />
    
      <Route
        path="/equipe"
        element={
          <RotaProtegida permissaesRequeridas="USUARIO_CADASTRAR" todasPermissoes={true}>
            <AuthenticatedLayout user={usuario as UserProfile | undefined}>
              <TelaEquipe />
            </AuthenticatedLayout>
          </RotaProtegida>
        }
      />

      {/* Tela de tarefas arquivadas */}
      <Route
        path="/finalizadas"
        element={
          <AuthenticatedLayout user={usuario as UserProfile | undefined}>
            <TelaArquivadas />
          </AuthenticatedLayout>
        }
      />

      {/* Tela de perfil */}
      <Route
        path="/perfil"
        element={
          <AuthenticatedLayout user={usuario as UserProfile | undefined}>
            <TelaPerfil />
          </AuthenticatedLayout>
        }
      />

      {/* Tela de dashboard */}
      <Route
        path="/dashboard"
        element={
          <AuthenticatedLayout user={usuario as UserProfile | undefined}>
            <TelaDashboard />
          </AuthenticatedLayout>
        }
      />

      {/* Tela de calendário */}
      <Route
        path="/calendario"
        element={
          <AuthenticatedLayout user={usuario as UserProfile | undefined}>
            <TelaCalendario />
          </AuthenticatedLayout>
        }
      />

      {/* Tela de ajuda */}
      <Route
        path="/ajuda"
        element={
          <AuthenticatedLayout user={usuario as UserProfile | undefined}>
            <Ajuda />
          </AuthenticatedLayout>
        }
      />

      {/* Tela de ajustes */}
      <Route
        path="/ajustes"
        element={
          <AuthenticatedLayout user={usuario as UserProfile | undefined}>
            <TelaAjustes />
          </AuthenticatedLayout>
        }
      />

      {/* Tela de detalhes de empresa */}
      <Route
        path="/empresa/:id"
        element={
          <AuthenticatedLayout user={usuario as UserProfile | undefined}>
            <EmpresaDetalhes />
          </AuthenticatedLayout>
        }
      />
    </Routes>
  );
}