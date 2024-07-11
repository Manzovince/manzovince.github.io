console.log("Hello I'm here");

const piano = document.getElementById('piano');
const whiteKeys = [0, 2, 4, 5, 7, 9, 11];
const totalKeys = 88;
const startNote = 21; // A0

// Create piano keyboard
function createKey(index) {
    const key = document.createElement('div');
    const noteNumber = startNote + index;
    const octave = Math.floor(noteNumber / 12) - 1;
    const noteName = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][noteNumber % 12];

    key.className = 'key ' + (whiteKeys.includes(noteNumber % 12) ? 'white' : 'black');
    key.dataset.note = noteNumber;
    key.title = `${noteName}${octave} (MIDI: ${noteNumber})`;

    return key;
}

for (let i = 0; i < totalKeys; i++) {
    piano.appendChild(createKey(i));
}

// MIDI message
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess()
        .then(onMIDISuccess, onMIDIFailure);
} else {
    console.log("WebMIDI is not supported in this browser.");
}

function onMIDISuccess(midiAccess) {
    for (var input of midiAccess.inputs.values()) {
        input.onmidimessage = getMIDIMessage;
    }
}

function onMIDIFailure() {
    console.log("Could not access your MIDI devices.");
}

function getMIDIMessage(message) {
    var command = message.data[0];
    var note = message.data[1];
    var velocity = (message.data.length > 2) ? message.data[2] : 0;

    let color = `hsl(${Math.floor(((note - 21) / 87) * 360) }, ${Math.floor(((note - 21) / 87) * 94)}%, ${Math.floor((velocity / 127) * 100)}%)`;
    console.log(note, color);
    document.getElementById('note-color').style.backgroundColor = color;

    switch (command) {
        case 144: // noteOn
            if (velocity > 0) {
                noteOn(note);
            } else {
                noteOff(note);
            }
            break;
        case 128: // noteOff
            noteOff(note);
            break;
    }
}

const noteDisplay = document.getElementById('note-display');
const chordDisplay = document.getElementById('chord-display');
const intervalsDisplay = document.getElementById('intervals-display');
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const activeNotes = new Set();
const notes = new Set();

function getNoteNameFromMIDI(midiNote) {
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = noteNames[midiNote % 12];
    return `${noteName}${octave}`;
}

function noteOn(note) {
    const key = document.querySelector(`.key[data-note="${note}"]`);
    if (key) {
        key.classList.add('pressed');
    }
    addNoteToDisplay(note);
}

function noteOff(note) {
    const key = document.querySelector(`.key[data-note="${note}"]`);
    if (key) {
        key.classList.remove('pressed');
    }
    removeNoteFromDisplay(note);
}

function addNoteToDisplay(note) {
    const noteName = getNoteNameFromMIDI(note);
    activeNotes.add(noteName);

    // Test
    // notes.add(note);
    // console.log(notes);

    updateNotes(activeNotes);
    updateChord(activeNotes);
}

function removeNoteFromDisplay(note) {
    const noteName = getNoteNameFromMIDI(note);
    activeNotes.delete(noteName);
    noteDisplay.textContent = "";
    chordDisplay.textContent = "Off";
    updateNotes(activeNotes);
    updateChord(activeNotes);
}

function updateNotes() {
    let notesList = [];
    let notesWithPositions = sortNotes(Array.from(activeNotes));
    for (let i = 0; i < notesWithPositions.length; i++) {
        const element = notesWithPositions[i].note;
        notesList.push(element);
    }

    noteDisplay.textContent = notesList.join(' · ');
}

function updateChord() {
    let notesList = [];
    let notesWithPositions = sortNotes(Array.from(activeNotes));
    for (let i = 0; i < notesWithPositions.length; i++) {
        const element = notesWithPositions[i].note;
        notesList.push(element);
    }
    let intervals = calculateRelativeIntervals(Array.from(activeNotes));
    chordDisplay.textContent = intervalsToChord(intervals, notesList);
}

