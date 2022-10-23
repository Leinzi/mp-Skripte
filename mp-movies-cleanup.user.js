// ==UserScript==
// @name                MP-Movies-Cleanup
// @description         Moviepilot-Filmseite bereinigen - Framework
// @author              leinzi
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-movies-cleanup.user.js
// @updateURL           https://github.com/Leinzi/mp-Skripte/raw/master/mp-movies-cleanup.user.js
// @match               https://www.moviepilot.de/movies/*
// @version             4.0.0
// ==/UserScript==

// RegExps
let regMoviesMain = /^https?:\/\/www\.moviepilot.de\/movies\/([^\/]*)$/
let regMoviesComments = /^https?:\/\/www\.moviepilot.de\/movies\/([^\/]*)\/kritik([^\/]*)?(\/([^\/]*))?$/

if (document.readyState !== 'loading') {
  performCleanUp()
} else {
  document.addEventListener('DOMContentLoaded', performCleanUp)
}

function performCleanUp() {
  if (regMoviesMain.test(window.location.href)) {
    buildAndPlaceCategorySection()
    .then(loadCheckboxValues)
    .then(filterMainPage)
  } else if (regMoviesComments.test(window.location.href)) {
   improveComments()
  }

  removeAds()
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
  document.querySelectorAll('.has-vertical-spacing:empty').forEach(element => element.remove())
  document.querySelectorAll('*[data-google-query-id]').forEach(element => element.remove())
  document.querySelectorAll('#dfp-header').forEach(element => element.remove())

  let outbrainElement = getElementByText('h2', 'Das könnte dich auch interessieren')
  if (outbrainElement) {
    let surroundingSection = outbrainElement.closest('section')
    surroundingSection.remove()
  }
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

// ----- Improvements - Ende -----

// ----- Rubrikauswahl - Anfang -----

function buildAndPlaceCategorySection() {
  let firstSection = document.querySelector('section')

  let categorySection = createElementFromHTML(categorySectionHTML())
  categorySection.append(buildCheckboxDivForMoviesMain())

  return Promise.resolve(firstSection.after(categorySection))
}

function categorySectionHTML() {
  return `
    <section class="grid--row has-vertical-spacing" mp-cleanup-category-switcher>
      <div class="grid--col-sm-12">
        <div class="h2-headline--wrapper">
          <h2 class="h2-headline">Rubrikenauswahl</h2>
        </div>
        <div class="h3-headline--wrapper">
          <h3 class="h3-headline">Nicht ausgewählte Rubriken werden ausgeblendet</h3>
        </div>
      </div>
    </section>
  `
}

function buildCheckboxDivForMoviesMain() {
  let checkboxDiv = document.createElement('div')

  for (let category of categories()) {
    checkboxDiv.append(buildDivForCategory(category))
  }

  checkboxDiv.append(buildDivWithSaveButton())
  return checkboxDiv
}

function buildDivForCategory(options = {}) {
  let htmlString = `
    <div class="grid--col-sm-6 grid--col-md-4 grid--col-lg-3">
      <input type="checkbox" id="${options.key}" checked data-headline="${options.title}" data-selector="${options.selector}" data-element-selector="${options.elementSelector}" data-element-title="${options.elementTitle}">
      <label for="${options.key}">${options.title}</label>
    </div>
  `
  return createElementFromHTML(htmlString)
}

function buildDivWithSaveButton() {
  let htmlString = `
    <div class="grid--col-sm-6 grid--col-md-4 grid--col-lg-3">
    </div>
  `
  let buttonDiv = createElementFromHTML(htmlString)
  buttonDiv.append(buildButtonWithCallback('Speichern', saveCheckboxValues))
  return buttonDiv
}

function buildButtonWithCallback(label, callback) {
  let htmlString = `
    <input type="button" value="${label}" class="akU5C" style="border: 2px solid black; margin: 5px 5px 0px; padding: 5px 10px; font-size: 14px;">
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
      key: 'friends',
      title: 'Deine Freunde',
      selector: "div[data-hypernova-key='FriendsOpinionsModule']",
      elementSelector: 'h2',
      elementTitle: 'Deine Freunde',
    },
    {
      key: 'stream',
      title: 'Streaming/TV',
      selector: "div[data-hypernova-key='ConsumptionModule']",
      elementSelector: 'h2',
      elementTitle: 'Schaue jetzt',
    },
    {
      key: 'cinema',
      title: 'im Kino',
      selector: "div[data-hypernova-key='MovieCinemaConsumptionModule']",
      elementSelector: 'h3',
      elementTitle: 'Aktuelle Vorstellungen',
    },
    {
      key: 'cast',
      title: 'Cast & Crew',
      selector: 'section',
      elementSelector: 'h2',
      elementTitle: 'Cast & Crew',
    },
    {
      key: 'videos',
      title: 'Videos & Bilder',
      selector: 'section',
      elementSelector: 'h2',
      elementTitle: 'Videos & Bilder',
    },
    {
      key: 'news',
      title: 'News',
      selector: "div[data-hypernova-key='ArticleSlider']",
      elementSelector: 'h2',
      elementTitle: 'News',
    },
    {
      key: 'press',
      title: 'Pressestimmen',
      selector: 'section',
      elementSelector: 'h2',
      elementTitle: 'Pressestimmen',
    },
    {
      key: 'statistics',
      title: 'Statistiken',
      selector: 'section',
      elementSelector: 'h2',
      elementTitle: 'Statistiken',
    },
    {
      key: 'comments',
      title: 'Kommentare',
      selector: 'section',
      elementSelector: 'h2',
      elementTitle: 'Kommentare',
    },
    {
      key: 'similar',
      title: 'Filme wie',
      selector: "div[data-hypernova-key='PosterSlider']",
      elementSelector: 'h2',
      elementTitle: 'Filme wie',
    },
    {
      key: 'lists',
      title: 'Listen',
      selector: "div[data-hypernova-key='ListSlider']",
      elementSelector: 'div.Jt--G',
      elementTitle: 'Trending: Meist diskutierte',
    },
    {
      key: 'moreNews',
      title: 'Weitere Artikel',
      selector: 'section',
      elementSelector: 'h2',
      elementTitle: 'Weitere Film-News',
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
