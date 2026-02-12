/**
 * Motor de Áudio Generativo Multi-Camadas
 * Usa Tone.js para criar terapia sonora procedural com:
 * - Binaural Beats (diferença de frequência entre ouvidos)
 * - Isochronic Tones (pulsos rítmicos)
 * - Camada Ambiente (ruído filtrado + pad harmônico)
 */

export const SynthHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
</head>
<body>
    <script>
        // ========== VARIÁVEIS GLOBAIS ==========
        let state = {
            isPlaying: false,
            currentFrequency: 10, // Hz (binaural beat frequency)
            carrierFrequency: 200, // Hz
            targetFrequency: 10,
            transitionDuration: 60, // segundos
            layerConfig: null,
        };

        // ========== CAMADAS DE ÁUDIO ==========
        
        // 1. Binaural Beats (estéreo)
        const merger = new Tone.Merger(2).toDestination();
        const leftOsc = new Tone.Oscillator().connect(merger, 0, 0);
        const rightOsc = new Tone.Oscillator().connect(merger, 0, 1);
        const binauralGain = new Tone.Gain(0.3).connect(merger);
        leftOsc.disconnect();
        rightOsc.disconnect();
        leftOsc.connect(binauralGain);
        rightOsc.connect(binauralGain);

        // 2. Isochronic Tones (mono, modulado)
        const isoOsc = new Tone.Oscillator();
        const isoLFO = new Tone.LFO(10, -60, 0); // Frequência, min dB, max dB
        const isoGain = new Tone.Gain(0.4).toDestination();
        isoLFO.connect(isoGain.gain);
        isoOsc.connect(isoGain);

        // 3. Camada Ambiente - Ruído
        const noise = new Tone.Noise("pink");
        const noiseFilter = new Tone.Filter(500, "lowpass");
        const noiseGain = new Tone.Gain(0.15).toDestination();
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);

        // 4. Camada Pad (harmônicos sutis)
        const pad = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sine" },
            envelope: {
                attack: 8,
                decay: 0,
                sustain: 1,
                release: 8
            }
        });
        const padFilter = new Tone.Filter(800, "lowpass");
        const padReverb = new Tone.Reverb({ decay: 8, wet: 0.5 });
        const padGain = new Tone.Gain(0.2).toDestination();
        pad.connect(padFilter);
        padFilter.connect(padReverb);
        padReverb.connect(padGain);

        // ========== FUNÇÕES DE CONTROLE ==========

        function startAudio() {
            if (state.isPlaying) return;
            
            Tone.start().then(() => {
                // Define volume inicial (70%)
                Tone.Destination.volume.value = Tone.gainToDb(0.7);
                
                // Inicia osciladores binaurais
                leftOsc.frequency.value = state.carrierFrequency;
                rightOsc.frequency.value = state.carrierFrequency + state.currentFrequency;
                leftOsc.start();
                rightOsc.start();

                // Inicia isochronic
                isoOsc.frequency.value = state.carrierFrequency;
                isoLFO.frequency.value = state.currentFrequency;
                isoOsc.start();
                isoLFO.start();

                // Inicia ruído
                noise.start();

                // Inicia pad com notas harmônicas baseadas no carrier
                startPadHarmonics();

                // Inicia variação procedural
                startProceduralVariation();

                state.isPlaying = true;
                sendLog('Audio engine started');
            });
        }

        function stopAudio() {
            if (!state.isPlaying) return;

            leftOsc.stop();
            rightOsc.stop();
            isoOsc.stop();
            isoLFO.stop();
            noise.stop();
            pad.releaseAll();

            state.isPlaying = false;
            sendLog('Audio engine stopped');
        }

        function startPadHarmonics() {
            const baseNote = Tone.Frequency(state.carrierFrequency).toNote();
            // Toca fundamental + 3ª + 5ª (acorde suave)
            const baseFreq = state.carrierFrequency;
            const notes = [
                Tone.Frequency(baseFreq).toNote(),
                Tone.Frequency(baseFreq * 1.25).toNote(), // 3ª maior
                Tone.Frequency(baseFreq * 1.5).toNote(),  // 5ª
            ];
            pad.triggerAttack(notes);
        }

        function updatePadHarmonics() {
            pad.releaseAll();
            setTimeout(startPadHarmonics, 500);
        }

        function adjustFrequency(targetFreq, carrierFreq, rampTime = 10, layerConfig = {}) {
            if (!state.isPlaying) {
                startAudio();
            }

            state.targetFrequency = targetFreq;
            state.carrierFrequency = carrierFreq;

            // Aplica configurações de camada se fornecidas
            if (layerConfig.binaural) {
                binauralGain.gain.rampTo(layerConfig.binaural.intensity, 2);
            }
            if (layerConfig.isochronic) {
                isoGain.gain.rampTo(layerConfig.isochronic.intensity, 2);
            }
            if (layerConfig.ambient) {
                noiseGain.gain.rampTo(layerConfig.ambient.intensity, 2);
                noiseFilter.frequency.rampTo(layerConfig.ambient.filterFreq, rampTime);
            }
            if (layerConfig.pad) {
                padGain.gain.rampTo(layerConfig.pad.intensity, 2);
            }

            // Transição gradual dos beats binaurais
            const currentRight = rightOsc.frequency.value;
            const newRight = carrierFreq + targetFreq;
            
            leftOsc.frequency.rampTo(carrierFreq, rampTime);
            rightOsc.frequency.rampTo(newRight, rampTime);

            // Transição isochronic
            isoOsc.frequency.rampTo(carrierFreq, rampTime);
            isoLFO.frequency.rampTo(targetFreq, rampTime);

            // Atualiza pad se carrier mudou significativamente
            if (Math.abs(carrierFreq - state.carrierFrequency) > 20) {
                updatePadHarmonics();
            }

            state.currentFrequency = targetFreq;

            sendLog('Adjusting to ' + targetFreq + 'Hz binaural, ' + carrierFreq + 'Hz carrier over ' + rampTime + 's');
        }

        function setVolume(volume) {
            Tone.Destination.volume.value = Tone.gainToDb(volume);
            sendLog('Volume set to ' + volume);
        }

        function sendLog(message) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'LOG',
                    message: message,
                    timestamp: Date.now()
                }));
            }
        }

        // ========== MESSAGE HANDLER ==========
        
        window.addEventListener("message", (event) => {
            try {
                const data = JSON.parse(event.data);
                
                switch(data.type) {
                    case 'START':
                        startAudio();
                        break;
                    
                    case 'STOP':
                        stopAudio();
                        break;
                    
                    case 'ADJUST':
                        adjustFrequency(
                            data.targetFrequency,
                            data.carrierFrequency,
                            data.rampTime || 10,
                            data.layerConfig || {}
                        );
                        break;
                    
                    case 'VOLUME':
                        setVolume(data.volume);
                        break;
                    
                    default:
                        sendLog('Unknown command: ' + data.type);
                }
            } catch (error) {
                sendLog('Error: ' + error.message);
            }
        });

        // ========== PROCEDURAL VARIATION ==========
        // Adiciona variação sutil para evitar fadiga auditiva
        
        let variationInterval = null;
        
        function startProceduralVariation() {
            if (variationInterval) return;
            
            variationInterval = setInterval(() => {
                if (!state.isPlaying) return;
                
                // Varia levemente o filtro do ruído (+/- 50Hz)
                const currentFilter = noiseFilter.frequency.value;
                const variation = (Math.random() - 0.5) * 100;
                noiseFilter.frequency.rampTo(currentFilter + variation, 20);
                
                // Varia levemente o volume das camadas (+/- 5%)
                const padVol = padGain.gain.value;
                padGain.gain.rampTo(padVol * (0.95 + Math.random() * 0.1), 15);
                
            }, 30000); // A cada 30 segundos
        }

        function stopProceduralVariation() {
            if (variationInterval) {
                clearInterval(variationInterval);
                variationInterval = null;
            }
        }

        // Inicia variação procedural ao começar
        document.addEventListener('DOMContentLoaded', () => {
            sendLog('Synth Engine ready');
        });

    </script>
</body>
</html>
`;
