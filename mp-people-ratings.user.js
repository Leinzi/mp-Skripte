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


//RegExps
const regPeople = /^https?:\/\/www\.moviepilot.de\/people\/([^\/\#]*?)\/filmography$/;

// Funktion, damit das Dokument erst fertig geladen wird
jQuery(document).ready(function(){
    const baseURL = 'https://www.moviepilot.de';
    const getURL = window.location.href.replace('.html', '');
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    const perPage = 100;
    let moviesListURL = null;
    let moviePages = 0
    let seriesListURL = null;
    let seriesPages = 0;

    const ratings = [];
    let sessionURL = 'https://www.moviepilot.de/api/session';
    makeAjaxCall(sessionURL, "GET", 'json')
        .then(initalize)
        .then(fetchMovieRatings)
        .then(fetchSeriesRatings)
        .then(addRatingsToFilmography)

    function initalize(xhr) {
        if (xhr.status == 200) {
            let data = JSON.parse(xhr.response)
            moviesListURL = baseURL + data.movie_ratings_path;
            moviePages = Math.ceil(data.movie_ratings / 100)
            seriesListURL = baseURL + data.series_ratings_path;
            seriesPages = Math.ceil(data.series_ratings / 100)
            return [];
        }
    }

    function fetchMovieRatings(data) {
        let pages = new Array(moviePages)
        for (var i = 1; i <= moviePages; i++) {
            pages[i-1] = makeAjaxCall(moviesListURL + "?page=" + i, "GET").then(mapEntries, function(reason){
                console.log("error in processing your request", reason);
            });
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

    function fetchSeriesRatings(data) {
        let pages = new Array(seriesPages)
        for (var i = 1; i <= seriesPages; i++) {
            pages[i-1] = makeAjaxCall(seriesListURL + "?page=" + i, "GET").then(mapEntries, function(reason){
                console.log("error in processing your request", reason);
            });
        }
        return Promise.all(data.concat(pages))
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
            var mean = (matchedRatings.length === 0) ? '-' : (Math.round((matchedRatings.reduce(reducer, 0) / matchedRatings.length) * 10000) / 10000.0)
            statistics.innerText = `Bewertet: ${matchedRatings.length}/${rows.length}, Durchschnitt: ${mean}`
            headline.after(statistics)
        })
    }
    function stringToHTML(str) {
        var dom = document.createElement('div');
        dom.innerHTML = str;
        return dom;
    };

    function makeAjaxCall(url, methodType, dataType, callback) {
        return new Promise(function(resolve, reject) {
            const httpRequest = new XMLHttpRequest();
            httpRequest.onload = function() {
                resolve(this)
            }
            httpRequest.onerror = function() {
                reject(new Error("Network error"))
            }
            httpRequest.open(methodType, url);
            httpRequest.send();

        })
    }
});
