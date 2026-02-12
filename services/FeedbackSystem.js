/**
 * Sistema de Feedback Adaptativo
 * Ajusta parâmetros do áudio com base na resposta do usuário
 */

export class FeedbackSystem {
    constructor(initialState, targetState, transitionTimeMinutes) {
        this.initialState = initialState;
        this.targetState = targetState;
        this.transitionTimeSeconds = transitionTimeMinutes * 60;
        this.feedbackHistory = [];
        this.currentPhase = 'TRANSITIONING'; // ou 'ARRIVED', 'STUCK'
    }

    // Registra feedback do usuário
    recordFeedback(response, elapsedTime) {
        const feedback = {
            response, // 'ARRIVED', 'NOT_YET', 'TOO_FAST'
            timestamp: Date.now(),
            elapsedTime,
            phase: this.currentPhase,
        };

        this.feedbackHistory.push(feedback);
        return this.analyzeAndAdapt(feedback);
    }

    // Analisa feedback e sugere ajustes
    analyzeAndAdapt(feedback) {
        const { response, elapsedTime } = feedback;
        const expectedTime = this.transitionTimeSeconds;
        const progress = elapsedTime / expectedTime;

        if (response === 'ARRIVED') {
            this.currentPhase = 'ARRIVED';

            return {
                action: 'STABILIZE',
                suggestion: 'Manter frequência atual e reduzir modulação',
                adjustments: {
                    reduceModulation: true,
                    increaseAmbient: true, // Mais som ambiente, menos beats
                }
            };
        }

        if (response === 'NOT_YET') {
            // Se já passou muito do tempo esperado, pode haver um problema
            if (progress > 1.5) {
                this.currentPhase = 'STUCK';

                return {
                    action: 'REASSESS',
                    suggestion: 'Estado inicial pode estar incorreto. Considerar reajuste.',
                    adjustments: {
                        offerRestart: true,
                    }
                };
            }

            // Se está no meio da transição, continuar
            if (progress < 1.0) {
                return {
                    action: 'CONTINUE',
                    suggestion: 'Continuar transição gradual',
                    adjustments: {
                        // Pode acelerar levemente se usuário está ansioso
                        rampMultiplier: 0.9, // 10% mais rápido
                    }
                };
            }

            // Se já passou o tempo esperado mas não chegou
            return {
                action: 'ADJUST',
                suggestion: 'Intensificar frequência alvo',
                adjustments: {
                    increaseIntensity: true,
                    rampMultiplier: 0.8,
                }
            };
        }

        return { action: 'CONTINUE', suggestion: '', adjustments: {} };
    }

    // Obtém recomendação para próximo prompt de feedback
    getNextPromptTime(currentTime) {
        const feedbackCount = this.feedbackHistory.length;

        // Primeiros feedbacks mais frequentes (3 min)
        if (feedbackCount < 2) {
            return 3 * 60 * 1000; // 3 minutos
        }

        // Depois estabiliza em 5 min
        return 5 * 60 * 1000;
    }

    // Estatísticas da sessão
    getSessionStats() {
        return {
            totalFeedbacks: this.feedbackHistory.length,
            arrivedCount: this.feedbackHistory.filter(f => f.response === 'ARRIVED').length,
            currentPhase: this.currentPhase,
            feedbackHistory: this.feedbackHistory,
        };
    }
}

// Funções helper para aplicar ajustes no audio engine

export const applyAdaptiveAdjustments = (adjustments, webviewRef, currentConfig) => {
    if (!webviewRef.current) return;

    if (adjustments.reduceModulation) {
        // Reduz intensidade dos beats binaurais e isochronic
        const newConfig = {
            ...currentConfig.layerConfig,
            binaural: {
                ...currentConfig.layerConfig.binaural,
                intensity: currentConfig.layerConfig.binaural.intensity * 0.7,
            },
            isochronic: {
                ...currentConfig.layerConfig.isochronic,
                intensity: currentConfig.layerConfig.isochronic.intensity * 0.7,
            },
        };

        webviewRef.current.postMessage(JSON.stringify({
            type: 'ADJUST',
            ...currentConfig,
            layerConfig: newConfig,
        }));
    }

    if (adjustments.increaseAmbient) {
        const newConfig = {
            ...currentConfig.layerConfig,
            ambient: {
                ...currentConfig.layerConfig.ambient,
                intensity: Math.min(0.8, currentConfig.layerConfig.ambient.intensity * 1.3),
            },
        };

        webviewRef.current.postMessage(JSON.stringify({
            type: 'ADJUST',
            ...currentConfig,
            layerConfig: newConfig,
        }));
    }

    if (adjustments.rampMultiplier) {
        const newRampTime = currentConfig.rampTime * adjustments.rampMultiplier;

        webviewRef.current.postMessage(JSON.stringify({
            type: 'ADJUST',
            ...currentConfig,
            rampTime: newRampTime,
        }));
    }
};
