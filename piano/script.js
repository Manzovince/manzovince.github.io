const keyboard = document.getElementById('keyboard');
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const noteNamesFR = ['Do', 'Do#', 'Ré', 'Ré#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
let activeNotes = [];
let isMouseDown = false;

const notesDisplay = document.getElementById('notes');
const velocityDisplay = document.getElementById('velocity');
const intervalsDisplay = document.getElementById('intervals');
const chordDisplay = document.getElementById('chord');
const colorCircle = document.getElementById('color-circle');
const keys = keyboard.getElementsByClassName('key');

const exerciseDisplay = document.getElementById('exercise-display');
const startChordsBtn = document.querySelector('button[onclick="startExercise(\'chords\')"]');
const startScalesBtn = document.querySelector('button[onclick="startExercise(\'scales\')"]');
const stopExerciseBtn = document.querySelector('button[onclick="stopExercise()"]');
const showAnswerBtn = document.querySelector('button[onclick="toggleAnswer()"]');

let answer = false;

let currentExercise = null;
let currentChord = null;
let currentScale = null;
let correctNotes = null;
const exerciseTypes = ['chords', 'scales'];

const chordPatterns = {
    '0': 'minor Second',
    '1': 'Second',
    '2': 'minor Third',
    '3': 'Third',
    '4': 'Fourth',
    '5': 'Augmented Fourth',
    '6': 'Fifth',
    '7': 'minor Sixth',
    '8': 'Sixth',
    '9': 'minor Seventh',
    '10': 'Seventh',
    '11': 'Octave',

    '0,0':'no3 7/Maj 7 (1)',
    '0,1':'min add ♭9',
    '0,2':'#9 (-3 st)',
    '0,3':'Maj 7 (1)',
    '0,4':'5 #11 (2)',
    '0,5':'5 add ♭9',
    '0,6':'5 Maj 7 (1)',
    '0,7':'#9 (inv 1)',
    '0,8':'min add9 (2)',
    '0,9':'no3 7/Maj 7 (1)',
    '0,10':'no3 add ♭9',
    '0,11':'no3 add ♭9',
    '0,12':'no3 b9/9',

    '1,0':'min add 9',
    '1,1':'add 9',
    '1,2':'min 7 (1)',
    '1,3':'Dom 7 (1)',
    '1,4':'sus2',
    '1,5':'O 5 (2)',
    '1,6':'5 7 (1)',
    '1,7':'add9 (2)',
    '1,8':'min add ♭9 (2)',
    '1,9':'no3 add 9',
    '1,10':'no3 ♭9/9',
    '1,11':'no3 add 9',
    '1,12':'min add 9',

    '2,0':'#9',
    '2,1':'5 7 (2)',
    '2,2':'Dim',
    '2,3':'min',
    '2,4':'Maj (2)',
    '2,5':'min 6',
    '2,6':'min 7',
    '2,7':'#9 (-3 st)',
    '2,8':'min',
    '2,9':'min add ♭9',
    '2,10':'min add 9',
    '2,11':'min',
    '2,12':'#9',

    '3,0':'5 Maj 7 (1)',
    '3,1':'O 5',
    '3,2':'Maj',
    '3,3':'Aug',
    '3,4':'min (2)',
    '3,5':'7',
    '3,6':'Maj 7',
    '3,7':'Maj',
    '3,8':'add ♭9',
    '3,9':'add 9',
    '3,10':'#9',
    '3,11':'Maj',
    '3,12':'add 11',

    '4,0':'5 add ♭9 (1)',
    '4,1':'sus4',
    '4,2':'min (1)',
    '4,3':'Maj (1)',
    '4,4':'sus2 (2)',
    '4,5':'5 #11 (1)',
    '4,6':'5 (1)',
    '4,7':'5 ♭13 (1)',
    '4,8':'5 6 (1)',
    '4,9':'5 7 (1)',
    '4,10':'5 Maj 7 (1)',

    '3,2,1': 'Maj 6',
    '2,3,1': 'min 6',
    '3,2,2': 'Dom 7',
    '3,2,3': 'Maj 7',
    '2,3,2': 'min 7',
    '2,2,2': 'Dim 7',
    '3,2,6': '9',
    '3,2,9': '11',
    '3,2,3,2': '7/9',
    '2,3,2,3': 'min 7/9',
};

const scalePatterns = {
    '1,1,0,1,1,1,0': 'Major',
    '1,0,1,1,1,0,1': 'minor',
    '2,1,0,0,2,1,2': 'Blues',
}

// MIDI input

navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(midiAccess) {
    console.log("MIDI access granted. Waiting for MIDI input...");

    for (let input of midiAccess.inputs.values()) {
        input.onmidimessage = getMIDIMessage;
    }
}

function onMIDIFailure(error) {
    console.log("Failed to get MIDI access - ", error);
}

function getMIDIMessage(message) {
    let command = message.data[0];
    let note = message.data[1];
    let velocity = (message.data.length > 2) ? message.data[2] : 0;

    switch (command) {
        case 144: // noteOn
            if (velocity > 0) {
                noteOn(note, velocity);
            } else {
                noteOff(note);
            }
            break;
        case 128: // noteOff
            noteOff(note);
            break;
    }
}

// Note On-Off

function noteOn(midiNote, velocity) {
    const noteName = noteNames[midiNote % 12] + Math.floor(midiNote / 12 - 1);
    activeNotes.push({ name: noteName, midiNote: midiNote, velocity: (velocity / 127).toFixed(1) });
    updateOutput();
    updateKeyboard();
    if (chordMode != "Off") {
        playChord(chordMode);
    }
    if (currentExercise === 'chords') {
        checkChord();
    } else if (currentExercise === 'scales') {
        checkScale();
    }
}

function noteOff(midiNote) {
    activeNotes = activeNotes.filter(n => n.midiNote !== midiNote);
    updateOutput();
    updateKeyboard();

    if (currentExercise === 'chords') {
        checkChord();
    } else if (currentExercise === 'scales') {
        checkScale();
    }
}

// Update informations

function updateOutput() {
    activeNotes.sort((a, b) => a.midiNote - b.midiNote);

    const intervals = calculateIntervals(activeNotes);

    chordDisplay.textContent = NotesToChordName(activeNotes);

    notesDisplay.textContent = "";
    activeNotes.forEach(note => {
        notesDisplay.textContent += note.name + " ";
    });

    velocityDisplay.textContent = "";
    activeNotes.forEach(note => { velocityDisplay.textContent += note.velocity + " "; });

    intervalsDisplay.textContent = intervals.join('\t');

    if (activeNotes.length === 0) {
        colorCircle.style.backgroundColor = "transparent";
    } else {
        changeColor(activeNotes);
    }
}

const calculateIntervals = notes => notes.slice(0, -1).map((note, i) => notes[i + 1].midiNote - note.midiNote - 1);

// function calculateIntervals(notes) {
//     const intervals = [];
//     for (let i = 0; i < notes.length - 1; i++) {
//         const interval = notes[i + 1].midiNote - notes[i].midiNote;
//         intervals.push(interval - 1);
//     }
//     return intervals;
// }

function getParenthesesContent(str) {
    const match = str.match(/\(([^)]+)\)/);
    return match ? match[1] : null;
}

