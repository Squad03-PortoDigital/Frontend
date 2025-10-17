import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Menu from "./components/Menu"; 
import Header from "./components/Header"; 
import TelaPerfil, { initialUser } from "./pages/TelaPerfil";
import Ajuda from "./pages/TelaAjuda"; 
import TelaAjustes from "./pages/TelaAjustes";
import EmpresaDetalhes from "./pages/TelaEmpresaDetalhes";
import KanbanBoard from "./pages/TelaKanbanBoard"; 
import "./App.css";
import TelaDetalhamento from "./pages/TelaDetalhamento";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/home"
        element={
          <div className="app-grid">
            <Header />
            <Menu user={initialUser} />
            <main className="app-content kanban-area">
                <KanbanBoard />
            </main>
          </div>
        }
      />

      <Route
        path="/detalhamento"
        element={
        <div className="app-grid">
          <Header />
          <Menu user={initialUser} />
          <main className="app-content">
             <TelaDetalhamento />
            </main>
          </div>
        }
          
      />

     {/* <Route
        path="/arquivados"
        element={
          <div className="app-grid">
            <Header />
            <Menu user={initialUser} />
            <main className="app-content">
              <TelaDetalhamento />
            </main>
          </div>
        }
      /> */}

      <Route
        path="/perfil"
        element={
          <div className="app-grid">
            <Header />
            <Menu user={initialUser} />
            <main className="app-content">
              <TelaPerfil />
            </main>
          </div>
        }
      />

      <Route
        path="/ajuda"
        element={
          <div className="app-grid">
            <Header />
            <Menu user={initialUser} />
            <main className="app-content">
              <Ajuda />
            </main>
          </div>
        }
      />
      
      <Route
        path="/ajustes"
        element={
          <div className="app-grid">
            <Header />
            <Menu user={initialUser} />
            <main className="app-content">
              <TelaAjustes /> 
            </main>
          </div>
        }
      />

      <Route
        path="/empresa/:id"
        element={
          <div className="app-grid">
            <Header />
            <Menu user={initialUser} />
            <main className="app-content">
              <EmpresaDetalhes />
            </main>
          </div>
        }
      />
    </Routes>
  );
}