// ==UserScript==
// @name                MP-Series-Cleanup (jQuery)
// @description	        Moviepilot-Serienseite bereinigen - Framework
// @grant               none
// @require							https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// @include	        		/^(https?:)\/\/(.+\.)?(moviepilot.de)\/serie\/(.*)$/
// @version							20180302
// ==/UserScript==

// jQuery-Konflikte loesen
this.$ = this.jQuery = jQuery.noConflict(true);

//RegExps
var series_main = /^(https:)\/\/(.+\.)?(moviepilot.de)\/serie\/((?!\/).)*$/;
var series_stream = /^(https:)\/\/(.+\.)?(moviepilot.de)\/serie\/(.*)\/(online-schauen)$/;
var series_season = /^(https:)\/\/(.+\.)?(moviepilot.de)\/serie\/(.*)\/(staffel)\/([1-9]?[0-9]+)$/
var series_season_stream = /^(https:)\/\/(.+\.)?(moviepilot.de)\/serie\/(.*)\/(staffel)\/([1-9]?[0-9]+)\/(online-schauen)$/

// Funktion, damit das Dokument erst fertig geladen wird
$(document).ready(function(){

  // Variablendefinitionen
  // Hinweis: 'i' wird bewusst ausgelassen

  var werbung 			= $(".advertisement--medium-rectangle");
  var adsOuter			= $("#ads-outer");

  // ----- Generelles - Anfang -----
  // Videoplayer im Header entfernen
  removeVideoplayer();

  // H3-Header entfernen
  //removeH3Header();

  // Werbe-DIVs entfernen
  werbung.remove();
  adsOuter.remove();
  // ----- Generelles - Ende -----

  improveStyle();

  // Funktionen etc.
  if ( series_main.test(window.location.href) || series_season.test(window.location.href)  ){
    improveMainPage();
    filterMainPage();
  } else if ( series_stream.test(window.location.href) || series_season.test(window.location.href)){
    var kurzbeschreibung 	= $('div').find('.grid--col-lg-8');
  	kurzbeschreibung.removeClass('grid--col-lg-8');
  	kurzbeschreibung.addClass('grid--col-lg');
    kurzbeschreibung.removeClass('grid--col-md-7');
  	kurzbeschreibung.addClass('grid--col-md');
  }
  // } else if (  ){
  //   improveMainPage();
  //   filterMainPage();
  // } else if ( series_season_stream.test(window.location.href) ){
  //   var kurzbeschreibung 	= $('div').find('.grid--col-lg-8');
  // 	kurzbeschreibung.removeClass('grid--col-lg-8');
  // 	kurzbeschreibung.addClass('grid--col-lg');
  //   kurzbeschreibung.removeClass('grid--col-md-7');
  // 	kurzbeschreibung.addClass('grid--col-md');
  // }
});

// Videoplayer im Header entfernen
function removeVideoplayer() {
  var headervideo 	= $(".hero--play");
  headervideo.remove();
}

function removeH3Header() {
  var h3header 			= $(".h3-headline--wrapper");
  h3header.remove();
}

function filterMainPage() {
  var sections 		= $('section.has-vertical-spacing');

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

function improveMainPage() {
  var sections		= $('section.has-vertical-spacing');

  var statistik 				= getElementByText(sections, 'h2', 'Statistiken');
	var statColumnLeft 		= statistik.find('.grid--col-lg-8');
	var statColumnRight 	= statistik.find('.grid--col-lg-4');
  statColumnLeft.removeClass('grid--col-lg-8');
  statColumnLeft.addClass('grid--col-lg');
  statColumnRight.remove();

  var kommentare 	= getElementByText(sections, 'h2', 'Kommentare');
	var kommColumnLeft 		= kommentare.find('.grid--col-lg-8');
	var kommColumnRight 	= kommentare.find('.grid--col-lg-4');
  kommColumnLeft.removeClass('grid--col-lg-8');
  kommColumnLeft.addClass('grid--col-lg');
  kommColumnRight.remove();
}

function removeElementByText(selection, descendantSelector, text) {
  var element 	= getElementByText(selection, descendantSelector, text);
  element.remove();
}

function getElementByText(selection, descendantSelector, text) {
  var element 	= selection.filter(":has("+descendantSelector+":contains("+ text +"))");
  return element;
}

function improveStyle() {
  $('.layout--content-width').css({'max-width': '80%'});
  $('._3CAHP').css({'max-width': '80%'});

	$('.hero').css('height', '250px');
	$('.has-vertical-spacing').css('padding', '25px 0');
	$('.item-statistics').css('margin-top', '0');
	$('.item-statistics--area').css('margin-top', '25px');
	$('.item-statistics--subline.typo--teaser-body').css({'font-size': '14px', 'line-height': '24px'});

	$('.typo--long-body').css({'font-size': '15px', 'line-height': '24px'});
	$('.meta-details--heading').css({'margin-top': '0', 'font-size': '14px', 'text-transform': 'none'});
	$('.meta-details--content').css({'margin-bottom': '15px', 'font-size': '14px'});
	$('.slider--avatars').css({'height': '250px'});
	$('.slider--avatars--item').css({'flex-basis': '180px', 'margin-right': '20px'});
	$('.avatar--image').css({'filter': 'none', '-webkit-filter': 'none'});
	$('.avatar--gradient').css({'background': 'none'});

	$('._3gBYU').css({'filter': 'none', '-webkit-filter': 'none'});
	$('._3WDUx').css({'background': 'none'});
	$('.cLbdk').css({'font-size': '13px'});
	$('.X76-l').css({'font-size': '13px', 'line-height': '1.4em'});
	$('h2').css({'font-size': '26px', 'line-height': '29px', 'letter-spacing': '0.02em'});
	$('.avatar--list-item--title-subline').css({'font-size': '15px'});
}
