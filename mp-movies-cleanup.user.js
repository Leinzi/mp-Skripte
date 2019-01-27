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

// ----- Helper - Anfang -----
function contains(selector, text) {
   var elements = document.querySelectorAll(selector);
   return Array.prototype.filter.call(elements, function(element){
      return RegExp(text).test(element.textContent);
   });
}
// ----- Helper - Ende -----

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
  let elementSelector = checkbox.dataset.elementSelector
  let elementTitle = checkbox.dataset.elementTitle
  let selector = checkbox.dataset.selector || 'section'
  let element = getElementByText(selection, elementSelector, elementTitle);
  let elementToHide = undefined

  if (element) {
    elementToHide = element.closest(selector)
  } else {
    elementToHide = document.querySelector(selector)
  }

  if (elementToHide) { elementToHide.style.display = 'none' }
}

function showElementByText(selection, checkbox) {
  let elementSelector = checkbox.dataset.elementSelector
  let elementTitle = checkbox.dataset.elementTitle
  let selector = checkbox.dataset.selector
  let element = getElementByText(selection, elementSelector, elementTitle);
  let elementToShow = undefined

  if (element) {
    elementToShow = element.closest(selector)
  } else {
    elementToShow = document.querySelector(selector)
  }
  if (elementToShow) { elementToShow.style.display = 'block' }
}

function getElementByText(selection, descendantSelector, text) {
  let matches = Array.prototype.slice.call(contains(descendantSelector, text));
  let element = matches[0];
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
  checkboxDiv.classList.add('grid--row');

  let categoryDiv = buildDivForCategory({
    key: 'moviesFreunde',
    title: 'Deine Freunde',
    selector: 'div[data-hypernova-key="FriendsOpinionsModule"]',
    elementSelector: 'h2',
    elementTitle: 'Deine Freunde',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'moviesStreaming',
    title: 'Streaming/TV',
    selector: 'div[data-hypernova-key="ConsumptionModule"]',
    elementSelector: 'h2',
    elementTitle: 'Schaue jetzt',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'moviesKino',
    title: 'im Kino',
    selector: 'div[data-hypernova-key="MovieCinemaConsumptionModule"]',
    elementSelector: 'h3',
    elementTitle: 'Aktuelle Vorstellungen',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'moviesTrivia',
    title: 'Trivia',
    selector: 'div[data-hypernova-key="TriviasModule"]',
    elementSelector: 'h2',
    elementTitle: 'Trivia',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'moviesPresse',
    title: 'Pressestimmen',
    selector: 'section',
    elementSelector: 'h2',
    elementTitle: 'Pressestimmen',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'moviesNews',
    title: 'News',
    selector: 'div[data-hypernova-key="ArticleSlider"]',
    elementSelector: 'h2',
    elementTitle: 'News',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'moviesArtikel',
    title: 'Weitere Artikel',
    selector: 'div[data-hypernova-key="ArticleSlider"]',
    elementSelector: 'h2',
    elementTitle: 'Das könnte dich auch interessieren',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'moviesStatistik',
    title: 'Statistiken',
    selector: 'section',
    elementSelector: 'h2',
    elementTitle: 'Statistiken',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'moviesHandlung',
    title: 'Handlung',
    selector: 'section',
    elementSelector: 'h2',
    elementTitle: 'Handlung',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'moviesCast',
    title: 'Cast & Crew',
    selector: 'section',
    elementSelector: 'h2',
    elementTitle: 'Cast & Crew',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'moviesComments',
    title: 'Kommentare',
    selector: 'section',
    elementSelector: 'h2',
    elementTitle: 'Kommentare',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'moviesVideos',
    title: 'Videos & Bilder',
    selector: 'section',
    elementSelector: 'h2',
    elementTitle: 'Videos & Bilder',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'moviesLike',
    title: 'Filme wie',
    selector: 'div[data-hypernova-key="PosterSlider"]',
    elementSelector: 'h2',
    elementTitle: 'Filme wie',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'moviesListen',
    title: 'Listen',
    selector: 'div[data-hypernova-key="ListSlider"]',
    elementSelector: 'a',
    elementTitle: 'Listen mit',
  });
  checkboxDiv.append(categoryDiv);

  var buttonDiv = buildDivWithSaveButton();
  checkboxDiv.append(buttonDiv);

  return checkboxDiv;
}

function buildDivForCategory(options = {}) {
  var categoryDiv = document.createElement('div');
  categoryDiv.classList.add('grid--col-sm-6');
  categoryDiv.classList.add('grid--col-md-4');
  categoryDiv.classList.add('grid--col-lg-3');
  var checkbox = buildCheckboxForCategory(options);
  var label = buildLabelForCheckbox(checkbox);
  categoryDiv.append(checkbox);
  categoryDiv.append(label);
  return categoryDiv;
}

function buildCheckboxForCategory(options = {}) {
  var checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('id', options.key);
  checkbox.checked = true;

  checkbox.dataset.headline = options.title;
  checkbox.dataset.selector = options.selector;
  checkbox.dataset.elementSelector = options.elementSelector;
  checkbox.dataset.elementTitle = options.elementTitle;

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
