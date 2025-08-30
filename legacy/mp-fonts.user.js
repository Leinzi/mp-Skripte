// ==UserScript==
// @name                MP-Fonts
// @description         Moviepilot Fonts ändern
// @author              leinzi
// @grant               none
// #downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-fonts.user.js
// @include             /^https?:\/\/www\.moviepilot.de\//
// @version             0.0.3

// ==/UserScript==

if (document.readyState !== 'loading') {
  performCleanUp();
} else {
  document.addEventListener('DOMContentLoaded', performCleanUp);
}

function performCleanUp() {
  loadOriginalFonts();
  loadFonts();
  // improveFonts();
}

// ----- Improvements - Anfang -----
const loadOriginalFonts = () => {
  const html = document.documentElement;
  html.classList.add(
    'wf-notosans-n4-active',
    'wf-notoserif-n4-active',
    'wf-notoserif-i4-active',
    'wf-oswald-n4-active',
    'wf-oswald-n5-active',
    'wf-oswald-n6-active',
    'wf-active'
  );
};

const loadFonts = () => {
  const fonts = document.createElement('link');
  fonts.href = 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Roboto:ital,wght@0,400;0,500;0,700;1,400&family=Noto+Serif:ital,wght@0,400;0,700;1,400;1,700&display=swap';
  fonts.rel = 'stylesheet';
  document.head.append(fonts);
};

const improveFonts = () => {
  const style = document.createElement('style');
  style.textContent = 'html,body * { font-family: "Roboto", serif !important; } h1,h2,h3,h4,h5,h6 { font-family: "Oswald", serif !important; }';
  document.head.append(style);
};

// ----- Improvements - Ende -----
