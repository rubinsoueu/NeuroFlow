/**
 * Estados Emocionais com Perfis Musicais
 * Baseado em pesquisa clínica sobre brainwave entrainment,
 * modos musicais e o Princípio ISO da musicoterapia.
 *
 * Referências:
 * - NIH/PubMed: "Music tempo induces Theta/Alpha in frontal region"
 * - Frontiers in Psychology: "Mode-emotion correlation in music perception"
 * - 2019 Meta-review (22 studies): Binaural beats and anxiety reduction
 */

// ============================================================
// Estados Iniciais (de onde o usuário parte)
// O musicProfile faz "matching" com o estado emocional atual
// ============================================================

export const EMOTIONAL_STATES = {
  RAIVA: {
    id: 'RAIVA',
    label: 'Raiva/Agitação',
    description: 'Sentindo raiva, frustração ou agitação',
    icon: '😤',
    color: '#E74C3C',

    // Parâmetros de brainwave (binaural beats)
    brainwave: {
      range: 'BETA_HIGH',
      baseFrequency: 25,       // Hz - Beta alto (20-30 Hz) → matching com agitação
      carrierFrequency: 200,
    },

    // Perfil musical - reflete o estado emocional (Princípio ISO)
    musicProfile: {
      tempoBPM: 125,                              // Rápido, tenso
      scale: { root: 'Eb', mode: 'phrygian' },   // Tensão, dissonância controlada
      timbreBrightness: 0.8,                      // Brilhante, incisivo
      harmonicComplexity: 0.7,                    // Acordes tensos, suspensões
      rhythmDensity: 0.7,                         // Pulso rítmico marcado
      melodicActivity: 0.6,                       // Melodia presente, errática
      dynamicRange: 0.8,                          // Volume flutuante
      effects: {
        reverbDecay: 1.0,    // Reverb curto
        reverbWet: 0.15,
        delayTime: 0.0,
        delayWet: 0.0,
        chorusFreq: 0.0,
        chorusWet: 0.0,
      },
    },
  },

  ANSIEDADE: {
    id: 'ANSIEDADE',
    label: 'Ansiedade',
    description: 'Sentindo ansiedade, preocupação ou nervosismo',
    icon: '😰',
    color: '#E67E22',

    brainwave: {
      range: 'BETA_MID',
      baseFrequency: 18,       // Hz - Beta médio (15-20 Hz)
      carrierFrequency: 200,
    },

    musicProfile: {
      tempoBPM: 105,                              // Moderadamente rápido
      scale: { root: 'D', mode: 'aeolian' },     // Menor natural, introspectivo
      timbreBrightness: 0.6,                      // Médio-brilhante
      harmonicComplexity: 0.5,                    // Moderada
      rhythmDensity: 0.5,                         // Pulso moderado
      melodicActivity: 0.5,                       // Melodia moderada
      dynamicRange: 0.6,                          // Variação moderada
      effects: {
        reverbDecay: 2.0,
        reverbWet: 0.25,
        delayTime: 0.0,
        delayWet: 0.0,
        chorusFreq: 0.0,
        chorusWet: 0.0,
      },
    },
  },

  CANSACO: {
    id: 'CANSACO',
    label: 'Cansaço Mental',
    description: 'Sentindo cansaço, fadiga mental ou exaustão',
    icon: '😴',
    color: '#9B59B6',

    brainwave: {
      range: 'THETA_LOW',
      baseFrequency: 5,        // Hz - Theta baixo (4-6 Hz)
      carrierFrequency: 180,
    },

    musicProfile: {
      tempoBPM: 55,                               // Lento, pesado
      scale: { root: 'Bb', mode: 'dorian' },     // Dorian: melancolicamente suave
      timbreBrightness: 0.3,                      // Warm, suave
      harmonicComplexity: 0.2,                    // Simples
      rhythmDensity: 0.2,                         // Pulso mínimo
      melodicActivity: 0.2,                       // Pouca atividade
      dynamicRange: 0.3,                          // Pouca variação
      effects: {
        reverbDecay: 5.0,
        reverbWet: 0.5,
        delayTime: 0.4,
        delayWet: 0.15,
        chorusFreq: 0.0,
        chorusWet: 0.0,
      },
    },
  },

  TRISTEZA: {
    id: 'TRISTEZA',
    label: 'Tristeza/Apatia',
    description: 'Sentindo tristeza, apatia ou desânimo',
    icon: '😔',
    color: '#34495E',

    brainwave: {
      range: 'DELTA_THETA',
      baseFrequency: 3,        // Hz - Delta/Theta (2-5 Hz)
      carrierFrequency: 150,
    },

    musicProfile: {
      tempoBPM: 58,                               // Lento, contemplativo
      scale: { root: 'F', mode: 'aeolian' },     // Menor, melancólico
      timbreBrightness: 0.2,                      // Muito warm
      harmonicComplexity: 0.3,                    // Acordes simples, melancólicos
      rhythmDensity: 0.15,                        // Ritmo mínimo
      melodicActivity: 0.3,                       // Melodia lenta, expressiva
      dynamicRange: 0.25,                         // Quase estático
      effects: {
        reverbDecay: 6.0,    // Reverb longo → vastidão, isolamento
        reverbWet: 0.55,
        delayTime: 0.5,
        delayWet: 0.2,
        chorusFreq: 0.0,
        chorusWet: 0.0,
      },
    },
  },

  NEUTRO: {
    id: 'NEUTRO',
    label: 'Neutro/Calmo',
    description: 'Sentindo-se neutro, equilibrado ou calmo',
    icon: '😌',
    color: '#3498DB',

    brainwave: {
      range: 'ALPHA',
      baseFrequency: 10,       // Hz - Alpha (8-12 Hz)
      carrierFrequency: 220,
    },

    musicProfile: {
      tempoBPM: 75,                               // Moderado, confortável
      scale: { root: 'C', mode: 'ionian' },      // Maior, neutra, clara
      timbreBrightness: 0.5,                      // Equilibrado
      harmonicComplexity: 0.4,                    // Harmonia balanceada
      rhythmDensity: 0.35,                        // Pulso leve
      melodicActivity: 0.4,                       // Melodia suave
      dynamicRange: 0.35,                         // Variação natural
      effects: {
        reverbDecay: 3.0,
        reverbWet: 0.35,
        delayTime: 0.3,
        delayWet: 0.1,
        chorusFreq: 1.5,
        chorusWet: 0.1,
      },
    },
  },
};

