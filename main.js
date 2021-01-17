const MIN_NOTE_DURATION = 100;

var voice = new Wad({
    source: 'mic'
});
var pitch = new Wad({
    source: 'mic'
});
var recording;
var polywad = new Wad.Poly({
    recorder: {
        options: { mimeType : 'audio/webm' },
        onstop: function(event) {
            let blob = new Blob(this.recorder.chunks, { 'type' : 'audio/webm;codecs=opus' });
            $('#download-rec').prop('disabled', false);
            $('#download-rec').click(e => {
                window.open(URL.createObjectURL(blob));
                recording = new Wad({source:URL.createObjectURL(blob)});
                console.log(recording);
            });
        }
    }
});
polywad.add(voice);
var polyharm = new Wad.Poly({
    recorder: {
        options: { mimeType : 'audio/webm' },
        onstop: function(event) {
            let blob = new Blob(this.recorder.chunks, { 'type' : 'audio/webm;codecs=opus' });
            console.log(blob);
            $('#download-harm').prop('disabled', false);
            $('#download-harm').click(e => {
                window.open(URL.createObjectURL(blob));
            });
        }
    }
});
var tone = new Wad(Wad.presets.piano);
polyharm.add(tone);
var click = new Wad(Wad.presets.snare);

var abortRecording = false;
var bars = [];
var key;
var numBars;

const LETTER_SHARPS = {
    "C": 0,
    "C#": 1,
    "D": 2,
    "D#": 3,
    "E": 4,
    "F": 5,
    "F#": 6,
    "G": 7,
    "G#": 8,
    "A": 9,
    "A#": 10,
    "B": 11
};

const LETTER_SHARPS_INV = {
    0: "C",
    1: "C#",
    2: "D",
    3: "D#",
    4: "E",
    5: "F",
    6: "F#",
    7: "G",
    8: "G#",
    9: "A",
    10: "A#",
    11: "B"
};

const UNSIGNED_KEY_NAMES = {
    "C": 0,
    "C sharp / D flat": 1,
    "D": 2,
    "D sharp / E flat": 3,
    "E": 4,
    "F": 5,
    "F sharp / G flat": 6,
    "G": 7,
    "G sharp / A flat": 8,
    "A": 9,
    "A sharp / B flat": 10,
    "B / C flat": 11
}

function getNote(noteName) {
    const octave = parseInt(noteName.slice(-1));
    const letter = LETTER_SHARPS[noteName.slice(0, -1)];

    return new Note(letter, octave);
}

