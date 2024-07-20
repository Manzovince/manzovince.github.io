const keyboard = document.getElementById('keyboard');
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const noteNamesFR = ['Do', 'Do#', 'Ré', 'Ré#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
let activeNotes = [];
let isMouseDown = false;

const notesDisplay = document.getElementById('notes');
const velocityDisplay = document.getElementById('velocity');
const intervalsDisplay = document.getElementById('intervals');
const chordDisplay = document.getElementById('chord');
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
    '3,2': 'Maj',
    '2,3': 'min',
    '2,2': 'Dim',
    '3,3': 'Aug',
    '1,4': 'sus2',
    '4,1': 'sus4',
    '3,2,1': 'Maj 6th',
    '2,3,1': 'min 6th',
    '3,2,2': 'Dom 7th',
    '3,2,3': 'Maj 7th',
    '2,3,2': 'min 7th',
    '2,2,2': 'Dim 7th',
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

function NotesToChordName(notes) {
    if (notes.length === 0) { return ""; }
    else if (notes.length === 1) { return noteNames[notes[0].midiNote % 12]; }
    else if (notes.length === 2) { return `${noteNames[notes[0].midiNote % 12]} + ${chordPatterns[calculateIntervals(notes) % 12]}`; }
    else {
        intervals = calculateIntervals(notes);
        let inversion = 0;

        console.log(notes);

        return `${noteNames[notes[inversion].midiNote % 12]} ${chordPatterns[intervals]}`;
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
    if (keyboardMap[event.keyCode]) { noteOn(keyboardMap[event.keyCode], 50); }
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
