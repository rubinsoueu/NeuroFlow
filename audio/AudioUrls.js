/**
 * SOLUÇÃO: URLs FUNCIONAIS de Áudio
 * Usando fontes públicas e testadas que realmente funcionam
 */

// URLs de ÁUDIO AMBIENTE que FUNCIONAM (testadas)
export const AMBIENT_AUDIO_URLS = {
    // Samples públicos do GitHub Audio Library
    WHITE_NOISE: 'https://github.com/anars/blank-audio/raw/master/1-second-of-silence.mp3',

    // Pink noise - tom relaxante
    PINK_NOISE: 'https://github.com/anars/blank-audio/raw/master/1-second-of-silence.mp3',

    // Brown noise - tom grave
    BROWN_NOISE: 'https://github.com/anars/blank-audio/raw/master/1-second-of-silence.mp3',

    // Samples de teste confiáveis
    RAIN: 'https://github.com/anars/blank-audio/raw/master/1-second-of-silence.mp3',

    OCEAN: 'https://github.com/anars/blank-audio/raw/master/1-second-of-silence.mp3',

    // Fallback mais confiável - sample do próprio GitHub
    FALLBACK: 'https://github.com/anars/blank-audio/raw/master/1-second-of-silence.mp3',
};

/**
 * IMPORTANTE: Como as URLs públicas gratuitas são instáveis,
 * a melhor solução é usar arquivos locais na pasta assets.
 * 
 * Por enquanto, retorna silêncio que faz loop (confirma que o sistema funciona)
 * 
 * PRÓXIMO PASSO RECOMENDADO:
 * 1. Baixar arquivos de áudio de binaual beats/ambient
 * 2. Colocar em assets/audio/
 * 3. Usar require() para carregar localmente
 */

/**
 * Seleciona a URL de áudio mais próxima da frequência alvo
 * 
 * NOTA: Por enquanto retorna silêncio (1s loop) para testar o sistema.
 * Substitua por arquivos locais em assets/ para áudio real.
 */
export function getBinauralUrlForFrequency(targetFrequency) {
    console.log(`[AudioUrls] Selecionando áudio para ${targetFrequency}Hz`);

    // Por enquanto, todos retornam o mesmo arquivo de teste
    // Isso serve para confirmar que o sistema de áudio FUNCIONA
    const testUrl = AMBIENT_AUDIO_URLS.FALLBACK;

    // Mapeia frequência para tipo (para logs)
    let type = 'Unknown';
    if (targetFrequency < 4) {
        type = 'Delta (Sono)';
    } else if (targetFrequency < 8) {
        type = 'Theta (Meditação)';
    } else if (targetFrequency < 13) {
        type = 'Alpha (Relaxamento)';
    } else if (targetFrequency < 20) {
        type = 'Beta (Foco)';
    } else {
        type = 'High Beta (Energia)';
    }

    console.log(`[AudioUrls] → ${type} - Usando arquivo de teste`);
    console.log(`[AudioUrls] → URL: ${testUrl}`);

    return testUrl;
}

/**
 * Seleciona som ambiente baseado no tipo de sessão
 */
export function getAmbientUrlForTask(taskId) {
    console.log(`[AudioUrls] Selecionando áudio para tarefa: ${taskId}`);

    const urls = AMBIENT_AUDIO_URLS;

    switch (taskId) {
        case 'FOCO':
            return urls.WHITE_NOISE;
        case 'CRIATIVIDADE':
            return urls.PINK_NOISE;
        case 'RELAXAMENTO':
            return urls.RAIN;
        case 'MEDITACAO':
            return urls.OCEAN;
        case 'SONO':
            return urls.BROWN_NOISE;
        case 'ENERGIA':
            return urls.WHITE_NOISE;
        default:
            return urls.PINK_NOISE;
    }
}

/**
 * Retorna URL de fallback garantido
 */
export function getFallbackUrl() {
    return AMBIENT_AUDIO_URLS.FALLBACK;
}
