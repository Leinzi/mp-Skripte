// ==UserScript==
// @name                MP-Series-Cleanup (jQuery)
// @description	        Moviepilot-Serienseite bereinigen - Framework
// @grant               none
// @require							https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js 
// @include	        		https://www.moviepilot.de/serie/*
// @include           	/^(https:)\/\/(.+\.)?(moviepilot.de)\/serie\/(.*)\/(staffel)\/([0-9]|[1-9][0-9])$/
// @exclude	        		/^(https:)\/\/(.+\.)?(moviepilot.de)\/serie\/(.*)\/(staffel)\/([0-9]|[1-9][0-9])\/([a-zA-Z].*)?/
// @version							20180302
// ==/UserScript==

// jQuery-Konflikte loesen
this.$ = this.jQuery = jQuery.noConflict(true);

//RegExps
var series_main = /^(https:)\/\/(.+\.)?(moviepilot.de)\/serie\/(.*$)/;

// Funktion, damit das Dokument erst fertig geladen wird
$(document).ready(function(){

  // Variablendefinitionen
  // Hinweis: 'i' wird bewusst ausgelassen
  var h3header 			= $(".h3-headline--wrapper");
  var headervideo 	= $(".hero--play");
  var werbung1 			= $(".grid--col-lg-4");
  var werbung2 			= $(".advertisement--medium-rectangle");


  // ----- Generelles - Anfang -----
  // Videoplayer im Header entfernen
  headervideo.remove();
  // H3-Header entfernen
  h3header.remove();
  // Werbe-DIVs entfernen
  werbung1[1].remove();
  werbung1[3].remove();
  werbung2.remove();
  // ----- Generelles - Ende -----
  

  // Funktionen etc.
  if ( series_main.test(window.location.href) ){
		filterMainPage();
  }
});

function filterMainPage() {
  var sections 		= $("section.has-vertical-spacing");

  // "Statistik" entfernen
  removeElementByText(sections, 'h2', 'Statistiken');
  // "Streaming" entfernen  
  removeElementByText(sections, 'h2', 'Schaue jetzt');
  // "Handlung" entfernen
  //removeElementByText(sections, 'h2', 'Handlung');
  // "Cast & Crew" entfernen
  //removeElementByText(sections, 'h2', 'Cast');
  // "Alle Staffeln ..." entfernen
  //removeElementByText(sections, 'h2', '1 Staffel von');
  //removeElementByText(sections, 'h2', ' Staffeln von');
  // "Recaps" entfernen
  removeElementByText(sections, 'h2', 'Recaps');
  // "News" entfernen
  removeElementByText(sections, 'h2', 'News');
  // "Freunde" entfernen
  //removeElementByText(sections, 'h2', 'Deine Freunde'); 
  // "Kommentare" entfernen
  //removeElementByText(sections, 'h2', 'Kommentare'); 
  // "Videos & Bilder" entfernen
  removeElementByText(sections, 'h2', 'Videos & Bilder'); 
  // "Serien wie ..." entfernen
  removeElementByText(sections, 'h2', 'Serien wie');
  // Listen etc. entfernen
  removeElementByText(sections, 'a', 'Listen mit'); 
  // "Interessen" entfernen
  removeElementByText(sections, 'h2', 'Das könnte dich auch interessieren');
}

function removeElementByText(selection, descendantSelector, text) {
  var element 	= selection.filter(":has("+descendantSelector+":contains("+ text +"))");
  selection.remove();
}