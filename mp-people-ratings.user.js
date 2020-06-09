// ==UserScript==
// @name                MP-People-Ratings (native Javascript)
// @description         Filmbewertungen auf Filmographien anzeigen
// @author              leinzi
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-people-ratings.user.js
// @include             /^https?:\/\/www\.moviepilot.de\/people\/([^\/\#]*?)\/filmography$/
// @version             0.5.1
// ==/UserScript==


if (document.readyState !== 'loading') {
  addRatingsToFilmography()
} else {
  document.addEventListener('DOMContentLoaded', addRatingsToFilmography)
}

function addRatingsToFilmography() {
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
          let settings = {
            moviesListURL: baseURL + data.movie_ratings_path,
            moviePages: Math.ceil(data.movie_ratings / perPage),
            seriesListURL: baseURL + data.series_ratings_path,
            seriesPages: Math.ceil(data.series_ratings / perPage),
          }
          resolve(settings)
        } else {
          reject(new Error('Only works when signed in.'))
        }
      } else {
        reject(new Error('There was an error in processing your request'))
      }
    })
  }

  function fetchRatings(settings) {
    let moviesPromise = fetchRatingsFromList(settings.moviesListURL, settings.moviePages)
    let seriesPromise = fetchRatingsFromList(settings.seriesListURL, settings.seriesPages)
    return Promise.all([moviesPromise, seriesPromise])
  }

  function fetchRatingsFromList(listURL, pageCount) {
    let pages = []
    for (let i = 1; i <= pageCount; i++) {
      pages.push(makeAjaxCall(listURL + "?page=" + i).then(processEntries))
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

  function processFilmography(data) {
    let ratings = data.flatten()
    insertGeneralStatistics(ratings)

    let type = 'movies'
    let tables = document.querySelectorAll('table')
    tables.forEach((table) => {
      let matchedRatings = []
      let rows = table.querySelectorAll('tr')
      rows.forEach((row) => {
        let link = row.querySelector('td a').href
        let matches = ratings.filter((ratingEntry) => {
          return ratingEntry.matchesLink(link)
        })
        let ratingLabel = determineRatingLabel(matches)
        let rating = parseFloat(ratingLabel)
        if (!isNaN(rating)) {
          matchedRatings.push(rating)
        }
        row.appendChild(createRatingElement(ratingLabel))
        type = link.match(/\/movies\//) ? 'movies' : 'serie'
      })

      let headline = table.previous()
      headline.after(createStatisticsElement(matchedRatings, rows.length, type))
    })

    function calculateBonusSettings(meanValue) {
      const maxRating = 10.0
      const minRating = 0.0
      let bonusSettings = []
      let meanRating = Math.round(meanValue * 2) / 2.0

      bonusSettings.push({
        minRating: Math.min(maxRating, meanRating + 3.5),
        maxRating: maxRating,
        bonus: 0.20,
        allowScaling: false,
      })
      bonusSettings.push({
        minRating: Math.min(maxRating, meanRating + 2.5),
        maxRating: Math.min(maxRating, meanRating + 3),
        bonus: 0.15,
        allowScaling: false,
      })
      bonusSettings.push({
        minRating: Math.min(maxRating, meanRating + 1),
        maxRating: Math.min(maxRating, meanRating + 2),
        bonus: 0.10,
        allowScaling: true,
      })
      bonusSettings.push({
        minRating: Math.max(minRating, meanRating - 0.5),
        maxRating: Math.min(maxRating, meanRating + 0.5),
        bonus: 0.0,
        allowScaling: false,
      })
      bonusSettings.push({
        minRating: Math.max(minRating, meanRating - 2.5),
        maxRating: Math.max(minRating, meanRating - 1),
        bonus: -0.10,
        allowScaling: true,
      })
      bonusSettings.push({
        minRating: Math.max(minRating, meanRating - 5),
        maxRating: Math.max(minRating, meanRating - 3),
        bonus: -0.15,
        allowScaling: false,
      })
      bonusSettings.push({
        minRating: minRating,
        maxRating: Math.max(minRating, meanRating - 5.5),
        bonus: -0.20,
        allowScaling: false,
      })
      return bonusSettings
    }

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
        let string = parseFloat(bonusSetting.maxRating).toFixed(1)
        string += ' >= x >= '
        string += parseFloat(bonusSetting.minRating).toFixed(1)
        string += ': '
        if (bonusSetting.bonus > 0) {
          string += '+'
        }
        string += parseFloat(bonusSetting.bonus).toFixed(2)
        if (bonusSetting.allowScaling) {
          string += '*'
        }
        entry.innerText = string
        bonusSettingsDiv.appendChild(entry)
      }
      let entry = document.createElement('div')
      entry.style.width = '50%';
      entry.innerText = '*) Hälfte bei mehr als 10 Bewertungen'
      bonusSettingsDiv.appendChild(entry)
      wrapper.appendChild(bonusSettingsDiv)
      return wrapper
    }

    function insertGeneralStatistics(ratings) {
      let movieHeadlineElement = document.querySelector('#filmography_movie')
      if (movieHeadlineElement) {
        let statisticsDiv = createGeneralStatisticsForType(ratings, 'movies')
        movieHeadlineElement.before(statisticsDiv)
      }
      let seriesHeadlineElement = document.querySelector('#filmography_series')
      if (seriesHeadlineElement) {
        let statisticsDiv = createGeneralStatisticsForType(ratings, 'serie')
        seriesHeadlineElement.before(statisticsDiv)
      }
    }

    function createGeneralStatisticsForType(ratings, type) {
      let ratingsForType = ratings.filter((ratingEntry) => {
          return ratingEntry.matchesType(type)
      })
      debugger
      ratingsForType = ratingsForType.map(ratingEntry => ratingEntry.rating)

      let statisticsDiv = document.createElement('div')
      statisticsDiv.style.fontSize = '1rem'
      statisticsDiv.style.marginTop = '1rem'

      let mean = (ratingsForType.length === 0) ? '-' : roundFloat(sumArray(ratingsForType) / ratingsForType.length, 4)
      let label = ''
      // TODO: Refactoren!
      if (type === 'movies') {
        label = 'Filme'
        moviesMean = mean
      } else {
        label = 'Serien'
        seriesMean = mean
      }
      statisticsDiv.innerText = `${label} allgemein - Bewertet: ${ratingsForType.length}, Durchschnitt: ${mean}`

      let bonusSettings = calculateBonusSettings(mean)
      let bonusSettingElement = createBonusSettingsElement(bonusSettings)
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
      let mean = type === 'movies' ? moviesMean : seriesMean
      let bonusSettings = calculateBonusSettings(mean)

      let points = ratings.map((rating) => {
        let matches = bonusSettings.filter((bonusSetting) => {
          return bonusSetting.minRating <= rating && rating <= bonusSetting.maxRating
        })
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
