import { TARGET_STATES } from './EmotionalStates';

/**
 * Perfis de Tarefas - Mapeia intenções do usuário para estados-alvo
 */

export const TASK_PROFILES = {
    ESTUDAR: {
        id: 'ESTUDAR',
        label: 'Estudar/Trabalhar',
        description: 'Trabalho concentrado, estudo, leitura',
        targetState: TARGET_STATES.FOCO,
        icon: '📚',
        recommendedDuration: 25, // minutos (Pomodoro)
        transitionTime: 5, // minutos para atingir o estado
    },

    CRIAR: {
        id: 'CRIAR',
        label: 'Criar/Brainstorm',
        description: 'Pensamento criativo, ideias, arte',
        targetState: TARGET_STATES.CRIATIVIDADE,
        icon: '🎨',
        recommendedDuration: 30,
        transitionTime: 8,
    },

    RELAXAR: {
        id: 'RELAXAR',
        label: 'Relaxar',
        description: 'Descansar, recuperar energia',
        targetState: TARGET_STATES.RELAXAMENTO,
        icon: '☁️',
        recommendedDuration: 15,
        transitionTime: 10,
    },

    MEDITAR: {
        id: 'MEDITAR',
        label: 'Meditar',
        description: 'Meditação, mindfulness',
        targetState: TARGET_STATES.MEDITACAO,
        icon: '🧘',
        recommendedDuration: 20,
        transitionTime: 12,
    },

    DORMIR: {
        id: 'DORMIR',
        label: 'Dormir',
        description: 'Preparar para o sono',
        targetState: TARGET_STATES.SONO,
        icon: '🌙',
        recommendedDuration: 60, // Pode ficar rodando até dormir
        transitionTime: 15,
    },

    ENERGIZAR: {
        id: 'ENERGIZAR',
        label: 'Energizar',
        description: 'Aumentar energia e alerta',
        targetState: TARGET_STATES.ENERGIA,
        icon: '⚡',
        recommendedDuration: 10,
        transitionTime: 5,
    },
};

// Helper para obter perfil por ID
export const getTaskProfile = (taskId) => {
    return TASK_PROFILES[taskId] || TASK_PROFILES.ESTUDAR;
};

// Lista ordenada para UI
export const TASK_PROFILES_LIST = Object.values(TASK_PROFILES);
