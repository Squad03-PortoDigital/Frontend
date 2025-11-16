(window as any).global = window;
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { PermissaoProvider } from './contexts/PermissaoContext';
import { ThemeProvider } from './contexts/ThemeContext';
import "./styles/login.css";
import { WebSocketProvider } from './contexts/WebSocketContext';

ReactDOM.createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <ThemeProvider>
        <WebSocketProvider>
          <PermissaoProvider>
            <App />
          </PermissaoProvider>
        </WebSocketProvider>
      </ThemeProvider>
    </BrowserRouter>
);
