// ==UserScript==
// @name                MP-People-Ratings (jQuery)
// @description         Filmbewertungen auf Filmographien anzeigen
// @author              leinzi
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-people-ratings.user.js
// @require             https://code.jquery.com/jquery-3.5.1.min.js
// @include             /^https?:\/\/www\.moviepilot.de\/people\/([^\/\#]*?)\/filmography$/
// @version             0.1.1
// ==/UserScript==


// Funktion, damit das Dokument erst fertig geladen wird
jQuery(document).ready(function(){

    fetchSession()
        .then(fetchRatings)
        .then(addRatingsToFilmography)

   function fetchSession() {
     let sessionURL = 'https://www.moviepilot.de/api/session'
     return makeAjaxCall(sessionURL).then(getSettings, handleErrors)
    }

    function getSettings(sessionResponse) {
      return new Promise(function(resolve, reject) {
        if (sessionResponse.status == 200) {
            let data = JSON.parse(sessionResponse.response)
            if (data.type === 'RegisteredUser') {
              const baseURL = 'https://www.moviepilot.de';
              const perPage = 100;
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
      });
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
          pages.push(makeAjaxCall(listURL + "?page=" + i).then(mapEntries, handleErrors))
        }
        return Promise.all(pages)
    }

    function mapEntries(xhr) {
        if (xhr.status == 200) {
            let data = xhr.response
            let dom = stringToHTML(data)
            let rows = dom.querySelectorAll('tbody tr')
            let entries = []
            rows.forEach(row => {
                let fields = row.querySelectorAll('td')
                let link = fields[0].querySelector('a').href
                let rating = parseFloat(fields[1].innerText)
                let entry = { link: link, rating: rating }
                entries.push(entry)
            })
            return entries
        }
    }
    function addRatingsToFilmography(data) {
        let ratings = data.flatten()
        let tables = document.querySelectorAll('table');
        tables.forEach((table) => {
            let headline = table.previous()
            let rows = table.querySelectorAll('tr');
            let matchedRatings = [];
            rows.forEach((row) => {
                let link = row.querySelector('td a').href
                let matches = ratings.filter((ratingEntry) => {
                    return ratingEntry.link === link
                })
                let rating = '?'
                if (matches.length > 0) {
                    rating = matches[0].rating
                    matchedRatings.push(rating)
                    rating = rating.toFixed(1)
                }

                var elem = jQuery('<td>')
                var innerElem = jQuery('<b>')
                elem = elem[0];
                innerElem = innerElem[0];
                innerElem.innerText = rating;
                elem.append(innerElem);
                row.append(elem);
            })
            var statistics = document.createElement('div')
            statistics.style.fontSize = '1rem'
            statistics.style.marginBottom = '1.25rem'
            var mean = (matchedRatings.length === 0) ? '-' : (Math.round((sumArray(matchedRatings) / matchedRatings.length) * 10000) / 10000.0)
            statistics.innerText = `Bewertet: ${matchedRatings.length}/${rows.length}, Durchschnitt: ${mean}`
            headline.after(statistics)
        })
    }

    // Utilities
    function sumArray(array, initValue = 0) {
      const reducer = (accumulator, currentValue) => accumulator + currentValue;
      array.reduce(reducer, initValue)
    }

    function stringToHTML(string) {
        var dom = document.createElement('div')
        dom.innerHTML = string
        return dom
    }

    function makeAjaxCall(url) {
        return new Promise(function(resolve, reject) {
            const httpRequest = new XMLHttpRequest();
            httpRequest.onload = function() {
                resolve(this)
            }
            httpRequest.onerror = function() {
                reject(new Error("Network error"))
            }
            httpRequest.open('GET', url);
            httpRequest.send();

        })
    }

    function handleErrors(error) {
      console.error(error.message);
    }
});
