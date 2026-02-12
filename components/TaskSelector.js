import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { TASK_PROFILES_LIST } from '../data/TaskProfiles';

export default function TaskSelector({ onSelect, selectedTask }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>O que você deseja fazer?</Text>
            <Text style={styles.subtitle}>Escolha sua intenção para esta sessão</Text>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.tasksContainer}
            >
                {TASK_PROFILES_LIST.map((task) => (
                    <TouchableOpacity
                        key={task.id}
                        style={[
                            styles.taskCard,
                            selectedTask?.id === task.id && styles.taskCardSelected,
                            { borderColor: task.targetState.color }
                        ]}
                        onPress={() => onSelect(task)}
                        activeOpacity={0.7}
                    >
                        <View style={[
                            styles.iconContainer,
                            { backgroundColor: task.targetState.color + '20' }
                        ]}>
                            <Text style={styles.icon}>{task.icon}</Text>
                        </View>
                        <View style={styles.taskInfo}>
                            <Text style={styles.taskLabel}>{task.label}</Text>
                            <Text style={styles.taskDescription}>{task.description}</Text>
                            <Text style={styles.duration}>
                                ~{task.recommendedDuration} min • Transição: {task.transitionTime} min
                            </Text>
                        </View>
                        <View style={[
                            styles.checkbox,
                            selectedTask?.id === task.id && { backgroundColor: task.targetState.color }
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
    tasksContainer: {
        paddingBottom: 40,
    },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    taskCardSelected: {
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
    taskInfo: {
        flex: 1,
    },
    taskLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    taskDescription: {
        fontSize: 14,
        color: '#8E9AAF',
        marginBottom: 4,
    },
    duration: {
        fontSize: 12,
        color: '#6B7280',
        fontStyle: 'italic',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#4A5568',
    },
});
