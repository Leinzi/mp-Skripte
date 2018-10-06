// ==UserScript==
// @name          mp-no-relevant-links
// @author        leinzi
// @description   Bilderstrecken auf Moviepilot umgehen
// @grant         none
// @downloadURL   https://raw.githubusercontent.com/Leinzi/mp-Skripte/master/mp-no-relevant-links.user.js
// @require       https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// @include       /^(https?:\/\/www\.moviepilot.de\/news\/)(.*?)$/
// @version       0.1.0
// ==/UserScript==

var regWithoutSuffix        = /^(https?:\/\/www\.moviepilot.de\/news\/)([^\/\#]*?)$/;
var regFirstPageOne         = /^(https?:\/\/www\.moviepilot.de\/news\/)([^"]*?)\/(seite-1)$/;
var regLatterPages          = /^(https?:\/\/www\.moviepilot.de\/news\/)([^"]*?)\/(seite-([2-9]|2[0-6]))$/;

// gibt es nicht mehr?
var regWithCommentSuffix    = /^(https?:\/\/www\.moviepilot.de\/news\/)([^"]*?)\#(comments)$/;

var pages;

// Funktion, damit das Dokument erst fertig geladen wird
$(document).ready(function(){

}
