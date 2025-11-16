import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Fix para global is not defined
if (typeof global === 'undefined') {
  (window as any).global = window;
}

export interface TarefaEvento {
  tipo: 'CRIADA' | 'MOVIDA' | 'ATUALIZADA' | 'DELETADA' | 'NOTIFICACAO' | 'NOVA_NOTIFICACAO';
  tarefaId: number;
  listaId?: number;
  novaPosicao?: number;
  tarefa?: any;
  usuarioNome?: string;
  listaIdOrigem?: number; 
  notificacao?: NotificacaoDTO;
}

export interface NotificacaoDTO {
  id: number;
  tipo: "MENCAO" | "ATRIBUICAO" | "PRAZO" | "COMENTARIO" | "TAREFA_MOVIDA" | "TAREFA_ATUALIZADA";
  titulo: string;
  mensagem: string;
  tarefaId?: number;
  tarefaTitulo?: string;
  remetente?: {
    id: number;
    nome: string;
    foto?: string;
  };
  dataHora: string;
  lida: boolean;
}

type TarefaCallback = (evento: TarefaEvento) => void;
type NotificacaoCallback = (notificacao: NotificacaoDTO) => void;
type ContadorCallback = (count: number) => void;

class WebSocketService {
  private client: Client | null = null;
  private isConnected: boolean = false;
  
  private tarefaCallbacks: Set<TarefaCallback> = new Set();
  private notificacaoCallbacks: Set<NotificacaoCallback> = new Set();
  private contadorCallbacks: Set<ContadorCallback> = new Set();
  
  // ✅ Flag para evitar subscrições duplicadas
  private subscriptionsCreated: boolean = false;

