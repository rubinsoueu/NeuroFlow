import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSIONS_KEY = '@neuroflow_sessions';

/**
 * Sistema de armazenamento de sessões
 * Salva histórico para análise e melhoria do algoritmo adaptativo
 */

export const SessionStorage = {
    // Salva uma nova sessão
    async saveSession(sessionData) {
        try {
            const sessions = await this.getAllSessions();
            const newSession = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                ...sessionData,
            };

            sessions.push(newSession);

            // Mantém apenas últimas 50 sessões
            const recentSessions = sessions.slice(-50);

            await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(recentSessions));
            return newSession;
        } catch (error) {
            console.error('Error saving session:', error);
            return null;
        }
    },

    // Obtém todas as sessões
    async getAllSessions() {
        try {
            const data = await AsyncStorage.getItem(SESSIONS_KEY);

            if (!data) return [];

            // Parse com validação
            let parsed;
            try {
                parsed = JSON.parse(data);
            } catch (jsonError) {
                console.error('[SessionStorage] Invalid JSON, clearing corrupted data:', jsonError);
                // Limpa dados corrompidos
                await AsyncStorage.removeItem(SESSIONS_KEY);
                return [];
            }

            // Valida que é array
            if (!Array.isArray(parsed)) {
                console.error('[SessionStorage] Data is not an array, clearing');
                await AsyncStorage.removeItem(SESSIONS_KEY);
                return [];
            }

            // Valida estrutura de cada sessão
            const validSessions = parsed.filter(session => {
                if (!session || typeof session !== 'object') return false;

                // Valida campos obrigatórios
                const hasRequiredFields =
                    typeof session.id === 'string' &&
                    typeof session.timestamp === 'string' &&
                    typeof session.duration === 'number' &&
                    typeof session.initialStateId === 'string' &&
                    typeof session.taskId === 'string';

                if (!hasRequiredFields) {
                    console.warn('[SessionStorage] Invalid session object, skipping:', session.id);
                }

                return hasRequiredFields;
            });

            // Se muitas sessões foram filtradas, avisar
            if (validSessions.length < parsed.length * 0.8) {
                console.warn(`[SessionStorage] Filtered ${parsed.length - validSessions.length} invalid sessions`);
            }

            return validSessions;
        } catch (error) {
            console.error('[SessionStorage] Error loading sessions:', error);
            return [];
        }
    },

    // Obtém estatísticas de uso
    async getStats() {
        const sessions = await this.getAllSessions();

        if (sessions.length === 0) {
            return {
                totalSessions: 0,
                totalTime: 0,
                averageTime: 0,
                mostUsedTask: null,
                mostCommonInitialState: null,
            };
        }

        const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const taskCounts = {};
        const stateCounts = {};

        sessions.forEach(s => {
            taskCounts[s.taskId] = (taskCounts[s.taskId] || 0) + 1;
            stateCounts[s.initialStateId] = (stateCounts[s.initialStateId] || 0) + 1;
        });

        const mostUsedTask = Object.keys(taskCounts).reduce((a, b) =>
            taskCounts[a] > taskCounts[b] ? a : b
        );

        const mostCommonInitialState = Object.keys(stateCounts).reduce((a, b) =>
            stateCounts[a] > stateCounts[b] ? a : b
        );

        return {
            totalSessions: sessions.length,
            totalTime,
            averageTime: Math.round(totalTime / sessions.length),
            mostUsedTask,
            mostCommonInitialState,
            taskDistribution: taskCounts,
            stateDistribution: stateCounts,
        };
    },

    // Limpa todas as sessões
    async clearAll() {
        try {
            await AsyncStorage.removeItem(SESSIONS_KEY);
        } catch (error) {
            console.error('Error clearing sessions:', error);
        }
    },
};

// Estrutura de dados de uma sessão
export const createSessionData = ({
    initialStateId,
    initialStateLabel,
    taskId,
    taskLabel,
    targetStateId,
    targetStateLabel,
    duration, // em segundos
    feedbacks = [], // array de feedbacks dados durante a sessão
    completed = false,
}) => ({
    initialStateId,
    initialStateLabel,
    taskId,
    taskLabel,
    targetStateId,
    targetStateLabel,
    duration,
    feedbacks,
    completed,
});
