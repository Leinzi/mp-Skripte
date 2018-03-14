// ==UserScript==
// @name                MP-Series-Cleanup (jQuery)
// @description         Moviepilot-Serienseite bereinigen - Framework
// @grant               none
// #downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-series-cleanup.user.js
// @require             https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// @include             /^(https?):\/\/(www\.)?(moviepilot\.de)\/(serie)\/([^\/]*)((\/[^\/]*)*)$/
// @version             3.1.7
// ==/UserScript==

// jQuery-Konflikte loesen
this.$ = this.jQuery = jQuery.noConflict(true);

//RegExps
var series_main = /^(https?):\/\/(www\.)?(moviepilot\.de)\/(serie)\/([^\/]*)$/;
var series_stream = /^(https?):\/\/(www\.)?(moviepilot\.de)\/(serie)\/([^\/]*)\/(online-schauen)$/;
var series_season = /^(https?):\/\/(www\.)?(moviepilot\.de)\/(serie)\/([^\/]*)\/(staffel)\/([1-9][0-9]*)$/;
var series_season_stream = /^(https?):\/\/(www\.)?(moviepilot\.de)\/(serie)\/([^\/]*)\/(staffel)\/([1-9][0-9]*)\/(online-schauen)$/;

var seriesMainPage = true;
var checkboxes = [];

// Funktion, damit das Dokument erst fertig geladen wird
$(document).ready(function(){
  // ----- Generelles - Anfang -----
  var werbung = $(".advertisement--medium-rectangle");
  var adsOuter = $("#ads-outer");
  // Videoplayer im Header entfernen
  removeVideoplayer();
  // Videoplayer im Footer entfernen
  removeFooterVideoplayer();

  // H3-Header entfernen
  //removeH3Header();

  // Werbe-DIVs entfernen
  werbung.remove();
  adsOuter.remove();
  // ----- Generelles - Ende -----

  improveStyle();

  if ( series_main.test(window.location.href) ){
    seriesMainPage = true;
    cleanUpMainPage();
  } else if ( series_season.test(window.location.href) ){
    seriesMainPage = false;
    cleanUpMainPage();
  } else if ( series_stream.test(window.location.href) || series_season.test(window.location.href)){
    var kurzbeschreibung   = $('div').find('.grid--col-lg-8');
    kurzbeschreibung.removeClass('grid--col-lg-8');
    kurzbeschreibung.addClass('grid--col-lg');
    kurzbeschreibung.removeClass('grid--col-md-7');
    kurzbeschreibung.addClass('grid--col-md');
  }

});

function cleanUpMainPage(){
  buildAndPlaceCategorySection();
  loadCheckboxValues();

  improveMainPage();
  filterMainPage();
}

// Videoplayer im Header entfernen
function removeVideoplayer() {
  var headervideo = $(".hero--play");
  headervideo.remove();
}

function removeH3Header() {
  var h3header = $(".h3-headline--wrapper");
  h3header.remove();
}

// Videoplayer im Header entfernen
function removeFooterVideoplayer() {
  var footervideo = $(".video--player--footer");
  footervideo.remove();
}

// ----- Filter - Anfang -----

function filterMainPage() {
  var sections = $('section.has-vertical-spacing');

  for(var i = 0; i < checkboxes.length; i++) {
    var checkbox = checkboxes[i];
    if(checkbox.checked){
      showElementByText(sections, checkbox.dataset.child, checkbox.dataset.headline);
    } else {
      hideElementByText(sections, checkbox.dataset.child, checkbox.dataset.headline);
    }
   }
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

// ----- Filter - Ende -----

// ----- Improvements - Anfang -----

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

  $('.typo--long-body').css({'text-align': 'justify'});
  $('.typo--teaser-body').css({'text-align': 'justify', 'margin-right': '20px'});
  $('.item-statistics--subline').css({'text-align': 'center', 'margin-right': '0'});
  
  _$('.1w4X-').css({'text-align': 'justify'});
}

// ----- Improvements - Ende -----

// ----- Rubrikauswahl - Anfang -----

function buildAndPlaceCategorySection() {
  var categorySection = buildNewSection();

  var headlineWrapper = buildWrapperForHeadlines("Rubrikenauswahl", "Nicht ausgewählte Rubriken werden ausgeblendet.");
  categorySection.append(headlineWrapper);

  var checkboxDiv = seriesMainPage ? buildCheckboxDivForSeriesMain() : buildCheckboxDivForSeasonMain();
  categorySection.append(checkboxDiv);

  var prevSection = $('.hot-now').closest('section');
  prevSection.after(categorySection);

  $('#rmvDiv > div').css({'display': 'inline-block', 'width': '25%'});
  $('#rmvDiv > div:nth-last-child(2)').css({'width': '50%'});
}

