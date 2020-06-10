// ==UserScript==
// @name                MP-Link-Rating-Extension (experimentell)
// @description         Das Skript hängt die eigene Bewertung als Tooltip an Film- und Serien-Links und färbt diese
// @author              leinzi
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/blob/master/mp-link-rating-extension.user.js
// @include             /^https?:\/\/www\.moviepilot.de\//
// @version             0.0.4
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

function addRatingsToLinks(signedInUser) {
  fetchRatings()
    .then(promise => processArticle(document))
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
      let promise = makeAjaxRequest(ratingAttributes.listURL + "?page=" + i)
        .then(request => (new RatingListProcessor(request).run()))
      pages.push(promise)
    }
    return Promise.all(pages)
  }

function addObserverToXHR() {
  let originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    this.addEventListener('load', function() {
      processArticle()
    })
    originalOpen.apply(this, arguments)
  }
}

function processArticle() {
    let anchorElements = Array.from(document.querySelectorAll('a'))
    let linkElements = anchorElements.map(element => new LinkElement(element))
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
      linkElement.element.style.color = (match) ? '#37996b' : '#f4645a'
    })
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

  isMediaLink() {
    return this.isMoviepilotLink() && ['movies', 'serie'].includes(this.type)
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
  constructor(request) {
    this.request = request
  }

  run() {
    if (this.status() === 200) {
      let dom = stringToHTML(this.response())
      let rows = dom.querySelectorAll('tbody tr')
      return Array.from(rows).map(row => this.buildRatingEntryFromRow(row))
    } else {
      throw new Error('There was an error in processing your request')
    }
  }

  status() { return this.request.status }
  response() { return this.request.response }

  buildRatingEntryFromRow(row) {
    let dataFields = row.querySelectorAll('td')
    let link = dataFields[0].querySelector('a').href
    let rating = parseFloat(dataFields[1].innerText)
    return new RatingEntry(link, rating)
  }
}
