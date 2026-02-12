# Integração de Sensores Biométricos - NeuroFlow

Esta pasta contém a arquitetura preparatória para integração futura com dispositivos de monitoramento biométrico.

## Visão Geral

O sistema foi projetado para ser modular e extensível, permitindo fácil adição de novos tipos de sensores sem refatorar o código existente.

## Arquitetura

### BiometricSource (Classe Abstrata)
Classe base que todos os sensores devem estender. Define a interface comum:
- `connect()`: Conecta ao dispositivo/serviço
- `getData()`: Obtém dados biométricos atuais
- `disconnect()`: Desconecta

### BiometricManager
Gerenciador central que coordena múltiplas fontes biométricas:
- Registra/desregistra fontes
- Coleta dados de todas as fontes ativas
- Monitora continuamente em intervalos configuráveis
- Fornece callback para integração com o motor de áudio

## Como Adicionar um Novo Sensor

### Passo 1: Criar a Classe do Sensor

```javascript
import { BiometricSource } from './BiometricInterface';

export class MeuSensor extends BiometricSource {
  constructor() {
    super('MeuSensor');
  }

  async connect() {
    // Implementar lógica de conexão
    // Ex: Bluetooth, API, HealthKit, etc.
    this.isConnected = true;
  }

  async getData() {
    if (!this.isConnected) return null;
    
    // Retornar dados do sensor
    return {
      valorDoSensor: 123,
      timestamp: Date.now(),
    };
  }

  disconnect() {
    // Limpar conexões
    super.disconnect();
  }
}
```

### Passo 2: Registrar no Manager

```javascript
import { biometricManager } from './BiometricInterface';
import { MeuSensor } from './MeuSensor';

const meuSensor = new MeuSensor();
biometricManager.registerSource(meuSensor);
await biometricManager.connectAll();
```

### Passo 3: Integrar com Audio Engine

```javascript
biometricManager.startMonitoring(5000, (data) => {
  const interpretation = interpretBiometricData(data, currentTargetState);
  
  if (interpretation.shouldAdjust) {
    // Aplicar ajustes no audio engine
    applyBiometricAdjustments(interpretation.adjustments);
  }
});
```

## Sensores Sugeridos para Implementação Futura

### 1. Monitor de Frequência Cardíaca (HR)
- **Fonte**: Bluetooth chest strap, smartwatch, Apple Watch
- **Lib sugerida**: `react-native-ble-plx` (Bluetooth)
- **Uso**: Detectar níveis de ativação/relaxamento
- **Ajuste**: Se HR alta e objetivo é relaxamento → aumentar Delta/Alpha

### 2. Variabilidade da Frequência Cardíaca (HRV)
- **Fonte**: Apple HealthKit, Polar H10, Oura Ring
- **Lib sugerida**: `react-native-health` (iOS), `react-native-google-fit` (Android)
- **Uso**: Indicador de estresse/recuperação
- **Ajuste**: HRV baixa (estresse) → reduzir Beta, aumentar Alpha

### 3. EEG (Ondas Cerebrais)
- **Fonte**: Muse, NeuroSky, OpenBCI
- **Lib sugerida**: SDK do fabricante
- **Uso**: Feedback direto do estado cerebral
- **Ajuste**: Comparar ondas detectadas com frequência alvo

### 4. Resposta Galvânica da Pele (GSR)
- **Fonte**: Dispositivos Bluetooth GSR
- **Uso**: Medir condutância da pele (indicador de stress)
- **Ajuste**: GSR alta → intensificar relaxamento

### 5. Oximetria (SpO2)
- **Fonte**: SmartWatch, Pulse Oximeter
- **Uso**: Correlação com breathing patterns
- **Ajuste**: Auxiliar em técnicas de respiração

## Dependências Necessárias (Instalar quando implementar)

```bash
# Para Bluetooth
npm install react-native-ble-plx

# Para HealthKit (iOS)
npm install react-native-health

# Para Google Fit (Android)
npm install react-native-google-fit

# Para AsyncStorage (já incluído)
npm install @react-native-async-storage/async-storage
```

## Permissões Necessárias

### iOS (info.plist)
```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>Precisamos acessar Bluetooth para conectar com seu monitor cardíaco</string>

<key>NSHealthShareUsageDescription</key>
<string>Precisamos acessar seus dados de saúde para personalizar a terapia sonora</string>
```

### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.BLUETOOTH"/>
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
```

## Exemplo de Uso Completo

```javascript
// No SessionScreen.js

import { biometricManager, BluetoothHRMonitor, interpretBiometricData } from '../sensors/BiometricInterface';

useEffect(() => {
  const setupBiometrics = async () => {
    // Registrar fonte
    const hrMonitor = new BluetoothHRMonitor();
    biometricManager.registerSource(hrMonitor);
    
    // Conectar
    await biometricManager.connectAll();
    
    // Iniciar monitoramento
    biometricManager.startMonitoring(5000, (data) => {
      console.log('Biometric data:', data);
      
      const interpretation = interpretBiometricData(data, targetState);
      
      if (interpretation.shouldAdjust) {
        // Ajustar áudio
        applyBiometricAdjustments(interpretation.adjustments);
      }
    });
  };

  setupBiometrics();

  return () => {
    biometricManager.stopMonitoring();
    biometricManager.disconnectAll();
  };
}, []);
```

## Considerações de Privacidade

- Todos os dados biométricos devem ser processados localmente no dispositivo
- Nunca enviar dados sensíveis sem consentimento explícito do usuário
- Fornecer opção para desabilitar monitoramento biométrico
- Seguir regulamentações: LGPD (Brasil), GDPR (Europa), HIPAA (EUA)

## Status Atual

✅ Arquitetura modular implementada
✅ Interfaces abstratas definidas
✅ Sistema de gerenciamento preparado
⏳ Implementações concretas pendentes (aguardando desenvolvimento futuro)

## Contato

Para dúvidas sobre a implementação de sensores, consulte a documentação oficial das bibliotecas ou abra uma issue no repositório.