function buildNewSection() {
  var section = document.createElement('section');
  section.setAttribute('class', 'has-vertical-spacing');
  return section;
}

function buildWrapperForHeadlines(headline, subline) {
  var headlineWrapper = document.createElement('div');
  headlineWrapper.setAttribute('class', 'h2-headline--wrapper');

  var mainHeader = document.createElement("h2");
  mainHeader.setAttribute('class', 'h2-headline');
  $(mainHeader).text(headline);
  headlineWrapper.append(mainHeader);

  var subHeader = document.createElement("h3");
  subHeader.setAttribute('class', 'h3-headline');
  $(subHeader).text(subline);
  headlineWrapper.append(subHeader);

  return headlineWrapper;
}

function buildCheckboxDivForSeriesMain() {
  var checkboxDiv = document.createElement('div');
  checkboxDiv.id = 'rmvDiv';
  $(checkboxDiv).addClass('grid--row');

  var categoryDiv = buildDivForCategory('seriesStatistik', 'Statistiken', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('seriesStreaming', 'Schaue jetzt', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('seriesHandlung', 'Handlung', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('seriesCast', 'Cast & Crew', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('seriesStaffel', 'Staffel', '._21ykL');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('seriesRecap', 'Recap', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('seriesNews', 'News', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('seriesFreunde', 'Deine Freunde', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('seriesComments', 'Kommentare', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('seriesVideos', 'Videos & Bilder', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('seriesLike', 'Serien wie', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('seriesListen', 'Listen mit', 'a');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('seriesInteresse', 'Das könnte dich auch interessieren', 'h2');
  checkboxDiv.append(categoryDiv);

  var buttonDiv = buildDivWithSaveButton();
  checkboxDiv.append(buttonDiv);

  return checkboxDiv;
}

function buildCheckboxDivForSeasonMain() {
  var checkboxDiv = document.createElement('div');
  checkboxDiv.id = 'rmvDiv';
  $(checkboxDiv).addClass('grid--row');

  var categoryDiv = buildDivForCategory('seasonEpisodes', 'Episodenguide', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('seasonStreaming', 'Schaue jetzt', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('seasonHandlung', 'Handlung', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('seasonStaffel', 'Staffel', '._21ykL');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('seasonRecap', 'Recap', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('seasonNews', 'News', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('seasonFreunde', 'Deine Freunde', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('seasonComments', 'Kommentare', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('seasonVideos', 'Videos & Bilder', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('seasonInteresse', 'Das könnte dich auch interessieren', 'h2');
  checkboxDiv.append(categoryDiv);

  var buttonDiv = buildDivWithSaveButton();
  checkboxDiv.append(buttonDiv);

  return checkboxDiv;
}

function buildDivForCategory(id, headline, childElem) {
  var categoryDiv = document.createElement('div');
  var checkbox = buildCheckboxForCategory(id, headline, childElem);
  var label = buildLabelForCheckbox(checkbox);
  categoryDiv.append(checkbox);
  categoryDiv.append(label);
  return categoryDiv;
}

function buildCheckboxForCategory(id, headline, childElem) {
  var checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('id', id);
  checkbox.checked = true;
  $(checkbox).attr("data-headline", headline);
  $(checkbox).attr("data-child", childElem);
  checkboxes.push(checkbox);
  return checkbox;
}

function buildLabelForCheckbox(checkbox) {
  var label = document.createElement('label');
  label.htmlFor = checkbox.id;
  label.appendChild(document.createTextNode(checkbox.dataset.headline));
  return label;
}

function buildDivWithSaveButton() {
  var buttonDiv = document.createElement('div');
  var button = buildButtonWithCallback('rmvSave', 'Speichern', saveCheckboxValues);
  buttonDiv.append(button);
  return buttonDiv;
}

function buildButtonWithCallback(id, label, callback) {
  var button = document.createElement('input');
  button.type = "button";
  button.value = label;
  button.id = id;
  $(button).click(callback);
  return button;
}

function saveCheckboxValues(){
  for(var i = 0; i < checkboxes.length; i++) {
    var checkbox = checkboxes[i];
    localStorage.setItem(checkbox.id, checkbox.checked);
  }
  filterMainPage();
}

function loadCheckboxValues(){
  for(var i = 0; i < checkboxes.length; i++) {
    var checkbox = checkboxes[i];
    checkbox.checked = JSON.parse(localStorage.getItem(checkbox.id));
  }
}

// ----- Rubrikauswahl - Ende -----
