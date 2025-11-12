import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { websocketService, type TarefaEvento } from '../services/websocket';

interface WebSocketContextType {
  isConnected: boolean;
  subscribe: (callback: (evento: TarefaEvento) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const callbacksRef = useRef<Set<(evento: TarefaEvento) => void>>(new Set());
  const isConnectedRef = useRef(false);

  useEffect(() => {
    console.log('🔌 Iniciando conexão WebSocket global');
    
    websocketService.connect((evento: TarefaEvento) => {
      console.log('📨 Evento recebido no Context:', evento);
      callbacksRef.current.forEach(callback => callback(evento));
    });

    isConnectedRef.current = true;

    return () => {
      console.log('🔌 Desconectando WebSocket global');
      websocketService.disconnect();
      isConnectedRef.current = false;
    };
  }, []);

  const subscribe = (callback: (evento: TarefaEvento) => void) => {
    callbacksRef.current.add(callback);
    
    return () => {
      callbacksRef.current.delete(callback);
    };
  };

  return (
    <WebSocketContext.Provider value={{ isConnected: isConnectedRef.current, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};
