
// src/utils/MusicTheory.js

// Mapeamento de modos musicais para seus intervalos em semitons (a partir da escala maior)
const MODE_INTERVALS = {
  'ionian': [0, 2, 4, 5, 7, 9, 11], // Major
  'dorian': [0, 2, 3, 5, 7, 9, 10],
  'phrygian': [0, 1, 3, 5, 7, 8, 10],
  'lydian': [0, 2, 4, 6, 7, 9, 11],
  'mixolydian': [0, 2, 4, 5, 7, 9, 10],
  'aeolian': [0, 2, 3, 5, 7, 8, 10], // Natural Minor
  'locrian': [0, 1, 3, 4, 6, 8, 10],
  'pentatonic_minor': [0, 3, 5, 7, 10],
  'pentatonic_major': [0, 2, 4, 7, 9], // Adicionado para completude
};

// Notas cromáticas para cálculo
const CHROMATIC_NOTES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

/**
 * Gera uma lista de notas para uma dada escala e modo ao longo de um range de oitavas.
 * @param {string} root - A nota raiz (ex: 'C', 'Eb', 'F#').
 * @param {string} mode - O modo musical (ex: 'ionian', 'dorian', 'aeolian').
 * @param {number} startOctave - A oitava inicial.
 * @param {number} endOctave - A oitava final.
 * @returns {string[]} Um array de notas (ex: ['C3', 'D3', 'E3', ..., 'C4']).
 */
export function getScaleNotes(root, mode, startOctave = 3, endOctave = 4) {
  const intervals = MODE_INTERVALS[mode.toLowerCase()];
  if (!intervals) {
    console.warn(`Modo '${mode}' não encontrado. Usando 'ionian'.`);
    return getScaleNotes(root, 'ionian', startOctave, endOctave);
  }

  const rootIndex = CHROMATIC_NOTES.indexOf(root.toUpperCase());
  if (rootIndex === -1) {
    console.warn(`Nota raiz '${root}' não encontrada. Usando 'C'.`);
    return getScaleNotes('C', mode, startOctave, endOctave);
  }

  const scaleNotes = [];
  for (let octave = startOctave; octave <= endOctave; octave++) {
    intervals.forEach(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      const noteName = CHROMATIC_NOTES[noteIndex];
      scaleNotes.push(`${noteName}${octave}`);
    });
  }
  return scaleNotes;
}

/**
 * Gera uma progressão de acordes básicos para uma dada escala e modo.
 * Por simplicidade para o MVP, gera acordes tônica (I), subdominante (IV) e dominante (V).
 * @param {string} root - A nota raiz da escala.
 * @param {string} mode - O modo musical.
 * @param {number} octave - A oitava base para os acordes.
 * @returns {string[][]} Um array de acordes (cada acorde é um array de notas).
 */
export function getChordsFromScale(root, mode, octave = 3) {
    const intervals = MODE_INTERVALS[mode.toLowerCase()];
    if (!intervals) return [];

    const scaleNotesOneOctave = getScaleNotes(root, mode, octave, octave); 
    const chords = [];

    // Tentar construir os acordes I, IV, V da escala (tríades básicas)
    // I (Tônica)
    if (scaleNotesOneOctave.length >= 5) { // Pelo menos 5 notas para construir tríades I-IV-V básicas
        const chordI = [
            scaleNotesOneOctave[0],
            scaleNotesOneOctave[2],
            scaleNotesOneOctave[4]
        ];
        chords.push(chordI);
    }

    // IV (Subdominante) - Acorde construído a partir da 4ª nota da escala
    if (scaleNotesOneOctave.length >= 7) { // Precisa de 7 notas para IV e V
        const chordIV = [
            scaleNotesOneOctave[3], // 1ª nota do acorde (4º grau da escala)
            scaleNotesOneOctave[(3 + 2) % scaleNotesOneOctave.length], // 3ª do acorde (6º grau da escala)
            scaleNotesOneOctave[(3 + 4) % scaleNotesOneOctave.length]  // 5ª do acorde (1º grau da escala + oitava)
        ];
        chords.push(chordIV);
    }

    // V (Dominante) - Acorde construído a partir da 5ª nota da escala
    if (scaleNotesOneOctave.length >= 7) {
        const chordV = [
            scaleNotesOneOctave[4], // 1ª nota do acorde (5º grau da escala)
            scaleNotesOneOctave[(4 + 2) % scaleNotesOneOctave.length], // 3ª do acorde (7º grau da escala)
            scaleNotesOneOctave[(4 + 4) % scaleNotesOneOctave.length]  // 5ª do acorde (2º grau da escala + oitava)
        ];
        chords.push(chordV);
    }

    // Retornar pelo menos o acorde I se nada mais for gerado (fallback)
    if (chords.length === 0 && scaleNotesOneOctave.length >= 3) {
        chords.push([
            scaleNotesOneOctave[0],
            scaleNotesOneOctave[2],
            scaleNotesOneOctave[4]
        ]);
    }

    return chords;
}

// A função midiToNote e o import Tone.Midi não são necessários no lado React Native,
// pois a lógica de Tone.js está no WebView.
// Removido para manter o utils limpo para a camada React Native.
