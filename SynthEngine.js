export const SynthHTML = `
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
</head>
<body>
    <script>
        const synth = new Tone.PolySynth(Tone.Synth).toDestination();
        const filter = new Tone.Filter(200, "lowpass").toDestination();
        synth.connect(filter);

        window.addEventListener("message", (message) => {
            const data = JSON.parse(message.data);
            if (data.type === 'START') { Tone.start(); Tone.Transport.start(); }
            if (data.type === 'ADJUST') {
                Tone.Transport.bpm.rampTo(data.bpm, 10);
                filter.frequency.rampTo(data.frequency, 10);
            }
        });
    </script>
</body>
</html>
`;
