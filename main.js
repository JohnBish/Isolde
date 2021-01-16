const MIN_NOTE_DURATION = 100;

var abortRecording = false;
var bars = [[]];

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

function getNote(noteName) {
    const octave = parseInt(noteName.slice(-1));
    const letter = LETTER_SHARPS[noteName.slice(0, -1)];

    return new Note(letter, octave);
}

$(document).ready(() => {
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
        var recordingStart;
        var sustainedNoteName;
        var sustainedNoteStart;
        var bar = [];
        var currentBar;
        var barDuration;

        $('#record').addClass('active');
        $('#record').prop('disabled', true);
        $('#abort').prop('disabled', false);

        console.log("Attempting to record audio");
        var voice = new Wad({
            source: 'mic'
        });

        var tuner = new Wad.Poly();
        tuner.setVolume(0);
        tuner.add(voice);

        let sine = new Wad({source : 'sine'});

        const numBars = $('#bars').val();
        const bpb = $('#bpb').val();
        const tempo = $('#tempo').val();
        for (i = 0; i < bpb; i++) {
            sine.play();
        }

        voice.play();
        tuner.updatePitch();

        barDuration = 60000 / tempo;
        console.log(barDuration);
        currentBar = 1;
        recordingStart = new Date().getTime();
        console.log(recordingStart);
        sustainedNoteStart = recordingStart;

        var logPitch = () => {
            if (tuner.noteName) {
                if (tuner.noteName != sustainedNoteName) {
                    const note = getNote(tuner.noteName);
                    sustainedNoteName = tuner.noteName;
                    if (new Date().getTime() - sustainedNoteStart >= MIN_NOTE_DURATION) {
                        bar.push(note);
                        sustainedNoteStart = new Date().getTime();
                        console.log(note);
                    }
                }
            }

            if (currentBar > numBars) {
                $('#abort').click();
            } else if (new Date().getTime() - (currentBar - 1)*barDuration - recordingStart >= barDuration) {
                bars.push(bar);
                bar = [];
                currentBar ++;
            }

            if (!abortRecording) {
                requestAnimationFrame(logPitch);
            } else {
                abortRecording = false;
            }
        };
        logPitch();
    });

    $('#abort').click(() => {
        $('#abort').prop('disabled', true);
        $('#record').prop('disabled', false);
        $('#record').removeClass('active');

        abortRecording = true;
        console.log(bars);
    });
});
