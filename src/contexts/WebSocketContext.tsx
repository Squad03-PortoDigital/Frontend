import { createContext, useContext, useEffect, useRef, useState, useMemo, useCallback, type ReactNode } from 'react';
import { websocketService, type TarefaEvento, type NotificacaoDTO } from '../services/websocket';

interface WebSocketContextType {
  isConnected: boolean;
  subscribe: (callback: (evento: TarefaEvento) => void) => () => void;
  lastNotification: NotificacaoDTO | null;
  unreadCount: number;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const callbacksRef = useRef<Set<(evento: TarefaEvento) => void>>(new Set());
  const initialized = useRef(false);
  
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState<NotificacaoDTO | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  const [hasToken, setHasToken] = useState(() => {
    const authToken = localStorage.getItem('auth');
    const isAuthenticated = localStorage.getItem('authenticated') === 'true';
    
    console.log('🔍 Verificando autenticação inicial:', {
      hasAuthToken: !!authToken,
      isAuthenticated,
      tokenPreview: authToken?.substring(0, 20) + '...'
    });
    
    return !!(authToken && isAuthenticated);
  });

  useEffect(() => {
    console.log('🔍 Iniciando monitoramento do token...');
    console.log('🔍 Token atual:', hasToken ? 'PRESENTE' : 'AUSENTE');
    
    const checkToken = () => {
      const authToken = localStorage.getItem('auth');
      const isAuthenticated = localStorage.getItem('authenticated') === 'true';
      const currentHasToken = !!(authToken && isAuthenticated);
      
      if (currentHasToken !== hasToken) {
        console.log('🔑 Status de autenticação mudou:', currentHasToken ? 'LOGADO ✅' : 'DESLOGADO ❌');
        console.log('🔍 Credenciais:', { 
          hasAuthToken: !!authToken,
          isAuthenticated,
          tokenPreview: authToken?.substring(0, 20) + '...'
        });
        setHasToken(currentHasToken);
        
        if (!currentHasToken && initialized.current) {
          console.log('🔌 Desconectando WebSocket (logout)');
          websocketService.disconnect();
          setIsConnected(false);
          setUnreadCount(0);
          setLastNotification(null);
          initialized.current = false;
        }
      }
    };

    checkToken();
    const interval = setInterval(checkToken, 500);
    window.addEventListener('focus', checkToken);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkToken);
    };
  }, [hasToken]);

  useEffect(() => {
    console.log('🔍 useEffect de conexão executado. hasToken:', hasToken, 'initialized:', initialized.current);
    
    if (!hasToken) {
      console.warn('⚠️ Aguardando login para conectar WebSocket...');
      return;
    }

    if (initialized.current) {
      console.log('✅ WebSocket já inicializado, pulando...');
      return;
    }

    console.log('🚀 INICIANDO CONEXÃO WEBSOCKET AGORA!');
    initialized.current = true;

    const authToken = localStorage.getItem('auth');
    console.log('🔑 Token Basic Auth encontrado:', authToken?.substring(0, 30) + '...');
    
    websocketService.requestNotificationPermission();
    
    console.log('📝 Registrando callbacks...');
    const unsubscribeNotification = websocketService.onNotification((notificacao: NotificacaoDTO) => {
      console.log('🔔 Nova notificação no Context:', notificacao);
      setLastNotification(notificacao);
      if (!notificacao.lida) {
        setUnreadCount(prev => prev + 1);
      }
    });

    const unsubscribeCount = websocketService.onNotificationCount((count: number) => {
      console.log('🔢 Contador atualizado no Context:', count);
      setUnreadCount(count);
    });
    
    console.log('🔌 Chamando websocketService.connect()...');
    websocketService.connect((evento: TarefaEvento) => {
      console.log('📨 Evento de tarefa recebido no Context:', evento);
      callbacksRef.current.forEach(callback => {
        try {
          callback(evento);
        } catch (error) {
          console.error('Erro no callback de tarefa:', error);
        }
      });
    });

    let attempts = 0;
    const maxAttempts = 100;
    
    console.log('⏳ Aguardando conexão WebSocket...');
    const checkConnection = setInterval(() => {
      attempts++;
      const isConnected = websocketService.isReallyConnected();
      
      if (attempts % 10 === 0) {
        console.log(`⏳ Tentativa ${attempts}/${maxAttempts} - Conectado: ${isConnected}`);
      }
      
      if (isConnected) {
        console.log('✅ WebSocket conectado com sucesso!');
        setIsConnected(true);
        clearInterval(checkConnection);
      } else if (attempts >= maxAttempts) {
        console.error('❌ Timeout: WebSocket não conectou em 10 segundos');
        console.error('❌ Verifique se o backend está rodando e se o token é válido');
        clearInterval(checkConnection);
        initialized.current = false;
      }
    }, 100);

    return () => {
      console.log('🧹 Limpando callbacks do WebSocket');
      clearInterval(checkConnection);
      unsubscribeNotification();
      unsubscribeCount();
    };
  }, [hasToken]);

  // ✅ CRÍTICO: Memoiza a função subscribe
  const subscribe = useCallback((callback: (evento: TarefaEvento) => void) => {
    callbacksRef.current.add(callback);
    console.log('👂 Callback adicionado. Total:', callbacksRef.current.size);
    return () => {
      callbacksRef.current.delete(callback);
      console.log('🔇 Callback removido. Total:', callbacksRef.current.size);
    };
  }, []);

  // ✅ SOLUÇÃO: Memoiza o value do Provider
  const value = useMemo(
    () => ({
      isConnected,
      subscribe,
      lastNotification,
      unreadCount,
    }),
    [isConnected, subscribe, lastNotification, unreadCount]
  );

  return (
    <WebSocketContext.Provider value={value}>
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
