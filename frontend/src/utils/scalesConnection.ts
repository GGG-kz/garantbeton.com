// Утилита для подключения к весам через COM порт
import { ScalesModel, ScalesResponse, PRESET_SCALES_MODELS } from '../types/scalesModels';

// Типы для Serial API
interface SerialPort {
  readable: ReadableStream | null
  writable: WritableStream | null
  open(options: SerialOptions): Promise<void>
  close(): Promise<void>
}

interface SerialOptions {
  baudRate: number
  dataBits?: number
  stopBits?: number
  parity?: 'none' | 'even' | 'odd'
  flowControl?: 'none' | 'hardware'
}

interface SerialPortFilter {
  usbVendorId?: number
  usbProductId?: number
}

interface SerialPortRequestOptions {
  filters: SerialPortFilter[]
}

// Расширение Navigator для Serial API
interface NavigatorWithSerial extends Navigator {
  serial?: {
    requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>
    getPorts(): Promise<SerialPort[]>
  }
}

export interface ScalesReading {
  weight: number
  unit: string
  timestamp: string
  stable: boolean // Стабильность показаний
}

export interface ScalesStatus {
  connected: boolean
  port: string | null
  model: ScalesModel | null
  currentWeight: number
  lastUpdate: Date
  error?: string
}

class ScalesConnection {
  private port: SerialPort | null = null
  private reader: ReadableStreamDefaultReader | null = null
  private writer: WritableStreamDefaultWriter | null = null
  private statusCallbacks: ((status: ScalesStatus) => void)[] = []
  private readingCallbacks: ((reading: ScalesReading) => void)[] = []
  private model: ScalesModel | null = null
  private pollingInterval: number | null = null
  private currentWeight: number = 0
  private lastUpdate: Date = new Date()
  private autoConnectAttempts: number = 0

  // Подключение к весам с моделью
  async connect(comPort: string, model?: ScalesModel): Promise<boolean> {
    try {
      // Проверяем поддержку Serial API
      if (!('serial' in navigator)) {
        throw new Error('Serial API не поддерживается в этом браузере')
      }

      // Устанавливаем модель (по умолчанию первая из предустановленных)
      this.model = model || PRESET_SCALES_MODELS[0]

      // Запрашиваем доступ к порту
      this.port = await (navigator as NavigatorWithSerial).serial!.requestPort({
        filters: [{ usbVendorId: 0x0403 }] // FTDI устройства
      })

      // Настройки порта из модели
      await this.port.open({
        baudRate: this.model.baudRate,
        dataBits: this.model.dataBits,
        stopBits: this.model.stopBits,
        parity: this.model.parity,
        flowControl: 'none'
      })

      // Задержка подключения если настроена
      if (this.model?.autoSettings.connectionDelay && this.model.autoSettings.connectionDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, this.model!.autoSettings.connectionDelay))
      }

      // Автоматические команды при подключении
      await this.executeAutoCommands()

      // Начинаем чтение данных
      this.startReading()

      // Запускаем автоматический опрос если настроен
      if (this.model.autoSettings.pollingInterval > 0) {
        this.startPolling()
      }

