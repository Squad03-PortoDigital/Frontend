import { useState, useEffect } from "react";
import api from "../services/api";
import { useWebSocket } from "../contexts/WebSocketContext";
import "../styles/NotificationDot.css";

export default function NotificationDot() {
  const [hasUnread, setHasUnread] = useState(false);
  const { unreadCount, lastNotification } = useWebSocket();

  // ✅ Carrega o contador inicial apenas uma vez
  useEffect(() => {
    checkUnread();
  }, []);

  // ✅ IMPORTANTE: Atualiza imediatamente quando o contador do WebSocket muda
  useEffect(() => {
    console.log('🔴 NotificationDot - Contador mudou:', unreadCount);
    setHasUnread(unreadCount > 0);
  }, [unreadCount]);

  // ✅ Atualiza quando uma nova notificação chega
  useEffect(() => {
    if (lastNotification) {
      console.log('🔴 NotificationDot - Nova notificação:', lastNotification);
      if (!lastNotification.lida) {
        setHasUnread(true);
      }
    }
  }, [lastNotification]);

  const checkUnread = async () => {
    try {
      const response = await api.get(`/notificacoes/contador`);
      const count = response.data.naoLidas || 0;
      console.log('🔴 NotificationDot - Contador inicial da API:', count);
      setHasUnread(count > 0);
    } catch (error) {
      console.error("Erro ao verificar notificações:", error);
    }
  };

  // ✅ Log para debug
  console.log('🔴 NotificationDot renderizou - hasUnread:', hasUnread);

  if (!hasUnread) return null;

  return <span className="notification-dot"></span>;
}