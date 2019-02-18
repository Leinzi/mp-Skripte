// ==UserScript==
// @name                MP-Series-Cleanup
// @description         Moviepilot-Serienseite bereinigen - Framework
// @author              mitcharts, leinzi
// @grant               none
// #downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-series-cleanup.user.js
// @include             /^(https?):\/\/(www\.)?(moviepilot\.de)\/(serie)\/([^\/]*)((\/[^\/]*)*)$/
// @version             3.3.1
// ==/UserScript==

//RegExps
let regSeriesMain = /^(https?):\/\/(www\.)?(moviepilot\.de)\/(serie)\/([^\/]*)$/;
let regSeriesComments = /^(https?):\/\/(www\.)?(moviepilot\.de)\/(serie)\/([^\/]*)\/(kritik)([^\/]*)?(\/([^\/]*))?$/;
let regSeriesSeason = /^(https?):\/\/(www\.)?(moviepilot\.de)\/(serie)\/([^\/]*)\/(staffel)\/([1-9][0-9]*)$/;
let regSeriesSeasonComments = /^(https?):\/\/(www\.)?(moviepilot\.de)\/(serie)\/([^\/]*)\/(staffel)\/([1-9][0-9]*)\/(kritik)([^\/]*)?(\/([^\/]*))?$/;

let seriesMainPage = true;
let checkboxes = [];

if (document.readyState !== 'loading') {
  performCleanUp();
} else {
  document.addEventListener('DOMContentLoaded', performCleanUp);
}

function performCleanUp() {
  if (regSeriesMain.test(window.location.href) ) {
    seriesMainPage = true;
    cleanUpMainPage();
  } else if (regSeriesSeason.test(window.location.href) ) {
    seriesMainPage = false;
    cleanUpMainPage();
  } else if (regSeriesComments.test(window.location.href) || regSeriesSeasonComments.test(window.location.href)) {
   improveComments();
  }

  removeFooterVideoplayer();
  bringBackTheColor();
  improveFonts();
}

function cleanUpMainPage(){
  buildAndPlaceCategorySection();
  loadCheckboxValues();
  filterMainPage();
}

// ----- Helper - Anfang -----
function contains(selector, text) {
   let elements = document.querySelectorAll(selector);
   return Array.prototype.filter.call(elements, function(element) {
      return RegExp(text).test(element.textContent);
   });
}
// ----- Helper - Ende -----

// ----- Filter - Anfang -----

function filterMainPage() {
  for (let i = 0; i < checkboxes.length; i++) {
    let checkbox = checkboxes[i];
    let element = getElementForCheckbox(checkbox)

    if (checkbox.checked) {
      if (element) { element.style.display = 'block' }
    } else {
      if (element) { element.style.display = 'none' }
    }
  }
}

function hideElementByText(selection, descendantSelector, text) {
  let element = getElementByText(selection, descendantSelector, text);
  element.hide();
}

function showElementByText(selection, descendantSelector, text) {
  let element = getElementByText(selection, descendantSelector, text);
  element.show();
}

function getElementForCheckbox(checkbox) {
  let elementSelector = checkbox.dataset.elementSelector
  let elementTitle = checkbox.dataset.elementTitle
  let selector = checkbox.dataset.selector || 'section'
  let identifierElement = getElementByText(elementSelector, elementTitle);

  if (identifierElement) {
    return identifierElement.closest(selector)
  }
}

function getElementByText(selector, text) {
  let matches = Array.prototype.slice.call(contains(selector, text));
  return matches[0];
}

// ----- Filter - Ende -----

// ----- Improvements - Anfang -----

function removeFooterVideoplayer() {
  let footerVideo = document.querySelector('.video--player--footer');
  if footerVideo {
    footerVideo.style.display = 'none';
  }
}

function bringBackTheColor() {
  let style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = '._3gBYU { filter: none !important; }';
  } else {
    style.appendChild(document.createTextNode('._3gBYU { filter: none !important; }'));
  }
  document.getElementsByTagName('head')[0].appendChild(style);
}

function improveComments() {
  let commentsSection = document.querySelector('section')
  let commentsDiv = commentsSection.querySelector('.grid--col-sm-12')
  commentsDiv.classList.add('grid--col-md-10')
  commentsDiv.classList.add('grid--col-lg-9')

  let paddingRight = document.createElement('div')
  paddingRight.classList.add('grid--col-md-2')
  paddingRight.classList.add('grid--col-lg-3')
  commentsDiv.after(paddingRight)
}

