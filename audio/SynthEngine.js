/**
 * NeuroFlow — Motor de Música Terapêutica Procedural
 *
 * Gera MÚSICA (melodias, harmonias, texturas) com binaural beats embutidos.
 * Baseado no Princípio ISO: matching → transição gradual → estado alvo.
 *
 * 5 CAMADAS:
 *   1. Binaural Beats (sine stereo, ~20% mix)
 *   2. Textura Ambiente (filtered noise + drone)
 *   3. Ritmo Sutil (shaped noise pulses)
 *   4. Harmonia/Pad (chord progressions)
 *   5. Melodia Procedural (arpeggios, scale patterns)
 *
 * Referências científicas:
 *   - NIH: Brainwave entrainment via binaural beats
 *   - Frontiers: Musical mode-emotion correlation
 *   - ISO Principle (1948): Match → Transition → Target
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
        // ========================================================
        // GLOBAL STATE
        // ========================================================
        const engineState = {
            isPlaying: false,
            currentProfile: null,
            targetProfile: null,
            transitionProgress: 0,    // 0 to 1
            transitionDuration: 60,   // seconds
            transitionStartTime: null,
            transitionTimer: null,
            volume: 0.7,
            // Current musical state (interpolated during transition)
            current: {
                tempoBPM: 72,
                timbreBrightness: 0.4,
                harmonicComplexity: 0.3,
                rhythmDensity: 0.3,
                melodicActivity: 0.25,
                dynamicRange: 0.2,
                binauralFreq: 10,
                carrierFreq: 200,
                reverbDecay: 3.0,
                reverbWet: 0.35,
                delayTime: 0.25,
                delayWet: 0.08,
            },
            scale: [],
            chords: [],
            chordIndex: 0,
            melodyIndex: 0,
            // Crossfade state for gradual scale/chord transitions
            oldScale: [],
            oldChords: [],
            targetScale: [],
            targetChords: [],
            scaleCrossfadeProgress: 1, // 1 = fully on current scale
        };

        // ========================================================
        // LAYER 1: BINAURAL BEATS (Subtle, stereo sine)
        // ========================================================
        const binauralMerger = new Tone.Merge().toDestination();
        const binauralGainNode = new Tone.Gain(0.2).connect(binauralMerger);

        const binauralLeft = new Tone.Oscillator({
            type: 'sine',
            frequency: 200,
            volume: -20,
        });
        const binauralRight = new Tone.Oscillator({
            type: 'sine',
            frequency: 210,
            volume: -20,
        });

        // Connect L/R to separate channels
        const leftGain = new Tone.Gain(1);
        const rightGain = new Tone.Gain(1);
        binauralLeft.connect(leftGain);
        binauralRight.connect(rightGain);
        leftGain.connect(binauralMerger, 0, 0);
        rightGain.connect(binauralMerger, 0, 1);

        // ========================================================
        // LAYER 2: AMBIENT TEXTURE (filtered noise + drone)
        // ========================================================
        const ambientNoise = new Tone.Noise('pink');
        const ambientFilter = new Tone.Filter({
            type: 'lowpass',
            frequency: 500,
            rolloff: -24,
        });
        const ambientGain = new Tone.Gain(0.12).toDestination();
        ambientNoise.connect(ambientFilter);
        ambientFilter.connect(ambientGain);

        // Sub-drone (very low sine for body)
        const droneSynth = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { attack: 4, decay: 0, sustain: 1, release: 4 },
        });
        const droneGain = new Tone.Gain(0.08).toDestination();
        const droneFilter = new Tone.Filter({ type: 'lowpass', frequency: 200 });
        droneSynth.connect(droneFilter);
        droneFilter.connect(droneGain);

        // ========================================================
        // LAYER 3: SUBTLE RHYTHM (shaped noise pulses)
        // ========================================================
        const rhythmNoise = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: {
                attack: 0.005,
                decay: 0.15,
                sustain: 0,
                release: 0.05,
            },
        });
        const rhythmFilter = new Tone.Filter({
            type: 'bandpass',
            frequency: 3000,
            Q: 2,
        });
        const rhythmGain = new Tone.Gain(0.08).toDestination();
        rhythmNoise.connect(rhythmFilter);
        rhythmFilter.connect(rhythmGain);

        // ========================================================
        // LAYER 4: HARMONY / PAD (chord progressions)
        // ========================================================
        const padSynth = new Tone.PolySynth(Tone.Synth, {
            maxPolyphony: 8,
            oscillator: { type: 'sine' },
            envelope: {
                attack: 3,
                decay: 1,
                sustain: 0.8,
                release: 4,
            },
        });
        const padFilter = new Tone.Filter({
            type: 'lowpass',
            frequency: 800,
            rolloff: -12,
        });
        const padReverb = new Tone.Reverb({ decay: 4, wet: 0.4 });
        const padChorus = new Tone.Chorus({
            frequency: 1.5,
            delayTime: 3.5,
            depth: 0.7,
            wet: 0.15,
        });
        const padGain = new Tone.Gain(0.18).toDestination();
        padSynth.connect(padFilter);
        padFilter.connect(padReverb);
        padReverb.connect(padChorus);
        padChorus.connect(padGain);

        // ========================================================
        // LAYER 5: PROCEDURAL MELODY (FM synth, arpeggios)
        // ========================================================
        const melodySynth = new Tone.FMSynth({
            harmonicity: 3,
            modulationIndex: 0.8,
            oscillator: { type: 'sine' },
            modulation: { type: 'sine' },
            envelope: {
                attack: 0.3,
                decay: 0.5,
                sustain: 0.6,
                release: 1.5,
            },
            modulationEnvelope: {
                attack: 0.5,
                decay: 0.2,
                sustain: 0.3,
                release: 0.5,
            },
        });
        const melodyReverb = new Tone.Reverb({ decay: 3, wet: 0.35 });
        const melodyDelay = new Tone.FeedbackDelay({
            delayTime: 0.25,
            feedback: 0.15,
            wet: 0.1,
        });
        const melodyGain = new Tone.Gain(0.15).toDestination();
        melodySynth.connect(melodyReverb);
        melodyReverb.connect(melodyDelay);
        melodyDelay.connect(melodyGain);

        // ========================================================
        // MASTER EFFECTS & VOLUME
        // ========================================================
        // (each layer routes to destination individually for
        //  independent volume control)

        // ========================================================
        // MUSICAL LOGIC
        // ========================================================

        /**
         * Map timbreBrightness (0-1) to filter frequency and oscillator params
         */
        // Track last oscillator type to avoid unnecessary switches
        let lastOscType = 'sine';

        function applyTimbre(brightness, rampSec) {
            rampSec = rampSec || 5;
            // Pad filter: 200-3000 Hz based on brightness
            const padFreq = 200 + (brightness * 2800);
            padFilter.frequency.rampTo(padFreq, rampSec);

            // Melody FM modulation index: brighter = more harmonics
            melodySynth.modulationIndex.rampTo(0.3 + (brightness * 2), rampSec);

            // Melody harmonicity: brighter = richer harmonics
            melodySynth.harmonicity.rampTo(2 + (brightness * 4), rampSec);

            // Ambient noise filter
            const noiseFreq = 200 + (brightness * 1500);
            ambientFilter.frequency.rampTo(noiseFreq, rampSec);

            // Oscillator type: use hysteresis to avoid rapid switching
            // and only switch when brightness is firmly in a zone
            let targetType;
            if (brightness < 0.25) {
                targetType = 'sine';
            } else if (brightness < 0.55) {
                targetType = 'triangle';
            } else {
                targetType = 'fatsawtooth';
            }

            // Only switch if type actually changed — avoids pops
            if (targetType !== lastOscType) {
                lastOscType = targetType;
                if (targetType === 'fatsawtooth') {
                    padSynth.set({ oscillator: { type: 'fatsawtooth', spread: 20, count: 3 } });
                } else {
                    padSynth.set({ oscillator: { type: targetType } });
                }
            }
        }

        /**
         * Apply effects based on current profile
         */
        function applyEffects(profile, rampSec) {
            const fx = profile.effects || {};
            rampSec = rampSec || 5;

            // Reverb
            if (fx.reverbDecay !== undefined) {
                // Reverb decay can't be ramped, set directly
                padReverb.decay = fx.reverbDecay || 3;
                melodyReverb.decay = fx.reverbDecay || 3;
            }
            if (fx.reverbWet !== undefined) {
                padReverb.wet.rampTo(fx.reverbWet, rampSec);
                melodyReverb.wet.rampTo(fx.reverbWet, rampSec);
            }

            // Delay
            if (fx.delayTime !== undefined) {
                melodyDelay.delayTime.rampTo(fx.delayTime || 0.25, rampSec);
            }
            if (fx.delayWet !== undefined) {
                melodyDelay.wet.rampTo(fx.delayWet || 0.1, rampSec);
            }

            // Chorus
            if (fx.chorusFreq !== undefined) {
                padChorus.frequency.value = fx.chorusFreq || 1.5;
            }
            if (fx.chorusWet !== undefined) {
                padChorus.wet.rampTo(fx.chorusWet || 0, rampSec);
            }
        }

        /**
         * Generate next melody note based on scale and activity level
         */
        function getNextMelodyNote() {
            // During transitions, blend old and target scales
            const cfProgress = engineState.scaleCrossfadeProgress;
            let scale;
            if (cfProgress < 1 && engineState.oldScale.length > 0 && engineState.targetScale.length > 0) {
                // Probabilistically pick from old or new scale
                scale = Math.random() < cfProgress ? engineState.targetScale : engineState.oldScale;
            } else {
                scale = engineState.scale;
            }
            if (!scale || scale.length === 0) return null;

            const activity = engineState.current.melodicActivity;

            // Low activity = stay near center of scale, big intervals rare
            // High activity = explore full range, more varied intervals
            const range = Math.floor(scale.length * (0.3 + activity * 0.7));
            const center = Math.floor(scale.length / 2);
            const minIdx = Math.max(0, center - Math.floor(range / 2));
            const maxIdx = Math.min(scale.length - 1, minIdx + range);

            // Weighted random: prefer stepwise motion (interval 1-2)
            const currentIdx = Math.min(engineState.melodyIndex, scale.length - 1);
            const intervals = [-2, -1, 0, 1, 2, 3, -3];
            const weights = [0.1, 0.25, 0.15, 0.25, 0.1, 0.08, 0.07];

            // Select interval
            const rand = Math.random();
            let cumulative = 0;
            let selectedInterval = 1;
            for (let i = 0; i < intervals.length; i++) {
                cumulative += weights[i];
                if (rand <= cumulative) {
                    selectedInterval = intervals[i];
                    break;
                }
            }

            let newIdx = currentIdx + selectedInterval;
            newIdx = Math.max(minIdx, Math.min(maxIdx, newIdx));
            engineState.melodyIndex = newIdx;

            return scale[newIdx];
        }

        /**
         * Get melody note duration based on activity and BPM
         */
        function getMelodyDuration() {
            const activity = engineState.current.melodicActivity;
            // Low activity: whole/half notes
            // High activity: quarter/eighth notes
            const durations = ['1n', '2n', '2n.', '4n', '4n.', '8n'];
            const weights_slow = [0.3, 0.35, 0.15, 0.15, 0.05, 0.0];
            const weights_fast = [0.0, 0.1, 0.1, 0.35, 0.25, 0.2];

            // Interpolate weights based on activity
            const weights = weights_slow.map((w, i) =>
                w * (1 - activity) + weights_fast[i] * activity
            );

            const rand = Math.random();
            let cumulative = 0;
            for (let i = 0; i < durations.length; i++) {
                cumulative += weights[i];
                if (rand <= cumulative) return durations[i];
            }
            return '4n';
        }

        /**
         * Decide whether to play melody note (or rest)
         */
        function shouldPlayMelody() {
            const activity = engineState.current.melodicActivity;
            // More activity = higher chance of playing
            return Math.random() < (0.3 + activity * 0.5);
        }

        // ========================================================
        // SEQUENCER / TRANSPORT LOOPS
        // ========================================================

        let melodyLoop = null;
        let rhythmLoop = null;
        let chordLoop = null;
        let variationLoop = null;

        /**
         * Start all musical loops
         */
        function startMusicalLoops() {
            // MELODY LOOP - plays notes from scale
            melodyLoop = new Tone.Loop((time) => {
                if (!engineState.isPlaying) return;
                if (!shouldPlayMelody()) return;

                const note = getNextMelodyNote();
                if (note) {
                    const duration = getMelodyDuration();
                    // Dynamic velocity based on dynamicRange
                    const baseVel = 0.4;
                    const range = engineState.current.dynamicRange;
                    const velocity = baseVel + (Math.random() * range * 0.4);
                    melodySynth.triggerAttackRelease(note, duration, time, velocity);
                }
            }, '4n'); // Evaluate every quarter note

            // RHYTHM LOOP - subtle percussive pulses
            rhythmLoop = new Tone.Loop((time) => {
                if (!engineState.isPlaying) return;
                const density = engineState.current.rhythmDensity;
                if (Math.random() > density) return;

                // Vary volume for organic feel
                const vel = 0.1 + (Math.random() * 0.15);
                rhythmNoise.triggerAttackRelease('16n', time, vel);
            }, '8n');

            // CHORD PROGRESSION LOOP - change chord every N bars
            // During transitions, crossfade between old and target chords
            chordLoop = new Tone.Loop((time) => {
                if (!engineState.isPlaying) return;

                // Pick chord source based on crossfade progress
                const cfProgress = engineState.scaleCrossfadeProgress;
                let chords;
                if (cfProgress < 1 && engineState.oldChords.length > 0 && engineState.targetChords.length > 0) {
                    chords = Math.random() < cfProgress ? engineState.targetChords : engineState.oldChords;
                } else {
                    chords = engineState.chords;
                }
                if (!chords || chords.length === 0) return;

                // Release previous chord gently
                padSynth.releaseAll(time);

                // Play next chord
                const chordIdx = engineState.chordIndex % chords.length;
                const chord = chords[chordIdx];
                if (chord && chord.length > 0) {
                    const vel = 0.35 + (engineState.current.harmonicComplexity * 0.2);
                    padSynth.triggerAttack(chord, time, vel);
                }
                engineState.chordIndex++;
            }, '2m'); // Change chord every 2 measures

            // PROCEDURAL VARIATION LOOP - prevents auditory fatigue
            variationLoop = new Tone.Loop((time) => {
                if (!engineState.isPlaying) return;

                // Subtle filter wobble on noise
                const currentNoiseFreq = ambientFilter.frequency.value;
                const variation = (Math.random() - 0.5) * 80;
                ambientFilter.frequency.rampTo(
                    Math.max(100, currentNoiseFreq + variation), 15
                );

                // Subtle pad volume breathing
                const padVol = padGain.gain.value;
                const padVar = padVol * (0.95 + Math.random() * 0.1);
                padGain.gain.rampTo(padVar, 10);

                // Occasional melody octave shift
                if (Math.random() < 0.15 && engineState.scale.length > 7) {
                    const shift = Math.random() < 0.5 ? -7 : 7;
                    let newIdx = engineState.melodyIndex + shift;
                    newIdx = Math.max(0, Math.min(engineState.scale.length - 1, newIdx));
                    engineState.melodyIndex = newIdx;
                }
            }, '8m'); // Every 8 measures (~30-60 seconds depending on BPM)

            // Start all loops
            melodyLoop.start(0);
            rhythmLoop.start(0);
            chordLoop.start(0);
            variationLoop.start(0);
        }

        /**
         * Stop all musical loops
         */
        function stopMusicalLoops() {
            if (melodyLoop) { melodyLoop.stop(); melodyLoop.dispose(); melodyLoop = null; }
            if (rhythmLoop) { rhythmLoop.stop(); rhythmLoop.dispose(); rhythmLoop = null; }
            if (chordLoop) { chordLoop.stop(); chordLoop.dispose(); chordLoop = null; }
            if (variationLoop) { variationLoop.stop(); variationLoop.dispose(); variationLoop = null; }
        }

        // ========================================================
        // CORE FUNCTIONS
        // ========================================================

        /**
         * Start the music engine with given profile
         */
        function startMusic(initialProfile, scale, chords) {
            if (engineState.isPlaying) return;

            Tone.start().then(() => {
                // Set master volume
                Tone.Destination.volume.value = Tone.gainToDb(engineState.volume);

                // Store scale and chords
                engineState.scale = scale || [];
                engineState.chords = chords || [];
                engineState.chordIndex = 0;
                engineState.melodyIndex = Math.floor(engineState.scale.length / 2);

                // Apply initial profile
                applyMusicProfile(initialProfile);

                // Set BPM
                Tone.Transport.bpm.value = initialProfile.tempoBPM || 72;

                // Start binaural
                binauralLeft.start();
                binauralRight.start();

                // Start ambient
                ambientNoise.start();

                // Start drone
                const droneNote = engineState.scale[0] || 'C2';
                // Get root note an octave lower for the drone
                droneSynth.triggerAttack(droneNote);

                // Start musical loops
                startMusicalLoops();

                // Start transport
                Tone.Transport.start();

                engineState.isPlaying = true;
                engineState.currentProfile = initialProfile;
                sendLog('Music engine started - 5 layers active');
            }).catch(err => {
                sendLog('ERROR starting Tone.js: ' + err.message);
            });
        }

        /**
         * Stop the music engine
         */
        function stopMusic() {
            if (!engineState.isPlaying) return;

            Tone.Transport.stop();
            stopMusicalLoops();

            binauralLeft.stop();
            binauralRight.stop();
            ambientNoise.stop();
            droneSynth.triggerRelease();
            padSynth.releaseAll();

            // Clear transition timer
            if (engineState.transitionTimer) {
                clearInterval(engineState.transitionTimer);
                engineState.transitionTimer = null;
            }

            engineState.isPlaying = false;
            sendLog('Music engine stopped');
        }

        /**
         * Apply a music profile to all layers
         */
        function applyMusicProfile(profile, rampSec) {
            if (!profile) return;
            rampSec = rampSec || 5;

            // Update current state
            engineState.current.tempoBPM = profile.tempoBPM || 72;
            engineState.current.timbreBrightness = profile.timbreBrightness || 0.4;
            engineState.current.harmonicComplexity = profile.harmonicComplexity || 0.3;
            engineState.current.rhythmDensity = profile.rhythmDensity || 0.3;
            engineState.current.melodicActivity = profile.melodicActivity || 0.25;
            engineState.current.dynamicRange = profile.dynamicRange || 0.2;

            // Apply timbre with dynamic ramp
            applyTimbre(profile.timbreBrightness || 0.4, rampSec);

            // Apply effects
            applyEffects(profile, rampSec);

            // Set rhythm gain based on density
            rhythmGain.gain.rampTo(0.03 + (profile.rhythmDensity || 0.3) * 0.12, rampSec);

            // Set melody gain based on activity
            melodyGain.gain.rampTo(0.08 + (profile.melodicActivity || 0.25) * 0.15, rampSec);

            // Set pad gain based on complexity
            padGain.gain.rampTo(0.1 + (profile.harmonicComplexity || 0.3) * 0.15, rampSec);
        }

        /**
         * Set binaural beat frequencies
         */
        let lastBinauralLog = 0;

        function setBinaural(binauralFreq, carrierFreq, rampTime) {
            rampTime = rampTime || 10;
            engineState.current.binauralFreq = binauralFreq;
            engineState.current.carrierFreq = carrierFreq;

            binauralLeft.frequency.rampTo(carrierFreq, rampTime);
            binauralRight.frequency.rampTo(carrierFreq + binauralFreq, rampTime);

            // Throttle binaural logs to every 10 seconds
            const now = Date.now();
            if (now - lastBinauralLog > 10000) {
                lastBinauralLog = now;
                sendLog('Binaural: ' + binauralFreq.toFixed(1) + 'Hz beat, ' + carrierFreq.toFixed(0) + 'Hz carrier');
            }
        }

        /**
         * ISO Principle: Transition from current to target profile over time
         * Linearly interpolates ALL musical parameters
         */
        function startTransition(targetProfile, targetScale, targetChords,
                                  targetBinauralFreq, targetCarrierFreq,
                                  durationSeconds) {
            // Store initial snapshot for interpolation
            const startSnapshot = {
                tempoBPM: engineState.current.tempoBPM,
                timbreBrightness: engineState.current.timbreBrightness,
                harmonicComplexity: engineState.current.harmonicComplexity,
                rhythmDensity: engineState.current.rhythmDensity,
                melodicActivity: engineState.current.melodicActivity,
                dynamicRange: engineState.current.dynamicRange,
                binauralFreq: engineState.current.binauralFreq,
                carrierFreq: engineState.current.carrierFreq,
                effects: { ...(engineState.currentProfile?.effects || {}) },
            };

            engineState.targetProfile = targetProfile;
            engineState.transitionDuration = durationSeconds;
            engineState.transitionStartTime = Tone.now();
            engineState.transitionProgress = 0;

            // Clear any existing transition
            if (engineState.transitionTimer) {
                clearInterval(engineState.transitionTimer);
            }

            // Gradual scale/chord crossfade instead of immediate swap
            // The melody and chord loops will probabilistically blend
            // old and target scales/chords based on crossfade progress
            engineState.oldScale = [...engineState.scale];
            engineState.oldChords = [...engineState.chords];
            engineState.targetScale = targetScale || engineState.scale;
            engineState.targetChords = targetChords || engineState.chords;
            engineState.scaleCrossfadeProgress = 0;
            // Keep current scale as reference, will be updated at completion
            engineState.melodyIndex = Math.min(
                engineState.melodyIndex,
                Math.max((targetScale || engineState.scale).length - 1, 0)
            );

            // Ultra-smooth transition: 500ms ticks with 3s Tone.js ramps
            // Each ramp overlaps the next tick, creating continuous interpolation
            const UPDATE_INTERVAL = 500; // ms
            const RAMP_SEC = 3; // Longer ramps = smoother overlap between ticks
            engineState.transitionTimer = setInterval(() => {
                const elapsed = Tone.now() - engineState.transitionStartTime;
                const progress = Math.min(1, elapsed / durationSeconds);
                engineState.transitionProgress = progress;

                // Lerp helper
                const lerp = (a, b, t) => a + (b - a) * t;

                // Smootherstep easing (Ken Perlin, 5th order polynomial)
                // C2 continuity: zero 1st AND 2nd derivatives at t=0 and t=1
                // Produces imperceptible entry/exit from the transition
                const t = progress;
                const baseEased = t * t * t * (t * (t * 6 - 15) + 10);

                // Organic micro-variation: subtle jitter (±1.5% of delta)
                // Strongest in the middle of the transition, zero at endpoints
                const jitter = (Math.random() - 0.5) * 0.03;
                const bellShape = 1 - Math.abs(2 * baseEased - 1); // peaks at eased=0.5
                const eased = Math.max(0, Math.min(1, baseEased + jitter * bellShape));

                // Update scale crossfade progress (follows the main easing)
                engineState.scaleCrossfadeProgress = eased;

                // Interpolate all musical parameters
                const interpolated = {
                    tempoBPM: lerp(startSnapshot.tempoBPM, targetProfile.tempoBPM, eased),
                    timbreBrightness: lerp(startSnapshot.timbreBrightness, targetProfile.timbreBrightness, eased),
                    harmonicComplexity: lerp(startSnapshot.harmonicComplexity, targetProfile.harmonicComplexity, eased),
                    rhythmDensity: lerp(startSnapshot.rhythmDensity, targetProfile.rhythmDensity, eased),
                    melodicActivity: lerp(startSnapshot.melodicActivity, targetProfile.melodicActivity, eased),
                    dynamicRange: lerp(startSnapshot.dynamicRange, targetProfile.dynamicRange, eased),
                    effects: {},
                };

                // Interpolate effects
                const startFx = startSnapshot.effects;
                const targetFx = targetProfile.effects || {};
                interpolated.effects.reverbDecay = lerp(startFx.reverbDecay || 3, targetFx.reverbDecay || 3, eased);
                interpolated.effects.reverbWet = lerp(startFx.reverbWet || 0.3, targetFx.reverbWet || 0.3, eased);
                interpolated.effects.delayTime = lerp(startFx.delayTime || 0.25, targetFx.delayTime || 0.25, eased);
                interpolated.effects.delayWet = lerp(startFx.delayWet || 0.1, targetFx.delayWet || 0.1, eased);
                interpolated.effects.chorusWet = lerp(startFx.chorusWet || 0, targetFx.chorusWet || 0, eased);

                // Apply interpolated profile with dynamic ramp time
                applyMusicProfile(interpolated, RAMP_SEC);

                // BPM ramp (slightly longer to avoid tempo glitches)
                Tone.Transport.bpm.rampTo(interpolated.tempoBPM, RAMP_SEC);

                // Binaural ramp
                const interpBinaural = lerp(startSnapshot.binauralFreq, targetBinauralFreq, eased);
                const interpCarrier = lerp(startSnapshot.carrierFreq, targetCarrierFreq, eased);
                setBinaural(interpBinaural, interpCarrier, RAMP_SEC);

                // Send progress to React Native
                sendProgress(progress);

                // Transition complete
                if (progress >= 1) {
                    clearInterval(engineState.transitionTimer);
                    engineState.transitionTimer = null;
                    engineState.currentProfile = targetProfile;
                    // Finalize scale/chord crossfade
                    engineState.scale = engineState.targetScale;
                    engineState.chords = engineState.targetChords;
                    engineState.scaleCrossfadeProgress = 1;
                    engineState.oldScale = [];
                    engineState.oldChords = [];
                    sendLog('Transition complete - arrived at target state');
                    sendMessage({ type: 'TRANSITION_COMPLETE' });
                }
            }, UPDATE_INTERVAL);

            sendLog('ISO Transition started: ' + durationSeconds + 's, ' +
                    startSnapshot.tempoBPM.toFixed(0) + 'BPM -> ' +
                    targetProfile.tempoBPM + 'BPM');
        }

        /**
         * Pause the transport (keeps state)
         */
        function pauseMusic() {
            Tone.Transport.pause();
            binauralLeft.stop();
            binauralRight.stop();
            ambientNoise.stop();
            sendLog('Music paused');
        }

        /**
         * Resume after pause
         */
        function resumeMusic() {
            binauralLeft.start();
            binauralRight.start();
            ambientNoise.start();
            Tone.Transport.start();
            sendLog('Music resumed');
        }

        /**
         * Set master volume (0-1)
         */
        function setVolume(vol) {
            engineState.volume = Math.max(0, Math.min(1, vol));
            Tone.Destination.volume.rampTo(Tone.gainToDb(engineState.volume), 0.5);
            sendLog('Volume: ' + (engineState.volume * 100).toFixed(0) + '%');
        }

        // ========================================================
        // COMMUNICATION WITH REACT NATIVE
        // ========================================================

        function sendLog(message) {
            sendMessage({ type: 'LOG', message: message, timestamp: Date.now() });
        }

        function sendProgress(progress) {
            sendMessage({
                type: 'TRANSITION_PROGRESS',
                progress: progress,
                timestamp: Date.now()
            });
        }

        function sendMessage(data) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify(data));
            }
        }

        // ========================================================
        // MESSAGE HANDLER (receives commands from React Native)
        // ========================================================

        window.addEventListener("message", (event) => {
            try {
                const data = JSON.parse(event.data);

                switch(data.type) {
                    case 'START_MUSIC':
                        startMusic(
                            data.initialProfile,
                            data.scale,
                            data.chords
                        );
                        // If binaural params provided, set them
                        if (data.binauralFreq !== undefined) {
                            setBinaural(data.binauralFreq, data.carrierFreq || 200, 2);
                        }
                        break;

                    case 'TRANSITION':
                        startTransition(
                            data.targetProfile,
                            data.targetScale,
                            data.targetChords,
                            data.targetBinauralFreq || 10,
                            data.targetCarrierFreq || 200,
                            data.durationSeconds || 60
                        );
                        break;

                    case 'STOP':
                        stopMusic();
                        break;

                    case 'PAUSE':
                        pauseMusic();
                        break;

                    case 'RESUME':
                        resumeMusic();
                        break;

                    case 'VOLUME':
                        setVolume(data.volume);
                        break;

                    case 'SET_PROFILE':
                        applyMusicProfile(data.profile);
                        if (data.scale) engineState.scale = data.scale;
                        if (data.chords) engineState.chords = data.chords;
                        break;

                    default:
                        sendLog('Unknown command: ' + data.type);
                }
            } catch (error) {
                sendLog('Error processing message: ' + error.message);
            }
        });

        // Android WebView uses different event
        document.addEventListener("message", (event) => {
            // Re-dispatch to window handler
            window.dispatchEvent(new MessageEvent('message', { data: event.data }));
        });

        // ========================================================
        // INIT
        // ========================================================
        document.addEventListener('DOMContentLoaded', () => {
            sendLog('NeuroFlow Music Engine v2.0 ready');
            sendMessage({ type: 'ENGINE_READY' });
        });

    </script>
</body>
</html>
`;
