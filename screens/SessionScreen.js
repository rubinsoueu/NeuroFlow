import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Animated,
    Dimensions,
} from 'react-native';
import { NativeAudioEngine } from '../audio/NativeAudioEngine';
import { getBinauralUrlForFrequency } from '../audio/AudioUrls';
import { getLayerConfig } from '../data/FrequencyMappings';

const { width } = Dimensions.get('window');

export default function SessionScreen({ sessionConfig, onEnd }) {
    const { initialState, task, targetState } = sessionConfig;

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentState, setCurrentState] = useState('TRANSITIONING');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [volume, setVolume] = useState(0.7);

    const audioEngine = useRef(new NativeAudioEngine()).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const animationRef = useRef(null); // Para parar animação no cleanup
    const isMountedRef = useRef(true); // Previne state updates após unmount
    const timerRef = useRef(null);
    const feedbackTimerRef = useRef(null);
    const currentStateRef = useRef('TRANSITIONING'); // Para closure atualizada

    useEffect(() => {
        // Marca estado atual
        currentStateRef.current = currentState;
    }, [currentState]);

    useEffect(() => {
        isMountedRef.current = true;
        initializeAudio();
        setupTimer();
        setupFeedbackPrompts();

        return () => {
            isMountedRef.current = false;

            // Limpa timers
            if (timerRef.current) clearInterval(timerRef.current);
            if (feedbackTimerRef.current) clearInterval(feedbackTimerRef.current);

            // Para animação
            if (animationRef.current) {
                animationRef.current.stop();
            }

            // Para áudio
            audioEngine.stop();
        };
    }, []);

    const initializeAudio = async () => {
        console.log('[SessionScreen] Initializing native audio engine...');
        await audioEngine.initialize();

        if (isMountedRef.current) {
            await startSession();
        }
    };

    const startSession = async () => {
        if (!isMountedRef.current) {
            console.log('[SessionScreen] Component unmounted, aborting session start');
            return;
        }

        console.log('[SessionScreen] Starting audio session...');

        try {
            const layerConfig = getLayerConfig(initialState, targetState);
            const rampTime = task.transitionTime * 60;

            // Inicia com frequência alvo
            await audioEngine.start(
                targetState.targetFrequency,
                targetState.carrierFrequency
            );

            if (isMountedRef.current) {
                setIsPlaying(true);
                startPulseAnimation();

                console.log('[SessionScreen] Audio session started successfully!');
                console.log('[SessionScreen] Playing binaural beat:', targetState.targetFrequency, 'Hz');
            }
        } catch (error) {
            console.error('[SessionScreen] Failed to start session:', error);
        }
    };

    const setupTimer = () => {
        timerRef.current = setInterval(() => {
            if (isMountedRef.current) {
                setElapsedTime((prev) => prev + 1);
            }
        }, 1000);
    };

    const setupFeedbackPrompts = () => {
        // Pergunta feedback a cada 3-5 minutos
        const intervalMinutes = 4;
        feedbackTimerRef.current = setInterval(() => {
            // Usa ref para pegar estado mais recente
            if (isMountedRef.current && currentStateRef.current === 'TRANSITIONING') {
                setShowFeedback(true);
            }
        }, intervalMinutes * 60 * 1000);
    };

    const startPulseAnimation = () => {
        animationRef.current = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        );
        animationRef.current.start();
    };

    const handlePlayPause = async () => {
        try {
            if (isPlaying) {
                await audioEngine.pause();
                setIsPlaying(false);
            } else {
                await audioEngine.resume();
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Play/Pause error:', error);
        }
    };

    const handleVolumeChange = async (delta) => {
        const newVolume = Math.max(0, Math.min(1, volume + delta));
        setVolume(newVolume);

        try {
            await audioEngine.setVolume(newVolume);
        } catch (error) {
            console.error('Volume change error:', error);
        }
    };

    const handleFeedback = (response) => {
        setShowFeedback(false);

        if (response === 'ARRIVED') {
            setCurrentState('ARRIVED');
            // Mantém a frequência atual, reduz modulação
        } else if (response === 'NOT_YET') {
            // Continua transição
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgressPercentage = () => {
        const transitionSeconds = task.transitionTime * 60;
        return Math.min(100, (elapsedTime / transitionSeconds) * 100);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0A0E27" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onEnd}>
                    <Text style={styles.backButtonText}>✕</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>{task.label}</Text>
                    <Text style={styles.headerSubtitle}>{formatTime(elapsedTime)}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Visualizador de Áudio */}
            <View style={styles.visualizerContainer}>
                <Animated.View
                    style={[
                        styles.visualizerCircle,
                        {
                            backgroundColor: targetState.color + '40',
                            borderColor: targetState.color,
                            transform: [{ scale: pulseAnim }],
                        }
                    ]}
                >
                    <View style={styles.visualizerInner}>
                        <Text style={styles.visualizerIcon}>{task.icon}</Text>
                        <Text style={styles.visualizerText}>
                            {currentState === 'TRANSITIONING' ? 'Transicionando...' : 'Chegou!'}
                        </Text>
                        <Text style={styles.visualizerPercentage}>
                            {Math.round(getProgressPercentage())}%
                        </Text>
                    </View>
                </Animated.View>

                {/* Progress Arc (visual) */}
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]} />
                </View>
            </View>

            {/* Estado Indicator */}
            <View style={styles.stateIndicator}>
                <View style={styles.stateRow}>
                    <View style={styles.stateBadge}>
                        <Text style={styles.stateBadgeIcon}>{initialState.icon}</Text>
                        <Text style={styles.stateBadgeText}>{initialState.label}</Text>
                    </View>
                    <Text style={styles.arrow}>→</Text>
                    <View style={[styles.stateBadge, { backgroundColor: targetState.color + '20' }]}>
                        <Text style={styles.stateBadgeIcon}>{targetState.icon}</Text>
                        <Text style={styles.stateBadgeText}>{targetState.label}</Text>
                    </View>
                </View>
            </View>

            {/* Feedback Dialog */}
            {showFeedback && (
                <View style={styles.feedbackOverlay}>
                    <View style={styles.feedbackCard}>
                        <Text style={styles.feedbackTitle}>Como você está se sentindo?</Text>
                        <Text style={styles.feedbackSubtitle}>
                            Já alcançou o estado desejado?
                        </Text>

                        <View style={styles.feedbackButtons}>
                            <TouchableOpacity
                                style={[styles.feedbackButton, styles.feedbackButtonYes]}
                                onPress={() => handleFeedback('ARRIVED')}
                            >
                                <Text style={styles.feedbackButtonText}>✓ Sim, cheguei!</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.feedbackButton, styles.feedbackButtonNo]}
                                onPress={() => handleFeedback('NOT_YET')}
                            >
                                <Text style={styles.feedbackButtonText}>⟳ Ainda não</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => setShowFeedback(false)}>
                            <Text style={styles.feedbackDismiss}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Controls */}
            <View style={styles.controls}>
                {/* Volume */}
                <View style={styles.volumeControl}>
                    <TouchableOpacity
                        style={styles.volumeButton}
                        onPress={() => handleVolumeChange(-0.1)}
                    >
                        <Text style={styles.volumeButtonText}>−</Text>
                    </TouchableOpacity>

                    <View style={styles.volumeBar}>
                        <View style={[styles.volumeFill, { width: `${volume * 100}%` }]} />
                    </View>

                    <TouchableOpacity
                        style={styles.volumeButton}
                        onPress={() => handleVolumeChange(0.1)}
                    >
                        <Text style={styles.volumeButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                {/* Play/Pause */}
                <TouchableOpacity
                    style={styles.playButton}
                    onPress={handlePlayPause}
                >
                    <Text style={styles.playButtonIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                </TouchableOpacity>

                {/* End Session */}
                <TouchableOpacity
                    style={styles.endButton}
                    onPress={onEnd}
                >
                    <Text style={styles.endButtonText}>Encerrar Sessão</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0E27',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '600',
    },
    headerCenter: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#8E9AAF',
        marginTop: 2,
    },
    visualizerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    visualizerCircle: {
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width * 0.3,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    visualizerInner: {
        alignItems: 'center',
    },
    visualizerIcon: {
        fontSize: 60,
        marginBottom: 16,
    },
    visualizerText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
        marginBottom: 8,
    },
    visualizerPercentage: {
        fontSize: 24,
        color: '#60A5FA',
        fontWeight: '800',
    },
    progressBar: {
        width: '80%',
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        marginTop: 30,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#60A5FA',
    },
    stateIndicator: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    stateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    stateBadgeIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    stateBadgeText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    arrow: {
        fontSize: 20,
        color: '#60A5FA',
        marginHorizontal: 16,
    },
    feedbackOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    feedbackCard: {
        backgroundColor: '#1A2332',
        borderRadius: 20,
        padding: 24,
        width: '85%',
        maxWidth: 400,
    },
    feedbackTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    feedbackSubtitle: {
        fontSize: 16,
        color: '#8E9AAF',
        marginBottom: 24,
        textAlign: 'center',
    },
    feedbackButtons: {
        gap: 12,
        marginBottom: 16,
    },
    feedbackButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    feedbackButtonYes: {
        backgroundColor: '#10B981',
    },
    feedbackButtonNo: {
        backgroundColor: '#6B7280',
    },
    feedbackButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    feedbackDismiss: {
        color: '#8E9AAF',
        fontSize: 14,
        textAlign: 'center',
    },
    controls: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    volumeControl: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    volumeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    volumeButtonText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '600',
    },
    volumeBar: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    volumeFill: {
        height: '100%',
        backgroundColor: '#60A5FA',
    },
    playButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#60A5FA',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 16,
    },
    playButtonIcon: {
        fontSize: 28,
    },
    endButton: {
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    endButtonText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '700',
    },
    engineContainer: {
        height: 0,
        width: 0,
        opacity: 0,
        position: 'absolute',
    },
});
