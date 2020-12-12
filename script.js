
// Get color used by user
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    colorMode('light');
} else {
    colorMode('dark');
}

// Set color theme
function colorMode(color) {
    if (color == "dark") {
        document.getElementById('color-mode').setAttribute( "onClick", "javascript: colorMode('light');");
        document.getElementById('color-mode').innerHTML = `<svg id="sun" viewBox="0 0 24 24" width="20" height="20" stroke="#F1ECE2" stroke-width="1" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
        document.getElementById('color-mode').style.backgroundColor = "#f1ece225";
        document.getElementById('logo').setAttribute('src', './assets/vm-logo.svg')
        document.getElementById('page').className = 'body-dark';
        document.getElementById('navigation').className = 'nav-dark';
        if (document.getElementById('header')) {
            document.getElementById('header').className = 'dark';
            document.getElementById('work').className = 'dark';
            document.getElementById('about').className = 'dark';
        }
        document.getElementsByTagName('footer')[0].className = 'dark';
        if (document.getElementById('project')) {
            document.getElementById('project').className = 'dark';
        }
        for (let i = 0; i < document.getElementsByClassName('xp-line').length; i++) {
            document.getElementsByClassName('xp-line')[i].classList.remove('xp-light');
            document.getElementsByClassName('xp-line')[i].classList.add('xp-dark');
        }
    }
    else if (color == "light") {
        document.getElementById('color-mode').setAttribute( "onClick", "javascript: colorMode('dark');" );
        document.getElementById('color-mode').innerHTML = `<svg id="moon" viewBox="0 0 24 24" width="20" height="20" stroke="#15181A" stroke-width="1" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        document.getElementById('color-mode').style.backgroundColor = "#15181a25";
        document.getElementById('logo').setAttribute('src', './assets/vm-logo-black.svg')
        document.getElementById('page').className = 'body-light';
        document.getElementById('navigation').className = 'nav-light';
        if (document.getElementById('header')) {
            document.getElementById('header').className = 'light';
            document.getElementById('work').className = 'light';
            document.getElementById('about').className = 'light';
        }
        document.getElementsByTagName('footer')[0].className = 'light';
        if (document.getElementById('project')) {
            document.getElementById('project').className = 'light';
        }
        for (let i = 0; i < document.getElementsByClassName('xp-line').length; i++) {
            document.getElementsByClassName('xp-line')[i].classList.remove('xp-dark');
            document.getElementsByClassName('xp-line')[i].classList.add('xp-light');;
            
        }
    }
}

// Navigation follower
window.onscroll = function() {
    document.getElementById('work-btn').style.borderBottom = checkVisible('work') ? 'solid 1px' : '';
    document.getElementById('about-btn').style.borderBottom = checkVisible('about') ? 'solid 1px' : '';
};

function checkVisible(id) {
    var el = document.getElementById(id);
    var rect = el.getBoundingClientRect();
    var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}


// Toggle
function toggle(el) {
    if (document.getElementById(el).style.display == 'block') {
        document.getElementById(el).style.display = 'none';
    } else {
        document.getElementById(el).style.display = 'block';
    }
}