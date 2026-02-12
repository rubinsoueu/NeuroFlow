import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { EMOTIONAL_STATES } from '../data/EmotionalStates';

const { width } = Dimensions.get('window');

export default function StateSelector({ onSelect, selectedState }) {
    const states = Object.values(EMOTIONAL_STATES);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Como você está se sentindo?</Text>
            <Text style={styles.subtitle}>Escolha o estado que mais se aproxima do seu momento atual</Text>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.statesContainer}
            >
                {states.map((state) => (
                    <TouchableOpacity
                        key={state.id}
                        style={[
                            styles.stateCard,
                            selectedState?.id === state.id && styles.stateCardSelected,
                            { borderColor: state.color }
                        ]}
                        onPress={() => onSelect(state)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: state.color + '20' }]}>
                            <Text style={styles.icon}>{state.icon}</Text>
                        </View>
                        <View style={styles.stateInfo}>
                            <Text style={styles.stateLabel}>{state.label}</Text>
                            <Text style={styles.stateDescription}>{state.description}</Text>
                        </View>
                        <View style={[
                            styles.checkbox,
                            selectedState?.id === state.id && { backgroundColor: state.color }
                        ]} />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
        backgroundColor: '#0A0E27',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#8E9AAF',
        marginBottom: 30,
    },
    scrollView: {
        flex: 1,
    },
    statesContainer: {
        paddingBottom: 40,
    },
    stateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    stateCardSelected: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    icon: {
        fontSize: 28,
    },
    stateInfo: {
        flex: 1,
    },
    stateLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    stateDescription: {
        fontSize: 14,
        color: '#8E9AAF',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#4A5568',
    },
});
