/**
 * Mapeamentos Musicais para Terapia Sonora
 *
 * Escalas, progressões harmônicas e configurações de camadas de áudio.
 * Baseado em estudos clínicos e teoria musical ocidental.
 *
 * Referências:
 * - Frontiers in Psychology: Musical mode-emotion correlation
 * - ResearchGate: Reverb length affects emotional perception
 * - NIH: Timbre contributes to emotion independently of melody
 */

// ============================================================
// ESCALAS MUSICAIS (notas Tone.js)
// Cada modo influencia a percepção emocional de forma diferente
// ============================================================

export const SCALES = {
    // ---------- MODOS MAIORES (emoções positivas) ----------
    C_ionian: ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
    G_mixolydian: ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'],
    F_lydian: ['F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'],

    // ---------- MODOS MENORES (introspecção, melancolia) ----------
    D_aeolian: ['D3', 'E3', 'F3', 'G3', 'A3', 'Bb3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5'],
    F_aeolian: ['F3', 'G3', 'Ab3', 'Bb3', 'C4', 'Db4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5', 'Db5', 'Eb5', 'F5'],
    Eb_phrygian: ['Eb3', 'Fb3', 'Gb3', 'Ab3', 'Bb3', 'Cb4', 'Db4', 'Eb4', 'Fb4', 'Gb4', 'Ab4', 'Bb4', 'Cb5', 'Db5', 'Eb5'],

    // ---------- MODOS INTERMEDIÁRIOS (contemplação, suavidade) ----------
    A_dorian: ['A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5', 'A5'],
    Bb_dorian: ['Bb3', 'C4', 'Db4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5', 'Db5', 'Eb5', 'F5', 'G5', 'Ab5', 'Bb5'],
    D_dorian: ['D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5'],

    // ---------- PENTATÔNICAS (universalmente agradáveis) ----------
    D_pentatonic_minor: ['D3', 'F3', 'G3', 'A3', 'C4', 'D4', 'F4', 'G4', 'A4', 'C5', 'D5', 'F5', 'G5', 'A5', 'C6'],
    C_pentatonic_major: ['C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5'],
};

/**
 * Resolve a escala para um dado root + mode
 * Retorna array de notas Tone.js
 */
export function getScale(root, mode) {
    const key = `${root}_${mode}`;
    if (SCALES[key]) {
        return SCALES[key];
    }
    // Fallback: pentatônica maior em C
    console.warn(`[FrequencyMappings] Scale "${key}" not found, using C_pentatonic_major`);
    return SCALES.C_pentatonic_major;
}

// ============================================================
// PROGRESSÕES HARMÔNICAS
// Arrays de acordes (arrays de notas) por caráter emocional
// ============================================================

export const CHORD_PROGRESSIONS = {
    // Calma, estável, luminosa (I - IV - V - I)
    serene: [
        ['C4', 'E4', 'G4'],        // C major
        ['F4', 'A4', 'C5'],        // F major
        ['G4', 'B4', 'D5'],        // G major
        ['C4', 'E4', 'G4'],        // C major
    ],

    // Foco, minimal, sustentada (I - vi - IV - I)
    focus: [
        ['C4', 'E4', 'G4', 'B4'],   // Cmaj7
        ['A3', 'C4', 'E4'],        // Am
        ['F4', 'A4', 'C5'],        // F
        ['C4', 'E4', 'G4'],        // C
    ],

    // Criativa, exploratória, Dorian (i - IV - v - i)
    creative: [
        ['A3', 'C4', 'E4'],        // Am
        ['D4', 'F#4', 'A4'],       // D major (IV de A dorian)
        ['E4', 'G4', 'B4'],        // Em
        ['A3', 'C4', 'E4', 'G4'],   // Am7
    ],

    // Relaxante, Lydian, "floating" (I - II - I - V)
    floating: [
        ['F4', 'A4', 'C5'],        // F
        ['G4', 'B4', 'D5'],        // G
        ['F4', 'A4', 'C5'],        // F
        ['C4', 'E4', 'G4'],        // C
    ],

    // Meditativa, minimal, drone (i - bVII - i)
    meditative: [
        ['D4', 'F4', 'A4'],        // Dm
        ['C4', 'E4', 'G4'],        // C
        ['D4', 'F4', 'A4'],        // Dm
    ],

    // Sono, ultra-minimal (i - iv)
    sleep: [
        ['F3', 'Ab3', 'C4'],       // Fm
        ['Bb3', 'Db4', 'F4'],      // Bbm
    ],

    // Energética, upbeat, Mixolydian (I - bVII - IV - I)
    energetic: [
        ['G4', 'B4', 'D5'],        // G
        ['F4', 'A4', 'C5'],        // F
        ['C4', 'E4', 'G4'],        // C
        ['G4', 'B4', 'D5'],        // G
    ],

    // Matching raiva → dissonância controlada (i - bII - v - i)
    tense: [
        ['Eb4', 'Gb4', 'Bb4'],     // Ebm
        ['Fb4', 'Ab4', 'Cb5'],     // Fb (bII)
        ['Bb3', 'Db4', 'Fb4'],     // Bbdim
        ['Eb4', 'Gb4', 'Bb4'],     // Ebm
    ],

    // Matching ansiedade → instável (i - bVI - bIII - bVII)
    anxious: [
        ['D4', 'F4', 'A4'],        // Dm
        ['Bb3', 'D4', 'F4'],       // Bb
        ['F4', 'A4', 'C5'],        // F
        ['C4', 'E4', 'G4'],        // C
    ],
};

