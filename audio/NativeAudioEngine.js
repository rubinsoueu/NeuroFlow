/**
 * Motor de Áudio Nativo usando Expo-AV
 * 
 * IMPORTANTE: Esta é uma implementação simplificada usando expo-av
 * pois o WebView + Tone.js não funciona bem no Expo Go.
 * 
 * Limitações:
 * - Não gera áudio procedural em tempo real
 * - Usa arquivos de áudio pré-gravados ou síntese básica
 * - Menos flexível que Tone.js mas funciona nativamente
 * 
 * Para versão completa com Tone.js, use um custom development build.
 */

import { Audio } from 'expo-av';
import { getBinauralUrlForFrequency } from './AudioUrls';

export class NativeAudioEngine {
    constructor() {
        this.sound = null;
        this.isPlaying = false;
        this.volume = 0.7;
    }

    async initialize() {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: true,
            });
            console.log('Audio mode configured');
        } catch (error) {
            console.error('Failed to set audio mode:', error);
        }
    }

    async start(frequency = 10, carrierFrequency = 200) {
        if (this.isPlaying) {
            console.log('Already playing');
            return;
        }

        try {
            // Usa a função que mapeia frequência para URL correta
            const audioUrl = getBinauralUrlForFrequency(frequency);

            console.log(`Loading audio for ${frequency}Hz from: ${audioUrl}`);

            const { sound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                {
                    shouldPlay: true,
                    volume: this.volume,
                    isLooping: true
                }
            );

            this.sound = sound;
            this.isPlaying = true;
            console.log('Audio started successfully');
        } catch (error) {
            console.error('Failed to start audio:', error);
            console.error('Error details:', error.message);

            // Fallback: toca um som ambiente simples
            await this.playFallbackSound();
        }
    }

    async playFallbackSound() {
        try {
            // Importa função de fallback
            const { getFallbackUrl } = require('./AudioUrls');
            const fallbackUrl = getFallbackUrl();

            console.log('[NativeAudioEngine] Playing fallback sound');
            console.log('[NativeAudioEngine] Fallback URL:', fallbackUrl);

            const { sound } = await Audio.Sound.createAsync(
                { uri: fallbackUrl },
                {
                    shouldPlay: true,
                    volume: this.volume,
                    isLooping: true
                }
            );

            this.sound = sound;
            this.isPlaying = true;
            console.log('[NativeAudioEngine] Fallback audio playing');
        } catch (error) {
            console.error('[NativeAudioEngine] Even fallback failed:', error);
            console.error('[NativeAudioEngine] Error message:', error.message);
        }
    }

    async stop() {
        if (!this.isPlaying || !this.sound) {
            return;
        }

        try {
            await this.sound.stopAsync();
            await this.sound.unloadAsync();
            this.sound = null;
            this.isPlaying = false;
            console.log('Audio stopped');
        } catch (error) {
            console.error('Failed to stop audio:', error);
        }
    }

    async pause() {
        if (!this.isPlaying || !this.sound) {
            return;
        }

        try {
            await this.sound.pauseAsync();
            this.isPlaying = false;
            console.log('Audio paused');
        } catch (error) {
            console.error('Failed to pause audio:', error);
        }
    }

    async resume() {
        if (this.isPlaying || !this.sound) {
            return;
        }

        try {
            await this.sound.playAsync();
            this.isPlaying = true;
            console.log('Audio resumed');
        } catch (error) {
            console.error('Failed to resume audio:', error);
        }
    }

    async setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));

        if (this.sound) {
            try {
                await this.sound.setVolumeAsync(this.volume);
                console.log('Volume set to', this.volume);
            } catch (error) {
                console.error('Failed to set volume:', error);
            }
        }
    }

    async adjust(frequency, carrier, duration) {
        // Para áudio nativo, precisaria trocar de arquivo
        // Ou usar uma biblioteca de síntese nativa
        // Por enquanto, apenas loga
        console.log(`Would adjust to ${frequency}Hz over ${duration}s (not implemented in native)`);

        // Poderia trocar para outro arquivo:
        // await this.stop();
        // await this.start(frequency, carrier);
    }
}
