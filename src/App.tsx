import Header from "./components/Header";
import Menu from "./components/Menu";
import TelaPerfil from "./pages/TelaPerfil";
import "./App.css";

export default function App() {
  return (
    <div className="app-grid">
      <Header />
      <Menu />
      <main className="app-content">
        <TelaPerfil />
      </main>
    </div>
  );
}
