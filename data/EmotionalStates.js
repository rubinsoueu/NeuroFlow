/**
 * Estados Emocionais baseados em pesquisa clínica sobre brainwave frequencies
 * Referências: Binaural beats e Isochronic tones para entrainment cerebral
 */

export const EMOTIONAL_STATES = {
  // Estados Iniciais (de onde o usuário parte)
  RAIVA: {
    id: 'RAIVA',
    label: 'Raiva/Agitação',
    description: 'Sentindo raiva, frustração ou agitação',
    icon: '😤',
    color: '#E74C3C', // Vermelho
    brainwaveRange: 'BETA_HIGH',
    baseFrequency: 25, // Hz - Beta alto (20-30 Hz)
    carrierFrequency: 200, // Hz - Tom base para binaural
  },
  
  ANSIEDADE: {
    id: 'ANSIEDADE',
    label: 'Ansiedade',
    description: 'Sentindo ansiedade, preocupação ou nervosismo',
    icon: '😰',
    color: '#E67E22', // Laranja
    brainwaveRange: 'BETA_MID',
    baseFrequency: 18, // Hz - Beta médio (15-20 Hz)
    carrierFrequency: 200,
  },

  CANSACO: {
    id: 'CANSACO',
    label: 'Cansaço Mental',
    description: 'Sentindo cansaço, fadiga mental ou exaustão',
    icon: '😴',
    color: '#9B59B6', // Roxo
    brainwaveRange: 'THETA_LOW',
    baseFrequency: 5, // Hz - Theta baixo (4-6 Hz)
    carrierFrequency: 180,
  },

  TRISTEZA: {
    id: 'TRISTEZA',
    label: 'Tristeza/Apatia',
    description: 'Sentindo tristeza, apatia ou desânimo',
    icon: '😔',
    color: '#34495E', // Azul escuro
    brainwaveRange: 'DELTA_THETA',
    baseFrequency: 3, // Hz - Delta/Theta (2-5 Hz)
    carrierFrequency: 150,
  },

  NEUTRO: {
    id: 'NEUTRO',
    label: 'Neutro/Calmo',
    description: 'Sentindo-se neutro, equilibrado ou calmo',
    icon: '😌',
    color: '#3498DB', // Azul
    brainwaveRange: 'ALPHA',
    baseFrequency: 10, // Hz - Alpha (8-12 Hz)
    carrierFrequency: 220,
  },
};

// Estados Alvo (baseados na tarefa que o usuário quer realizar)
export const TARGET_STATES = {
  FOCO: {
    id: 'FOCO',
    label: 'Foco Profundo',
    description: 'Estado ideal para trabalho concentrado e deep work',
    icon: '🎯',
    color: '#27AE60', // Verde
    brainwaveRange: 'ALPHA_SMR',
    targetFrequency: 12, // Hz - Alpha + SMR (10-14 Hz)
    carrierFrequency: 220,
    // Combina Alpha (relaxado) + Beta baixo SMR (foco sem ansiedade)
    layerConfig: {
      alpha: 10,
      smr: 14, // Sensorimotor Rhythm
    }
  },

  CRIATIVIDADE: {
    id: 'CRIATIVIDADE',
    label: 'Criatividade',
    description: 'Estado ideal para brainstorm e pensamento criativo',
    icon: '💡',
    color: '#F39C12', // Amarelo/Dourado
    brainwaveRange: 'THETA_ALPHA',
    targetFrequency: 7, // Hz - Theta alto + Alpha baixo (6-9 Hz)
    carrierFrequency: 200,
    layerConfig: {
      theta: 7,
      alpha: 9,
    }
  },

  RELAXAMENTO: {
    id: 'RELAXAMENTO',
    label: 'Relaxamento',
    description: 'Estado de relaxamento profundo e recuperação',
    icon: '🧘',
    color: '#1ABC9C', // Turquesa
    brainwaveRange: 'ALPHA_DELTA',
    targetFrequency: 10, // Hz - Alpha com Delta suave
    carrierFrequency: 210,
    layerConfig: {
      alpha: 10,
      delta: 2,
    }
  },

  MEDITACAO: {
    id: 'MEDITACAO',
    label: 'Meditação',
    description: 'Estado meditativo profundo',
    icon: '🕉️',
    color: '#8E44AD', // Roxo
    brainwaveRange: 'THETA',
    targetFrequency: 6, // Hz - Theta (4-7 Hz)
    carrierFrequency: 190,
    layerConfig: {
      theta: 6,
    }
  },

  SONO: {
    id: 'SONO',
    label: 'Sono',
    description: 'Preparação para sono profundo e reparador',
    icon: '😴',
    color: '#2C3E50', // Azul escuro
    brainwaveRange: 'DELTA',
    targetFrequency: 2, // Hz - Delta (0.5-4 Hz)
    carrierFrequency: 150,
    layerConfig: {
      delta: 2,
    }
  },

  ENERGIA: {
    id: 'ENERGIA',
    label: 'Energia/Alerta',
    description: 'Estado de alta energia e alerta',
    icon: '⚡',
    color: '#E74C3C', // Vermelho
    brainwaveRange: 'BETA_MID_HIGH',
    targetFrequency: 20, // Hz - Beta médio-alto (18-25 Hz)
    carrierFrequency: 230,
    layerConfig: {
      beta: 20,
    }
  },
};

// Mapeamento de ondas cerebrais
export const BRAINWAVE_RANGES = {
  DELTA: { min: 0.5, max: 4, label: 'Delta - Sono Profundo' },
  THETA: { min: 4, max: 8, label: 'Theta - Meditação/Criatividade' },
  ALPHA: { min: 8, max: 13, label: 'Alpha - Relaxamento/Foco' },
  BETA_LOW: { min: 13, max: 15, label: 'SMR - Foco Calmo' },
  BETA_MID: { min: 15, max: 20, label: 'Beta - Atenção Normal' },
  BETA_HIGH: { min: 20, max: 30, label: 'Beta Alto - Agitação' },
};
