// ==UserScript==
// @name                MP-People-Cleanup
// @description         Peronenseiten auf Moviepilot bereinigen
// @author              leinzi
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-people-cleanup.user.js
// @updateURL           https://github.com/Leinzi/mp-Skripte/raw/master/mp-people-cleanup.user.js
// @match               https://www.moviepilot.de/people/*
// @version             4.0.0
// ==/UserScript==

// RegExps
let regexpPeople = /^(https?:\/\/www\.moviepilot.de\/people\/)([^\/\#]*?)$/

if (document.readyState !== 'loading') {
  performCleanUp()
} else {
  document.addEventListener('DOMContentLoaded', performCleanUp)
}

function performCleanUp() {
  if (regexpPeople.test(window.location.href)) {
    buildAndPlaceCategorySection()
    .then(loadCheckboxValues)
    .then(filterMainPage)

    removeAds()
  }
}

// ----- Helper - Anfang -----
function contains(selector, text) {
   let elements = document.querySelectorAll(selector)
   return Array.prototype.filter.call(elements, function(element) {
      return RegExp(text).test(element.textContent)
   })
}
// ----- Helper - Ende -----

// ----- Filter - Anfang -----

function filterMainPage() {
  for (let checkbox of categoryCheckboxes()) {
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
  let identifierElement = getElementByText(elementSelector, elementTitle)

  if (identifierElement) {
    return identifierElement.closest(selector)
  }
}

function getElementByText(selector, text) {
  let matches = Array.prototype.slice.call(contains(selector, text))
  return matches[0]
}

// ----- Filter - Ende -----

// ----- Improvements - Anfang -----
function removeAds() {
  document.querySelectorAll('.sc-gsTCUz.czc4w4-0.coCsbI.kUbppy').forEach(element => element.remove())
}

// ----- Improvements - Ende -----

// ----- Rubrikauswahl - Anfang -----

function buildAndPlaceCategorySection() {
  let firstSection = document.querySelector('.sc-gsDKAQ.sc-czc4w4-0.fPGaEA.bfkWBo')

  let categorySection = createElementFromHTML(categorySectionHTML())
  categorySection.append(buildCheckboxDiv())

  return Promise.resolve(firstSection.after(categorySection))
}

function categorySectionHTML() {
  return `
    <div class="sc-gsDKAQ sc-czc4w4-0 fPGaEA bflxVs" mp-cleanup-category-switcher>
      <div class="sc-dkPtRN xjahx">
        <div class="sc-1v39bmu-1 ibANOf">
          <h2 class="sc-1v39bmu-0 cDGjuc">Rubrikenauswahl</h2>
        </div>
        <h3 class="sc-1iqgfnr-0 fajBNI">Nicht ausgewählte Rubriken werden ausgeblendet</h3>
      </div>
    </section>
  `
}

function buildCheckboxDiv() {
  let checkboxDiv = document.createElement('div')
  checkboxDiv.style.display = 'flex'
  checkboxDiv.style.flexWrap = 'wrap'

  for (let category of categories()) {
    checkboxDiv.append(buildDivForCategory(category))
  }

  checkboxDiv.append(buildDivWithSaveButton())
  return checkboxDiv
}

function buildDivForCategory(options = {}) {
  let htmlString = `
    <div style="flex: 0 0 33%">
      <input type="checkbox" id="${options.key}" checked data-headline="${options.title}" data-selector="${options.selector}" data-element-selector="${options.elementSelector}" data-element-title="${options.elementTitle}">
      <label for="${options.key}">${options.title}</label>
    </div>
  `
  return createElementFromHTML(htmlString)
}

function buildDivWithSaveButton() {
  let htmlString = `
    <div style="flex: 0 0 33%">
    </div>
  `
  let buttonDiv = createElementFromHTML(htmlString)
  buttonDiv.append(buildButtonWithCallback('Speichern', saveCheckboxValues))
  return buttonDiv
}

function buildButtonWithCallback(label, callback) {
  let htmlString = `
    <input type="button" value="${label}" class="sc-1bpjhwu-1 QKNgR" style="border: 2px solid black; margin: 5px 5px 0px; padding: 5px 10px; font-size: 14px;">
  `

  let button = createElementFromHTML(htmlString)
  button.addEventListener('click', callback)
  return button
}

function saveCheckboxValues() {
  for (let checkbox of categoryCheckboxes()) {
    MPCleanupStorage.storeItem(checkbox.id, checkbox.checked)
  }
  filterMainPage();
}

function loadCheckboxValues() {
  for (let checkbox of categoryCheckboxes()) {
    checkbox.checked = MPCleanupStorage.getItem(checkbox.id)
  }
  return Promise.resolve(MPCleanupStorage.getStorage())
}

function categoryCheckboxes() {
  let categorySection = document.querySelector('[mp-cleanup-category-switcher]')
  return categorySection.querySelectorAll('input[type="checkbox"]')
}

function categories() {
  let defaultSelector = '.sc-gsDKAQ.sc-czc4w4-0'
  return [
    {
      key: 'friends',
      title: 'Deine Freunde',
      selector: defaultSelector,
      elementSelector: 'h2',
      elementTitle: 'Deine Freunde',
    },
    {
      key: 'filmography',
      title: 'Filmographie',
      selector: defaultSelector,
      elementSelector: 'h2',
      elementTitle: 'Bekannt für',
    },
    {
      key: 'workedWith',
      title: 'Zusammenarbeiten',
      selector: defaultSelector,
      elementSelector: 'h2',
      elementTitle: 'Zusammengearbeitet mit',
    },
    {
      key: 'shopping',
      title: 'Shopping',
      selector: defaultSelector,
      elementSelector: 'h3',
      elementTitle: 'Kaufe auf DVD & Blu-Ray',
    },
    {
      key: 'videos',
      title: 'Videos & Bilder',
      selector: defaultSelector,
      elementSelector: 'h2',
      elementTitle: 'Videos & Bilder',
    },
    {
      key: 'news',
      title: 'News',
      selector: defaultSelector,
      elementSelector: 'h2',
      elementTitle: 'News',
    }
  ]
}

// Utilities
function stringToHTML(string) {
  const dom = document.createElement('div')
  dom.innerHTML = string
  return dom
}

function createElementFromHTML(htmlString) {
  return stringToHTML(htmlString).children[0]
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
