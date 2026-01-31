import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { SynthHTML } from './SynthEngine';
import { MOOD_MAP } from './MoodConstants';

export default function App() {
  const [currentMood, setCurrentMood] = useState('RAIVA');
  const [isTransforming, setIsTransforming] = useState(false);
  const webviewRef = useRef(null);

  const startTransformation = () => {
    setIsTransforming(true);
    
    // Puxa as configurações do MoodConstants para a transição
    const config = { 
      type: 'ADJUST', 
      bpm: MOOD_MAP.RAIVA.targetBPM, 
      frequency: MOOD_MAP.RAIVA.frequency 
    };

    // Envia o comando para o motor de áudio A (Sintetizador)
    if (webviewRef.current) {
      webviewRef.current.postMessage(JSON.stringify(config));
    }
    
    // Simula a mudança visual de estado
    setTimeout(() => {
      setCurrentMood('CONCENTRACAO');
      setIsTransforming(false);
    }, 5000); // 5 segundos para demonstração no teste
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: MOOD_MAP[currentMood].color }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.content}>
        <Text style={styles.title}>NeuroFlow</Text>
        
        <View style={styles.statusCard}>
          <Text style={styles.label}>Estado Atual:</Text>
          <Text style={styles.moodText}>
            {isTransforming ? "Transformando..." : MOOD_MAP[currentMood].label}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={startTransformation}
          disabled={isTransforming}
        >
          <Text style={styles.buttonText}>
            {currentMood === 'RAIVA' ? "Alcançar Foco Profundo" : "Reiniciar Sessão"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Camada invisível que processa o áudio em tempo real */}
      <View style={styles.engineContainer}>
        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={{ html: SynthHTML }}
          onMessage={(event) => console.log("Audio Engine Log:", event.nativeEvent.data)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    transition: 'background-color 2s ease', // Note: transições suaves funcionam melhor com Animated API, mas para o MVP o estilo dinâmico basta
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 40,
    letterSpacing: -1,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 30,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  moodText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  engineContainer: {
    height: 0,
    width: 0,
    opacity: 0,
    position: 'absolute',
  }
});
