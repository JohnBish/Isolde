// create pitch enum
const PITCH = {
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

var MAJOR_RELATIVE_DIATONICS = {
	'I': [0, 4, 7],
	'ii': [2, 5, 9],
	'iii': [4, 7, 11],
	'IV': [5, 9, 0],
	'V': [7, 11, 2],
	'vi': [9, 0, 4],
    'dvii': [11, 2, 5]
};

var MINOR_RELATIVE_DIATONICS = {
	'i': [0, 3, 7],
	'dii': [2, 5, 8],
	'III': [4, 8, 11],
	'iv': [5, 8, 0],
	'v': [7, 10, 2],
    'V': [7, 11, 2],
	'VI': [8, 0, 3],
    'VII': [10, 2, 5],
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
    const MAJOR = true;
    const MINOR = false;

	constructor(letter, sign) {
		this.tonic = letter; // PITCH
		this.sign = sign; // Key.MAJOR or Key.MINOR
	}
}

// user input:
// audio file, number of bars (int), key (letter and sign) (enum)
// first chord in the piece (different enum)

var numBars = 0; // TODO

var key = new Key(PITCH.C, '+'); // TODO

// array of bars, where each bar is an array of Notes
var bars = []; // TODO

var majDict = {
	0 : 'I',
	1 : 'bII',
	2 : 'ii',
	3 : 'bIII',
	4 : 'iii',
	5 : 'IV',
	6 : 'bV',
	7 : 'V',
	8 : 'bVI',
	9 : 'vi',
	10 : 'bVII',
	11 : 'vii',
	12 : 'bvii'
};

// bar: array of Notes, key: a Key
function findChord(bar, key) {
    const tonic = key.tonic;

	var chordMatchWeights = {};

	for (i = 0; i < bar.length; ++i) {
        const note = bar[i]
		const relative_note = diff(note, tonic) % 12;

        let findMatchWeights = chordSet => {
            for (let chord in chordSet) {
                const weight = chordSet[chord].includes(degree) ? note.duration : 0;
                if (chordMatchWeights[chord] == null) {
                    chordMatchWeights[chord] = weight;
                } else {
                    chordMatchWeights[chord] += weight;
                }
            }
        }

        if (key.sign == Key.MAJOR) {
            findMatchWeights(MAJOR_RELATIVE_DIATONICS);
        } else {
            findMatchWeights(MINOR_RELATIVE_DIATONICS);
        }
	}

	// for each chord relative to the tonic
	// we have a constant array of notes that are members of that chord (14)
	// include possible decorations

	// for each note in the bar:
	// figure out truthiness of if the note is in the chord in question, 1 or 0
	// multiply the truthiness by fraction of bar note duration is for
	// end up with a value between 0 and 1, if all notes in the bar match the chord, it'll be 1

	// look at notes in the bar, check against all 7 arrays
	// make an array for all matches
	// make an array for most matches (backup)


	// independently, make a call to the API, based on the sequence of chords we have
	// compare



	// check if all scale degrees fit into a chord
	// array of possible chords
	
}


/*
- find a chord that works for the bar

- first, make an API call given the chord progression up to now
- should give us a list of possible continuations
- go down the list, check them against notes in the bar
- make another list of the possible options

- pick one based on the genre
- pop song -> first, jazz -> second or third 

- append to sequence of chords we have
- store in array (size is number of bars)
*/





///////////////////////////////////// API //////////////////////////////////////


key = 'maggie_htn';
secret = 'ineedsleep2021';
token = '6b1ca8fa98008b1c379ea974f4d4db68';

// get auth token (only need to do once)
/*
fetch('https://api.hooktheory.com/v1/users/auth', {
	method: 'POST',
	headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	},
	body: JSON.stringify({
		username: key,
		password: secret
	})
}).then(function (resp) {
	// return response as JSON
	return resp.json();
}).then(function (data) {
	// log API data
	console.log('token', data);
}).catch(function (err) {
	// log errors
	console.log('something went wrong:', err);
});
*/

// async
async function getNextChord() {
	let response = await 
		fetch('https://api.hooktheory.com/v1/trends/nodes?cp=4', {
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

getNextChord().then(function (data) {console.log(data)});

async function getSong() {
	let response = await 
		fetch('https://api.hooktheory.com/v1/trends/songs?cp=4', {
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

getSong().then(function (data) {console.log(data)});
