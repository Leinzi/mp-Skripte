// ==UserScript==
// @name                MP-Series-Cleanup (jQuery)
// @description         Moviepilot-Serienseite bereinigen - Framework
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-series-cleanup.user.js
// @require             https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// @include             /^(https?):\/\/(www\.)?(moviepilot\.de)\/(serie)\/([^\/]*)((\/[^\/]*)*)$/
// @version             20180302
// ==/UserScript==

// jQuery-Konflikte loesen
this.$ = this.jQuery = jQuery.noConflict(true);

//RegExps
var series_main = /^(https?):\/\/(www\.)?(moviepilot\.de)\/(serie)\/([^\/]*)$/;
var series_stream = /^(https?):\/\/(www\.)?(moviepilot\.de)\/(serie)\/([^\/]*)\/(online-schauen)$/;
var series_season = /^(https?):\/\/(www\.)?(moviepilot\.de)\/(serie)\/([^\/]*)\/(staffel)\/([1-9][0-9]*)$/;
var series_season_stream = /^(https?):\/\/(www\.)?(moviepilot\.de)\/(serie)\/([^\/]*)\/(staffel)\/([1-9][0-9]*)\/(online-schauen)$/;

var checkboxDiv = null;
var checkboxes = [];

// Funktion, damit das Dokument erst fertig geladen wird
$(document).ready(function(){
  load();
  // Variablendefinitionen
  // Hinweis: 'i' wird bewusst ausgelassen

  var werbung = $(".advertisement--medium-rectangle");
  var adsOuter = $("#ads-outer");

  // ----- Generelles - Anfang -----
  // Videoplayer im Header entfernen
  removeVideoplayer();
  // Videoplayer im Footer entfernen
  removeFooterVideoplayer()
  
  // H3-Header entfernen
  //removeH3Header();

  // Werbe-DIVs entfernen
  werbung.remove();
  adsOuter.remove();
  // ----- Generelles - Ende -----

  // improveStyle();
    

  // Funktionen etc.
  if ( series_main.test(window.location.href) || series_season.test(window.location.href)  ){
    buildCheckboxes();
    improveMainPage();
    filterMainPage();
  } else if ( series_stream.test(window.location.href) || series_season.test(window.location.href)){
    var kurzbeschreibung   = $('div').find('.grid--col-lg-8');
    kurzbeschreibung.removeClass('grid--col-lg-8');
    kurzbeschreibung.addClass('grid--col-lg');
    kurzbeschreibung.removeClass('grid--col-md-7');
    kurzbeschreibung.addClass('grid--col-md');
  }

});



// Videoplayer im Header entfernen
function removeVideoplayer() {
  var headervideo = $(".hero--play");
  headervideo.remove();
}

function removeH3Header() {
  var h3header = $(".h3-headline--wrapper");
  h3header.remove();
}

function filterMainPage() {
  var sections = $('section.has-vertical-spacing');

  for(var i = 0; i < checkboxes.length; i++) {
    var checkbox = checkboxes[i];
    if(checkbox.checked){
      hideElementByText(sections, checkbox.dataset.child, checkbox.dataset.headline);
    } else {
      showElementByText(sections, checkbox.dataset.child, checkbox.dataset.headline);
    }
   }
}

function improveMainPage() {
  var sections = $('section.has-vertical-spacing');

  var statistik = getElementByText(sections, 'h2', 'Statistiken');
  var statColumnLeft = statistik.find('.grid--col-lg-8');
  var statColumnRight = statistik.find('.grid--col-lg-4');
  statColumnLeft.removeClass('grid--col-lg-8');
  statColumnLeft.addClass('grid--col-lg');
  statColumnRight.remove();

  var kommentare = getElementByText(sections, 'h2', 'Kommentare');
  var kommColumnLeft = kommentare.find('.grid--col-lg-8');
  var kommColumnRight = kommentare.find('.grid--col-lg-4');
  kommColumnLeft.removeClass('grid--col-lg-8');
  kommColumnLeft.addClass('grid--col-lg');
  kommColumnRight.remove();
}

function hideElementByText(selection, descendantSelector, text) {
  var element = getElementByText(selection, descendantSelector, text);
  element.hide();
}

function showElementByText(selection, descendantSelector, text) {
  var element = getElementByText(selection, descendantSelector, text);
  element.show();
}

function getElementByText(selection, descendantSelector, text) {
  var element = selection.filter(":has("+descendantSelector+":contains("+ text +"))");
  return element;
}

