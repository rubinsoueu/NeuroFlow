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
            currentProfile: null, // Full profile (initialState or targetState)
            targetProfile: null,  // Full profile (targetState)
            transitionProgress: 0,    // 0 to 1
            transitionDuration: 60,   // seconds
            transitionStartTime: null,
            transitionTimer: null,
            volume: 0.7,
            // Current musical state (interpolated during transition)
            current: { // These will be directly interpolated values
                tempoBPM: 72,
                timbreBrightness: 0.4,
                harmonicComplexity: 0.3,
                rhythmDensity: 0.3,
                melodicActivity: 0.25,
                dynamicRange: 0.2,
                binauralFreq: 10,
                carrierFreq: 200,
                // Effects are now part of the music profile
                reverbDecay: 3.0,
                reverbWet: 0.35,
                delayTime: 0.25,
                delayWet: 0.08,
                chorusFreq: 0.0,
                chorusWet: 0.0,
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
            frequency: 200, // Initial value, will be set by profile
            volume: -20,
        });
        const binauralRight = new Tone.Oscillator({
            type: 'sine',
            frequency: 210, // Initial value, will be set by profile
            volume: -20,
        });

        // Connect L/R to separate channels
        const leftGain = new Tone.Gain(1);
        const rightGain = new Tone.Gain(1);
        binauralLeft.connect(leftGain);
        binauralRight.connect(rightGain);
        leftGain.connect(binauralMerger, 0, 0);
        rightGain.connect(binauralMerger, 0, 1);

        // ========================================================\
        // LAYER 2: AMBIENT TEXTURE (filtered noise + drone)\
        // ========================================================\
        const ambientNoise = new Tone.Noise('pink');
        const ambientFilter = new Tone.Filter({
            type: 'lowpass',
            frequency: 500, // Initial value, will be set by profile
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
        const droneFilter = new Tone.Filter({ type: 'lowpass', frequency: 200 }); // Initial value
        droneSynth.connect(droneFilter);
        droneFilter.connect(droneGain);

        // ========================================================\
        // LAYER 3: SUBTLE RHYTHM (shaped noise pulses)\
        // ========================================================\
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
            frequency: 3000, // Initial value
            Q: 2,
        });
        const rhythmGain = new Tone.Gain(0.08).toDestination();
        rhythmNoise.connect(rhythmFilter);
        rhythmFilter.connect(rhythmGain);

        // ========================================================\
        // LAYER 4: HARMONY / PAD (chord progressions)\
        // ========================================================\
        const padSynth = new Tone.PolySynth(Tone.Synth, {
            maxPolyphony: 8,
            oscillator: { type: 'sine' }, // Will be set by profile
            envelope: {
                attack: 3,
                decay: 1,
                sustain: 0.8,
                release: 4,
            },
        });
        const padFilter = new Tone.Filter({
            type: 'lowpass',
            frequency: 800, // Initial value
            rolloff: -12,
        });
        const padReverb = new Tone.Reverb({ decay: 4, wet: 0.4 }); // Initial values
        const padChorus = new Tone.Chorus({
            frequency: 1.5, // Initial values
            delayTime: 3.5,
            depth: 0.7,
            wet: 0.15,
        });
        const padGain = new Tone.Gain(0.18).toDestination();
        padSynth.connect(padFilter);
        padFilter.connect(padReverb);
        padReverb.connect(padChorus);
        padChorus.connect(padGain);

        // ========================================================\
        // LAYER 5: PROCEDURAL MELODY (FM synth, arpeggios)\
        // ========================================================\
        const melodySynth = new Tone.FMSynth({
            harmonicity: 3,       // Initial value
            modulationIndex: 0.8, // Initial value
            oscillator: { type: 'sine' }, // Initial value
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
        const melodyReverb = new Tone.Reverb({ decay: 3, wet: 0.35 }); // Initial values
        const melodyDelay = new Tone.FeedbackDelay({
            delayTime: 0.25, // Initial values
            feedback: 0.15,
            wet: 0.1,
        });
        const melodyGain = new Tone.Gain(0.15).toDestination();
        melodySynth.connect(melodyReverb);
        melodyReverb.connect(melodyDelay);
        melodyDelay.connect(melodyGain);

        // ========================================================\
        // MASTER EFFECTS & VOLUME\
        // ========================================================\
        // (each layer routes to destination individually for
        //  independent volume control)

        // ========================================================\
        // MUSICAL LOGIC\
        // ========================================================\

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
         * Apply effects based on current profile's effects parameters
         */
        function applyEffects(effectsParams, rampSec) { // Now accepts effectsParams directly
            const fx = effectsParams || {};
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
         * Start the music engine with given profile, scale, and chords
         */
        function startMusic(initialFullProfile, scale, chords) { // Accepts full initial profile
            if (engineState.isPlaying) return;

            Tone.start().then(() => {
                // Set master volume
                Tone.Destination.volume.value = Tone.gainToDb(engineState.volume);

                // Store scale and chords
                engineState.scale = scale || [];
                engineState.chords = chords || [];
                engineState.chordIndex = 0;
                engineState.melodyIndex = Math.floor(engineState.scale.length / 2);

                // Apply initial music profile
                applyMusicProfile(initialFullProfile.musicProfile); // Pass only musicProfile

                // Set BPM
                Tone.Transport.bpm.value = initialFullProfile.musicProfile.tempoBPM || 72;

                // Start binaural with initial brainwave params
                setBinaural(
                    initialFullProfile.brainwave.baseFrequency || 10,
                    initialFullProfile.brainwave.carrierFrequency || 200,
                    2 // quick ramp for start
                );
                binauralLeft.start();
                binauralRight.start();

                // Start ambient
                ambientNoise.start();

                // Start drone
                const droneNote = engineState.scale[0] || 'C2'; // Use the root of the scale
                droneSynth.triggerAttack(droneNote);

                // Start musical loops
                startMusicalLoops();

                // Start transport
                Tone.Transport.start();

                engineState.isPlaying = true;
                engineState.currentProfile = initialFullProfile; // Store full profile
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
        function applyMusicProfile(musicProfile, rampSec) { // Renamed to musicProfile
            if (!musicProfile) return;
            rampSec = rampSec || 5;

            // Update current state
            engineState.current.tempoBPM = musicProfile.tempoBPM || 72;
            engineState.current.timbreBrightness = musicProfile.timbreBrightness || 0.4;
            engineState.current.harmonicComplexity = musicProfile.harmonicComplexity || 0.3;
            engineState.current.rhythmDensity = musicProfile.rhythmDensity || 0.3;
            engineState.current.melodicActivity = musicProfile.melodicActivity || 0.25;
            engineState.current.dynamicRange = musicProfile.dynamicRange || 0.2;

            // Apply timbre with dynamic ramp
            applyTimbre(musicProfile.timbreBrightness || 0.4, rampSec);

            // Apply effects
            applyEffects(musicProfile.effects, rampSec); // Pass only effects parameters

            // Set rhythm gain based on density
            rhythmGain.gain.rampTo(0.03 + (musicProfile.rhythmDensity || 0.3) * 0.12, rampSec);

            // Set melody gain based on activity
            melodyGain.gain.rampTo(0.08 + (musicProfile.melodicActivity || 0.25) * 0.15, rampSec);

            // Set pad gain based on complexity
            padGain.gain.rampTo(0.1 + (musicProfile.harmonicComplexity || 0.3) * 0.15, rampSec);
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
        function startTransition(targetFullProfile, targetScale, targetChords, durationSeconds) { // Accepts full target profile
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
                effects: { ...(engineState.currentProfile?.musicProfile?.effects || {}) }, // Use musicProfile.effects
            };

            engineState.targetProfile = targetFullProfile; // Store full profile
            engineState.transitionDuration = durationSeconds;
            engineState.transitionStartTime = Tone.now();
            engineState.transitionProgress = 0;

            // Clear any existing transition
            if (engineState.transitionTimer) {
                clearInterval(engineState.transitionTimer);
            }

            // Gradual scale/chord crossfade instead of immediate swap
            engineState.oldScale = [...engineState.scale];
            engineState.oldChords = [...engineState.chords];
            engineState.targetScale = targetScale || engineState.scale;
            engineState.targetChords = targetChords || engineState.chords;
            engineState.scaleCrossfadeProgress = 0;
            engineState.melodyIndex = Math.min(
                engineState.melodyIndex,
                Math.max((targetScale || engineState.scale).length - 1, 0)
            );

            const UPDATE_INTERVAL = 500; // ms
            const RAMP_SEC = 3; 
            engineState.transitionTimer = setInterval(() => {
                const elapsed = Tone.now() - engineState.transitionStartTime;
                const progress = Math.min(1, elapsed / durationSeconds);
                engineState.transitionProgress = progress;

                const lerp = (a, b, t) => a + (b - a) * t;

                const t = progress;
                const baseEased = t * t * t * (t * (t * 6 - 15) + 10);

                const jitter = (Math.random() - 0.5) * 0.03;
                const bellShape = 1 - Math.abs(2 * baseEased - 1); 
                const eased = Math.max(0, Math.min(1, baseEased + jitter * bellShape));

                engineState.scaleCrossfadeProgress = eased;

                // Interpolate all musical parameters using targetFullProfile.musicProfile
                const interpolatedMusicProfile = {
                    tempoBPM: lerp(startSnapshot.tempoBPM, targetFullProfile.musicProfile.tempoBPM, eased),
                    timbreBrightness: lerp(startSnapshot.timbreBrightness, targetFullProfile.musicProfile.timbreBrightness, eased),
                    harmonicComplexity: lerp(startSnapshot.harmonicComplexity, targetFullProfile.musicProfile.harmonicComplexity, eased),
                    rhythmDensity: lerp(startSnapshot.rhythmDensity, targetFullProfile.musicProfile.rhythmDensity, eased),
                    melodicActivity: lerp(startSnapshot.melodicActivity, targetFullProfile.musicProfile.melodicActivity, eased),
                    dynamicRange: lerp(startSnapshot.dynamicRange, targetFullProfile.musicProfile.dynamicRange, eased),
                    effects: {}, // Placeholder, will be interpolated below
                };

                // Interpolate effects
                const startFx = startSnapshot.effects;
                const targetFx = targetFullProfile.musicProfile.effects || {};
                interpolatedMusicProfile.effects.reverbDecay = lerp(startFx.reverbDecay || 3, targetFx.reverbDecay || 3, eased);
                interpolatedMusicProfile.effects.reverbWet = lerp(startFx.reverbWet || 0.3, targetFx.reverbWet || 0.3, eased);
                interpolatedMusicProfile.effects.delayTime = lerp(startFx.delayTime || 0.25, targetFx.delayTime || 0.25, eased);
                interpolatedMusicProfile.effects.delayWet = lerp(startFx.delayWet || 0.1, targetFx.delayWet || 0.1, eased);
                interpolatedMusicProfile.effects.chorusWet = lerp(startFx.chorusWet || 0, targetFx.chorusWet || 0, eased);

                // Apply interpolated music profile
                applyMusicProfile(interpolatedMusicProfile, RAMP_SEC);

                // BPM ramp 
                Tone.Transport.bpm.rampTo(interpolatedMusicProfile.tempoBPM, RAMP_SEC);

                // Binaural ramp using targetFullProfile.brainwave
                const interpBinaural = lerp(startSnapshot.binauralFreq, targetFullProfile.brainwave.targetFrequency, eased);
                const interpCarrier = lerp(startSnapshot.carrierFreq, targetFullProfile.brainwave.carrierFrequency, eased);
                setBinaural(interpBinaural, interpCarrier, RAMP_SEC);

                sendProgress(progress);

                if (progress >= 1) {
                    clearInterval(engineState.transitionTimer);
                    engineState.transitionTimer = null;
                    engineState.currentProfile = targetFullProfile; // Store full profile
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
                    targetFullProfile.musicProfile.tempoBPM + 'BPM');
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

        // ========================================================\
        // COMMUNICATION WITH REACT NATIVE\
        // ========================================================\

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

        // ========================================================\
        // MESSAGE HANDLER (receives commands from React Native)\
        // ========================================================\

        window.addEventListener("message", (event) => {
            try {
                const data = JSON.parse(event.data);

                switch(data.type) {
                    case 'START_MUSIC':
                        startMusic(
                            data.initialProfile, // Passa o perfil COMPLETO
                            data.scale,
                            data.chords
                        );
                        break;

                    case 'TRANSITION':
                        startTransition(
                            data.targetProfile, // Passa o perfil COMPLETO
                            data.targetScale,
                            data.targetChords,
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

        // ========================================================\
        // INIT\
        // ========================================================\
        document.addEventListener('DOMContentLoaded', () => {
            sendLog('NeuroFlow Music Engine v2.0 ready');
            sendMessage({ type: 'ENGINE_READY' });
        });

    </script>
</body>
</html>
`;