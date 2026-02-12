/**
 * Mapeamentos de Frequências para Terapia Sonora
 * Baseado em estudos clínicos sobre binaural beats e isochronic tones
 */

// Frequências Solfeggio (opcional, para camada ambiente)
export const SOLFEGGIO_FREQUENCIES = {
    UT: 396, // Liberação de medo e culpa
    RE: 417, // Desfazer situações e facilitar mudanças
    MI: 528, // Transformação e milagres (reparação DNA)
    FA: 639, // Conexão e relacionamentos
    SOL: 741, // Expressão e soluções
    LA: 852, // Despertar intuição
    SI: 963, // Conexão espiritual
};

// Carrier frequencies ideais para binaural beats
export const CARRIER_FREQUENCIES = {
    LOW: 150, // Para estados delta/sono
    MID_LOW: 180, // Para theta/meditação
    MID: 200, // Para alpha/foco
    MID_HIGH: 220, // Para beta baixo/energia moderada
    HIGH: 250, // Para beta alto/alerta
};

// Frequências binaurais clássicas
export const BINAURAL_BEATS = {
    // Delta (0.5-4 Hz) - Sono profundo
    DEEP_SLEEP: 2,
    SLEEP: 3,

    // Theta (4-8 Hz) - Meditação, criatividade
    DEEP_MEDITATION: 5,
    MEDITATION: 6,
    CREATIVITY: 7,

    // Alpha (8-13 Hz) - Relaxamento, foco relaxado
    DEEP_RELAXATION: 8,
    RELAXATION: 10,
    FOCUS_RELAXED: 12,

    // Beta baixo/SMR (12-15 Hz) - Foco ativo
    SMR: 14, // Sensorimotor Rhythm - foco sem tensão

    // Beta médio (15-20 Hz) - Atenção, pensamento ativo
    ALERT: 18,
    ACTIVE_THINKING: 20,

    // Beta alto (20-30 Hz) - Alta energia, pode causar ansiedade
    HIGH_ENERGY: 24,
};

// Configurações de camadas de áudio para cada tipo de transição
export const AUDIO_LAYER_CONFIGS = {
    // Transição calmante (ex: Raiva → Foco)
    CALMING: {
        binaural: {
            intensity: 0.3, // Volume relativo
            rampTime: 10, // segundos para mudança
        },
        isochronic: {
            intensity: 0.4,
            pulseShape: 'sine', // ou 'square' para pulsos mais pronunciados
        },
        ambient: {
            intensity: 0.5,
            type: 'pink_noise', // ou 'brown_noise'
            filterFreq: 500, // Hz - filtro passa-baixa
        },
        pad: {
            intensity: 0.3,
            harmonics: [1, 2, 3, 5], // Harmônicos para enriquecer
        }
    },

    // Transição energizante (ex: Cansaço → Energia)
    ENERGIZING: {
        binaural: {
            intensity: 0.4,
            rampTime: 8,
        },
        isochronic: {
            intensity: 0.5,
            pulseShape: 'square', // Mais pronunciado
        },
        ambient: {
            intensity: 0.3,
            type: 'white_noise',
            filterFreq: 2000,
        },
        pad: {
            intensity: 0.4,
            harmonics: [1, 2, 4, 6],
        }
    },

    // Transição para sono (qualquer → Sono)
    SLEEP: {
        binaural: {
            intensity: 0.2, // Bem suave
            rampTime: 15,
        },
        isochronic: {
            intensity: 0.2,
            pulseShape: 'sine',
        },
        ambient: {
            intensity: 0.6, // Mais ambiente, menos beats
            type: 'brown_noise',
            filterFreq: 300,
        },
        pad: {
            intensity: 0.5,
            harmonics: [1, 2], // Apenas fundamentais
        }
    },
};

// Determina qual configuração usar baseado no estado inicial e alvo
export const getLayerConfig = (initialState, targetState) => {
    const initialFreq = initialState.baseFrequency;
    const targetFreq = targetState.targetFrequency;

    if (targetState.id === 'SONO') {
        return AUDIO_LAYER_CONFIGS.SLEEP;
    }

    if (targetFreq > initialFreq) {
        return AUDIO_LAYER_CONFIGS.ENERGIZING;
    }

    return AUDIO_LAYER_CONFIGS.CALMING;
};