function NotesToChordName(notes) {
    if (notes.length === 0) { return ""; }
    else if (notes.length === 1) { return noteNames[notes[0].midiNote % 12]; }
    else if (notes.length === 2) { return `${noteNames[notes[0].midiNote % 12]} + ${chordPatterns[calculateIntervals(notes) % 12]}`; }
    else if (notes.length === 3 || notes.length === 4) {
        intervals = calculateIntervals(notes);
        let inversion = 0;

        if (getParenthesesContent(chordPatterns[intervals])) {
            console.log(getParenthesesContent(chordPatterns[intervals]));
            inversion = getParenthesesContent(chordPatterns[intervals]);
        }
        if (chordPatterns[intervals] === undefined) {
            return `${noteNames[notes[inversion].midiNote % 12]} ?`;
        }

        return `${noteNames[notes[inversion].midiNote % 12]} ${chordPatterns[intervals]}`;
    } else {
        return `${noteNames[notes[inversion].midiNote % 12]}`;
    }
}

// Piano keyboard generation

function createKeyboard() {
    keyboard.innerHTML = '';
    const screenWidth = window.innerWidth;
    const octaves = Math.max(1, Math.min(7, Math.floor(screenWidth / 210))); // 7 white keys per octave, ~30px each

    for (let octave = 0; octave < octaves; octave++) {
        for (let i = 0; i < 12; i++) {
            const key = document.createElement('div');
            const isBlack = [1, 3, 6, 8, 10].includes(i);
            key.className = `key ${isBlack ? 'black' : 'white'}`;
            key.dataset.note = octave * 12 + i + 24; // Start from A0 (MIDI note 21)
            key.textContent = octave * 12 + i + 24;
            keyboard.appendChild(key);
        }
    }
}

