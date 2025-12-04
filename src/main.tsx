(window as any).global = window;
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { PermissaoProvider } from './contexts/PermissaoContext';
import { ThemeProvider } from './contexts/ThemeContext';
import "./styles/login.css";

// main.tsx
ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ThemeProvider>
      <PermissaoProvider>
        <App />
      </PermissaoProvider>
    </ThemeProvider>
  </BrowserRouter>
);
