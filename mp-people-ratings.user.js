// ==UserScript==
// @name                MP-People-Ratings (jQuery)
// @description         Filmbewertungen auf Filmographien anzeigen
// @author              leinzi
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-people-ratings.user.js
// @include             /^https?:\/\/www\.moviepilot.de\/people\/([^\/\#]*?)\/filmography$/
// @version             0.2.0
// ==/UserScript==


// TODO: Error Handling
if (document.readyState !== 'loading') {
  addRatingsToFilmography()
} else {
  document.addEventListener('DOMContentLoaded', addRatingsToFilmography)
}

function addRatingsToFilmography() {
  fetchSession()
    .then(fetchRatings)
    .then(processFilmography)
    .catch(handleErrors)

  function fetchSession() {
    let sessionURL = 'https://www.moviepilot.de/api/session'
    return makeAjaxCall(sessionURL).then(processSettings)
  }

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
    let ratingPromises = []
    ratingPromises.push(fetchRatingsFromList(settings.moviesListURL, settings.moviePages))
    ratingPromises.push(fetchRatingsFromList(settings.seriesListURL, settings.seriesPages))
    return Promise.all(ratingPromises)
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
        return { link: link, rating: rating }
      })
    } else {
      throw new Error('There was an error in processing your request')
    }
  }

  function processFilmography(data) {
    let ratings = data.flatten()
    let tables = document.querySelectorAll('table')
    tables.forEach((table) => {
      let matchedRatings = []
      let rows = table.querySelectorAll('tr')
      rows.forEach((row) => {
        let link = row.querySelector('td a').href
        let matches = ratings.filter((ratingEntry) => {
          return ratingEntry.link === link
        })
        let ratingLabel = determineRatingLabel(matches)
        let rating = parseFloat(ratingLabel)
        if (!isNaN(rating)) {
          matchedRatings.push(rating)
        }
        row.appendChild(createRatingElement(ratingLabel))
      })

      let headline = table.previous()
      headline.after(createStatisticsElement(matchedRatings, rows.length))
    })

    function determineRatingLabel(matches) {
      if (matches.length > 0) {
        return matches[0].rating.toFixed(1)
      } else {
        return '?'
      }
    }

    function createStatisticsElement(matchedRatings, numberOfEntries) {
      let statisticsDiv = document.createElement('div')
      statisticsDiv.style.fontSize = '1rem'
      statisticsDiv.style.marginBottom = '1.25rem'

      let mean = (matchedRatings.length === 0) ? '-' : (Math.round((sumArray(matchedRatings) / matchedRatings.length) * 10000) / 10000.0)
      statisticsDiv.innerText = `Bewertet: ${matchedRatings.length}/${numberOfEntries}, Durchschnitt: ${mean}`
      return statisticsDiv
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
    console.log(error.message)
  }
}
