// ==UserScript==
// @name                MP-Movies-Cleanup (jQuery)
// @description         Moviepilot-Filmseite bereinigen - Framework
// @author              leinzi
// @grant               none
// #downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-movies-cleanup.user.js
// @require             https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// @include             /^(https?):\/\/(www\.)?(moviepilot\.de)\/(movies)\/([^\/]*)((\/[^\/]*)*)$/
// @version             0.1.2
// ==/UserScript==

// jQuery-Konflikte loesen
window.$ = window.jQuery;

// RegExps
var moviesMain = /^(https?):\/\/(www\.)?(moviepilot\.de)\/(movies)\/([^\/]*)$/;

var moviesMainPage = true;
var checkboxes = [];

// Funktion, damit das Dokument erst fertig geladen wird
$(document).ready(function(){

  if (moviesMain.test(window.location.href)) {
    moviesMainPage = true;
    cleanUpMainPage();
  }
});

function cleanUpMainPage(){
  buildAndPlaceCategorySection();
  loadCheckboxValues();

  filterMainPage();
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

// ----- Rubrikauswahl - Anfang -----

function buildAndPlaceCategorySection() {
  var categorySection = buildNewSection();

  var headlineWrapper = buildWrapperForHeadlines("Rubrikenauswahl", "Nicht ausgewählte Rubriken werden ausgeblendet.");
  categorySection.append(headlineWrapper);

  var checkboxDiv = buildCheckboxDivForMoviesMain();
  categorySection.append(checkboxDiv);

  var prevSection = $('.hot-now').closest('section');
  prevSection.after(categorySection);
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

function buildCheckboxDivForMoviesMain() {
  let checkboxDiv = document.createElement('div');
  checkboxDiv.id = 'rmvDiv';
  $(checkboxDiv).addClass('grid--row');

  let categoryDiv = buildDivForCategory('moviesFreunde', 'Deine Freunde', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('moviesStreaming', 'Schaue jetzt', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('moviesTrivia', 'Trivia', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('moviesPresse', 'Pressestimmen', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('moviesNews', 'News', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('moviesStatistik', 'Statistiken', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('moviesHandlung', 'Handlung', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('moviesCast', 'Cast & Crew', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('moviesComments', 'Kommentare', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('moviesVideos', 'Videos & Bilder', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('moviesLike', 'Filme wie', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('moviesListen', 'Listen mit', 'a');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('moviesInteresse', 'Das könnte dich auch interessieren', 'h2');
  checkboxDiv.append(categoryDiv);

  var buttonDiv = buildDivWithSaveButton();
  checkboxDiv.append(buttonDiv);

  return checkboxDiv;
}

function buildDivForCategory(id, headline, childElem, withinModule = false) {
  var categoryDiv = document.createElement('div');
  categoryDiv.classList.add('grid--col-sm-6');
  categoryDiv.classList.add('grid--col-md-4');
  categoryDiv.classList.add('grid--col-lg-3');
  var checkbox = buildCheckboxForCategory(id, headline, childElem, withinModule);
  var label = buildLabelForCheckbox(checkbox);
  categoryDiv.append(checkbox);
  categoryDiv.append(label);
  return categoryDiv;
}

function buildCheckboxForCategory(id, headline, childElem, withinModule) {
  var checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('id', id);
  checkbox.checked = true;
  $(checkbox).attr("data-headline", headline);
  $(checkbox).attr("data-child", childElem);
  $(checkbox).attr("data-within-module", withinModule);
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
  buttonDiv.classList.add('grid--col-sm-6');
  buttonDiv.classList.add('grid--col-md-4');
  buttonDiv.classList.add('grid--col-lg-3');
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
