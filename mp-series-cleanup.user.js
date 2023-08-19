// ==UserScript==
// @name                MP-Series-Cleanup
// @description         Moviepilot-Serienseite bereinigen - Framework
// @author              leinzi
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-series-cleanup.user.js
// @updateURL           https://github.com/Leinzi/mp-Skripte/raw/master/mp-series-cleanup.user.js
// @match               https://www.moviepilot.de/serie/*
// @version             4.1.0
// ==/UserScript==

//RegExps
let regSeriesMain = /^https?:\/\/www\.moviepilot.de\/serie\/([^\/]*)$/
let regSeriesSeason = /^https?:\/\/www\.moviepilot.de\/serie\/([^\/]*)\/staffel\/([1-9][0-9]*)$/

const sectionContainerSelector = '.sc-bgqQcB.sc-325b3011-1.fPKbZG'
const sectionSelector = '.sc-gTRrQi.sc-325b3011-0.kxAeeW'

let seriesMainPage = true

if (document.readyState !== 'loading') {
  performCleanUp()
} else {
  document.addEventListener('DOMContentLoaded', performCleanUp)
}

function performCleanUp() {
  if (regSeriesMain.test(window.location.href) ) {
    seriesMainPage = true
    cleanUpMainPage()
  } else if (regSeriesSeason.test(window.location.href) ) {
    seriesMainPage = false
    cleanUpMainPage()
  }
}