// Videoplayer im Header entfernen
function removeFooterVideoplayer() {
  var footervideo = $(".video--player--footer");
  footervideo.remove();
}

function buildCheckboxes() {

  var container = $('.hot-now').closest('section');
  
  checkboxDiv = document.createElement('div');
  checkboxDiv.id = 'rmvDiv';
  $(checkboxDiv).addClass('grid--row');
  
  var rubrikDiv = document.createElement('div');
  var checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('id', 'rmvStatistik');
  $(checkbox).attr("data-headline", "Statistiken");
  $(checkbox).attr("data-child", "h2");
  checkboxes.push(checkbox);
  
  var label = document.createElement('label')
  label.htmlFor = checkbox.id;
  label.appendChild(document.createTextNode(checkbox.dataset.headline));

  rubrikDiv.append(checkbox);
  rubrikDiv.append(label);
  checkboxDiv.append(rubrikDiv);
  
  rubrikDiv = document.createElement('div');
  checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('id', 'rmvStreaming');
  $(checkbox).attr("data-headline", "Schaue jetzt");
  $(checkbox).attr("data-child", "h2");
  checkboxes.push(checkbox);

  label = document.createElement('label');
  label.htmlFor = checkbox.id;
  label.appendChild(document.createTextNode(checkbox.dataset.headline));

  rubrikDiv.append(checkbox);
  rubrikDiv.append(label);
  checkboxDiv.append(rubrikDiv);
  
  rubrikDiv = document.createElement('div');
  checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('id', 'rmvHandlung');
  $(checkbox).attr("data-headline", "Handlung");
  $(checkbox).attr("data-child", "h2");
  checkboxes.push(checkbox);

  label = document.createElement('label');
  label.htmlFor = checkbox.id;
  label.appendChild(document.createTextNode(checkbox.dataset.headline));

  rubrikDiv.append(checkbox);
  rubrikDiv.append(label);
  checkboxDiv.append(rubrikDiv);
  
  rubrikDiv = document.createElement('div');
  checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('id', 'rmvCast');
  $(checkbox).attr("data-headline", "Cast & Crew");
  $(checkbox).attr("data-child", "h2");
  checkboxes.push(checkbox);

  label = document.createElement('label')
  label.htmlFor = checkbox.id;
  label.appendChild(document.createTextNode(checkbox.dataset.headline));

  rubrikDiv.append(checkbox);
  rubrikDiv.append(label);
  checkboxDiv.append(rubrikDiv);
  
  rubrikDiv = document.createElement('div');
  checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('id', 'rmvStaffel');
  $(checkbox).attr("data-headline", "Staffel");
  $(checkbox).attr("data-child", "h2");
  checkboxes.push(checkbox);

  label = document.createElement('label')
  label.htmlFor = checkbox.id;
  label.appendChild(document.createTextNode(checkbox.dataset.headline));

  rubrikDiv.append(checkbox);
  rubrikDiv.append(label);
  checkboxDiv.append(rubrikDiv);
  
  rubrikDiv = document.createElement('div');
  checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('id', 'rmvRecap');
  $(checkbox).attr("data-headline", "Recap");
  $(checkbox).attr("data-child", "h2");
  checkboxes.push(checkbox);

  label = document.createElement('label')
  label.htmlFor = checkbox.id;
  label.appendChild(document.createTextNode(checkbox.dataset.headline));

  rubrikDiv.append(checkbox);
  rubrikDiv.append(label);
  checkboxDiv.append(rubrikDiv);
  
  rubrikDiv = document.createElement('div');
  checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('id', 'rmvNews');
  $(checkbox).attr("data-headline", "News");
  $(checkbox).attr("data-child", "h2");
  checkboxes.push(checkbox);

  label = document.createElement('label')
  label.htmlFor = checkbox.id;
  label.appendChild(document.createTextNode(checkbox.dataset.headline));

  rubrikDiv.append(checkbox);
  rubrikDiv.append(label);
  checkboxDiv.append(rubrikDiv);
  
  rubrikDiv = document.createElement('div');
  checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('id', 'rmvFreunde');
  $(checkbox).attr("data-headline", "Deine Freunde");
  $(checkbox).attr("data-child", "h2");
  checkboxes.push(checkbox);

  label = document.createElement('label')
  label.htmlFor = checkbox.id;
  label.appendChild(document.createTextNode(checkbox.dataset.headline));

  rubrikDiv.append(checkbox);
  rubrikDiv.append(label);
  checkboxDiv.append(rubrikDiv);
  
  rubrikDiv = document.createElement('div');
  checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('id', 'rmvComments');
  $(checkbox).attr("data-headline", "Kommentare");
  $(checkbox).attr("data-child", "h2");
  checkboxes.push(checkbox);

  label = document.createElement('label')
  label.htmlFor = checkbox.id;
  label.appendChild(document.createTextNode(checkbox.dataset.headline));

  rubrikDiv.append(checkbox);
  rubrikDiv.append(label);
  checkboxDiv.append(rubrikDiv);
  
  rubrikDiv = document.createElement('div'); 
  checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('id', 'rmvVideos');
  $(checkbox).attr("data-headline", "Videos & Bilder");
  $(checkbox).attr("data-child", "h2");
  checkboxes.push(checkbox);

  label = document.createElement('label')
  label.htmlFor = checkbox.id;
  label.appendChild(document.createTextNode(checkbox.dataset.headline));

  rubrikDiv.append(checkbox);
  rubrikDiv.append(label);
  checkboxDiv.append(rubrikDiv);
  
  rubrikDiv = document.createElement('div'); 
  checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('id', 'rmvLike');
  $(checkbox).attr("data-headline", "Serien wie");
  $(checkbox).attr("data-child", "h2");
  checkboxes.push(checkbox);

  label = document.createElement('label')
  label.htmlFor = checkbox.id;
  label.appendChild(document.createTextNode(checkbox.dataset.headline));

  rubrikDiv.append(checkbox);
  rubrikDiv.append(label);
  checkboxDiv.append(rubrikDiv);
  
  rubrikDiv = document.createElement('div');
  checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('id', 'rmvListen');
  $(checkbox).attr("data-headline", "Listen mit");
  $(checkbox).attr("data-child", "a");
  checkboxes.push(checkbox);

  label = document.createElement('label')
  label.htmlFor = checkbox.id;
  label.appendChild(document.createTextNode(checkbox.dataset.headline));

  rubrikDiv.append(checkbox);
  rubrikDiv.append(label);
  checkboxDiv.append(rubrikDiv);
  
  rubrikDiv = document.createElement('div');
  checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('id', 'rmvInteresse');
  $(checkbox).attr("data-headline", "Das könnte dich auch interessieren");
  $(checkbox).attr("data-child", "h2");
  checkboxes.push(checkbox);

  label = document.createElement('label')
  label.htmlFor = checkbox.id;
  label.appendChild(document.createTextNode(checkbox.dataset.headline));

  rubrikDiv.append(checkbox);
  rubrikDiv.append(label);
  checkboxDiv.append(rubrikDiv);
  
  rubrikDiv = document.createElement('div');
  var button = document.createElement('input');
  button.type = "button";
  button.value = "save";
  button.id = "rmvSave";

  rubrikDiv.append(button);
  checkboxDiv.append(rubrikDiv);
  $(button).click(save);
  
  load();
  var section = document.createElement('section');
  section.setAttribute('class', 'has-vertical-spacing');
  var headlineWrapper = document.createElement('div');
  headlineWrapper.setAttribute('class', 'h2-headline--wrapper');
  var header = document.createElement("h2");
  header.setAttribute('class', 'h2-headline');
  $(header).text("Rubrikenauswahl");
  headlineWrapper.append(header);
  var header2 = document.createElement("h3");
  header2.setAttribute('class', 'h3-headline');
  $(header2).text("Ausgewählte Rubriken werden ausgeblendet.");
  headlineWrapper.append(header2);
  section.append(headlineWrapper);
  section.append(checkboxDiv);
  container.after(section);
  
 $('#rmvDiv > div').css({'display': 'inline-block', 'width': '25%'});
 $('#rmvDiv > div:nth-last-child(2)').css({'width': '50%'}); 
 
}

function save(){
  for(var i = 0; i < checkboxes.length; i++) {
    var checkbox = checkboxes[i];
    localStorage.setItem(checkbox.id, checkbox.checked);
  }
  filterMainPage();
}

function load(){    
  for(var i = 0; i < checkboxes.length; i++) {
    var checkbox = checkboxes[i];
    checkbox.checked = JSON.parse(localStorage.getItem(checkbox.id));      
  }
}

function improveStyle() {
  //$('.layout--content-width').css({'max-width': '75%'});
  //$('._3CAHP').css({'max-width': '80%'});

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