import { useState, useEffect } from "react";
import api from "../services/api";
import "../styles/NotificationDot.css";


export default function NotificationDot() {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    checkUnread();
    
    // Verifica a cada 30 segundos
    const interval = setInterval(() => {
      checkUnread();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const checkUnread = async () => {
    try {
      const usuarioLogado = JSON.parse(localStorage.getItem("usuario") || "{}");
      const response = await api.get(`/notificacoes/count?usuarioId=${usuarioLogado.id}`);
      setHasUnread(response.data > 0);
    } catch (error) {
      console.error("Erro ao verificar notificações:", error);
    }
  };

  if (!hasUnread) return null;

  return <span className="notification-dot"></span>;
}