      this.notifyStatus({ 
        connected: true, 
        port: comPort, 
        model: this.model,
        currentWeight: this.currentWeight,
        lastUpdate: this.lastUpdate
      })
      return true

    } catch (error) {
      console.error('Ошибка подключения к весам:', error)
      this.notifyStatus({ 
        connected: false, 
        port: null, 
        model: this.model,
        currentWeight: this.currentWeight,
        lastUpdate: this.lastUpdate,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      })
      
      // Автоматическое переподключение если настроено
      if (this.model?.autoSettings.autoReconnect && this.autoConnectAttempts < this.model.autoSettings.retryAttempts) {
        this.autoConnectAttempts++
        setTimeout(() => this.connect(comPort, this.model || undefined), 5000)
      }
      
      return false
    }
  }

  // Отключение от весов
  async disconnect(): Promise<void> {
    try {
      // Останавливаем автоматический опрос
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval)
        this.pollingInterval = null
      }

      if (this.reader) {
        await this.reader.cancel()
        this.reader = null
      }
      
      if (this.writer) {
        await this.writer.close()
        this.writer = null
      }
      
      if (this.port) {
        await this.port.close()
        this.port = null
      }

      this.autoConnectAttempts = 0
      this.notifyStatus({ 
        connected: false, 
        port: null, 
        model: this.model,
        currentWeight: this.currentWeight,
        lastUpdate: this.lastUpdate
      })
    } catch (error) {
      console.error('Ошибка отключения от весов:', error)
    }
  }

  // Чтение данных с весов
  private async startReading(): Promise<void> {
    if (!this.port) return

    try {
      this.reader = this.port.readable?.getReader() || null
      this.writer = this.port.writable?.getWriter() || null

      if (!this.reader) {
        throw new Error('Не удалось получить reader для порта')
      }

      // Отправляем команду для получения веса если настроена
      if (this.model?.commands.getWeight) {
        await this.sendCommand(this.model.commands.getWeight)
      }

      // Читаем данные
      while (this.reader && this.port) {
        try {
          const { value, done } = await this.reader.read()
          
          if (done) break

          // Парсим данные с весов
          const data = new TextDecoder().decode(value)
          const reading = this.parseScalesData(data)
          
          if (reading) {
            this.currentWeight = reading.weight
            this.lastUpdate = new Date()
            this.notifyReading(reading)
            
            // Обновляем статус с новыми данными
            this.notifyStatus({ 
              connected: true, 
              port: 'connected', 
              model: this.model,
              currentWeight: this.currentWeight,
              lastUpdate: this.lastUpdate
            })
          }
        } catch (error) {
          console.error('Ошибка чтения данных:', error)
          break
        }
      }
    } catch (error) {
      console.error('Ошибка начала чтения:', error)
      this.notifyStatus({ 
        connected: false, 
        port: null, 
        model: this.model,
        currentWeight: this.currentWeight,
        lastUpdate: this.lastUpdate,
        error: error instanceof Error ? error.message : 'Ошибка чтения данных'
      })
    }
  }

  // Отправка команды на весы
  private async sendCommand(command: string): Promise<void> {
    if (this.writer) {
      const data = new TextEncoder().encode(command)
      await this.writer.write(data)
    }
  }

  // Выполнение автоматических команд при подключении
  private async executeAutoCommands(): Promise<void> {
    if (!this.model) return

    try {
      // Автоматическое тарирование
      if (this.model.autoSettings.autoTare && this.model.commands.tare) {
        await this.sendCommand(this.model.commands.tare)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Автоматическое обнуление
      if (this.model.autoSettings.autoZero && this.model.commands.zero) {
        await this.sendCommand(this.model.commands.zero)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error('Ошибка выполнения автоматических команд:', error)
    }
  }

  // Запуск автоматического опроса
  private startPolling(): void {
    if (!this.model || this.pollingInterval) return

    this.pollingInterval = setInterval(async () => {
      try {
        if (this.model?.commands.getWeight) {
          await this.sendCommand(this.model.commands.getWeight)
        }
      } catch (error) {
        console.error('Ошибка автоматического опроса:', error)
      }
    }, this.model.autoSettings.pollingInterval)
  }

  // Отправка команды с повторными попытками
  async sendCommandWithRetry(command: string): Promise<boolean> {
    if (!this.model) return false

    for (let attempt = 1; attempt <= this.model.autoSettings.retryAttempts; attempt++) {
      try {
        await this.sendCommand(command)
        return true
      } catch (error) {
        console.error(`Попытка ${attempt} неудачна:`, error)
        if (attempt < this.model.autoSettings.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }
    return false
  }

  // Парсинг данных с весов
  private parseScalesData(data: string): ScalesReading | null {
    try {
      // Убираем лишние символы
      const cleanData = data.trim()
      
      // Различные форматы данных с весов
      const patterns = [
        // Формат: ST,+0000.00,kg
        /ST,\+?(-?\d+\.?\d*),(\w+)/,
        // Формат: ST +0000.00 kg
        /ST\s+\+?(-?\d+\.?\d*)\s+(\w+)/,
        // Формат: +0000.00kg
        /\+?(-?\d+\.?\d*)(\w+)/,
        // Формат: 0000.00
        /(-?\d+\.?\d*)/
      ]

      for (const pattern of patterns) {
        const match = cleanData.match(pattern)
        if (match) {
          const weight = parseFloat(match[1])
          const unit = match[2] || 'kg'
          const stable = cleanData.includes('ST') || cleanData.includes('STABLE')
          
          return {
            weight,
            unit,
            timestamp: new Date().toISOString(),
            stable
          }
        }
      }

      return null
    } catch (error) {
      console.error('Ошибка парсинга данных весов:', error)
      return null
    }
  }

  // Получение текущего веса
  async getCurrentWeight(): Promise<ScalesReading | null> {
    if (!this.port || !this.model?.commands.getWeight) return null

    try {
      await this.sendCommandWithRetry(this.model.commands.getWeight)
      // Возвращаем последнее известное значение
      return {
        weight: this.currentWeight,
        unit: 'kg',
        timestamp: this.lastUpdate.toISOString(),
        stable: true
      }
    } catch (error) {
      console.error('Ошибка получения веса:', error)
      return null
    }
  }

  // Тарирование
  async tare(): Promise<boolean> {
    if (!this.model?.commands.tare) return false
    return await this.sendCommandWithRetry(this.model.commands.tare)
  }

  // Обнуление
  async zero(): Promise<boolean> {
    if (!this.model?.commands.zero) return false
    return await this.sendCommandWithRetry(this.model.commands.zero)
  }

  // Калибровка
  async calibrate(): Promise<boolean> {
    if (!this.model?.commands.calibration) return false
    return await this.sendCommandWithRetry(this.model.commands.calibration)
  }

  // Проверка статуса устройства
  async checkDeviceStatus(): Promise<boolean> {
    if (!this.model?.commands.status) return false
    return await this.sendCommandWithRetry(this.model.commands.status)
  }

  // Сброс
  async reset(): Promise<boolean> {
    if (!this.model?.commands.reset) return false
    return await this.sendCommandWithRetry(this.model.commands.reset)
  }

  // Подписка на статус подключения
  onStatusChange(callback: (status: ScalesStatus) => void): void {
    this.statusCallbacks.push(callback)
  }

  // Подписка на показания весов
  onReadingChange(callback: (reading: ScalesReading) => void): void {
    this.readingCallbacks.push(callback)
  }

  // Уведомление об изменении статуса
  private notifyStatus(status: ScalesStatus): void {
    this.statusCallbacks.forEach(callback => callback(status))
  }

  // Уведомление о новых показаниях
  private notifyReading(reading: ScalesReading): void {
    this.readingCallbacks.forEach(callback => callback(reading))
  }

  // Получение текущего статуса
  getStatus(): ScalesStatus {
    return {
      connected: this.port !== null,
      port: this.port ? 'connected' : null,
      model: this.model,
      currentWeight: this.currentWeight,
      lastUpdate: this.lastUpdate
    }
  }

  // Получение текущей модели
  getCurrentModel(): ScalesModel | null {
    return this.model
  }

  // Установка модели
  setModel(model: ScalesModel): void {
    this.model = model
  }
}

// Глобальный экземпляр подключения к весам
export const scalesConnection = new ScalesConnection()

// Утилиты для работы с весами
export const scalesUtils = {
  // Проверка поддержки Serial API
  isSupported(): boolean {
    return 'serial' in navigator && !!(navigator as NavigatorWithSerial).serial
  },

  // Получение списка доступных портов
  async getAvailablePorts(): Promise<string[]> {
    if (!('serial' in navigator)) {
      return []
    }

    try {
      // В реальном приложении здесь будет получение списка портов
      return ['COM1', 'COM2', 'COM3', 'COM4', 'COM5']
    } catch (error) {
      console.error('Ошибка получения списка портов:', error)
      return []
    }
  },

  // Подключение к весам по порту с моделью
  async connectToScales(port: string, model?: ScalesModel): Promise<boolean> {
    return await scalesConnection.connect(port, model)
  },

  // Отключение от весов
  async disconnectFromScales(): Promise<void> {
    await scalesConnection.disconnect()
  },

  // Получение текущего веса
  async getCurrentWeight(): Promise<ScalesReading | null> {
    return await scalesConnection.getCurrentWeight()
  },

  // Тарирование
  async tare(): Promise<boolean> {
    return await scalesConnection.tare()
  },

  // Обнуление
  async zero(): Promise<boolean> {
    return await scalesConnection.zero()
  },

  // Калибровка
  async calibrate(): Promise<boolean> {
    return await scalesConnection.calibrate()
  },

  // Проверка статуса устройства
  async checkDeviceStatus(): Promise<boolean> {
    return await scalesConnection.checkDeviceStatus()
  },

  // Сброс
  async reset(): Promise<boolean> {
    return await scalesConnection.reset()
  },

  // Получение текущего статуса
  getConnectionStatus(): ScalesStatus {
    return scalesConnection.getStatus()
  },

  // Получение текущей модели
  getCurrentModel(): ScalesModel | null {
    return scalesConnection.getCurrentModel()
  },

  // Установка модели
  setModel(model: ScalesModel): void {
    scalesConnection.setModel(model)
  }
}
