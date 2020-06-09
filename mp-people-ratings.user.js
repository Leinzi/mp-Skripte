// ==UserScript==
// @name                MP-People-Ratings (native Javascript)
// @description         Filmbewertungen auf Filmographien anzeigen
// @author              leinzi
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-people-ratings.user.js
// @include             /^https?:\/\/www\.moviepilot.de\/people\/([^\/\#]*?)\/filmography$/
// @version             0.6.0
// ==/UserScript==


if (document.readyState !== 'loading') {
  addRatingsToFilmography()
} else {
  document.addEventListener('DOMContentLoaded', addRatingsToFilmography)
}

function addRatingsToFilmography() {
  let signedInUser = undefined
  let moviesMean = 5
  let seriesMean = 5

  let sessionURL = 'https://www.moviepilot.de/api/session'
  makeAjaxCall(sessionURL)
    .then(processSettings)
    .then(fetchRatings)
    .then(processFilmography)
    .catch(handleErrors)

  function processSettings(request) {
    return new Promise(function(resolve, reject) {
      if (request.status == 200) {
        let data = JSON.parse(request.response)
        if (data.type === 'RegisteredUser') {
          const baseURL = 'https://www.moviepilot.de'
          const perPage = 100
          signedInUser = new User()
          signedInUser.setSessionInformationForType('movies', Math.ceil(data.movie_ratings / perPage), baseURL + data.movie_ratings_path)
          signedInUser.setSessionInformationForType('series', Math.ceil(data.series_ratings / perPage), baseURL + data.series_ratings_path)
          resolve(signedInUser)
        } else {
          reject(new Error('Only works when signed in.'))
        }
      } else {
        reject(new Error('There was an error in processing your request'))
      }
    })
  }

  function fetchRatings() {
    let moviesPromise = fetchRatingsFromList(signedInUser.movies)
      .then((data) => signedInUser.setRatingEntriesForType('movies', data.flatten()))
    let seriesPromise = fetchRatingsFromList(signedInUser.series)
      .then((data) => signedInUser.setRatingEntriesForType('series', data.flatten()))
    return Promise.all([moviesPromise, seriesPromise])
  }

  function fetchRatingsFromList(ratingAttributes) {
    let pages = []
    for (let i = 1; i <= ratingAttributes.pages; i++) {
      pages.push(makeAjaxCall(ratingAttributes.listURL + "?page=" + i).then(processEntries))
    }
    return Promise.all(pages)
  }

  function processEntries(request) {
    if (request.status == 200) {
      let data = request.response
      let dom = stringToHTML(data)
      let rows = dom.querySelectorAll('tbody tr')

      return Array.from(rows).map(row => {
        let fields = row.querySelectorAll('td')
        let link = fields[0].querySelector('a').href
        let rating = parseFloat(fields[1].innerText)
        return new RatingEntry(link, rating)
      })
    } else {
      throw new Error('There was an error in processing your request')
    }
  }

  function processFilmography() {
    insertGeneralStatistics()

    let type = 'movies'
    let tables = document.querySelectorAll('table')
    tables.forEach((table) => {
      let matchedRatings = []
      let rows = table.querySelectorAll('tr')
      rows.forEach((row) => {
        let link = row.querySelector('td a').href
        type = link.match(/\/movies\//) ? 'movies' : 'series'
        let ratings = signedInUser.getRatingEntriesForType(type)
        let matches = ratings.filter((ratingEntry) => {
          return ratingEntry.matchesLink(link)
        })
        let ratingLabel = determineRatingLabel(matches)
        let rating = parseFloat(ratingLabel)
        if (!isNaN(rating)) {
          matchedRatings.push(rating)
        }
        row.appendChild(createRatingElement(ratingLabel))
      })

      let headline = table.previous()
      headline.after(createStatisticsElement(matchedRatings, rows.length, type))
    })

    function createBonusSettingsElement(bonusSettings) {
      let wrapper = document.createElement('div')
      wrapper.style.paddingTop = '0.75rem'
      let header = document.createElement('h3')
      header.innerText = 'Bonusberechnung'
      header.style.marginBottom = '0.75rem'
      wrapper.appendChild(header)
      let bonusSettingsDiv = document.createElement('div')
      bonusSettingsDiv.style.fontSize = '0.75rem'
      bonusSettingsDiv.style.marginTop = '0.75rem'
      bonusSettingsDiv.style.display = 'flex'
      bonusSettingsDiv.style.flexWrap = 'wrap'

      for (let bonusSetting of bonusSettings) {
        let entry = document.createElement('div')
        entry.style.width = '33%';
        entry.innerText = bonusSetting.toString()
        bonusSettingsDiv.appendChild(entry)
      }
      let entry = document.createElement('div')
      entry.style.width = '50%';
      entry.innerText = '*) Hälfte bei mehr als 10 Bewertungen'
      bonusSettingsDiv.appendChild(entry)
      wrapper.appendChild(bonusSettingsDiv)
      return wrapper
    }

    function insertGeneralStatistics() {
      let movieHeadlineElement = document.querySelector('#filmography_movie')
      if (movieHeadlineElement) {
        let statisticsDiv = createGeneralStatisticsFor(signedInUser.getAttributesForType('movies'))
        movieHeadlineElement.before(statisticsDiv)
      }
      let seriesHeadlineElement = document.querySelector('#filmography_series')
      if (seriesHeadlineElement) {
        let statisticsDiv = createGeneralStatisticsFor(signedInUser.getAttributesForType('series'))
        seriesHeadlineElement.before(statisticsDiv)
      }
    }

    function createGeneralStatisticsFor(ratingAttributes) {
      let statisticsDiv = document.createElement('div')
      statisticsDiv.style.fontSize = '1rem'
      statisticsDiv.style.marginTop = '1rem'

      let mean = (ratingAttributes.mean) ? roundFloat(ratingAttributes.mean, 4) : '-'
      statisticsDiv.innerText = `${ratingAttributes.label} allgemein - Bewertet: ${ratingAttributes.numberOfEntries}, Durchschnitt: ${mean}`

      let bonusSettingElement = createBonusSettingsElement(ratingAttributes.bonusSettings)
      statisticsDiv.appendChild(bonusSettingElement)
      return statisticsDiv
    }

    function determineRatingLabel(matches) {
      if (matches.length > 0) {
        return matches[0].rating.toFixed(1)
      } else {
        return '?'
      }
    }

    function createStatisticsElement(matchedRatings, numberOfEntries, type) {
      let statisticsDiv = document.createElement('div')
      statisticsDiv.style.fontSize = '1rem'
      statisticsDiv.style.marginBottom = '1.25rem'

      let points = calculateBonus(matchedRatings, type)

      let mean = (matchedRatings.length === 0) ? '-' : roundFloat(sumArray(matchedRatings) / matchedRatings.length)
      statisticsDiv.innerText = `Bewertet: ${matchedRatings.length}/${numberOfEntries}, Durchschnitt: ${mean}, Punkte: ${roundFloat(mean + points)}`

      if (matchedRatings.length > 0) {
        statisticsDiv.appendChild(createOverviewFor(matchedRatings))
      }
      return statisticsDiv
    }

    function createOverviewFor(matchedRatings) {
      let overview = document.createElement('div')
      overview.style.fontSize = '0.75rem'
      overview.style.marginTop = '0.75rem'
      overview.style.display = 'flex'
      overview.style.flexWrap = 'wrap'
      for (let i = 100; i >= 0; i = i - 5) {
        let entry = document.createElement('div')
        entry.style.width = '10%';
        let rating = i / 10.0
        let ratings = matchedRatings.filter((ratingEntry) => {
          return ratingEntry === rating
        })
        entry.innerText = `${parseFloat(rating).toFixed(1)}: ${ratings.length}x`
        if (ratings.length > 0) {
         overview.appendChild(entry)
        }
      }
      return overview
    }

    function calculateBonus(ratings, type) {
      let bonusSettings = signedInUser.getBonusSettingsForType(type)

      let points = ratings.map((rating) => {
        let matches = bonusSettings.filter(bonusSetting => bonusSetting.matchesRating(rating))
        if (matches) {
          let match = matches[0]
          return (match.allowScaling && ratings.length >= 10) ? match.bonus * 0.5 : match.bonus
        } else {
          return 0.0
        }
      })
      return sumArray(points, 0)
    }

    function createRatingElement(rating) {
      let ratingElement = document.createElement('td')
      ratingElement.style.fontWeight = 'bold'
      ratingElement.innerText = rating
      return ratingElement
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

function makeAjaxCall(url) {
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
}

class User {
  constructor() {
    this.movies = new RatingAttributes('Filme')
    this.series = new RatingAttributes('Serien')
  }

  getAttributesForType(type) {
    switch(type) {
      case 'movies': return this.movies
      case 'series': return this.series
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

  matchesRating(rating) {
    return this.minRating <= rating && rating <= this.maxRating
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