/**
 * Seleciona a progressão harmônica baseada no perfil do estado
 */
export function getChordProgression(stateId) {
    const mapping = {
        RAIVA: 'tense',
        ANSIEDADE: 'anxious',
        CANSACO: 'meditative',
        TRISTEZA: 'sleep',
        NEUTRO: 'serene',
        FOCO: 'focus',
        CRIATIVIDADE: 'creative',
        RELAXAMENTO: 'floating',
        MEDITACAO: 'meditative',
        SONO: 'sleep',
        ENERGIA: 'energetic',
    };

    const key = mapping[stateId] || 'serene';
    return CHORD_PROGRESSIONS[key];
}

// ============================================================
// CARRIER FREQUENCIES para binaural beats
// ============================================================

export const CARRIER_FREQUENCIES = {
    LOW: 150,   // Para estados delta/sono
    MID_LOW: 180,   // Para theta/meditação
    MID: 200,   // Para alpha/foco
    MID_HIGH: 220,   // Para beta baixo/energia moderada
    HIGH: 250,   // Para beta alto/alerta
};

// ============================================================
// FREQUÊNCIAS SOLFEGGIO (opcional, para camada ambiente)
// ============================================================

export const SOLFEGGIO_FREQUENCIES = {
    UT: 396,   // Liberação de medo e culpa
    RE: 417,   // Facilitar mudanças
    MI: 528,   // Transformação ("Love frequency")
    FA: 639,   // Conexão, relacionamentos
    SOL: 741,   // Expressão, soluções
    LA: 852,   // Despertar intuição
    SI: 963,   // Conexão espiritual
};

// ============================================================
// CONFIGURAÇÕES DE CAMADAS DE ÁUDIO
// Determinam o mix relativo das 5 camadas para cada tipo de transição
// ============================================================

export const AUDIO_LAYER_CONFIGS = {
    // Acalmante: Raiva/Ansiedade → Foco/Calma
    CALMING: {
        binaural: { intensity: 0.25, rampTime: 10 },
        ambient: { intensity: 0.4, filterFreq: 500, noiseType: 'pink' },
        rhythm: { intensity: 0.15 },
        harmony: { intensity: 0.35 },
        melody: { intensity: 0.3 },
    },

    // Energizante: Cansaço/Tristeza → Energia
    ENERGIZING: {
        binaural: { intensity: 0.25, rampTime: 8 },
        ambient: { intensity: 0.25, filterFreq: 1500, noiseType: 'white' },
        rhythm: { intensity: 0.35 },
        harmony: { intensity: 0.4 },
        melody: { intensity: 0.45 },
    },

    // Sono: qualquer → Sono
    SLEEP: {
        binaural: { intensity: 0.2, rampTime: 15 },
        ambient: { intensity: 0.5, filterFreq: 300, noiseType: 'brown' },
        rhythm: { intensity: 0.05 },
        harmony: { intensity: 0.4 },
        melody: { intensity: 0.15 },
    },

    // Meditação: qualquer → Meditação
    MEDITATION: {
        binaural: { intensity: 0.3, rampTime: 12 },
        ambient: { intensity: 0.45, filterFreq: 400, noiseType: 'pink' },
        rhythm: { intensity: 0.0 },
        harmony: { intensity: 0.35 },
        melody: { intensity: 0.2 },
    },

    // Criatividade: qualquer → Criatividade
    CREATIVE: {
        binaural: { intensity: 0.2, rampTime: 10 },
        ambient: { intensity: 0.3, filterFreq: 800, noiseType: 'pink' },
        rhythm: { intensity: 0.2 },
        harmony: { intensity: 0.4 },
        melody: { intensity: 0.5 },
    },
};

/**
 * Determina qual configuração de camadas usar
 * baseado no estado inicial e alvo
 */
export function getLayerConfig(initialState, targetState) {
    const targetId = targetState.id;

    if (targetId === 'SONO') return AUDIO_LAYER_CONFIGS.SLEEP;
    if (targetId === 'MEDITACAO') return AUDIO_LAYER_CONFIGS.MEDITATION;
    if (targetId === 'CRIATIVIDADE') return AUDIO_LAYER_CONFIGS.CREATIVE;

    const initialFreq = initialState.brainwave
        ? initialState.brainwave.baseFrequency
        : 10;
    const targetFreq = targetState.brainwave
        ? targetState.brainwave.targetFrequency
        : 10;

    if (targetFreq > initialFreq) {
        return AUDIO_LAYER_CONFIGS.ENERGIZING;
    }

    return AUDIO_LAYER_CONFIGS.CALMING;
}
