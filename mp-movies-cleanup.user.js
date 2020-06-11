// ==UserScript==
// @name                MP-Movies-Cleanup
// @description         Moviepilot-Filmseite bereinigen - Framework
// @author              leinzi
// @grant               none
// #downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-movies-cleanup.user.js
// @include             /^(https?):\/\/(www\.)?(moviepilot\.de)\/(movies)\/([^\/]*)((\/[^\/]*)*)$/
// @version             0.5.0
// ==/UserScript==

// RegExps
let regMoviesMain = /^(https?):\/\/(www\.)?(moviepilot\.de)\/(movies)\/([^\/]*)$/;
let regMoviesComments = /^(https?):\/\/(www\.)?(moviepilot\.de)\/(movies)\/([^\/]*)\/(kritik)([^\/]*)?(\/([^\/]*))?$/;

if (document.readyState !== 'loading') {
  performCleanUp();
} else {
  document.addEventListener('DOMContentLoaded', performCleanUp);
}

function performCleanUp() {
  if (regMoviesMain.test(window.location.href)) {
    buildAndPlaceCategorySection()
    .then(loadCheckboxValues)
    .then(filterMainPage)
  } else if (regMoviesComments.test(window.location.href)) {
   improveComments();
  }

  bringBackTheColor();
  improveFonts();
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
  let categorySection = document.querySelector('.mp-cleanup-category-switcher')
  let checkboxes = categorySection.querySelectorAll('input[type="checkbox"]')
  for (let checkbox of checkboxes) {
    let element = getElementForCheckbox(checkbox)
    if (checkbox.checked) {
      if (element) { element.style.display = 'block' }
    } else {
      if (element) { element.style.display = 'none' }
    }
  }
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
  categorySection.classList.add('mp-cleanup-category-switcher')

  let headlineColumn = buildColumnForHeadlines("Rubrikenauswahl", "Nicht ausgewählte Rubriken werden ausgeblendet");
  categorySection.append(headlineColumn);

  let checkboxDiv = buildCheckboxDivForMoviesMain();
  categorySection.append(checkboxDiv);

  let firstSection = document.querySelector('section');
  return Promise.resolve(firstSection.after(categorySection))
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

function buildCheckboxDivForMoviesMain() {
  let checkboxDiv = document.createElement('div');

  let categoryDiv = buildDivForCategory({
    key: 'friends',
    title: 'Deine Freunde',
    selector: 'div[data-hypernova-key="FriendsOpinionsModule"]',
    elementSelector: 'h2',
    elementTitle: 'Deine Freunde',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'stream',
    title: 'Streaming/TV',
    selector: 'div[data-hypernova-key="ConsumptionModule"]',
    elementSelector: 'h2',
    elementTitle: 'Schaue jetzt',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'cinema',
    title: 'im Kino',
    selector: 'div[data-hypernova-key="MovieCinemaConsumptionModule"]',
    elementSelector: 'h3',
    elementTitle: 'Aktuelle Vorstellungen',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'cast',
    title: 'Cast & Crew',
    selector: 'section',
    elementSelector: 'h2',
    elementTitle: 'Cast & Crew',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'videos',
    title: 'Videos & Bilder',
    selector: 'section',
    elementSelector: 'h2',
    elementTitle: 'Videos & Bilder',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'news',
    title: 'News',
    selector: 'div[data-hypernova-key="ArticleSlider"]',
    elementSelector: 'h2',
    elementTitle: 'News',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'press',
    title: 'Pressestimmen',
    selector: 'section',
    elementSelector: 'h2',
    elementTitle: 'Pressestimmen',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'statistics',
    title: 'Statistiken',
    selector: 'section',
    elementSelector: 'h2',
    elementTitle: 'Statistiken',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'comments',
    title: 'Kommentare',
    selector: 'section',
    elementSelector: 'h2',
    elementTitle: 'Kommentare',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'similar',
    title: 'Filme wie',
    selector: 'div[data-hypernova-key="PosterSlider"]',
    elementSelector: 'h2',
    elementTitle: 'Filme wie',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'lists',
    title: 'Listen',
    selector: 'div[data-hypernova-key="ListSlider"]',
    elementSelector: 'div.Jt--G',
    elementTitle: 'Trending: Meist diskutierte',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'moreNews',
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
  let categorySection = document.querySelector('.mp-cleanup-category-switcher')
  let checkboxes = categorySection.querySelectorAll('input[type="checkbox"]')
  for (let checkbox of checkboxes) {
    MPCleanupStorage.storeItem(checkbox.id, checkbox.checked);
  }
  filterMainPage();
}

function loadCheckboxValues() {
  let categorySection = document.querySelector('.mp-cleanup-category-switcher')
  let checkboxes = categorySection.querySelectorAll('input[type="checkbox"]')
  for (let checkbox of checkboxes) {
    checkbox.checked = MPCleanupStorage.getItem(checkbox.id)
  }
  return Promise.resolve(MPCleanupStorage.getStorage())
}

// ----- Rubrikauswahl - Ende -----

class MPCleanupStorage {
  static storageKey() {
    return 'mpCleanupStorage'
  }

  static categoryKey() {
    return 'movies'
  }

  static getStorage() {
    let storage = localStorage.getItem(MPCleanupStorage.storageKey())
    if (storage) {
      return JSON.parse(storage)
    } else {
     return {}
    }
  }

  static setStorage(newStorage) {
   localStorage.setItem(MPCleanupStorage.storageKey(), JSON.stringify(newStorage))
  }

  static clearStorage() {
   localStorage.removeItem(MPCleanupStorage.storageKey())
  }

  static getItem(key) {
    let storage = MPCleanupStorage.getStorage()
    let categorySettings = storage[MPCleanupStorage.categoryKey()]
    if (categorySettings) {
      return categorySettings[key]
    } else {
      return undefined
    }
  }

  static removeItem(key) {
    let storage = MPCleanupStorage.getStorage()
    let categorySettings = storage[MPCleanupStorage.categoryKey()]
    if (categorySettings) {
      delete categorySettings[key]
      MPCleanupStorage.setStorage(storage)
    }
  }

  static storeItem(key, item) {
    let storage = MPCleanupStorage.getStorage()
    let categorySettings = storage[MPCleanupStorage.categoryKey()] || {}
    categorySettings[key] = item
    storage[MPCleanupStorage.categoryKey()] = categorySettings
    MPCleanupStorage.setStorage(storage)
  }
}
