// ==UserScript==
// @name                MP-Movies-Cleanup (jQuery)
// @description         Moviepilot-Filmseite bereinigen - Framework
// @author              leinzi
// @grant               none
// #downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-movies-cleanup.user.js
// @require             https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// @include             /^(https?):\/\/(www\.)?(moviepilot\.de)\/(movies)\/([^\/]*)((\/[^\/]*)*)$/
// @version             0.2.1
// ==/UserScript==

// jQuery-Konflikte loesen
this.$ = this.jQuery = jQuery.noConflict(true);

// RegExps
var moviesMain = /^(https?):\/\/(www\.)?(moviepilot\.de)\/(movies)\/([^\/]*)$/;

var moviesMainPage = true;
var checkboxes = [];

// Funktion, damit das Dokument erst fertig geladen wird
if (document.readyState !== 'loading') {
  performCleanUp();
} else {
  document.addEventListener('DOMContentLoaded', performCleanUp);
}

function performCleanUp() {
  if (moviesMain.test(window.location.href)) {
    moviesMainPage = true;
    buildAndPlaceCategorySection();
    loadCheckboxValues();
    filterMainPage();
  }
}

// ----- Filter - Anfang -----

function filterMainPage() {
  var sections = $('section.has-vertical-spacing');

  for(var i = 0; i < checkboxes.length; i++) {
    var checkbox = checkboxes[i];
    if(checkbox.checked){
      showElementByText(sections, checkbox);
    } else {
      hideElementByText(sections, checkbox);
    }
   }
}

function hideElementByText(selection, checkbox) {
  let descendantSelector = checkbox.dataset.child
  let text = checkbox.dataset.headline
  let selector = checkbox.dataset.selector

  if (selector) {
    $(selector).hide()
  } else {
    let element = getElementByText(selection, descendantSelector, text);
    element.hide();
  }
}

function showElementByText(selection, checkbox) {
  let descendantSelector = checkbox.dataset.child
  let text = checkbox.dataset.headline
  let selector = checkbox.dataset.selector

  if (selector) {
    $(selector).show()
  } else {
    let element = getElementByText(selection, descendantSelector, text);
    element.show();
  }
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

  let categoryDiv = buildDivForCategory2({
    key: 'moviesFreunde',
    title: 'Deine Freunde',
    selector: 'div[data-hypernova-key="FriendsOpinionsModule"]'
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory2({
    key: 'moviesStreaming',
    title: 'Kino/Streaming/TV',
    selector: 'div[data-hypernova-key="ConsumptionModule"], div[data-hypernova-key="MovieCinemaConsumptionModule"]'
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory2({
    key: 'moviesTrivia',
    title: 'Trivia',
    selector: 'div[data-hypernova-key="TriviasModule"]'
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory('moviesPresse', 'Pressestimmen', 'h2');
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory2({
    key: 'moviesArtikel',
    title: 'Artikel',
    selector: 'div[data-hypernova-key="ArticleSlider"]'
  });
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

  categoryDiv = buildDivForCategory2({
    key: 'moviesLike',
    title: 'Filme wie',
    selector: 'div[data-hypernova-key="PosterSlider"]'
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory2({
    key: 'moviesListen',
    title: 'Listen mit',
    selector: 'div[data-hypernova-key="ListSlider"]'
  });
  checkboxDiv.append(categoryDiv);

  // categoryDiv = buildDivForCategory('moviesInteresse', 'Das könnte dich auch interessieren', 'h2');
  // checkboxDiv.append(categoryDiv);

  var buttonDiv = buildDivWithSaveButton();
  checkboxDiv.append(buttonDiv);

  return checkboxDiv;
}

function buildDivForCategory(id, headline, childElem, withinModule = false) {
  var categoryDiv = document.createElement('div');
  categoryDiv.classList.add('grid--col-sm-6');
  categoryDiv.classList.add('grid--col-md-4');
  categoryDiv.classList.add('grid--col-lg-3');
  var checkbox = buildCheckboxForCategory(id, headline, childElem, null, withinModule);
  var label = buildLabelForCheckbox(checkbox);
  categoryDiv.append(checkbox);
  categoryDiv.append(label);
  return categoryDiv;
}

function buildDivForCategory2(options = {}) {
  var categoryDiv = document.createElement('div');
  categoryDiv.classList.add('grid--col-sm-6');
  categoryDiv.classList.add('grid--col-md-4');
  categoryDiv.classList.add('grid--col-lg-3');
  var checkbox = buildCheckboxForCategory(options.key, options.title, null, options.selector);
  var label = buildLabelForCheckbox(checkbox);
  categoryDiv.append(checkbox);
  categoryDiv.append(label);
  return categoryDiv;
}

function buildCheckboxForCategory(id, headline, childElem, selector, withinModule = false) {
  var checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('id', id);
  checkbox.checked = true;
  $(checkbox).attr("data-headline", headline);
  $(checkbox).attr("data-child", childElem);
  $(checkbox).attr("data-within-module", withinModule);
  $(checkbox).attr("data-selector", selector);
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
  button.classList.add('akU5C')
  button.style.border = '2px solid black';
  button.style.margin = '5px 5px 0';
  button.style.padding = '5px 10px';
  button.style.fontSize = '14px';

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
