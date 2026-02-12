/**
 * Interface Abstrata para Integração de Sensores Biométricos
 * 
 * Esta é uma arquitetura preparatória para integração futura com dispositivos
 * de monitoramento biométrico como monitores cardíacos, EEG, sensores de HRV, etc.
 * 
 * COMO USAR NO FUTURO:
 * 1. Criar uma nova classe que estende BiometricSource
 * 2. Implementar os métodos abstratos (connect, getData, disconnect)
 * 3. Registrar a fonte no BiometricManager
 * 4. O sistema de áudio poderá usar os dados para adaptação em tempo real
 */

/**
 * Classe base abstrata para fontes biométricas
 */
export class BiometricSource {
  constructor(name) {
    this.name = name;
    this.isConnected = false;
    this.lastData = null;
  }

  // Conecta ao dispositivo/serviço
  async connect() {
    throw new Error('connect() must be implemented by subclass');
  }

  // Obtém dados biométricos atuais
  async getData() {
    throw new Error('getData() must be implemented by subclass');
  }

  // Desconecta do dispositivo/serviço
  disconnect() {
    this.isConnected = false;
  }

  // Verifica se está conectado
  checkConnection() {
    return this.isConnected;
  }
}

/**
 * Gerenciador de múltiplas fontes biométricas
 */
export class BiometricManager {
  constructor() {
    this.sources = new Map();
    this.updateInterval = null;
    this.onDataUpdate = null; // Callback quando novos dados chegam
  }

  // Registra uma nova fonte
  registerSource(source) {
    if (!(source instanceof BiometricSource)) {
      throw new Error('Source must extend BiometricSource');
    }
    this.sources.set(source.name, source);
  }

  // Remove uma fonte
  unregisterSource(sourceName) {
    const source = this.sources.get(sourceName);
    if (source && source.isConnected) {
      source.disconnect();
    }
    this.sources.delete(sourceName);
  }

  // Conecta todas as fontes registradas
  async connectAll() {
    const promises = Array.from(this.sources.values()).map(source =>
      source.connect().catch(err => {
        console.error(`Failed to connect ${source.name}:`, err);
        return null;
      })
    );
    await Promise.all(promises);
  }

  // Desconecta todas
  disconnectAll() {
    this.sources.forEach(source => source.disconnect());
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Inicia monitoramento contínuo
  startMonitoring(intervalMs = 5000, callback) {
    this.onDataUpdate = callback;

    this.updateInterval = setInterval(async () => {
      const data = await this.collectData();
      if (this.onDataUpdate) {
        this.onDataUpdate(data);
      }
    }, intervalMs);
  }

  // Coleta dados de todas as fontes
  async collectData() {
    const data = {};

    for (const [name, source] of this.sources) {
      if (source.isConnected) {
        try {
          data[name] = await source.getData();
        } catch (error) {
          console.error(`Error collecting data from ${name}:`, error);
          data[name] = null;
        }
      }
    }

    return data;
  }

  // Para monitoramento
  stopMonitoring() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

// ============ EXEMPLOS DE IMPLEMENTAÇÕES FUTURAS ============

/**
 * Exemplo: Monitor de Frequência Cardíaca via Bluetooth
 * (Não implementado - apenas estrutura)
 */
export class BluetoothHRMonitor extends BiometricSource {
  constructor() {
    super('BluetoothHR');
    this.device = null;
  }

  async connect() {
    // TODO: Implementar conexão Bluetooth
    // Usar react-native-ble-plx ou similar
    /*
    this.device = await BluetoothManager.connect(deviceId);
    this.isConnected = true;
    */
    throw new Error('BluetoothHRMonitor not yet implemented');
  }

  async getData() {
    if (!this.isConnected) return null;

    // TODO: Ler dados do dispositivo
    /*
    const hr = await this.device.readHeartRate();
    this.lastData = {
      heartRate: hr,
      timestamp: Date.now(),
    };
    return this.lastData;
    */
    return null;
  }

  disconnect() {
    // TODO: Desconectar Bluetooth
    /*
    if (this.device) {
      this.device.disconnect();
    }
    */
    super.disconnect();
  }
}

/**
 * Exemplo: Apple HealthKit (iOS)
 * (Não implementado - apenas estrutura)
 */
export class AppleHealthKitSource extends BiometricSource {
  constructor() {
    super('AppleHealthKit');
  }

  async connect() {
    // TODO: Solicitar permissões HealthKit
    // Usar react-native-health ou similar
    /*
    const authorized = await HealthKit.requestAuthorization();
    this.isConnected = authorized;
    */
    throw new Error('AppleHealthKitSource not yet implemented');
  }

  async getData() {
    if (!this.isConnected) return null;

    // TODO: Ler dados do HealthKit
    /*
    const hr = await HealthKit.getHeartRate();
    const hrv = await HealthKit.getHRV();
    
    this.lastData = {
      heartRate: hr,
      hrv: hrv,
      timestamp: Date.now(),
    };
    return this.lastData;
    */
    return null;
  }
}

/**
 * Função helper para interpretar dados biométricos e ajustar áudio
 */
export const interpretBiometricData = (data, targetState) => {
  const suggestions = {
    shouldAdjust: false,
    adjustments: {},
    insights: [],
  };

  // Exemplo: Se HR está alto e objetivo é relaxamento
  if (data.heartRate && targetState.id === 'RELAXAMENTO') {
    if (data.heartRate > 80) {
      suggestions.shouldAdjust = true;
      suggestions.adjustments.increaseAlpha = true;
      suggestions.adjustments.increaseDelta = true;
      suggestions.insights.push('HR elevada - intensificando frequências relaxantes');
    }
  }

  // Exemplo: Se HRV está baixa (estresse) e objetivo é foco
  if (data.hrv && targetState.id === 'FOCO') {
    if (data.hrv < 30) {
      suggestions.shouldAdjust = true;
      suggestions.adjustments.reduceBeta = true;
      suggestions.insights.push('HRV baixa - reduzindo frequências beta para evitar sobrecarga');
    }
  }

  return suggestions;
};

// Singleton instance
export const biometricManager = new BiometricManager();