// ============================================================
// Estados Alvo (para onde o usuário quer ir)
// Combinam brainwave targetFrequency com musicProfile objetivo
// ============================================================

export const TARGET_STATES = {
  FOCO: {
    id: 'FOCO',
    label: 'Foco Profundo',
    description: 'Estado ideal para trabalho concentrado e deep work',
    icon: '🎯',
    color: '#27AE60',

    brainwave: {
      range: 'ALPHA_SMR',
      targetFrequency: 13,     // Hz - SMR (12-15 Hz) → foco sem ansiedade
      carrierFrequency: 220,
    },

    musicProfile: {
      tempoBPM: 76,                               // Moderado, estável
      scale: { root: 'C', mode: 'ionian' },      // Maior, clara → positividade
      timbreBrightness: 0.4,                      // Balanced, não distrai
      harmonicComplexity: 0.3,                    // Simples, estável
      rhythmDensity: 0.3,                         // Pulso sutil, constante
      melodicActivity: 0.25,                      // Melodia minimal, não distrai
      dynamicRange: 0.2,                          // Pouca variação → previsibilidade
      effects: {
        reverbDecay: 3.0,
        reverbWet: 0.35,
        delayTime: 0.25,
        delayWet: 0.08,
        chorusFreq: 0.0,
        chorusWet: 0.0,
      },
    },
  },

  CRIATIVIDADE: {
    id: 'CRIATIVIDADE',
    label: 'Criatividade',
    description: 'Estado ideal para brainstorm e pensamento criativo',
    icon: '💡',
    color: '#F39C12',

    brainwave: {
      range: 'THETA_ALPHA',
      targetFrequency: 8,      // Hz - Theta alto + Alpha baixo (6-9 Hz)
      carrierFrequency: 200,
    },

    musicProfile: {
      tempoBPM: 70,                               // Relaxado mas não letárgico
      scale: { root: 'A', mode: 'dorian' },       // Dorian: contemplativo mas não triste
      timbreBrightness: 0.45,                     // Warm-balanced, inspirador
      harmonicComplexity: 0.5,                    // Riqueza harmônica → estimula
      rhythmDensity: 0.3,                         // Ritmo orgânico
      melodicActivity: 0.5,                       // Melodia exploratória
      dynamicRange: 0.4,                          // Variação natural
      effects: {
        reverbDecay: 4.0,
        reverbWet: 0.45,
        delayTime: 0.35,      // Delay mais presente → hypnótico
        delayWet: 0.2,
        chorusFreq: 1.5,
        chorusWet: 0.15,
      },
    },
  },

  RELAXAMENTO: {
    id: 'RELAXAMENTO',
    label: 'Relaxamento',
    description: 'Estado de relaxamento profundo e recuperação',
    icon: '🧘',
    color: '#1ABC9C',

    brainwave: {
      range: 'ALPHA',
      targetFrequency: 10,     // Hz - Alpha (8-12 Hz)
      carrierFrequency: 210,
    },

    musicProfile: {
      tempoBPM: 64,                               // Lento, flowing
      scale: { root: 'F', mode: 'lydian' },       // Lydian: luminoso, "floating"
      timbreBrightness: 0.3,                      // Warm, acolhedor
      harmonicComplexity: 0.35,                   // Harmonia gentil
      rhythmDensity: 0.2,                         // Ritmo quase ausente
      melodicActivity: 0.3,                       // Melodia suave, sustentada
      dynamicRange: 0.25,                         // Variação mínima → previsível
      effects: {
        reverbDecay: 5.5,     // Reverb longo → vastidão, calma
        reverbWet: 0.55,
        delayTime: 0.4,
        delayWet: 0.15,
        chorusFreq: 1.2,
        chorusWet: 0.2,       // Chorus → warmth, dream-like
      },
    },
  },

  MEDITACAO: {
    id: 'MEDITACAO',
    label: 'Meditação',
    description: 'Estado meditativo profundo',
    icon: '🕉️',
    color: '#8E44AD',

    brainwave: {
      range: 'THETA',
      targetFrequency: 6,      // Hz - Theta (4-7 Hz) → meditação profunda
      carrierFrequency: 190,
    },

    musicProfile: {
      tempoBPM: 52,                               // Muito lento, contemplativo
      scale: { root: 'D', mode: 'pentatonic_minor' },  // Pentatônica: universalmente agradável
      timbreBrightness: 0.2,                      // Sine puro, etéreo
      harmonicComplexity: 0.2,                    // Harmonia mínima, drones
      rhythmDensity: 0.1,                         // Quase sem ritmo
      melodicActivity: 0.2,                       // Notas longas, espaçadas
      dynamicRange: 0.15,                         // Quase estático
      effects: {
        reverbDecay: 8.0,     // Reverb muito longo → dissolução do ego
        reverbWet: 0.65,
        delayTime: 0.5,
        delayWet: 0.15,
        chorusFreq: 0.8,
        chorusWet: 0.1,
      },
    },
  },

  SONO: {
    id: 'SONO',
    label: 'Sono',
    description: 'Preparação para sono profundo e reparador',
    icon: '😴',
    color: '#2C3E50',

    brainwave: {
      range: 'DELTA',
      targetFrequency: 2,      // Hz - Delta (0.5-4 Hz) → sono profundo
      carrierFrequency: 150,
    },

    musicProfile: {
      tempoBPM: 45,                               // Muito lento → induz sono
      scale: { root: 'F', mode: 'aeolian' },     // Menor: introspecção, descanso
      timbreBrightness: 0.1,                      // Sine puro, extremamente suave
      harmonicComplexity: 0.15,                   // Apenas fundamentais + 5ª
      rhythmDensity: 0.05,                        // Virtualmente sem ritmo
      melodicActivity: 0.1,                       // Notas raras, muito longas
      dynamicRange: 0.1,                          // Volume estável, baixo
      effects: {
        reverbDecay: 10.0,    // Reverb enorme → sensação de flutuação
        reverbWet: 0.7,
        delayTime: 0.6,
        delayWet: 0.1,
        chorusFreq: 0.5,
        chorusWet: 0.05,
      },
    },
  },

  ENERGIA: {
    id: 'ENERGIA',
    label: 'Energia/Alerta',
    description: 'Estado de alta energia e alerta',
    icon: '⚡',
    color: '#E74C3C',

    brainwave: {
      range: 'BETA_MID_HIGH',
      targetFrequency: 20,     // Hz - Beta médio-alto (18-25 Hz)
      carrierFrequency: 230,
    },

    musicProfile: {
      tempoBPM: 100,                              // Upbeat, motivante
      scale: { root: 'G', mode: 'mixolydian' },  // Mixolydian: energia positiva
      timbreBrightness: 0.65,                     // Brilhante, presente
      harmonicComplexity: 0.45,                   // Harmonia motivante
      rhythmDensity: 0.6,                         // Ritmo marcado, groove
      melodicActivity: 0.55,                      // Melodia ativa, aspiracional
      dynamicRange: 0.5,                          // Variação energética
      effects: {
        reverbDecay: 1.5,     // Reverb curto → presença, imediatismo
        reverbWet: 0.2,
        delayTime: 0.15,
        delayWet: 0.08,
        chorusFreq: 2.0,
        chorusWet: 0.1,
      },
    },
  },
};

// ============================================================
// Mapeamento de ondas cerebrais (referência)
// ============================================================
export const BRAINWAVE_RANGES = {
  DELTA: { min: 0.5, max: 4, label: 'Delta - Sono Profundo' },
  THETA: { min: 4, max: 8, label: 'Theta - Meditação/Criatividade' },
  ALPHA: { min: 8, max: 13, label: 'Alpha - Relaxamento/Foco' },
  BETA_LOW: { min: 13, max: 15, label: 'SMR - Foco Calmo' },
  BETA_MID: { min: 15, max: 20, label: 'Beta - Atenção Normal' },
  BETA_HIGH: { min: 20, max: 30, label: 'Beta Alto - Agitação' },
};
