import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { PermissaoProvider } from './contexts/PermissaoContext';
import "./styles/login.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <PermissaoProvider>
        <App />
      </PermissaoProvider>
    </BrowserRouter>
);
