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
  remetente?: {  // ✅ AGORA É OPCIONAL
    id: number;
    nome: string;
    foto?: string;
  };
  dataHora: string;
  lida: boolean;
}

class WebSocketService {
  private client: Client | null = null;
  private isConnected: boolean = false;

  connect(onTarefaEvento: (evento: TarefaEvento) => void) {
    const socket = new SockJS('http://localhost:8080/ws');
    
    this.client = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: () => {
        console.log('✅ WebSocket conectado!');
        this.isConnected = true;

        this.client?.subscribe('/topic/tarefas', (message) => {
          const evento: TarefaEvento = JSON.parse(message.body);
          console.log('📨 Evento recebido:', evento);
          onTarefaEvento(evento);
        });
      },

      onDisconnect: () => {
        console.log('❌ WebSocket desconectado');
        this.isConnected = false;
      },

      onStompError: (frame) => {
        console.error('❌ Erro STOMP:', frame);
      }
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.isConnected = false;
      console.log('🔌 WebSocket desconectado manualmente');
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const websocketService = new WebSocketService();