function sortNotes(notes) {
    const notePositions = {
        'C': 0, 'C#': 1, 'Db': 1,
        'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'Fb': 4, 'F': 5,
        'F#': 6, 'Gb': 6, 'G': 7,
        'G#': 8, 'Ab': 8, 'A': 9,
        'A#': 10, 'Bb': 10, 'B': 11
    };

    const notesWithPositions = notes.map(note => {
        const letter = note.slice(0, -1);
        const octave = parseInt(note.slice(-1));
        const position = notePositions[letter];
        return { note, position, octave };
    });

    notesWithPositions.sort((a, b) => a.position + a.octave * 12 - (b.position + b.octave * 12));

    return notesWithPositions;
}

function calculateRelativeIntervals(notes) {

    notesWithPositions = sortNotes(notes);

    const intervals = [];
    for (let i = 1; i < notesWithPositions.length; i++) {
        const currentNote = notesWithPositions[i];
        const prevNote = notesWithPositions[i - 1];
        const interval = (currentNote.position + currentNote.octave * 12) - (prevNote.position + prevNote.octave * 12);
        intervals.push(interval);
    }

    return intervals;
}

function intervalsToChord(intervals, notesList) {
    console.log(intervals);
    // Convert intervals array to a sorted string for easier comparison
    let int = intervals.join(',');

    intervalsDisplay.textContent = intervals.join(' · ');

    let chord = ""

    if (notesList.length === 0 ) { chord = "Off"; }
    else if (notesList.length === 1 ) { chord = notesList[0].slice(0, -1); }
    else if (notesList.length === 2 ) {
        let octaves = Math.floor(intervals[0] / 12);
        switch (intervals[0] % 12) {
            case 0: chord = notesList[0].slice(0,-1) + " + Octave " + octaves; break;
            case 1: chord = notesList[0].slice(0,-1) + " + minor Second " + octaves; break;
            case 2: chord = notesList[0].slice(0,-1) + " + Second " + octaves; break;
            case 3: chord = notesList[0].slice(0,-1) + " + minor Third " + octaves; break;
            case 4: chord = notesList[0].slice(0,-1) + " + Third " + octaves; break;
            case 5: chord = notesList[0].slice(0,-1) + " + Fourth " + octaves; break;
            case 6: chord = notesList[0].slice(0,-1) + " + Aug Fourth " + octaves; break;
            case 7: chord = notesList[0].slice(0,-1) + " + Fifth " + octaves; break;
            case 8: chord = notesList[0].slice(0,-1) + " + minor Sixth " + octaves; break;
            case 9: chord = notesList[0].slice(0,-1) + " + Sixth " + octaves; break;
            case 10: chord = notesList[0].slice(0,-1) + " + minor Seventh " + octaves; break;
            case 11: chord = notesList[0].slice(0,-1) + " + Seventh " + octaves; break;
            default: chord = "2 notes unknown"; break;
          }
    }
    else if (notesList.length === 3) {
        switch (intervals.join(',')) {
            case '4,3': chord = notesList[0].slice(0, -1) + " Maj"; break;
            case '5,4': chord = notesList[1].slice(0, -1) + " Maj (inv 1)"; break;
            case '3,5': chord = notesList[2].slice(0, -1) + " Maj (inv 2)"; break;
            case '3,4': chord = notesList[0].slice(0, -1) + " min"; break;
            case '5,3': chord = notesList[1].slice(0, -1) + " min (inv 1)"; break;
            case '4,5': chord = notesList[2].slice(0, -1) + " min (inv 2)"; break;
            case '2,5': chord = notesList[0].slice(0, -1) + " sus2"; break;
            case '5,2': chord = notesList[0].slice(0, -1) + " sus4"; break;
            case '3,3': chord = notesList[0].slice(0, -1) + " Dim"; break;
            case '4,4': chord = notesList[0].slice(0, -1) + " Aug"; break;
            case '7,5': chord = notesList[0].slice(0, -1) + " 5"; break;
            case '3,6': chord = notesList[0].slice(0, -1) + " min6"; break;
            case '???': chord = notesList[0].slice(0, -1) + " Maj6"; break;
            case '???': chord = notesList[0].slice(0, -1) + " min7"; break;
            case '???': chord = notesList[0].slice(0, -1) + " Maj7"; break;
            case '???': chord = notesList[0].slice(0, -1) + " 7 (Dom)"; break;
            case '???': chord = notesList[0].slice(0, -1) + " min9"; break;
            case '???': chord = notesList[0].slice(0, -1) + " Maj9"; break;
            case '???': chord = notesList[0].slice(0, -1) + " min11"; break;
            case '???': chord = notesList[0].slice(0, -1) + " Maj11"; break;
            case '???': chord = notesList[0].slice(0, -1) + " min13"; break;
            case '???': chord = notesList[0].slice(0, -1) + " Maj13"; break;
            case '???': chord = notesList[0].slice(0, -1) + " ♭13"; break;
            case '12,12': chord = notesList[0].slice(0, -1) + " Octaves x2"; break;
            default: chord = "3 notes unknown"; break;
        }
    }
    else if (notesList.length === 4) {
        switch (intervals.join(',')) {
            case '12,12,12': chord = notesList[0].slice(0, -1) + " Octaves x3"; break;
            default: chord = "4 notes unknown"; break;
        }
    }
    else if (notesList.length === 5) {
        switch (intervals.join(',')) {
            case '12,12,12,12': chord = notesList[0].slice(0, -1) + " Octaves x4"; break;
            default: chord = "5 notes unknown"; break;
        }
    }
    else {
        chord = "Not defined";
    }

    return chord;

    // if (int === '') { return notesList[0].slice(0, -1); }
    // else if (int === '1' || int === '13' || int === '25') { return notesList[0].slice(0, -1) + " + Minor Second"; }
    // else if (int === '2' || int === '14' || int === '26') { return notesList[0].slice(0, -1) + " + Second"; }
    // else if (int === '3' || int === '15' || int === '27') { return notesList[0].slice(0, -1) + " + minor Third"; }
    // else if (int === '4' || int === '16' || int === '28') { return notesList[0].slice(0, -1) + " + Third"; }
    // else if (int === '5' || int === '17' || int === '29') { return notesList[0].slice(0, -1) + " + Fourth"; }
    // else if (int === '6' || int === '18' || int === '30') { return notesList[0].slice(0, -1) + " + Aug Fourth"; }
    // else if (int === '7' || int === '19' || int === '31') { return notesList[0].slice(0, -1) + " + Fifth"; }
    // else if (int === '8' || int === '20' || int === '32') { return notesList[0].slice(0, -1) + " + minor Sixth"; }
    // else if (int === '9' || int === '21' || int === '33') { return notesList[0].slice(0, -1) + " + Sixth"; }
    // else if (int === '10' || int === '22' || int === '34') { return notesList[0].slice(0, -1) + " + minor Seventh"; }
    // else if (int === '11' || int === '23' || int === '35') { return notesList[0].slice(0, -1) + " + Seventh"; }
    // else if (int === '12' || int === '24' || int === '36') { return notesList[0].slice(0, -1) + " + Octave"; }
    // else if (int === '12,12') { return notesList[0].slice(0, -1) + " + Octave x2"; }
    // else if (int === '12,12,12') { return notesList[0].slice(0, -1) + " + Octave x3"; }
    // else if (int === '4,3') { return notesList[0].slice(0, -1) + " Major"; }
    // else if (int === '5,4') { return notesList[1].slice(0, -1) + " Major (inv 1)"; }
    // else if (int === '3,5') { return notesList[2].slice(0, -1) +  " Major (inv 2)"; }
    // else if (int === '3,4') { return notesList[0].slice(0, -1) + " minor"; }
    // else if (int === '5,3') { return notesList[1].slice(0, -1) + " minor (inv 1)"; }
    // else if (int === '4,5') { return notesList[2].slice(0, -1) + " minor (inv 2)"; }
    // else if (int === '2,5') { return notesList[0].slice(0, -1) + " sus2"; }
    // else if (int === '5,2') { return notesList[0].slice(0, -1) + " sus4"; }
    // else if (int === '3,3') { return notesList[0].slice(0, -1) + " Dim"; }
    // else if (int === '4,4') { return notesList[0].slice(0, -1) + " Aug"; }
    // else if (int === '7,5') { return notesList[0].slice(0, -1) + " 5"; }
    // else if (int === '3,6' || int === '6,3' || int === '3,4,2') { return notesList[0].slice(0, -1) + " min6"; }
    // else if (int === '4,3,2') { return notesList[0].slice(0, -1) + " Maj6"; }
    // else if (int === '4,6' ) { return notesList[0].slice(0, -1) + " 7"; }
    // else if (int === '2,3' || int === '3,4,3') { return notesList[0].slice(0, -1) + " min7"; }
    // else if (int === '3,7' || int === '2,3' || int === '3,4,3') { return notesList[0].slice(0, -1) + " min7"; }
    // else if (int === '2,3,4') { return notesList[0][1] + " min7 (inv 1)"; }
    // else if (int === '4,7' || int === '4,3,4') { return notesList[0].slice(0, -1) + " Maj7"; }
    // else if (int === '1,4,3') { return notesList[1].slice(0, -1) + " Maj7 (inv 1)"; }
    // else if (int === '4,3,3') { return notesList[0].slice(0, -1) + " Dom7"; }
    // else if (int === '3,4,7') { return notesList[0].slice(0, -1) + " min9"; }
    // else if (int === '4,3,7') { return notesList[0].slice(0, -1) + " Maj9"; }
    // else if (int === '3,2,5') { return notesList[0].slice(0, -1) + " min11"; }
    // else if (int === '4,1,6') { return notesList[0].slice(0, -1) + " Maj11"; }
    // else if (int === '2') { return notesList[0].slice(0, -1) + " min13"; }
    // else if (int === '2') { return notesList[0].slice(0, -1) + " Maj13"; }
    // else if (int === '4,3,1') { return notesList[0].slice(0, -1) + " b13"; }
    // else if (int === '2,3,2') { return notesList[0].slice(0, -1) + " 9sus4"; }
    // else if (int === '2,2,1,2') { return notesList[0].slice(0, -1) + " 9/11"; }
    // else if (int === '2,1' || int === '000') { return notesList[0].slice(0, -1) + " min add9"; }
    // else if (int === '1,2' || int === '000') { return notesList[0].slice(0, -1) + " min add b9"; }
    // else if (int === '2,2' || int === '2,2,3') { return notesList[0].slice(0, -1) + " add9"; }
    // else if (int === '4,1,2') { return notesList[0].slice(0, -1) + " add11"; }
    // else if (int === '4,3,4,3,3') { return notesList[0].slice(0, -1) + " 13"; }
    // else if (int === '1,2,3,4') { return " Test"; }
    // else { return notesList[0].slice(0, -1) + " ?" }
}

