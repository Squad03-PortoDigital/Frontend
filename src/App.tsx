import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Menu from "./components/Menu";
import Header from "./components/Header";
import TelaPerfil, { initialUser } from "./pages/TelaPerfil";
import "./App.css";

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
            <main className="app-content">
            </main>
          </div>
        }
      />

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
    </Routes>
  );
}