function improveFonts() {
  let style = document.createElement('style');
  style.type = 'text/css';

  let improvements = '._3-wEn[itemprop="text"] { font-size: 16px !important; } ._3-wEn[itemprop="text"] ._1xAhf { max-height: 500px !important; } .typo--long-body { font-size: 16px !important; }'

  if (style.styleSheet) {
    style.styleSheet.cssText = improvements;
  } else {
    style.appendChild(document.createTextNode(improvements));
  }
  document.getElementsByTagName('head')[0].appendChild(style);
}

// ----- Improvements - Ende -----

// ----- Rubrikauswahl - Anfang -----

function buildAndPlaceCategorySection() {
  let categorySection = buildNewSection();

  let headlineColumn = buildColumnForHeadlines("Rubrikenauswahl", "Nicht ausgewählte Rubriken werden ausgeblendet");
  categorySection.append(headlineColumn);

  let checkboxDiv = seriesMainPage ? buildCheckboxDivForSeriesMain() : buildCheckboxDivForSeasonMain();
  categorySection.append(checkboxDiv);

  let firstSection = document.querySelector('section');
  firstSection.after(categorySection);
}

function buildNewSection() {
  let section = document.createElement('section');
  section.classList.add('grid--row');
  section.classList.add('has-vertical-spacing');
  return section;
}

function buildColumnForHeadlines(headline, subline) {
  let headlineColumn = document.createElement('div');
  headlineColumn.classList.add('grid--col-sm-12');

  let mainWrapper = document.createElement('div');
  mainWrapper.classList.add('h2-headline--wrapper');
  let mainHeader = document.createElement("h2");
  mainHeader.classList.add('h2-headline');
  mainHeader.textContent = headline;
  mainWrapper.append(mainHeader);
  headlineColumn.append(mainWrapper);

  let subWrapper = document.createElement('div');
  subWrapper.classList.add('h3-headline--wrapper');
  let subHeader = document.createElement("h3");
  subHeader.classList.add('h3-headline');
  subHeader.textContent = subline;
  subWrapper.append(subHeader);
  headlineColumn.append(subWrapper);

  return headlineColumn;
}

function buildCheckboxDivForSeriesMain() {
  let checkboxDiv = document.createElement('div');

  let categoryDiv = buildDivForCategory({
    key: 'seriesStatistik',
    title: 'Statistiken',
    selector: 'section',
    elementSelector: 'h2',
    elementTitle: 'Statistiken',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'seriesStreaming',
    title: 'Streaming/TV',
    selector: 'div[data-hypernova-key="ConsumptionModule"]',
    elementSelector: 'h2',
    elementTitle: 'Schaue jetzt',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'seriesHandlung',
    title: 'Handlung',
    selector: 'section',
    elementSelector: 'h2',
    elementTitle: 'Handlung',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'seriesCast',
    title: 'Cast & Crew',
    selector: 'section',
    elementSelector: 'h2',
    elementTitle: 'Cast & Crew',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
      key: 'seriesStaffel',
      title: 'Staffeln',
      selector: 'div[data-hypernova-key="PosterSlider"]',
      elementSelector: 'h2',
      elementTitle: 'Staffel',
    });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'seriesRecap',
    title: 'Recaps',
    selector: 'div[data-hypernova-key="ArticleSlider"]',
    elementSelector: 'h2',
    elementTitle: 'Recaps',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'seriesNews',
    title: 'News',
    selector: 'div[data-hypernova-key="ArticleSlider"]',
    elementSelector: 'h2',
    elementTitle: 'News',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'seriesFreunde',
    title: 'Deine Freunde',
    selector: 'div[data-hypernova-key="FriendsOpinionsModule"]',
    elementSelector: 'h2',
    elementTitle: 'Deine Freunde',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'seriesComments',
    title: 'Kommentare',
    selector: 'section',
    elementSelector: 'h2',
    elementTitle: 'Kommentare',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'seriesVideos',
    title: 'Videos & Bilder',
    selector: 'section',
    elementSelector: 'h2',
    elementTitle: 'Videos & Bilder',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'seriesLike',
    title: 'Serien wie',
    selector: 'div[data-hypernova-key="PosterSlider"]',
    elementSelector: 'h2',
    elementTitle: 'Serien wie',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'seriesListen',
    title: 'Listen',
    selector: 'div[data-hypernova-key="ListSlider"]',
    elementSelector: 'div.Jt--G',
    elementTitle: 'Trending: Meist diskutierte',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'seriesArtikel',
    title: 'Weitere Artikel',
    selector: 'div[data-hypernova-key="ArticleSlider"]',
    elementSelector: 'h2',
    elementTitle: 'Das könnte dich auch interessieren',
  });
  checkboxDiv.append(categoryDiv);

  checkboxDiv.append(buildDivWithSaveButton());
  return checkboxDiv;
}