  connect(onTarefaEvento: TarefaCallback) {
    if (this.isConnected && this.client?.connected) {
      console.log('✅ WebSocket já conectado - adicionando callback');
      this.tarefaCallbacks.add(onTarefaEvento);
      return;
    }

    this.tarefaCallbacks.add(onTarefaEvento);

    // ✅ CORREÇÃO: Busca o token Basic Auth correto
    const token = localStorage.getItem('auth'); // ← Era 'token', agora é 'auth'
    const wsUrl = 'https://gabrielfiel.com.br/ws';
    
    console.log('🔌 Conectando ao WebSocket:', wsUrl);
    console.log('🔑 Token Basic Auth disponível:', token ? 'SIM ✅' : 'NÃO ❌');
    if (token) {
      console.log('🔑 Token preview:', token.substring(0, 20) + '...');
    }
    
    const socket = new SockJS(wsUrl, null, {
      transports: ['websocket', 'xhr-polling'],
      timeout: 10000
    });
    
    this.client = new Client({
      webSocketFactory: () => socket as any,
      connectHeaders: token ? {
        Authorization: `Basic ${token}` // ✅ CORREÇÃO: Usa Basic ao invés de Bearer
      } : {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      debug: (str) => {
        if (str.includes('CONNECTED') || str.includes('ERROR') || str.includes('DISCONNECT')) {
          console.log('🔌 STOMP:', str);
        }
      },

      onConnect: () => {
        console.log('✅ WebSocket conectado com sucesso!');
        this.isConnected = true;
        
        // ✅ Cria subscrições apenas uma vez
        if (!this.subscriptionsCreated) {
          this.createSubscriptions();
          this.subscriptionsCreated = true;
        }
      },

      onDisconnect: () => {
        console.log('❌ WebSocket desconectado');
        this.isConnected = false;
        this.subscriptionsCreated = false;
      },

      onStompError: (frame) => {
        console.error('❌ Erro STOMP:', frame.headers['message']);
        console.error('Detalhes:', frame.body);
        this.isConnected = false;
      }
    });

    this.client.activate();
  }

  // ✅ Método separado para criar subscrições
  private createSubscriptions() {
    if (!this.client) {
      console.error('❌ Cliente STOMP não inicializado');
      return;
    }

    // ✅ CORREÇÃO: Busca o token correto
    const token = localStorage.getItem('auth'); // ← Era 'token', agora é 'auth'
    const isAuthenticated = localStorage.getItem('authenticated') === 'true';
    
    console.log('📡 Criando subscrições...');
    console.log('📡 Token:', token ? 'OK ✅' : 'AUSENTE ❌');
    console.log('📡 Autenticado:', isAuthenticated ? 'SIM ✅' : 'NÃO ❌');

    // Subscrição 1: Eventos de tarefas (público)
    const tarefaSub = this.client.subscribe('/topic/tarefas', (message) => {
      try {
        const evento: TarefaEvento = JSON.parse(message.body);
        console.log('📨 Evento de tarefa recebido:', evento);
        
        this.tarefaCallbacks.forEach(callback => {
          try {
            callback(evento);
          } catch (error) {
            console.error('Erro ao executar callback de tarefa:', error);
          }
        });
      } catch (error) {
        console.error('Erro ao processar evento de tarefa:', error);
      }
    });
    
    console.log('✅ Inscrito em /topic/tarefas:', tarefaSub?.id);

    // ✅ Só subscreve em canais privados se estiver autenticado
    if (token && isAuthenticated) {
      console.log('🔐 Criando subscrições privadas (autenticado)...');
      
      // Subscrição 2: Notificações pessoais
      const notifSub = this.client.subscribe('/user/queue/notificacoes', (message) => {
        try {
          console.log('📬 MENSAGEM BRUTA RECEBIDA:', message);
          console.log('📬 BODY:', message.body);
          
          const notificacao: NotificacaoDTO = JSON.parse(message.body);
          console.log('🔔 Notificação recebida via WebSocket:', notificacao);
          
          this.notificacaoCallbacks.forEach(callback => {
            try {
              console.log('📞 Executando callback de notificação...');
              callback(notificacao);
            } catch (error) {
              console.error('Erro ao executar callback de notificação:', error);
            }
          });

          this.showBrowserNotification(notificacao);
        } catch (error) {
          console.error('Erro ao processar notificação:', error);
        }
      });
      
      console.log('✅ Inscrito em /user/queue/notificacoes:', notifSub?.id);

      // Subscrição 3: Contador de notificações
      const countSub = this.client.subscribe('/user/queue/notificacoes/count', (message) => {
        try {
          console.log('📊 MENSAGEM DE CONTADOR RECEBIDA:', message);
          console.log('📊 BODY:', message.body);
          
          const count: number = JSON.parse(message.body);
          console.log('🔢 Contador de notificações recebido:', count);
          
          this.contadorCallbacks.forEach(callback => {
            try {
              console.log('📞 Executando callback de contador...');
              callback(count);
            } catch (error) {
              console.error('Erro ao executar callback de contador:', error);
            }
          });
        } catch (error) {
          console.error('Erro ao processar contador:', error);
        }
      });
      
      console.log('✅ Inscrito em /user/queue/notificacoes/count:', countSub?.id);
    } else {
      console.warn('⚠️ Token não encontrado - notificações pessoais não serão recebidas');
      console.warn('⚠️ Apenas eventos públicos de /topic/tarefas serão recebidos');
    }
  }

  onNotification(callback: NotificacaoCallback): () => void {
    this.notificacaoCallbacks.add(callback);
    console.log('📝 Callback de notificação registrado. Total:', this.notificacaoCallbacks.size);
    return () => {
      this.notificacaoCallbacks.delete(callback);
      console.log('📝 Callback de notificação removido. Total:', this.notificacaoCallbacks.size);
    };
  }

  onNotificationCount(callback: ContadorCallback): () => void {
    this.contadorCallbacks.add(callback);
    console.log('📝 Callback de contador registrado. Total:', this.contadorCallbacks.size);
    return () => {
      this.contadorCallbacks.delete(callback);
      console.log('📝 Callback de contador removido. Total:', this.contadorCallbacks.size);
    };
  }

  private showBrowserNotification(notificacao: NotificacaoDTO) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(notificacao.titulo, {
        body: notificacao.mensagem,
        icon: notificacao.remetente?.foto || '/logo.png',
        tag: `notificacao-${notificacao.id}`,
        badge: '/logo.png',
        requireInteraction: false,
      });

      setTimeout(() => notification.close(), 5000);

      notification.onclick = () => {
        window.focus();
        notification.close();
        
        if (notificacao.tarefaId) {
          window.location.href = `/tarefas/${notificacao.tarefaId}`;
        }
      };
    }
  }

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('📢 Permissão de notificação:', permission);
      });
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.isConnected = false;
      this.subscriptionsCreated = false;
      
      this.tarefaCallbacks.clear();
      this.notificacaoCallbacks.clear();
      this.contadorCallbacks.clear();
      
      console.log('🔌 WebSocket desconectado manualmente');
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  isReallyConnected(): boolean {
    return this.isConnected && (this.client?.connected || false);
  }
}

export const websocketService = new WebSocketService();