// ==UserScript==
// @name                MP-Fonts
// @description         Moviepilot Fonts ändern
// @author              leinzi
// @grant               none
// #downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-fonts.user.js
// @include             /^https?:\/\/www\.moviepilot.de\//
// @version             0.0.2
// ==/UserScript==


if (document.readyState !== 'loading') {
  performCleanUp();
} else {
  document.addEventListener('DOMContentLoaded', performCleanUp);
}

function performCleanUp() {
  loadOriginalFonts()
  loadFonts();
  //improveFonts();
}

// ----- Improvements - Anfang -----
function loadOriginalFonts() {
  let html = document.querySelector('html');
  html.classList.add('wf-notosans-n4-active')
  html.classList.add('wf-notoserif-n4-active')
  html.classList.add('wf-notoserif-i4-active')
  html.classList.add('wf-oswald-n4-active')
  html.classList.add('wf-oswald-n5-active')
  html.classList.add('wf-oswald-n6-active')
  html.classList.add('wf-active')
}

function loadFonts() {
  let fonts = document.createElement('link');
  fonts.href = 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Roboto:ital,wght@0,400;0,500;0,700;1,400&family=Noto+Serif:ital,wght@0,400;0,700;1,400;1,700&display=swap';
  fonts.rel = "stylesheet";
  document.getElementsByTagName('head')[0].appendChild(fonts);
}

function improveFonts() {
  let style = document.createElement('style');
  style.type = 'text/css';

  let improvements = 'html,body * { font-family: "Roboto", serif !important; } h1,h2,h3,h4,h5,h6 { font-family: "Oswald", serif !important; }'

  if (style.styleSheet) {
    style.styleSheet.cssText = improvements;
  } else {
    style.appendChild(document.createTextNode(improvements));
  }
  document.getElementsByTagName('head')[0].appendChild(style);
}

// ----- Improvements - Ende -----
