// ==UserScript==
// @name          mp-no-relevant-links
// @author        leinzi
// @description   Bilderstrecken auf Moviepilot umgehen
// @grant         none
// @downloadURL   https://raw.githubusercontent.com/Leinzi/mp-Skripte/master/mp-no-relevant-links.user.js
// @require       https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// @include       /^(https?:\/\/www\.moviepilot.de\/news)(\?page=([1-9][0-9]*))?$/
// @version       0.1.3
// ==/UserScript==


// Funktion, damit das Dokument erst fertig geladen wird
$(document).ready(function(){
  var linkParagraphs = $('p:contains("Relevante Links")');
  linkParagraphs.remove();
});
