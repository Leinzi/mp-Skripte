// ==UserScript==
// @name                MP-Link-Rating-Extension (experimentell)
// @description         Das Skript hängt die eigene Bewertung als Tooltip an Film- und Serien-Links und färbt diese
// @author              leinzi
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/blob/master/mp-link-rating-extension.user.js
// @include             /^https?:\/\/www\.moviepilot.de\//
// @version             0.1.2
// ==/UserScript==

if (document.readyState !== 'loading') {
  linkRatingExtension()
} else {
  document.addEventListener('DOMContentLoaded', linkRatingExtension)
}

function linkRatingExtension() {
  let sessionURL = 'https://www.moviepilot.de/api/session'
  makeAjaxRequest(sessionURL)
    .then(createUserFromSession)
    .then(addRatingsToLinks)
    .then(addStylesheetToHead)
    .catch(handleErrors)
}

function createUserFromSession(sessionRequest) {
  return new Promise(function(resolve, reject) {
    if (sessionRequest.status == 200) {
      let data = JSON.parse(sessionRequest.response)
      if (data.type === 'RegisteredUser') {
        const baseURL = 'https://www.moviepilot.de'
        const perPage = 100
        let signedInUser = new User()
        signedInUser.setSessionInformationForType('movies', Math.ceil(data.movie_ratings / perPage), baseURL + data.movie_ratings_path)
        signedInUser.setSessionInformationForType('serie', Math.ceil(data.series_ratings / perPage), baseURL + data.series_ratings_path)
        resolve(signedInUser)
      } else {
      reject(new Error('Only works when signed in.'))
      }
    } else {
      reject(new Error('There was an error in processing your request'))
    }
  })
}

function addStylesheetToHead() {
  let style = document.createElement('style')
  style.type = 'text/css'
  style.append(document.createTextNode('.media-link.-seen { color: rgb(55, 153, 107) }'))
  style.append(document.createTextNode('.media-link.-seen:hover { color: rgba(55, 153, 107, .75) }'))
  style.append(document.createTextNode('.media-link.-unseen{ color: rgb(244, 100, 90) }'))
  style.append(document.createTextNode('.media-link.-unseen:hover { color: rgba(244, 100, 90, .75) }'))
  style.append(document.createTextNode('.person--details .regular-link { color: rgb(28, 44, 133) !important }'))
  style.append(document.createTextNode('.person--details .regular-link:hover { color: rgba(28, 44, 133, .75) !important }'))

  document.getElementsByTagName('head')[0].append(style);
  return Promise.resolve(true)
}


function addRatingsToLinks(signedInUser) {
  fetchRatings()
    .then(processPage)
    .then(addObserverToXHR)

  function fetchRatings() {
    let moviesPromise = fetchRatingsFromList(signedInUser.movies)
      .then(ratingEntriesPerPage => { signedInUser.setRatingEntriesForType('movies', ratingEntriesPerPage.flat()) })
    let seriesPromise = fetchRatingsFromList(signedInUser.series)
      .then(ratingEntriesPerPage => signedInUser.setRatingEntriesForType('serie', ratingEntriesPerPage.flat()))
    return Promise.all([moviesPromise, seriesPromise])
  }

  function fetchRatingsFromList(ratingAttributes) {
    let pages = []
    for (let i = 1; i <= ratingAttributes.pages; i++) {
      let url = ratingAttributes.listURL + "?page=" + i
      let ratingListProcessor = new RatingListProcessor(url)
      let promise = ratingListProcessor.fetchRatingList()
        .then(response => response.text())
        .then(ratingList => ratingListProcessor.processList(ratingList))
      pages.push(promise)
    }
    return Promise.all(pages)
  }

function addObserverToXHR() {
  let originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    this.addEventListener('load', function() {
      processPage()
    })
    originalOpen.apply(this, arguments)
  }
}

function processPage() {
    let content = document.querySelector('main, #main, #content')
    if (content) {
      let anchorElements = Array.from(content.querySelectorAll('a'))
      let linkElements = anchorElements.map(element => new LinkElement(element))
      if (window.location.href.match('https://www.moviepilot.de/people')) {
        linkElements.filter(element => !element.isMediaLink())
          .forEach(linkElement => linkElement.element.classList.add('regular-link'))
      }
      linkElements = linkElements.filter(element => element.isMediaLink())

      linkElements.forEach((linkElement) => {
        let match = signedInUser.findRatingEntry(linkElement.type, linkElement.slug)
        let rating = match ? parseFloat(match.rating).toFixed(1) : 'keine'
        let title = linkElement.element.title
        if (title.match(/( \(Deine Bewertung: .*\))/)) {
          title = title.replace(RegExp.lastMatch, ` (Deine Bewertung: ${rating})`)
        } else {
          title += ` (Deine Bewertung: ${rating})`
        }
        linkElement.element.title = title
        linkElement.element.classList.add('media-link')
        linkElement.element.classList.toggle('-seen', match)
        linkElement.element.classList.toggle('-unseen', !match)
      })
    }
  }
}

// Utilities
function stringToHTML(string) {
  let dom = document.createElement('div')
  dom.innerHTML = string
  return dom
}

function makeAjaxRequest(url) {
  return new Promise(function(resolve, reject) {
    const httpRequest = new XMLHttpRequest()
    httpRequest.onload = function() {
      resolve(this)
    }
    httpRequest.onerror = function() {
      reject(new Error("Network error"))
    }
    httpRequest.open('GET', url)
    httpRequest.send()
  })
}

function handleErrors(error) {
  console.error(error.message)
}

function roundFloat(number, precision = 2) {
  return Math.round(number * Math.pow(10, precision)) / Math.pow(10, precision)
}

