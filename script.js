// Get color used by user
/*
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    colorMode('light');
} else {
    colorMode('dark');
}
*/
colorMode('dark');

// Greeting
function greeting() {
    const greets = ['Hello', 'Hi', 'Ahoy', 'Welcome', 'Hey', 'Bonjour', 'Holã', 'Ciao']
    var greet = greets[Math.floor(Math.random() * greets.length)];
    document.getElementById('greet').innerHTML = greet + ' !<br>';
}

// Set color theme
function colorMode(color) {
    if (color == "dark") {
        if (document.getElementById('color-mode')) {
            document.getElementById('color-mode').setAttribute("onClick", "javascript: colorMode('light');");
            document.getElementById('color-mode').innerHTML = `<svg id="sun" viewBox="0 0 24 24" width="20" height="20" stroke="#F1ECE2" stroke-width="1" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
            document.getElementById('color-mode').style.backgroundColor = "#f1ece225";
        }
        document.getElementById('logo').setAttribute('src', './assets/vm-logo.svg')
        if (document.getElementById('page')) {
            document.getElementById('page').className = 'body-dark';
        }
        document.getElementById('navigation').className = 'nav-dark';
        if (document.getElementById('header')) {
            greeting();
            document.getElementById('header').className = 'dark';
            document.getElementById('work').className = 'dark';
            document.getElementById('about').className = 'dark';
            document.getElementsByTagName('footer')[0].className = 'dark';
        }
        if (document.getElementById('project')) {
            document.getElementById('project').className = 'dark';
            document.getElementsByTagName('footer')[0].className = 'dark';
        }
    } else if (color == "light") {
        if (document.getElementById('color-mode')) {
            document.getElementById('color-mode').setAttribute("onClick", "javascript: colorMode('dark');");
            document.getElementById('color-mode').innerHTML = `<svg id="moon" viewBox="0 0 24 24" width="20" height="20" stroke="#15181A" stroke-width="1" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
            document.getElementById('color-mode').style.backgroundColor = "#15181a25";
        }
        document.getElementById('logo').setAttribute('src', './assets/vm-logo-black.svg')
        if (document.getElementById('page')) {
            document.getElementById('page').className = 'body-light';
        }
        document.getElementById('navigation').className = 'nav-light';
        if (document.getElementById('header')) {
            greeting();
            document.getElementById('header').className = 'light';
            document.getElementById('work').className = 'light';
            document.getElementById('about').className = 'light';
            document.getElementsByTagName('footer')[0].className = 'light';
        }
        if (document.getElementById('project')) {
            document.getElementById('project').className = 'light';
            document.getElementsByTagName('footer')[0].className = 'light';
        }
    }
}

// Navigation hider
var prevScrollpos = window.pageYOffset;

// Navigation follower
function checkVisible(id) {
    var el = document.getElementById(id);
    var rect = el.getBoundingClientRect();
    var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

// Navigation effects
window.onscroll = function () {
    document.getElementById('work-btn').style.borderBottom = checkVisible('work') ? '2px solid' : '';
    document.getElementById('work-btn').style.fontWeight = checkVisible('work') ? '600' : '';
    document.getElementById('about-btn').style.borderBottom = checkVisible('about') ? '2px solid' : '';
    document.getElementById('about-btn').style.fontWeight = checkVisible('about') ? '600' : '';

    var currentScrollPos = window.pageYOffset;
    if (prevScrollpos > currentScrollPos) {
        document.getElementById('navigation').style.top = "0";
    } else {
        document.getElementById('navigation').style.top = "-110px";
    }
    if (currentScrollPos <= 0) {
        document.getElementById('navigation').style.top = "0";
    }
    prevScrollpos = currentScrollPos;
};

// Toggle
function toggle(el) {
    if (document.getElementById(el).style.display == 'block') {
        document.getElementById(el).style.display = 'none';
    } else {
        document.getElementById(el).style.display = 'block';
    }
}

// Random music
function randomMusic() {
    let musics = ['<iframe scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/5501395&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=false&show_reposts=false&show_teaser=true&visual=true"></iframe>'];
    let music = musics[Math.floor(Math.random() * musics.length)];
    document.getElementById('jukebox').innerHTML = music;
}

// Konami code
let cursor = 0;
const KONAMI_CODE = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
document.addEventListener('keydown', (e) => {
    cursor = (e.keyCode == KONAMI_CODE[cursor]) ? cursor + 1 : 0;
    if (cursor == KONAMI_CODE.length) activate();
});

// Game
function activate() {
    alert("Well done! Now click on the 01100110 01101001 01110010 01110011 01110100 00100000 01100100 01101111 01110100");
}

function start() {
    alert("Seeeecret game! Ok let's go.");
    window.location.href = "./unknown.html";
}

function step2() {
    alert("Well done! Next part is currently under development. Stay tuned ;)");
}