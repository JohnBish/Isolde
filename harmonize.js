// hooktheory API credentials
const hkey = 'maggie_htn';
const secret = 'ineedsleep2021';
const token = '6b1ca8fa98008b1c379ea974f4d4db68';

// create pitch enum
const PITCH = {
    CFL : -1,
	C : 0,
	CSH : 1, DFL : 1,
	D : 2,
	DSH : 3, EFL : 3,
	E : 4, FFL : 4,
	ESH : 5, F : 5,
	FSH : 6, GFL : 6,
	G : 7,
	GSH : 8, AFL : 8,
	A : 9,
	ASH : 10, BFL : 10,
	B : 11, CFL : 11,
	BSH : 0
};

const MAJOR_RELATIVE_DIATONICS = {
	'1': [0, 4, 7], // I
	'2': [2, 5, 9], // ii
	'3': [4, 7, 11], // iii
	'4': [5, 9, 0], // IV
	'5': [7, 11, 2], // V
	'6': [9, 0, 4], // VI
    '7': [11, 2, 5] // dvii
};

const MINOR_RELATIVE_DIATONICS = {
	'b1': [0, 3, 7], // i
	'b2': [2, 5, 8], // dii
	'b3': [4, 8, 11], // bIII
	'b4': [5, 8, 0], // iv
	'b5': [7, 10, 2], // v
    '5': [7, 11, 2], // V
	'b6': [8, 0, 3], // bVI
    'b7': [10, 2, 5] // bVII
};

class Note {
	constructor(letter, octave, duration) {
		this.letter = letter; // PITCH
		this.octave = octave; // int
        this.duration = duration; // float between 0 and 1 (1 is a whole note)
	}

	// methods
	diff(tonic) {
		let semitones = (this.octave * 12 + this.letter) - (tonic.octave * 12 + tonic.letter);
		return semitones % 12;
	}
}

class Key {
    MAJOR = true;
    MINOR = false;

	constructor(letter, sign) {
		this.tonic = letter; // PITCH
		this.sign = sign; // Key.MAJOR or Key.MINOR
	}
}

// async, chords is a string of nums, separated by commas, i.e. '1,4,5'
async function getNextChord(chords) {
	let url = 'https://api.hooktheory.com/v1/trends/nodes?cp=' + chords;

	let response = await 
		fetch(url, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
			}
		});

	let data = await response.json();
	return data;
}

// bar: array of Notes, key: a Key
// findChord finds the best possible chord for the bar
async function findChord(bar, numBars, key, chordsSoFar, numChordsSoFar) {
    const tonic = new Note(key.tonic, 4, 1);
	var chordMatchWeights = {};

	for (i = 0; i < bar.length; ++i) {
        const note = bar[i];
		const relativeNote = note.diff(tonic);
		//console.log("note is:", note);

		// find match weights 
        let findMatchWeights = chordSet => {
            for (let chord in chordSet) {
                const weight = chordSet[chord].includes(relativeNote) ? note.duration : 0;

                if (chordMatchWeights[chord] == null) {
                    chordMatchWeights[chord] = weight;
                } else {
                    chordMatchWeights[chord] += weight;
                }
            }
        }

        // find list of chords that work
        if (key.sign === Key.MAJOR) {
            findMatchWeights(MAJOR_RELATIVE_DIATONICS);
        } else {
            findMatchWeights(MINOR_RELATIVE_DIATONICS);
        }
	}

	//console.log('chordMatchWeights', chordMatchWeights);

	var possibleChords = {};
	var bestChord = '5';
	var largestWeightProbSoFar = 0;
	let lastChord = chordsSoFar.charAt(chordsSoFar.length - 1);

	console.log("lastChord", lastChord);

	// if we're at the second last bar, we want to force a V-I resolution
	if (numChordsSoFar + 1 === numBars) {
		// if we already have a V chord, append a I
		if (lastChord === '5') {
			if (key.sign === Key.MAJOR) {
				chordsSoFar += ',1';
			} else {
				chordsSoFar += ',b1'
			}
		} else {
			// otherwise, append a V-I
			if (key.sign === Key.MAJOR) {
				chordsSoFar += ',5,1';
			} else {
				chordsSoFar += ',5,b1'
			}
		}
		console.log("force resolution chordsSoFar", chordsSoFar);
		return chordsSoFar;
	}

	// get possible next chords from API
	await getNextChord(chordsSoFar).then(function(data) {
		//console.log('apiData', data);

		for (i = 0; i < data.length; ++i) {
			const chordID = data[i].chord_ID;
			const chordWeight = chordMatchWeights[chordID];

			// find best chord based on the chord weight and API probability
			if (chordWeight) {
				let finalWeightProb = (0.75 * chordWeight) + (0.25 * data[i].probability);

				if (finalWeightProb > largestWeightProbSoFar) {
					// if chord is not a 1, just add it
					if ((chordID != '1') && (chordID != 'b1')) {
							largestWeightProbSoFar = finalWeightProb;
							bestChord = chordID;
					} else {
						// if the chord is a 1 and the previous chord is not a 5, just add it
						if (lastChord != '5') {
							largestWeightProbSoFar = finalWeightProb;
							bestChord = chordID;
						} else {
							// prevent a V-I or V-i or v-i in the middle
						}
					}
				}
				possibleChords[chordID] = finalWeightProb;
			}
		}

		console.log('possibleChords', possibleChords);

		// append next chord to sequence of chords we have
		chordsSoFar += ',' + bestChord;
		// increment the number of bars we've found a chord for

		console.log("chordsSoFar", chordsSoFar);
	});
    return chordsSoFar;
}

/*
var myBar = [
	new Note(PITCH.C, 4, 1),
	new Note(PITCH.E, 4, 0.25),
	new Note(PITCH.G, 4, 0.5)
];

var myKey = new Key(PITCH.C, Key.MAJOR);

// find the next chord
findChord(myBar, myKey);
*/