function hashString(string) {
  let hash = 0
  if (string.length == 0) return hash
  for (let i = 0; i < string.length; i++) {
    let char = string.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}

class RatingEntry {
  constructor(link, rating) {
    this.rating = rating
    if (link) {
      let tokens = link.split('/')
      this.type = tokens.slice(-2)[0]
      this.slug = tokens.slice(-1)[0]
    }
  }

  matchesLink(link) {
    let tokens = link.split('/')
    return this.matchesType(tokens.slice(-2)[0]) && this.slug === tokens.slice(-1)[0]
  }

  matchesType(type) {
    return this.type === type
  }

  matchesSlug(slug) {
    return this.slug === slug
  }
}

class User {
  constructor() {
    this.movies = new RatingAttributes()
    this.series = new RatingAttributes()
  }

  getAttributesForType(type) {
    switch(type) {
      case 'movies': return this.movies
      case 'serie': return this.series
      default: throw new Error('undefined type: ' + type)
    }
  }

  setSessionInformationForType(type, pages, listURL) {
    let ratingAttributes = this.getAttributesForType(type)
    ratingAttributes.pages = pages
    ratingAttributes.listURL = listURL
  }

  setRatingEntriesForType(type, ratingEntries) {
    let ratingAttributes = this.getAttributesForType(type)
    ratingAttributes.setRatingEntries(ratingEntries)
  }

  getRatingEntriesForType(type) {
    let ratingAttributes = this.getAttributesForType(type)
    return ratingAttributes.ratingEntries
  }

  findRatingEntry(type, slug) {
    let ratingAttributes = this.getAttributesForType(type)
    return ratingAttributes.findRatingEntry(type, slug)
  }
}

class LinkElement {
  constructor(element) {
    this.element = element
    this.link = this.element.href
    let tokens = this.link.split('/')
    this.type = tokens.slice(-2)[0]
    this.slug = tokens.slice(-1)[0]
  }

  isMoviepilotLink() {
    return this.link && this.link.startsWith('https://www.moviepilot.de/')
  }

  isNavigationLink() {
    return this.element.innerText === 'Übersicht'
  }

  isMediaLink() {
    return this.isMoviepilotLink() && ['movies', 'serie'].includes(this.type) && !this.slug.includes('#')
  }
}

class RatingAttributes {
  constructor() {
    this.pages = 1
    this.listURL = null
    this.setRatingEntries([])
  }

  setRatingEntries(newRatingEntries) {
    this.ratingEntries = newRatingEntries
  }

  findRatingEntry(type, slug) {
    return this.ratingEntries.filter(ratingEntry => (ratingEntry.type === type && ratingEntry.slug === slug))[0]
  }
}

class RatingListProcessor {
  constructor(url) {
    this.url = url
  }

  fetchRatingList() {
    let expiry = 10 * 60 // 10 min default
    // Use the URL as the cache key to sessionStorage
    let cacheKey = hashString(this.url)
    let cached = MPRatingStorage.getItem(cacheKey)
    let whenCached = MPRatingStorage.getItem(cacheKey + ':ts')
    if (cached !== null && whenCached !== null) {
      // it was in sessionStorage! Yay!
      // Even though 'whenCached' is a string, this operation
      // works because the minus sign converts the
      // string to an integer and it will work.
      let age = (Date.now() - whenCached) / 1000
      if (age < expiry) {
        let response = new Response(new Blob([cached]))
        return Promise.resolve(response)
      } else {
        // We need to clean up this old key
        MPRatingStorage.removeItem(cacheKey)
        MPRatingStorage.removeItem(cacheKey + ':ts')
      }
    }
    return fetch(this.url).then(response => {
      if (response.status === 200) {
        let ct = response.headers.get('Content-Type')
        if (ct && (ct.match(/application\/json/i) || ct.match(/text\//i))) {
          response.clone().text().then(content => {
            let dom = stringToHTML(content)
            let ratingList = dom.querySelector('table')
            MPRatingStorage.storeItem(cacheKey, ratingList.outerHTML)
            MPRatingStorage.storeItem(cacheKey + ':ts', Date.now())
          })
        }
        return Promise.resolve(response)
      } else {
        return Promise.reject(new Error('There was an error in processing your request'))
      }
    })
  }

  processList(ratingList) {
    let dom = stringToHTML(ratingList)
    ratingList = dom.querySelector('table')
    let rows = ratingList.querySelectorAll('tbody tr')
    if (rows) {
      return Promise.resolve(Array.from(rows).map(row => this.buildRatingEntryFromRow(row)))
    } else {
      return Promise.reject(new Error('There was an error in processing your request'))
    }
  }

  buildRatingEntryFromRow(row) {
    let dataFields = row.querySelectorAll('td')
    let link = dataFields[0].querySelector('a').href
    let rating = parseFloat(dataFields[1].innerText)
    return new RatingEntry(link, rating)
  }
}

class MPRatingStorage {
  static storageKey() {
    return 'mpRatingStorage'
  }

  static getStorage() {
    let storage = localStorage.getItem(MPRatingStorage.storageKey())
    if (storage) {
      return JSON.parse(storage)
    } else {
     return {}
    }
  }

  static setStorage(newStorage) {
   localStorage.setItem(MPRatingStorage.storageKey(), JSON.stringify(newStorage))
  }

  static clearStorage() {
   localStorage.removeItem(MPRatingStorage.storageKey())
  }

  static getItem(key) {
    let item = MPRatingStorage.getStorage()[key]
    return item
  }

  static removeItem(key) {
    let storage = MPRatingStorage.getStorage()
    delete storage[key]
    MPRatingStorage.setStorage(storage)
  }

  static storeItem(key, item) {
    let storage = MPRatingStorage.getStorage()
    storage[key] = item
    MPRatingStorage.setStorage(storage)
  }
}
