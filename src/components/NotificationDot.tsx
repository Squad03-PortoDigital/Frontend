import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useWebSocket } from "../contexts/WebSocketContext";
import "../styles/NotificationDot.css";

export default function NotificationDot() {
  const [hasUnread, setHasUnread] = useState(false);
  const { unreadCount, lastNotification } = useWebSocket();

  // ✅ Função memoizada para evitar re-criação
  const checkUnread = useCallback(async () => {
    try {
      const response = await api.get(`/notificacoes/contador`);
      const count = response.data.naoLidas || 0;
      setHasUnread(count > 0);
    } catch (error) {
      console.error("Erro ao verificar notificações:", error);
    }
  }, []); // Sem dependências - função estável

  // ✅ Carrega o contador inicial apenas uma vez
  useEffect(() => {
    checkUnread();
  }, [checkUnread]);

  // ✅ Atualiza quando o contador do WebSocket muda
  useEffect(() => {
    if (unreadCount !== undefined) {
      setHasUnread(unreadCount > 0);
    }
  }, [unreadCount]);

  // ✅ CRÍTICO: Escuta novas notificações via WebSocket
  useEffect(() => {
    if (lastNotification) {
      console.log('🔔 Nova notificação recebida:', lastNotification);
      // Se a notificação não está lida, mostra o dot
      if (!lastNotification.lida) {
        setHasUnread(true);
      }
    }
  }, [lastNotification]); // ✅ Esse useEffect é ESSENCIAL

  if (!hasUnread) return null;

  return <span className="notification-dot"></span>;
}
