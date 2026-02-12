import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { WebView } from 'react-native-webview';
import { SynthHTML } from '../audio/SynthEngine';
import { getScale, getChordProgression, getLayerConfig } from '../data/FrequencyMappings';

const { width } = Dimensions.get('window');

export default function SessionScreen({ sessionConfig, onEnd }) {
    const { initialState, task, targetState } = sessionConfig;

    const [isPlaying, setIsPlaying] = useState(false);
    const [isEngineReady, setIsEngineReady] = useState(false);
    const [currentPhase, setCurrentPhase] = useState('INITIALIZING'); // INITIALIZING | MATCHING | TRANSITIONING | ARRIVED
    const [elapsedTime, setElapsedTime] = useState(0);
    const [transitionProgress, setTransitionProgress] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [volume, setVolume] = useState(0.7);

    const webviewRef = useRef(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const animationRef = useRef(null);
    const glowAnimRef = useRef(null);
    const isMountedRef = useRef(true);
    const timerRef = useRef(null);
    const feedbackTimerRef = useRef(null);
    const currentPhaseRef = useRef('INITIALIZING');

    // Keep ref in sync
    useEffect(() => {
        currentPhaseRef.current = currentPhase;
    }, [currentPhase]);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            if (timerRef.current) clearInterval(timerRef.current);
            if (feedbackTimerRef.current) clearInterval(feedbackTimerRef.current);
            if (animationRef.current) animationRef.current.stop();
            if (glowAnimRef.current) glowAnimRef.current.stop();
            // Stop audio via webview
            sendCommand({ type: 'STOP' });
        };
    }, []);

    // ========================================================
    // AUDIO ENGINE COMMUNICATION
    // ========================================================

    const sendCommand = useCallback((command) => {
        if (webviewRef.current) {
            webviewRef.current.postMessage(JSON.stringify(command));
        }
    }, []);

    const handleWebViewMessage = useCallback((event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);

            switch (data.type) {
                case 'ENGINE_READY':
                    console.log('[Session] Engine ready, starting music...');
                    if (isMountedRef.current) {
                        setIsEngineReady(true);
                        startSession();
                    }
                    break;

                case 'LOG':
                    console.log('[SynthEngine]', data.message);
                    break;

                case 'TRANSITION_PROGRESS':
                    if (isMountedRef.current) {
                        setTransitionProgress(data.progress);
                    }
                    break;

                case 'TRANSITION_COMPLETE':
                    if (isMountedRef.current) {
                        setCurrentPhase('ARRIVED');
                    }
                    break;
            }
        } catch (error) {
            console.error('[Session] WebView message error:', error);
        }
    }, []);

    // ========================================================
    // SESSION LIFECYCLE
    // ========================================================

    const startSession = useCallback(() => {
        if (!isMountedRef.current) return;

        console.log('[Session] Starting musical session...');
        console.log('[Session] Initial:', initialState.id, '→ Target:', targetState.id);

        // Get scale and chords for initial state (ISO matching)
        const initialScale = getScale(
            initialState.musicProfile.scale.root,
            initialState.musicProfile.scale.mode
        );
        const initialChords = getChordProgression(initialState.id);

        // Phase 1: Start with music that MATCHES the user's current state
        setCurrentPhase('MATCHING');
        sendCommand({
            type: 'START_MUSIC',
            initialProfile: initialState.musicProfile,
            scale: initialScale,
            chords: initialChords,
            binauralFreq: initialState.brainwave.baseFrequency,
            carrierFreq: initialState.brainwave.carrierFrequency,
        });

        setIsPlaying(true);
        startPulseAnimation();
        startGlowAnimation();
        setupTimer();
        setupFeedbackPrompts();

        // Phase 2: After a brief matching period, begin ISO transition
        const MATCHING_DURATION = 15000; // 15 seconds of matching first
        setTimeout(() => {
            if (!isMountedRef.current) return;
            beginTransition();
        }, MATCHING_DURATION);

    }, [initialState, targetState, task]);

    const beginTransition = useCallback(() => {
        if (!isMountedRef.current) return;

        console.log('[Session] Beginning ISO transition...');
        setCurrentPhase('TRANSITIONING');

        // Get target scale and chords
        const targetScale = getScale(
            targetState.musicProfile.scale.root,
            targetState.musicProfile.scale.mode
        );
        const targetChords = getChordProgression(targetState.id);

        // Calculate transition duration
        const transitionSeconds = task.transitionTime * 60;

        // Send transition command to engine
        sendCommand({
            type: 'TRANSITION',
            targetProfile: targetState.musicProfile,
            targetScale: targetScale,
            targetChords: targetChords,
            targetBinauralFreq: targetState.brainwave.targetFrequency,
            targetCarrierFreq: targetState.brainwave.carrierFrequency,
            durationSeconds: transitionSeconds,
        });

    }, [targetState, task]);

    // ========================================================
    // TIMERS & ANIMATIONS
    // ========================================================

    const setupTimer = () => {
        timerRef.current = setInterval(() => {
            if (isMountedRef.current) {
                setElapsedTime((prev) => prev + 1);
            }
        }, 1000);
    };

    const setupFeedbackPrompts = () => {
        const intervalMinutes = 4;
        feedbackTimerRef.current = setInterval(() => {
            if (isMountedRef.current && currentPhaseRef.current === 'TRANSITIONING') {
                setShowFeedback(true);
            }
        }, intervalMinutes * 60 * 1000);
    };

    const startPulseAnimation = () => {
        animationRef.current = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.08,
                    duration: 2500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2500,
                    useNativeDriver: true,
                }),
            ])
        );
        animationRef.current.start();
    };

    const startGlowAnimation = () => {
        glowAnimRef.current = Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: false,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 3000,
                    useNativeDriver: false,
                }),
            ])
        );
        glowAnimRef.current.start();
    };

    // ========================================================
    // USER INTERACTIONS
    // ========================================================

    const handlePlayPause = () => {
        if (isPlaying) {
            sendCommand({ type: 'PAUSE' });
            setIsPlaying(false);
        } else {
            sendCommand({ type: 'RESUME' });
            setIsPlaying(true);
        }
    };

    const handleVolumeChange = (delta) => {
        const newVolume = Math.max(0, Math.min(1, volume + delta));
        setVolume(newVolume);
        sendCommand({ type: 'VOLUME', volume: newVolume });
    };

    const handleFeedback = (response) => {
        setShowFeedback(false);
        if (response === 'ARRIVED') {
            setCurrentPhase('ARRIVED');
        }
    };

    // ========================================================
    // HELPERS
    // ========================================================

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgressPercentage = () => {
        if (currentPhase === 'ARRIVED') return 100;
        if (currentPhase === 'MATCHING') return 0;
        return Math.round(transitionProgress * 100);
    };

    const getPhaseLabel = () => {
        switch (currentPhase) {
            case 'INITIALIZING': return 'Preparando...';
            case 'MATCHING': return 'Sintonizando com você...';
            case 'TRANSITIONING': return 'Transicionando...';
            case 'ARRIVED': return '✓ Estado alcançado!';
            default: return '';
        }
    };

    const getCurrentColor = () => {
        if (currentPhase === 'ARRIVED') return targetState.color;
        if (currentPhase === 'MATCHING') return initialState.color;
        // Interpolate color during transition
        return targetState.color;
    };

    const glowColor = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [getCurrentColor() + '20', getCurrentColor() + '60'],
    });

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0A0E27" />

            {/* Hidden WebView - Audio Engine */}
            <View style={styles.engineContainer}>
                <WebView
                    ref={webviewRef}
                    originWhitelist={['*']}
                    source={{ html: SynthHTML }}
                    onMessage={handleWebViewMessage}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    mediaPlaybackRequiresUserAction={false}
                    allowsInlineMediaPlayback={true}
                />
            </View>

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

            {/* Audio Visualizer */}
            <View style={styles.visualizerContainer}>
                <Animated.View
                    style={[
                        styles.visualizerGlow,
                        { backgroundColor: glowColor },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.visualizerCircle,
                        {
                            borderColor: getCurrentColor(),
                            transform: [{ scale: pulseAnim }],
                        }
                    ]}
                >
                    <View style={styles.visualizerInner}>
                        <Text style={styles.visualizerIcon}>{task.icon}</Text>
                        <Text style={styles.phaseText}>{getPhaseLabel()}</Text>
                        <Text style={styles.visualizerPercentage}>
                            {getProgressPercentage()}%
                        </Text>
                    </View>
                </Animated.View>

                {/* Progress Bar */}
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${getProgressPercentage()}%`,
                                backgroundColor: getCurrentColor(),
                            }
                        ]}
                    />
                </View>
            </View>

            {/* State Indicator */}
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
                    style={[styles.playButton, { backgroundColor: getCurrentColor() }]}
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
    engineContainer: {
        height: 0,
        width: 0,
        opacity: 0,
        position: 'absolute',
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
    visualizerGlow: {
        position: 'absolute',
        width: width * 0.75,
        height: width * 0.75,
        borderRadius: width * 0.375,
    },
    visualizerCircle: {
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width * 0.3,
        borderWidth: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    visualizerInner: {
        alignItems: 'center',
    },
    visualizerIcon: {
        fontSize: 52,
        marginBottom: 12,
    },
    phaseText: {
        fontSize: 14,
        color: '#8E9AAF',
        fontWeight: '600',
        marginBottom: 8,
    },
    visualizerPercentage: {
        fontSize: 28,
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
        borderRadius: 2,
    },
    stateIndicator: {
        paddingHorizontal: 20,
        paddingVertical: 16,
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
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    endButtonText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '700',
    },
});
