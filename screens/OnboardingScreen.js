import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import StateSelector from '../components/StateSelector';
import TaskSelector from '../components/TaskSelector';

export default function OnboardingScreen({ onStart }) {
    const [step, setStep] = useState(1); // 1: Estado, 2: Tarefa, 3: Confirmação
    const [selectedState, setSelectedState] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);

    const handleStateSelect = (state) => {
        setSelectedState(state);
    };

    const handleTaskSelect = (task) => {
        setSelectedTask(task);
    };

    const handleNext = () => {
        if (step === 1 && selectedState) {
            setStep(2);
        } else if (step === 2 && selectedTask) {
            setStep(3);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleStartSession = () => {
        onStart({
            initialState: selectedState,
            task: selectedTask,
            targetState: selectedTask.targetState,
        });
    };

    const canProceed =
        (step === 1 && selectedState) ||
        (step === 2 && selectedTask);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0A0E27" />

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
                <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
                <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
                <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
                <View style={[styles.progressLine, step >= 3 && styles.progressLineActive]} />
                <View style={[styles.progressDot, step >= 3 && styles.progressDotActive]} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                {step === 1 && (
                    <StateSelector
                        onSelect={handleStateSelect}
                        selectedState={selectedState}
                    />
                )}

                {step === 2 && (
                    <TaskSelector
                        onSelect={handleTaskSelect}
                        selectedTask={selectedTask}
                    />
                )}

                {step === 3 && (
                    <View style={styles.confirmationContainer}>
                        <Text style={styles.confirmTitle}>Vamos começar!</Text>
                        <Text style={styles.confirmSubtitle}>Sua sessão de terapia sonora</Text>

                        <View style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Estado Inicial:</Text>
                                <View style={styles.summaryBadge}>
                                    <Text style={styles.summaryIcon}>{selectedState.icon}</Text>
                                    <Text style={styles.summaryText}>{selectedState.label}</Text>
                                </View>
                            </View>

                            <View style={styles.arrow}>
                                <Text style={styles.arrowText}>↓</Text>
                            </View>

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Objetivo:</Text>
                                <View style={styles.summaryBadge}>
                                    <Text style={styles.summaryIcon}>{selectedTask.icon}</Text>
                                    <Text style={styles.summaryText}>{selectedTask.label}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Tempo de transição:</Text>
                                <Text style={styles.infoValue}>~{selectedTask.transitionTime} min</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Duração recomendada:</Text>
                                <Text style={styles.infoValue}>{selectedTask.recommendedDuration} min</Text>
                            </View>
                        </View>

                        <Text style={styles.note}>
                            O áudio será gerado continuamente. Você pode dar feedback durante a sessão para ajustar em tempo real.
                        </Text>
                    </View>
                )}
            </View>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                {step > 1 && (
                    <TouchableOpacity
                        style={[styles.button, styles.buttonSecondary]}
                        onPress={handleBack}
                    >
                        <Text style={styles.buttonSecondaryText}>Voltar</Text>
                    </TouchableOpacity>
                )}

                {step < 3 ? (
                    <TouchableOpacity
                        style={[
                            styles.button,
                            styles.buttonPrimary,
                            !canProceed && styles.buttonDisabled
                        ]}
                        onPress={handleNext}
                        disabled={!canProceed}
                    >
                        <Text style={styles.buttonPrimaryText}>Próximo</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, styles.buttonPrimary, styles.buttonStart]}
                        onPress={handleStartSession}
                    >
                        <Text style={styles.buttonPrimaryText}>Iniciar Sessão 🎵</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0E27',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 40,
    },
    progressDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#2D3748',
    },
    progressDotActive: {
        backgroundColor: '#60A5FA',
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    progressLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#2D3748',
        marginHorizontal: 8,
    },
    progressLineActive: {
        backgroundColor: '#60A5FA',
    },
    content: {
        flex: 1,
    },
    confirmationContainer: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    confirmTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    confirmSubtitle: {
        fontSize: 16,
        color: '#8E9AAF',
        marginBottom: 40,
    },
    summaryCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        marginBottom: 24,
    },
    summaryRow: {
        marginBottom: 16,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#8E9AAF',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    summaryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    summaryIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    summaryText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    arrow: {
        alignItems: 'center',
        marginVertical: 8,
    },
    arrowText: {
        fontSize: 24,
        color: '#60A5FA',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: '#8E9AAF',
    },
    infoValue: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    note: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        fontStyle: 'italic',
        paddingHorizontal: 20,
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPrimary: {
        backgroundColor: '#60A5FA',
    },
    buttonStart: {
        backgroundColor: '#10B981',
    },
    buttonPrimaryText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    buttonSecondary: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        maxWidth: 120,
    },
    buttonSecondaryText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.4,
    },
});
