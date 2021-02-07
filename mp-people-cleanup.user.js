// ==UserScript==
// @name                MP-People-Cleanup
// @description         Peronenseiten auf Moviepilot bereinigen
// @author              leinzi
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-people-cleanup.user.js
// @include             /^(https?:\/\/www\.moviepilot.de\/people\/)([^\/\#]*?)$/
// @version             1.0.0
// ==/UserScript==

// RegExps
let regexpPeople = /^(https?:\/\/www\.moviepilot.de\/people\/)([^\/\#]*?)$/

if (document.readyState !== 'loading') {
  performCleanUp();
} else {
  document.addEventListener('DOMContentLoaded', performCleanUp);
}

function performCleanUp() {
  if (regexpPeople.test(window.location.href)) {
    buildAndPlaceCategorySection()
    .then(loadCheckboxValues)
    .then(filterMainPage)
  }

  removeAds();
  removeFooterVideoplayer();
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

function removeFooterVideoplayer() {
  let footerVideo = document.querySelector('.l0tnxs-0.eLUaXV');
  if (footerVideo) {
    footerVideo.after(document.createElement('hr'))
    footerVideo.remove();
  }
}

function removeAds() {
  document.querySelectorAll('.sc-gsTCUz.czc4w4-0.coCsbI.kUbppy').forEach(element => element.remove())
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

// ----- Improvements - Ende -----

// ----- Rubrikauswahl - Anfang -----

function buildAndPlaceCategorySection() {
  let categorySection = buildNewSection();
  categorySection.classList.add('mp-cleanup-category-switcher')

  let mainWrapper = document.createElement('div');
  mainWrapper.classList.add('sc-1v39bmu-1');
  mainWrapper.classList.add('fgRjYT');

  let mainHeader = document.createElement('h2');
  mainHeader.classList.add('sc-1v39bmu-0');
  mainHeader.classList.add('drzpja');
  mainHeader.textContent = 'Rubrikenauswahl';
  mainWrapper.append(mainHeader);
  categorySection.append(mainWrapper);

  let subHeader = document.createElement("h3");
  subHeader.classList.add('sc-1iqgfnr-0');
  subHeader.classList.add('gcLzgF');
  subHeader.textContent = 'Nicht ausgewählte Rubriken werden ausgeblendet';
  categorySection.append(subHeader);

  let checkboxDiv = buildCheckboxDiv();
  categorySection.append(checkboxDiv);

  let firstSection = document.querySelector('.sc-gsTCUz.czc4w4-0.coCsbI.kUbEFm');
  return Promise.resolve(firstSection.after(categorySection))
}

function buildNewSection() {
  let section = document.createElement('div');
  section.style.margin = '2.5rem 0';
  return section;
}

function buildCheckboxDiv() {
  let checkboxDiv = document.createElement('div')
  checkboxDiv.style.display = 'flex'
  checkboxDiv.style.flexWrap = 'wrap'

  let categoryDiv = buildDivForCategory({
    key: 'friends',
    title: 'Deine Freunde',
    selector: '.sc-gsTCUz.czc4w4-0.coCsbI.eODaHT',
    elementSelector: 'h2',
    elementTitle: 'Deine Freunde',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'filmography',
    title: 'Filmographie',
    selector: '.sc-gsTCUz.czc4w4-0.coCsbI.kUaNVu',
    elementSelector: 'h2',
    elementTitle: 'Bekannt für',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'workedWith',
    title: 'Zusammenarbeiten',
    selector: '.sc-gsTCUz.czc4w4-0.coCsbI.kUaNVu',
    elementSelector: 'h2',
    elementTitle: 'Zusammengearbeitet mit',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'shopping',
    title: 'Shopping',
    selector: '.sc-gsTCUz.czc4w4-0.coCsbI.kUbEFm',
    elementSelector: 'h3',
    elementTitle: 'Kaufe auf DVD & Blu-Ray',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'videos',
    title: 'Videos & Bilder',
    selector: '.sc-gsTCUz.czc4w4-0.coCsbI.kUaNVu',
    elementSelector: 'h2',
    elementTitle: 'Videos & Bilder',
  });
  checkboxDiv.append(categoryDiv);

  categoryDiv = buildDivForCategory({
    key: 'news',
    title: 'News',
    selector: '.sc-gsTCUz.czc4w4-0.coCsbI.kUaNVu',
    elementSelector: 'h2',
    elementTitle: 'News',
  });
  checkboxDiv.append(categoryDiv);

  checkboxDiv.append(buildDivWithSaveButton());
  return checkboxDiv;
}

function buildDivForCategory(options = {}) {
  let categoryDiv = document.createElement('div');
  categoryDiv.style.flex = '0 0 33%'

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
  buttonDiv.classList.add('sc-1bpjhwu-0');
  buttonDiv.classList.add('fyqsOW');

  buttonDiv.append(buildButtonWithCallback('Speichern', saveCheckboxValues));
  return buttonDiv;
}

function buildButtonWithCallback(label, callback) {
  let button = document.createElement('input');
  button.type = "button";
  button.value = label;
  button.classList.add('sc-1bpjhwu-1');
  button.classList.add('cidguH');
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
    return 'people'
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
