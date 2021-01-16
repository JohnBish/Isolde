$(document).ready(() => {
    for (i = 1; i <= 16; i++) {
        $('#bars').append($('<option></option>').val(i).html(i));
    }

    for (i = 1; i <= 6; i++) {
        $('#bpb').append($('<option></option>').val(i).html(i));
    }

    $('#record').click(() => {
        console.log("Attempting to record audio");
        var voice = new Wad({
            source: 'mic'
        });

        var tuner = new Wad.Poly();
        tuner.setVolume(0);
        tuner.add(voice);

        let saw = new Wad({source : 'sawtooth'});

        const bars = $('bars').val();
        const bpb = $('bpb').val();
        for (i = 0; i < bpb; i++) {
            saw.play();
        }

        voice.play();
        tuner.updatePitch();

        var logPitch = () => {
            console.log(tuner.pitch, tuner.noteName);
            requestAnimationFrame(logPitch);
        };
        logPitch();
    });
});