function buildCheckboxDivForSeasonMain() {
  let checkboxDiv = document.createElement('div');

  let categoryDiv = buildDivForCategory({
    key: 'seasonEpisodes',
    title: 'Episodenguide',
    selector: 'section',
    elementSelector: 'h2',
    elementTitle: 'Episodenguide',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'seasonStreaming',
    title: 'Streaming/TV',
    selector: 'div[data-hypernova-key="ConsumptionModule"]',
    elementSelector: 'h2',
    elementTitle: 'Schaue jetzt',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'seasonHandlung',
    title: 'Handlung',
    selector: 'section',
    elementSelector: 'h2',
    elementTitle: 'Handlung',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
      key: 'seasonStaffel',
      title: 'Staffeln',
      selector: 'div[data-hypernova-key="PosterSlider"]',
      elementSelector: 'h2',
      elementTitle: 'Staffel',
    });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'seasonRecap',
    title: 'Recaps',
    selector: 'div[data-hypernova-key="ArticleSlider"]',
    elementSelector: 'h2',
    elementTitle: 'Recaps',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'seasonNews',
    title: 'News',
    selector: 'div[data-hypernova-key="ArticleSlider"]',
    elementSelector: 'h2',
    elementTitle: 'News',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'seasonFreunde',
    title: 'Deine Freunde',
    selector: 'div[data-hypernova-key="FriendsOpinionsModule"]',
    elementSelector: 'h2',
    elementTitle: 'Deine Freunde',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'seasonComments',
    title: 'Kommentare',
    selector: 'section',
    elementSelector: 'h2',
    elementTitle: 'Kommentare',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'seasonVideos',
    title: 'Videos & Bilder',
    selector: 'section',
    elementSelector: 'h2',
    elementTitle: 'Videos & Bilder',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'seasonArtikel',
    title: 'Weitere Artikel',
    selector: 'div[data-hypernova-key="ArticleSlider"]',
    elementSelector: 'h2',
    elementTitle: 'Das könnte dich auch interessieren',
  });
  checkboxDiv.append(categoryDiv);

  checkboxDiv.append(buildDivWithSaveButton());
  return checkboxDiv;
}

function buildDivForCategory(options = {}) {
  let categoryDiv = document.createElement('div');
  categoryDiv.classList.add('grid--col-sm-6');
  categoryDiv.classList.add('grid--col-md-4');
  categoryDiv.classList.add('grid--col-lg-3');

  let checkbox = buildCheckboxForCategory(options);
  let label = buildLabelForCheckbox(checkbox);
  categoryDiv.append(checkbox);
  categoryDiv.append(label);

  return categoryDiv;
}

function buildCheckboxForCategory(options = {}) {
  let checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = options.key;
  checkbox.checked = true;

  checkbox.dataset.headline = options.title;
  checkbox.dataset.selector = options.selector;
  checkbox.dataset.elementSelector = options.elementSelector;
  checkbox.dataset.elementTitle = options.elementTitle;

  checkboxes.push(checkbox);
  return checkbox;
}

function buildLabelForCheckbox(checkbox) {
  let label = document.createElement('label');
  label.htmlFor = checkbox.id;
  label.appendChild(document.createTextNode(checkbox.dataset.headline));
  return label;
}

function buildDivWithSaveButton() {
  let buttonDiv = document.createElement('div');
  buttonDiv.classList.add('grid--col-sm-6');
  buttonDiv.classList.add('grid--col-md-4');
  buttonDiv.classList.add('grid--col-lg-3');

  buttonDiv.append(buildButtonWithCallback('Speichern', saveCheckboxValues));
  return buttonDiv;
}

function buildButtonWithCallback(label, callback) {
  let button = document.createElement('input');
  button.type = "button";
  button.value = label;
  button.classList.add('akU5C')
  button.style.border = '2px solid black';
  button.style.margin = '5px 5px 0';
  button.style.padding = '5px 10px';
  button.style.fontSize = '14px';

  button.addEventListener('click', callback);
  return button;
}

function saveCheckboxValues() {
  for (let i = 0; i < checkboxes.length; i++) {
    let checkbox = checkboxes[i];
    localStorage.setItem(checkbox.id, checkbox.checked);
  }
  filterMainPage();
}

function loadCheckboxValues() {
  for (let i = 0; i < checkboxes.length; i++) {
    let checkbox = checkboxes[i];
    checkbox.checked = JSON.parse(localStorage.getItem(checkbox.id));
  }
}

// ----- Rubrikauswahl - Ende -----
