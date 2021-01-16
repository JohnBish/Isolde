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
	BSH : 12 // note: B# = C but we use 12 here
};

class Note {
	constructor(letter, octave) {
		this.letter = letter; // PITCH
		this.octave = octave; // int
	}
}

class Key {
	constructor(letter, sign) {
		this.letter = letter; // PITCH
		this.sign = sign; // char
	}
}

class Chord {
	constructor(note1, note2, note3) {
		this.note1 = note1;
		this.note2 = note2;
		this.note3 = note3;
	}
}

// a chord example using our class definitions
sample_chord = new Chord(
	new Note(PITCH.C, 4),
	new Note(PITCH.E, 4),
	new Note(PITCH.G, 4)
);

// user input:
// audio file, number of bars (int), key (letter and sign) (enum)
// first chord in the piece (different enum)

var numBars = 0; // TODO

// array of bars, where each bar is an array of Notes
var bars = []; // TODO

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



function findChord(bar) {
	/////
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