// const chordDefinitions = {
//     // Intervals are represented as strings for faster lookup
//     '': note => `${note} + Minor Second`,
//     '1': note => `${note} + Minor Second`,
//     '2': note => `${note} + Second`,
//     '3': note => `${note} + minor Third`,
//     '4': note => `${note} + Third`,
//     '5': note => `${note} + Fourth`,
//     '6': note => `${note} + Aug Fourth`,
//     '7': note => `${note} + Fifth`,
//     '8': note => `${note} + minor Sixth`,
//     '9': note => `${note} + Sixth`,
//     '10': note => `${note} + minor Seventh`,
//     '11': note => `${note} + Seventh`,
//     '12': note => `${note} + Octave`,
//     '12,12': note => `${note} + Octave x2`,
//     '12,12,12': note => `${note} + Octave x3`,
    
//     // Triads and other chords
//     '4,3': note => `${note} Major`,
//     '5,4': (_, notes) => `${notes[1]} Major (inv 1)`,
//     '3,5': (_, notes) => `${notes[2]} Major (inv 2)`,
//     '3,4': note => `${note} minor`,
//     '5,3': (_, notes) => `${notes[1]} minor (inv 1)`,
//     '4,5': (_, notes) => `${notes[2]} minor (inv 2)`,
//     '2,5': note => `${note} sus2`,
//     '5,2': note => `${note} sus4`,
//     '3,3': note => `${note} Dim`,
//     '4,4': note => `${note} Aug`,
//     '7,5': note => `${note} 5`,
//     '3,6': note => `${note} min6`,
//     '6,3': note => `${note} min6`,
//     '3,4,2': note => `${note} min6`,
//     '4,3,2': note => `${note} Maj6`,
//     '4,6': note => `${note} 7`,
//     '3,7': note => `${note} min7`,
//     '2,3': note => `${note} min7`,
//     '3,4,3': note => `${note} min7`,
//     '2,3,4': (_, notes) => `${notes[0][1]} min7 (inv 1)`,
//     '4,7': note => `${note} Maj7`,
//     '4,3,4': note => `${note} Maj7`,
//     '1,4,3': (_, notes) => `${notes[1]} Maj7 (inv 1)`,
//     '4,3,3': note => `${note} Dom7`,
//     '3,4,7': note => `${note} min9`,
//     '4,3,7': note => `${note} Maj9`,
//     '3,2,5': note => `${note} min11`,
//     '4,1,6': note => `${note} Maj11`,
//     '222': note => `${note} min13`,
//     '4,3,1': note => `${note} b13`,
//     '2,3,2': note => `${note} 9sus4`,
//     '2,2,1,2': note => `${note} 9/11`,
//     '2,1': note => `${note} min add9`,
//     '1,2': note => `${note} min add b9`,
//     '2,2': note => `${note} add9`,
//     '2,2,3': note => `${note} add9`,
//     '4,1,2': note => `${note} add11`,
//     '4,3,4,3,3': note => `${note} 13`,
//     '1,2,3,4': () => 'Test'
// };