$(document).ready(() => {
    for (let k in UNSIGNED_KEY_NAMES) {
        $('#letter').append($('<option></option>').val(UNSIGNED_KEY_NAMES[k]).html(k));
    }
    $('#sign').append($('<option></option>').val(true).html('Major'));
    $('#sign').append($('<option></option>').val(false).html('minor'));
    for (i = 1; i <= 16; i++) {
        $('#bars').append($('<option></option>').val(i).html(i));
    }
    $('#bars').val(4);

    for (i = 1; i <= 6; i++) {
        $('#bpb').append($('<option></option>').val(i).html(i));
    }
    $('#bpb').val(4);

    $('#tempo').val(60);

    $('#record').click(() => {
        $('#download-rec').prop('disabled', true);
        $('#download-harm').prop('disabled', true);
        var recordingStart;
        var sustainedNoteName;
        var sustainedNoteStart;
        var bar = [];
        bars = [];
        var currentBar;
        var barDuration;
        var clickTrackCounter;
        var currentBeatStart;

        $('#record').addClass('active');
        $('#record').prop('disabled', true);
        $('#abort').prop('disabled', false);

        console.log("Attempting to record audio");

        var tuner = new Wad.Poly();
        tuner.setVolume(0);
        tuner.add(pitch);
 
        numBars = $('#bars').val();
        const bpb = $('#bpb').val();
        const tempo = $('#tempo').val();
        key = new Key(parseInt($('#letter').val()), $('#sign').val() == "true");
        console.log(key);

        voice.play();
        pitch.play();
        polywad.recorder.start();
        tuner.updatePitch();

        const beatDuration = 60000 / tempo;
        barDuration = beatDuration * bpb;
        currentBar = 0;
        recordingStart = new Date().getTime();
        currentBarStart = recordingStart;
        sustainedNoteStart = recordingStart + barDuration;
        clickTrackCounter = 1;
        currentBeatStart = recordingStart;

        var logPitch = () => {
            if (abortRecording) {
                click.stop();
                tone.stop();
                abortRecording = false;
                return;
            }

            if (clickTrackCounter > bpb) {
                if (tuner.noteName) {
                    if (tuner.noteName != sustainedNoteName) {
                        const note = getNote(tuner.noteName);
                        sustainedNoteName = tuner.noteName;
                        const noteDuration = new Date().getTime() - sustainedNoteStart;
                        note.duration = noteDuration / barDuration;
                        if (noteDuration >= MIN_NOTE_DURATION) {
                            bar.push(note);
                            sustainedNoteStart = new Date().getTime();
                            console.log(note);
                        }
                    }
                }

            }
        
            const now = new Date().getTime();
            if (now - currentBeatStart >= beatDuration) {
                 if (clickTrackCounter < bpb) {
                    tone.play({pitch: LETTER_SHARPS_INV[$('#letter').val()] + 4});
                    tone.stop();
                } else {
                    click.play();
                    click.stop();
                }

                currentBeatStart = recordingStart + clickTrackCounter * beatDuration;
                clickTrackCounter ++;
            }
            if (now - currentBarStart >= barDuration) {
                if (clickTrackCounter > 2*bpb) {
                    bars.push(bar);
                    bar = [];
                }

                currentBarStart += barDuration;
                currentBar ++;
            }

            if (currentBar > numBars) {
                $('#abort').click();
            }

            requestAnimationFrame(logPitch);
        };

        tone.play({pitch: LETTER_SHARPS_INV[$('#letter').val()] + 4});
        tone.stop();
        logPitch();
    });

    async function synthesizeAlberti(chords) {
        numBars = $('#bars').val();
        const bpb = $('#bpb').val();
        const tempo = $('#tempo').val();

        const beatDuration = 60000 / tempo;
        barDuration = beatDuration * bpb;
        recordingStart = new Date().getTime();
        currentBarStart = recordingStart;

        const noteDuration = beatDuration / 4;
        const totalNotes = bpb * numBars * 4;
        var noteCounter = 0;
        var absoluteNotes = [];

        for (const chord of chords.split(",")) {
            for (i = 0; i < bpb; i++) {
                var prevRelative = 0;
                if (chord in MAJOR_RELATIVE_DIATONICS) {
                    for (const relative of MAJOR_RELATIVE_DIATONICS[chord]) {
                        const absolute = key.tonic + ((relative >= prevRelative) ? relative : relative + 12);
                        absoluteNotes.push(absolute);
                        prevRelative = relative;
                    };
                } else if (chord in MINOR_RELATIVE_DIATONICS) {
                    for (const relative of MINOR_RELATIVE_DIATONICS[chord]) {
                        const absolute = key.tonic + ((relative >= prevRelative) ? relative : relative + 12);
                        absoluteNotes.push(absolute);
                        prevRelative = relative;
                    };
                } else {
                    console.log("DANGER DANGER DANGER NIGHTMARE NIGHTMARE NIGHTMARE");
                }
                absoluteNotes.push(absoluteNotes[absoluteNotes.length - 2]);
            }
        }

        var currentTone = 0;
        let playNext = async () => {
            // tone.stop();
            if (currentTone >= absoluteNotes.length) {
                polyharm.recorder.stop();
                return;
            }
            tone.play({pitch: LETTER_SHARPS_INV[absoluteNotes[currentTone] % 12] + 4});
            currentTone ++;
            await setTimeout(playNext, noteDuration);
        }; 

        polyharm.recorder.start();
        await playNext();
    }

    $('#abort').click(async () => {
        polywad.recorder.stop();
        voice.stop();
        pitch.stop();

        $('#abort').prop('disabled', true);
        $('#record').prop('disabled', false);
        $('#record').removeClass('active');

        abortRecording = true;
        console.log(bars);

        var chordsSoFar = key.sign ? '1' : 'd1';
        var numChordsSoFar = 1;
        for (j = 1; j < numBars; j++) {
            chordsSoFar = await findChord(bars[j], numBars, key, chordsSoFar, numChordsSoFar);
            numChordsSoFar ++;
        }

        await synthesizeAlberti(chordsSoFar);
    });
});
