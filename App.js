import React, { useState } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import OnboardingScreen from './screens/OnboardingScreen';
import SessionScreen from './screens/SessionScreen';
import { SessionStorage, createSessionData } from './services/SessionStorage';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('ONBOARDING'); // 'ONBOARDING' | 'SESSION'
  const [sessionConfig, setSessionConfig] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const handleStartSession = (config) => {
    setSessionConfig(config);
    setSessionStartTime(Date.now());
    setCurrentScreen('SESSION');
  };

  const handleEndSession = async () => {
    try {
      if (sessionConfig && sessionStartTime) {
        // Calcula duração da sessão
        const duration = Math.floor((Date.now() - sessionStartTime) / 1000); // segundos

        // Salva sessão no histórico
        const sessionData = createSessionData({
          initialStateId: sessionConfig.initialState.id,
          initialStateLabel: sessionConfig.initialState.label,
          taskId: sessionConfig.task.id,
          taskLabel: sessionConfig.task.label,
          targetStateId: sessionConfig.targetState.id,
          targetStateLabel: sessionConfig.targetState.label,
          duration: duration,
          feedbacks: [], // TODO: Coletar feedbacks da sessão
          completed: duration >= (sessionConfig.task.recommendedDuration * 60),
        });

        const saved = await SessionStorage.saveSession(sessionData);

        if (saved) {
          console.log('[App] Session saved successfully:', saved.id);
        } else {
          console.error('[App] Failed to save session data');
        }
      }
    } catch (error) {
      console.error('[App] Error in handleEndSession:', error);
      // Continue anyway para não travar o app
    } finally {
      // Volta para onboarding sempre, mesmo se salvar falhou
      setCurrentScreen('ONBOARDING');
      setSessionConfig(null);
      setSessionStartTime(null);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E27" />

      {currentScreen === 'ONBOARDING' && (
        <OnboardingScreen onStart={handleStartSession} />
      )}

      {currentScreen === 'SESSION' && sessionConfig && (
        <SessionScreen
          sessionConfig={sessionConfig}
          onEnd={handleEndSession}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // Styles movidos para as respectivas telas
});