function updateKeyboard() {
    for (let key of keys) {
        key.classList.remove('active', 'correct', 'incorrect');
    }
    for (let note of activeNotes) {
        const key = keyboard.querySelector(`[data-note="${note.midiNote}"]`);
        if (key) key.classList.add('active');
    }
    if (currentExercise) {
        highlightPlayedNotes();
    }
}

createKeyboard();
window.addEventListener('resize', createKeyboard);

// Interactive keyboard

const keyboardMap = {
    81: 60, 90: 61, 83: 62, 69: 63, 68: 64, 70: 65, 84: 66,
    71: 67, 89: 68, 72: 69, 85: 70, 74: 71, 75: 72, 79: 73,
    76: 74, 80: 75, 77: 76
};

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

function handleKeyDown(event) {
    if (event.repeat) return;
    if (keyboardMap[event.keyCode]) { noteOn(keyboardMap[event.keyCode], 127); }
}

function handleKeyUp(event) { noteOff(keyboardMap[event.keyCode]); }

// Click on keys
keyboard.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    if (e.target.classList.contains('key')) {
        noteOn(e.target.getAttribute('data-note'), 50);
    }
});

keyboard.addEventListener('mouseup', () => {
    isMouseDown = false;
    Array.from(keys).forEach(key => {
        if (key.classList.contains('active')) {
            noteOff(key.getAttribute('data-note'));
        }
    });
});

// Chord exercice

function startExercise(type) {
    if (!exerciseTypes.includes(type)) return;
    currentExercise = type;
    if (type === 'chords') {
        nextChordExercise();
    } else if (type === 'scales') {
        nextScaleExercise();
    }
    updateUI();
}

function stopExercise() {
    currentExercise = null;
    currentChord = null;
    currentScale = null;
    answer = true;
    toggleAnswer();
    updateUI();
    for (let key of keys) {
        key.classList.remove('correct', 'incorrect');
    }
}

function nextChordExercise() {
    let chordNames = Object.keys(chordPatterns).filter(key => key.includes(','));
    let randomChord = chordNames[Math.floor(Math.random() * chordNames.length)];
    let rootNote = noteNames[Math.floor(Math.random() * 12)];
    currentChord = { root: rootNote, type: chordPatterns[randomChord], intervals: randomChord };
    updateUI();
}

function getChordNotes(intervals) {
    let shift = noteNames.indexOf(currentChord.root);
    let chordNotes = [noteNames[shift]];
    intervals.forEach(interval => {
        shift += Number(interval) + 1;
        if (shift > 11) { shift -= 12; }
        chordNotes.push(noteNames[shift]);
    })
    return chordNotes;
}

function checkChord() {
    if (!currentChord) return;
    const expectedNotes = getChordNotes(currentChord.intervals.split(','));
    const playedNotes = activeNotes.map(note => note.name.replace(/\d+/, '')); // Remove octave number
    const isCorrect = expectedNotes.every(note => playedNotes.includes(note)) &&
        playedNotes.every(note => expectedNotes.includes(note));

    if (isCorrect) {
        highlightCorrectChord();
        setTimeout(() => {
            answer = true;
            toggleAnswer();
            nextChordExercise();
        }, 1000);
    } else {
        highlightPlayedNotes();
    }
}

function highlightPlayedNotes() {
    // const correctNotes = getChordNotes(currentChord.root, currentChord.intervals.split(','));
    if (currentExercise === 'chords') {
        correctNotes = getChordNotes(currentChord.intervals.split(','));
    } else if (currentExercise === 'scales') {
        correctNotes = getScaleNotes(currentScale.intervals.split(','));
    } else { return; }

    activeNotes.forEach(note => {
        const noteName = note.name.replace(/\d+/, ''); // Remove octave number
        const isCorrect = correctNotes.includes(noteName);
        highlightNote(note.midiNote, isCorrect ? 'correct' : 'incorrect');
    });
}

function highlightCorrectChord() {
    correctNotes = getChordNotes(currentChord.intervals.split(','));
    highlightNotes(correctNotes, 'correct');
}

// Scale exercise