// function intervalsToChord(intervals, notesList) {
//     console.log(intervals);
//     document.getElementById('intervals-display').textContent = intervals.join(' · ');

//     if (notesList.length === 0) return "Off";

//     const rootNote = notesList[0].slice(0, -1);
//     const intervalKey = intervals.join(',');

//     // Check for octave equivalents
//     const normalizedIntervalKey = intervals.map(i => i % 12).sort((a, b) => a - b).join(',');

//     if (chordDefinitions.hasOwnProperty(intervalKey)) {
//         return chordDefinitions[intervalKey](rootNote, notesList);
//     } else if (chordDefinitions.hasOwnProperty(normalizedIntervalKey)) {
//         return chordDefinitions[normalizedIntervalKey](rootNote, notesList);
//     } else {
//         return `${rootNote} ?`;
//     }
// }


const MIDI_NOTE_ON = 144;
const MIDI_NOTE_OFF = 128;
const MIDI_VELOCITY = 100;
const testChord = [60, 64, 67]; // MIDI notes for C4, E4, G4

// Add this function to your existing code
function simulateMIDIMessage(note, isNoteOn) {
    const command = isNoteOn ? MIDI_NOTE_ON : MIDI_NOTE_OFF;
    const velocity = isNoteOn ? MIDI_VELOCITY : 0;
    getMIDIMessage({ data: [command, note, velocity] });
}

// Add this event listener at the end of your script
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !event.repeat) {
        event.preventDefault(); // Prevent scrolling
        testChord.forEach(note => simulateMIDIMessage(note, true));
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        testChord.forEach(note => simulateMIDIMessage(note, false));
    }
});
