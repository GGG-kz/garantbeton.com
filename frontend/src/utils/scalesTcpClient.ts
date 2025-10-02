// TCP клиент для подключения к серверу весов
interface ScalesResponse {
  type: 'weight' | 'connected' | 'error' | 'tare';
  value?: number;
  unit?: string;
  message?: string;
  port?: string;
  timestamp: string;
}

interface ScalesTcpClient {
  isConnected: boolean;
  weight: number | null;
  error: string | null;
  onWeightChange?: (weight: number) => void;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: string) => void;
  
  connect(host: string, port: number): Promise<void>;
  disconnect(): void;
  getWeight(): void;
  tare(): void;
}

class ScalesTcpClientImpl implements ScalesTcpClient {
  private socket: WebSocket | null = null;
  private host: string = '';
  private port: number = 8080;
  
  public isConnected: boolean = false;
  public weight: number | null = null;
  public error: string | null = null;
  
  public onWeightChange?: (weight: number) => void;
  public onConnectionChange?: (connected: boolean) => void;
  public onError?: (error: string) => void;

  async connect(host: string, port: number): Promise<void> {
    this.host = host;
    this.port = port;
    
    try {
      // Создаем WebSocket подключение к TCP серверу через WebSocket-to-TCP прокси
      // В реальном проекте нужен WebSocket-to-TCP мост
      const wsUrl = `ws://${host}:${port + 1000}`; // Предполагаем, что WebSocket работает на порту +1000
      
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        this.isConnected = true;
        this.error = null;
        this.onConnectionChange?.(true);
        console.log('✅ Подключено к серверу весов');
      };
      
      this.socket.onmessage = (event) => {
        try {
          const response: ScalesResponse = JSON.parse(event.data);
          this.handleResponse(response);
        } catch (error) {
          this.error = 'Ошибка парсинга ответа сервера';
          this.onError?.(this.error);
        }
      };
      
      this.socket.onclose = () => {
        this.isConnected = false;
        this.onConnectionChange?.(false);
        console.log('🔌 Отключено от сервера весов');
      };
      
      this.socket.onerror = (error) => {
        this.error = 'Ошибка подключения к серверу весов';
        this.onError?.(this.error);
        console.error('❌ Ошибка WebSocket:', error);
      };
      
    } catch (error) {
      this.error = `Ошибка подключения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`;
      this.onError?.(this.error);
      throw error;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.onConnectionChange?.(false);
  }

  getWeight(): void {
    if (this.socket && this.isConnected) {
      const command = {
        type: 'get_weight'
      };
      this.socket.send(JSON.stringify(command));
    } else {
      this.error = 'Нет подключения к серверу весов';
      this.onError?.(this.error);
    }
  }

  tare(): void {
    if (this.socket && this.isConnected) {
      const command = {
        type: 'tare'
      };
      this.socket.send(JSON.stringify(command));
    } else {
      this.error = 'Нет подключения к серверу весов';
      this.onError?.(this.error);
    }
  }

  private handleResponse(response: ScalesResponse): void {
    switch (response.type) {
      case 'weight':
        if (response.value !== undefined) {
          this.weight = response.value;
          this.onWeightChange?.(response.value);
        }
        break;
        
      case 'connected':
        console.log('📡 Подключено к серверу весов:', response.message);
        break;
        
      case 'error':
        this.error = response.message || 'Ошибка сервера';
        this.onError?.(this.error);
        break;
        
      case 'tare':
        console.log('⚖️ Обнуление весов:', response.message);
        break;
    }
  }
}

// HTTP клиент как альтернатива WebSocket (проще в реализации)
class ScalesHttpClient {
  private baseUrl: string = '';
  private isConnected: boolean = false;
  private weight: number | null = null;
  private error: string | null = null;
  private pollingInterval: number | null = null;
  
  public onWeightChange?: (weight: number) => void;
  public onConnectionChange?: (connected: boolean) => void;
  public onError?: (error: string) => void;

  async connect(host: string, port: number): Promise<void> {
    this.baseUrl = `http://${host}:${port}`;
    
    try {
      // Проверяем доступность сервера
      const response = await fetch(`${this.baseUrl}/status`);
      if (response.ok) {
        this.isConnected = true;
        this.error = null;
        this.onConnectionChange?.(true);
        console.log('✅ Подключено к HTTP серверу весов');
        
        // Запускаем опрос весов
        this.startPolling();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      this.error = `Ошибка подключения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`;
      this.onError?.(this.error);
      throw error;
    }
  }

  disconnect(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isConnected = false;
    this.onConnectionChange?.(false);
  }

  async getWeight(): Promise<number | null> {
    if (!this.isConnected) {
      this.error = 'Нет подключения к серверу весов';
      this.onError?.(this.error);
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/weight`);
      if (response.ok) {
        const data = await response.json();
        if (data.value !== undefined) {
          this.weight = data.value;
          this.onWeightChange?.(data.value);
          return data.value;
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      this.error = `Ошибка получения веса: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`;
      this.onError?.(this.error);
    }
    
    return null;
  }

  async tare(): Promise<void> {
    if (!this.isConnected) {
      this.error = 'Нет подключения к серверу весов';
      this.onError?.(this.error);
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/tare`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log('⚖️ Команда обнуления отправлена');
    } catch (error) {
      this.error = `Ошибка обнуления: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`;
      this.onError?.(this.error);
    }
  }

  private startPolling(): void {
    // Опрашиваем весы каждые 2 секунды
    this.pollingInterval = window.setInterval(() => {
      this.getWeight();
    }, 2000);
  }
}

// Экспортируем HTTP клиент как основной (проще в использовании)
export const scalesClient = new ScalesHttpClient();

// Для совместимости экспортируем интерфейс
export type { ScalesTcpClient, ScalesResponse };