function cleanUpMainPage(){
  buildAndPlaceCategorySection()
    .then(loadCheckboxValues)
    .then(filterMainPage)
    .then(addStylesheetToHead)
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

// ----- Rubrikauswahl - Anfang -----

function buildAndPlaceCategorySection() {
  const sections = document.querySelectorAll(`${sectionContainerSelector} ${sectionSelector}`)
  const secondSection = sections[1]

  let categorySection = createElementFromHTML(categorySectionHTML())
  let checkboxDiv = seriesMainPage ? buildCheckboxDivForSeriesMain() : buildCheckboxDivForSeasonMain()
  categorySection.append(checkboxDiv)

  return Promise.resolve(secondSection.after(categorySection))
}

function addStylesheetToHead() {
  let style = document.createElement('style')
  style.type = 'text/css'
  style.append(document.createTextNode(stylesheetCSS()))

  return Promise.resolve(document.getElementsByTagName('head')[0].append(style))
}

function categorySectionHTML() {
  return `
    <section class="filter" mp-cleanup-category-switcher>
      <div class="filter--headline-wrapper">
        <h2 class="filter--headline">Rubrikenauswahl</h2>
      </div>
      <h3 class="filter--subline">Nicht ausgewählte Rubriken werden ausgeblendet</h3>
    </section>
  `
}

function buildCheckboxDivForSeriesMain() {
  let checkboxDiv = document.createElement('div')
  checkboxDiv.classList.add('filter--entries')

  for (let category of categories()) {
    checkboxDiv.append(buildDivForCategory(category))
  }

  checkboxDiv.append(buildDivWithSaveButton())
  return checkboxDiv
}

function buildCheckboxDivForSeasonMain() {
  let checkboxDiv = document.createElement('div')
  checkboxDiv.classList.add('filter--entries')

  for (let category of seasonCategories()) {
    checkboxDiv.append(buildDivForCategory(category))
  }

  checkboxDiv.append(buildDivWithSaveButton())
  return checkboxDiv
}

function buildDivForCategory(options = {}) {
  let htmlString = `
    <div class="filter--entry">
      <input type="checkbox" id="${options.key}" checked data-headline="${options.title}" data-selector="${options.selector}" data-element-selector="${options.elementSelector}" data-element-title="${options.elementTitle}">
      <label for="${options.key}">${options.title}</label>
    </div>
  `
  return createElementFromHTML(htmlString)
}

function buildDivWithSaveButton() {
  let htmlString = `
    <div class="filter--entry">
    </div>
  `
  let buttonDiv = createElementFromHTML(htmlString)
  buttonDiv.append(buildButtonWithCallback('Speichern', saveCheckboxValues))
  return buttonDiv
}

function buildButtonWithCallback(label, callback) {
  let htmlString = `
    <input type="button" value="${label}" class="filter--button" style="border: 2px solid black; margin: 5px 5px 0px; padding: 5px 10px; font-size: 14px;">
  `

  let button = createElementFromHTML(htmlString)
  button.addEventListener('click', callback)
  return button
}

function saveCheckboxValues() {
  for (let checkbox of categoryCheckboxes()) {
    MPCleanupStorage.storeItem(checkbox.id, checkbox.checked)
  }
  filterMainPage()
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
  return [
    {
      key: 'statistics',
      title: 'Statistiken',
      selector: sectionSelector,
      elementSelector: 'h2',
      elementTitle: 'Statistiken',
    },
    {
      key: 'stream',
      title: 'Streaming/TV',
      selector: sectionSelector,
      elementSelector: 'h2',
      elementTitle: 'Schaue jetzt',
    },
    {
      key: 'cast',
      title: 'Cast & Crew',
      selector: sectionSelector,
      elementSelector: 'h2',
      elementTitle: 'Cast & Crew',
    },
    {
      key: 'seasons',
      title: 'Staffeln',
      selector: sectionSelector,
      elementSelector: 'h2',
      elementTitle: 'Staffel',
    },
    {
      key: 'recaps',
      title: 'Recaps',
      selector: sectionSelector,
      elementSelector: 'h2',
      elementTitle: 'Recaps',
    },
    {
      key: 'news',
      title: 'News',
      selector: sectionSelector,
      elementSelector: 'h2',
      elementTitle: 'News',
    },
    {
      key: 'friends',
      title: 'Deine Freunde',
      selector: sectionSelector,
      elementSelector: 'h2',
      elementTitle: 'Deine Freunde',
    },
    {
      key: 'comments',
      title: 'Kommentare',
      selector: sectionSelector,
      elementSelector: 'h2',
      elementTitle: 'Kommentare',
    },
    {
      key: 'videos',
      title: 'Videos & Bilder',
      selector: sectionSelector,
      elementSelector: 'h2',
      elementTitle: 'Videos & Bilder',
    },
    {
      key: 'similar',
      title: 'Serien wie',
      selector: sectionSelector,
      elementSelector: 'h2',
      elementTitle: 'Serien wie',
    },
    {
      key: 'lists',
      title: 'Listen',
      selector: sectionSelector,
      elementSelector: 'div.sc-9795d339-1',
      elementTitle: 'Trending: Meist diskutierte',
    },
    {
      key: 'moreNews',
      title: 'Weitere Artikel',
      selector: sectionSelector,
      elementSelector: 'h2',
      elementTitle: 'Weitere Serien-News',
    }
  ]
}

function seasonCategories() {
  return [
    {
      key: 'episodes',
      title: 'Episodenguide',
      selector: sectionSelector,
      elementSelector: 'h2',
      elementTitle: 'Episodenguide',
    },
    {
      key: 'stream',
      title: 'Streaming/TV',
      selector: sectionSelector,
      elementSelector: 'h2',
      elementTitle: 'Schaue jetzt',
    },
    {
      key: 'seasons',
      title: 'Staffeln',
      selector: sectionSelector,
      elementSelector: 'h2',
      elementTitle: 'Staffel',
    },
    {
      key: 'recaps',
      title: 'Recaps',
      selector: sectionSelector,
      elementSelector: 'h2',
      elementTitle: 'Recaps',
    },
    {
      key: 'news',
      title: 'News',
      selector: sectionSelector,
      elementSelector: 'h2',
      elementTitle: 'News',
    },
    {
      key: 'friends',
      title: 'Deine Freunde',
      selector: sectionSelector,
      elementSelector: 'h2',
      elementTitle: 'Deine Freunde',
    },
    {
      key: 'comments',
      title: 'Kommentare',
      selector: sectionSelector,
      elementSelector: 'h2',
      elementTitle: 'Kommentare',
    },
    {
      key: 'videos',
      title: 'Videos & Bilder',
      selector: sectionSelector,
      elementSelector: 'h2',
      elementTitle: 'Videos & Bilder',
    },
    {
      key: 'moreNews',
      title: 'Weitere Artikel',
      selector: sectionSelector,
      elementSelector: 'h2',
      elementTitle: 'Das könnte dich auch interessieren',
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
    return seriesMainPage ? 'series' : 'season'
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

function stylesheetCSS() {
  return `
    .filter {
      display: flex;
      flex-direction: column;
    }

    .filter--headline-wrapper {
      display: block;
      margin-bottom: 20px;
      border-bottom: 1px solid rgb(20, 20, 20);
    }

    .filter--headline {
      font-family: Oswald, sans-serif;
      font-stretch: normal;
      font-weight: 600;
      letter-spacing: 0.04em;
      display: inline-block;
      margin: 0px 0px -1px;
      padding: 0px 10px 10px 0px;
      border-bottom: 1px solid rgb(244, 100, 90);
      font-size: 23px;
      line-height: 1.25;
      text-transform: uppercase;
    }

    .filter--subline {
      color: rgb(107, 107, 107);
      font-size: 15px;
      font-weight: 400;
      margin-top: 0;
    }

    .filter--entries {
      display: flex;
      flex-wrap: wrap;
    }

    .filter--entry {
      flex: 0 0 33%;
    }

    .filter--button {
      margin: 0px;
      overflow: visible;
      background: transparent;
      font-style: inherit;
      font-variant: inherit;
      font-optical-sizing: inherit;
      font-kerning: inherit;
      font-feature-settings: inherit;
      font-variation-settings: inherit;
      -webkit-font-smoothing: inherit;
      appearance: none;
      font-family: Oswald, sans-serif;
      font-stretch: normal;
      font-weight: 600;
      letter-spacing: 0.06em;
      display: inline-block;
      transition-property: border-color, background-color, color;
      transition-duration: 0.1s;
      outline: 0px;
      font-size: 15px;
      line-height: 1.67;
      text-align: center;
      text-decoration: none;
      text-transform: uppercase;
      cursor: pointer;
      position: relative;
      padding: 7px 11px;
      border: 3px solid rgb(20, 20, 20);
      color: rgb(20, 20, 20);
      width: 264px;
    }
	`
}
