// ==UserScript==
// @name          mp-no-relevant-links
// @author        leinzi
// @description   Bilderstrecken auf Moviepilot umgehen
// @grant         none
// @downloadURL   https://raw.githubusercontent.com/Leinzi/mp-Skripte/master/mp-no-relevant-links.user.js
// @include       /^(https?:\/\/www\.moviepilot.de\/news)(\?page=([1-9][0-9]*))?$/
// @version       0.1.5
// ==/UserScript==

if (document.readyState !== 'loading') {
  hideRelevantLinks();
} else {
  document.addEventListener('DOMContentLoaded', hideRelevantLinks);
}

function hideRelevantLinks() {
  document
    .querySelectorAll('p')
    .forEach((p) => {
      if (p.textContent.includes('Relevante Links')) {
        p.style.display = 'none';
      }
    });
}
