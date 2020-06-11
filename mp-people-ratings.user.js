// ==UserScript==
// @name                MP-People-Ratings (native Javascript)
// @description         Filmbewertungen auf Filmographien anzeigen
// @author              leinzi
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-people-ratings.user.js
// @include             /^https?:\/\/www\.moviepilot.de\/people\/([^\/\#]*?)\/filmography$/
// @version             0.7.0
// ==/UserScript==


if (document.readyState !== 'loading') {
  filmographyRatingExtension()
} else {
  document.addEventListener('DOMContentLoaded', filmographyRatingExtension)
}

function filmographyRatingExtension() {
  let sessionURL = 'https://www.moviepilot.de/api/session'
  makeAjaxRequest(sessionURL)
    .then(createUserFromSession)
    .then(addRatingsToFilmography)
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

function addRatingsToFilmography(signedInUser) {
  fetchRatings()
    .then(processFilmography)

  function fetchRatings() {
    let moviesPromise = fetchRatingsFromList(signedInUser.movies)
      .then(ratingEntriesPerPage => signedInUser.setRatingEntriesForType('movies', ratingEntriesPerPage.flat()))
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

  function processFilmography() {
    insertGeneralStatistics()
    let tables = document.querySelectorAll('table')
    new FilmographyProcessor(signedInUser, tables).run()

    function insertGeneralStatistics() {
      let movieHeadlineElement = document.querySelector('#filmography_movie')
      if (movieHeadlineElement) {
        movieHeadlineElement.before(createGeneralStatisticsFor('movies'))
      }
      let seriesHeadlineElement = document.querySelector('#filmography_series')
      if (seriesHeadlineElement) {
        seriesHeadlineElement.before(createGeneralStatisticsFor('serie'))
      }
    }

    function createGeneralStatisticsFor(type) {
      let ratingAttributes = signedInUser.getAttributesForType(type)

      let statisticsDiv = document.createElement('div')
      statisticsDiv.style.fontSize = '1rem'
      statisticsDiv.style.marginTop = '1rem'

      let mean = (ratingAttributes.mean) ? roundFloat(ratingAttributes.mean, 4) : '-'
      statisticsDiv.innerText = `${ratingAttributes.label} allgemein - Bewertet: ${ratingAttributes.numberOfEntries}, Durchschnitt: ${mean}`
      statisticsDiv.append(BonusSetting.arrayToHTML(ratingAttributes.bonusSettings))
      return statisticsDiv
    }
  }
}

// Utilities
function sumArray(array, initValue = 0) {
  const reducer = (accumulator, currentValue) => accumulator + currentValue
  return array.reduce(reducer, initValue)
}

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

  matches(type, slug) {
    return this.matchesType(type) && this.matchesSlug(slug)
  }
}

class User {
  constructor() {
    this.movies = new RatingAttributes('Filme')
    this.series = new RatingAttributes('Serien')
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

  getBonusSettingsForType(type) {
    let ratingAttributes = this.getAttributesForType(type)
    return ratingAttributes.bonusSettings
  }

  findRatingEntry(type, slug) {
    let ratingAttributes = this.getAttributesForType(type)
    return ratingAttributes.findRatingEntry(type, slug)
  }
}

class RatingAttributes {
  constructor(label) {
    this.label = label
    this.mean = null
    this.pages = 1
    this.listURL = null
    this.setRatingEntries([])
    this.setBonusSettings([])
  }

  get numberOfEntries() {
    return this.ratingEntries.length
  }

  setRatingEntries(newRatingEntries) {
    this.ratingEntries = newRatingEntries
    this.calculateMean()
    this.calculateBonusSettings()
  }

  setBonusSettings(newBonusSettings) {
    this.bonusSettings = newBonusSettings
  }

  findRatingEntry(type, slug) {
    return this.ratingEntries.filter(ratingEntry => ratingEntry.matches(type, slug))[0]
  }

  calculateMean() {
    let ratings = this.ratingEntries.map(ratingEntry => ratingEntry.rating)
    this.mean = (ratings.length === 0) ? null : sumArray(ratings) / ratings.length
  }

  calculateBonusSettings() {
    if (this.mean) {
      const maxRating = 10.0
      const minRating = 0.0
      const meanRating = Math.round(this.mean * 2) / 2.0

      let bonusSettings = []
      bonusSettings.push(new BonusSetting(Math.min(maxRating, meanRating + 3.5), maxRating, 0.20))
      bonusSettings.push(new BonusSetting(Math.min(maxRating, meanRating + 2.5), Math.min(maxRating, meanRating + 3), 0.15))
      bonusSettings.push(new BonusSetting(Math.min(maxRating, meanRating + 1), Math.min(maxRating, meanRating + 2), 0.10, true))
      bonusSettings.push(new BonusSetting(Math.max(minRating, meanRating - 0.5), Math.min(maxRating, meanRating + 0.5), 0.0))
      bonusSettings.push(new BonusSetting(Math.max(minRating, meanRating - 2.5), Math.max(minRating, meanRating - 1), -0.10, true))
      bonusSettings.push(new BonusSetting(Math.max(minRating, meanRating - 5), Math.max(minRating, meanRating - 3), -0.15))
      bonusSettings.push(new BonusSetting(minRating, Math.max(minRating, meanRating - 5.5), -0.20))
      this.setBonusSettings(bonusSettings)
    }
  }
}

class BonusSetting {
  constructor(minRating, maxRating, bonus, allowScaling = false) {
    this.minRating = minRating
    this.maxRating = maxRating
    this.bonus = bonus
    this.allowScaling = allowScaling
  }

  static arrayToHTML(bonusSettings) {
    let wrapper = document.createElement('div')
    wrapper.style.paddingTop = '0.75rem'

    let header = document.createElement('h3')
    header.innerText = 'Bonusberechnung'
    header.style.marginBottom = '0.75rem'
    wrapper.append(header)

    let bonusSettingsDiv = document.createElement('div')
    bonusSettingsDiv.style.fontSize = '0.75rem'
    bonusSettingsDiv.style.marginTop = '0.75rem'
    bonusSettingsDiv.style.display = 'flex'
    bonusSettingsDiv.style.flexWrap = 'wrap'
    bonusSettings.forEach(bonusSetting => bonusSettingsDiv.append(bonusSetting.toHTML()))

    let descriptionEntry = document.createElement('div')
    descriptionEntry.style.width = '50%';
    descriptionEntry.innerText = '*) Hälfte bei mehr als 10 Bewertungen'
    bonusSettingsDiv.append(descriptionEntry)

    wrapper.append(bonusSettingsDiv)
    return wrapper
  }

  matchesRating(rating) {
    return this.minRating <= rating && rating <= this.maxRating
  }

  toHTML() {
    let html = document.createElement('div')
    html.style.width = '33%';
    html.innerText = this.toString()
    return html
  }

  toString() {
    let string = parseFloat(this.maxRating).toFixed(1)
    string += ' >= x >= '
    string += parseFloat(this.minRating).toFixed(1)
    string += ': '
    if (this.bonus > 0) {
      string += '+'
    }
    string += parseFloat(this.bonus).toFixed(2)
    if (this.allowScaling) {
      string += '*'
    }
    return string
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

class FilmographyProcessor {
  constructor(user, tables) {
    this.user = user
    this.tables = tables
  }

  run() {
    this.tables.forEach(table => new TableProcessor(this.user, table).run())
  }
}

class TableProcessor {
  constructor(user, table) {
    this.user = user
    this.table = table
    this.ratingEntries = []
  }

  get numberOfEntries() {
    return this.ratingEntries.length
  }

  run() {
    let rows = this.table.querySelectorAll('tr')
    this.ratingEntries = Array.from(rows).map(row => new RowProcessor(this.user, row).runAndReturnRating())

    let headline = this.table.previousElementSibling
    if (headline) {
      headline.after(this.createStatisticsElement())
    }
  }

  createStatisticsElement() {
    let statisticsDiv = document.createElement('div')
    statisticsDiv.style.fontSize = '1rem'
    statisticsDiv.style.marginBottom = '1.25rem'

    let matchedRatings = this.ratingEntries.filter(Boolean)
    let ratedString = `${matchedRatings.length}/${this.numberOfEntries}`

    if (matchedRatings.length > 0) {
      let type = matchedRatings[0].type
      let mean = roundFloat(sumArray(matchedRatings.map(ratingEntry => ratingEntry.rating)) / matchedRatings.length)
      let points = roundFloat(mean + this.calculateBonus())
      statisticsDiv.innerText = `Bewertet: ${ratedString}, Durchschnitt: ${mean}, Punkte: ${points}`
      statisticsDiv.append(new Overview(matchedRatings).toHTML())
    } else {
      statisticsDiv.innerText = `Bewertet: ${ratedString}, Durchschnitt: -, Punkte: -`
    }
    return statisticsDiv
  }

  calculateBonus() {
    let ratingEntries = this.ratingEntries.filter(Boolean)
    let points = ratingEntries.map(ratingEntry => {
      let bonusSettings = this.user.getBonusSettingsForType(ratingEntry.type)
      let match = bonusSettings.filter(bonusSetting => bonusSetting.matchesRating(ratingEntry.rating))[0]
      if (match) {
        return (match.allowScaling && ratingEntries.length >= 10) ? match.bonus * 0.5 : match.bonus
      } else {
        return 0.0
      }
    })
    return sumArray(points, 0)
  }
}

class RowProcessor {
  constructor(user, row) {
    this.user = user
    this.row = row
    let link = row.querySelector('td a').href
    if (link) {
      let tokens = link.split('/')
      this.type = tokens.slice(-2)[0]
      this.slug = tokens.slice(-1)[0]
    }
  }

  runAndReturnRating() {
    let match = this.user.findRatingEntry(this.type, this.slug)
    let ratingLabel = (match) ? match.rating.toFixed(1) : '?'
    this.row.append(this.createRatingElement(ratingLabel))
    return match
  }

  createRatingElement(label) {
    let ratingElement = document.createElement('td')
    ratingElement.style.fontWeight = 'bold'
    ratingElement.innerText = label
    return ratingElement
  }
}

class Overview {
  constructor(ratingEntries) {
    this.ratingEntries = ratingEntries
  }

  toHTML() {
    let overview = document.createElement('div')
    overview.style.fontSize = '0.75rem'
    overview.style.marginTop = '0.75rem'
    overview.style.display = 'flex'
    overview.style.flexWrap = 'wrap'

    for (let i = 100; i >= 0; i = i - 5) {
      let overviewEntry = document.createElement('div')
      overviewEntry.style.width = '10%';
      let rating = i / 10.0
      let ratings = this.ratingEntries.filter(ratingEntry => ratingEntry.rating === rating)
      if (ratings.length > 0) {
       overviewEntry.innerText = `${parseFloat(rating).toFixed(1)}: ${ratings.length}x`
       overview.append(overviewEntry)
      }
    }
    return overview
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
