import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./components/Login";
import Cadastro from "./components/Cadastro";
import Menu from "./components/Menu";
import Header from "./components/Header";
import TelaPerfil from "./pages/TelaPerfil";
import Ajuda from "./pages/TelaAjuda";
import TelaAjustes from "./pages/TelaAjustes";
import EmpresaDetalhes from "./pages/TelaEmpresaDetalhes";
import KanbanBoard from "./pages/TelaKanbanBoard";
import TelaDetalhamento from "./pages/TelaDetalhamento";
import "./App.css";

// Tipo para o usuário
interface Usuario {
  id?: number;
  nome: string;
  email: string;
  foto?: string | null;
  cargo?: {
    nome: string;
  };
  role?: string;
}

export default function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Carrega o usuário logado do localStorage assim que o app inicializa
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  return (
    <Routes>
      {/* Tela de login */}
      <Route path="/" element={<Login />} />

      {/* Tela de cadastro */}
      <Route path="/cadastro" element={<Cadastro />} />

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