function nextScaleExercise() {
    let scaleNames = Object.keys(scalePatterns).filter(key => key.includes(','));
    let randomScale = scaleNames[Math.floor(Math.random() * scaleNames.length)];
    let rootNote = noteNames[Math.floor(Math.random() * 12)];
    currentScale = { root: rootNote, type: scalePatterns[randomScale], intervals: randomScale };
    checkScale();
    updateUI();
}

function getScaleNotes(intervals) {
    let shift = noteNames.indexOf(currentScale.root);
    let scaleNotes = [];
    intervals.forEach(interval => {
        scaleNotes.push(noteNames[shift]);
        shift += Number(interval) + 1;
        if (shift > 11) { shift -= 12; }
    })
    return scaleNotes;
}

function checkScale() {
    if (!currentScale) return;
    const expectedNotes = getScaleNotes(currentScale.intervals.split(','));
    const playedNotes = activeNotes.map(note => note.name.replace(/\d+/, '')); // Remove octave number
    const isCorrect = expectedNotes.every(note => playedNotes.includes(note)) &&
        playedNotes.every(note => expectedNotes.includes(note));

    if (isCorrect) {
        highlightCorrectScale();
        setTimeout(() => {
            answer = true;
            toggleAnswer();
            nextScaleExercise();
        }, 1000);
    } else {
        highlightPlayedNotes();
    }
}

function highlightCorrectScale() {
    const correctNotes = getScaleNotes(currentScale.intervals.split(','));
    highlightNotes(correctNotes, 'correct');
}

// Highlight notes

function highlightNotes(notes, className) {
    for (let key of keys) {
        const keyNote = noteNames[key.dataset.note % 12];
        key.classList.remove('correct', 'incorrect');
        if (notes.includes(keyNote)) {
            key.classList.add(className);
        }
    }
}

function highlightNote(midiNote, className) {
    const key = keyboard.querySelector(`[data-note="${midiNote}"]`);
    if (key) {
        key.classList.remove('correct', 'incorrect');
        key.classList.add(className);
    }
}

// Actions

function toggleAnswer() {
    answer ^= true;
    if (answer) {
        showAnswerBtn.textContent = "Hide answer";
        if (currentExercise === 'chords') {
            highlightCorrectChord();
        }
        if (currentExercise === 'scales') {
            highlightCorrectScale();
        }
    } else {
        for (let key of keys) {
            key.classList.remove('correct', 'incorrect');
        }
        showAnswerBtn.textContent = "Show answer";
    }
}

function updateUI() {

    if (currentExercise) {
        startChordsBtn.style.display = 'none';
        startScalesBtn.style.display = 'none';
        stopExerciseBtn.style.display = 'inline-block';
        showAnswerBtn.style.display = 'inline-block';

        if (currentExercise === 'chords' && currentChord) {
            exerciseDisplay.textContent = `Play the ${currentChord.root} ${currentChord.type} chord`;
        } else if (currentExercise === 'scales' && currentScale ) {
            exerciseDisplay.textContent = `Play the ${currentScale.root} ${currentScale.type} scale`;
        }
    } else {
        startChordsBtn.style.display = 'inline-block';
        startScalesBtn.style.display = 'inline-block';
        stopExerciseBtn.style.display = 'none';
        showAnswerBtn.style.display = 'none';
        exerciseDisplay.textContent = '';
    }
}

updateUI();

// Color circle

function changeColor(notes) {
    let hue = 0;
    let saturation = 0;
    let lightness = 50;

    notes.forEach(note => { 
        hue += Math.floor(((note.midiNote % 12) * 360) / 12);
        saturation += Math.floor(((note.velocity % 127) * 100));
    })
    hue /= notes.length;
    saturation /= notes.length;

    colorCircle.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Chord maker

function populateChordSelect() {
    const select = document.getElementById('chord-list');
    select.innerHTML = '<option value="">Off</option>' + 
        Object.entries(chordPatterns)
            .filter(([key]) => isNaN(key) || parseInt(key) > 11)
            .map(([value, text]) => `<option value="${value}">${text}</option>`)
            .join('');
}

let chordMode = "Off";

function detectChordSelection() {
    const select = document.getElementById('chord-list');
    select.addEventListener('change', function() {
        if (this.value !== '') {
            chordMode = this.value.split(',');
            // playChord(this.value.split(','));
        } else {
            chordMode = "Off";
        }
    });
}

function playChord(intervals) {
    if (activeNotes.length === 1) {
        console.log("hey ", activeNotes);
    }
}

populateChordSelect();
detectChordSelection();
