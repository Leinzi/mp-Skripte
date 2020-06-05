// ==UserScript==
// @name                MP-People-Ratings (jQuery)
// @description         Filmbewertungen auf Filmographien anzeigen
// @author              leinzi
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-people-ratings.user.js
// @require             https://code.jquery.com/jquery-3.5.1.min.js
// @include             /^https?:\/\/www\.moviepilot.de\/people\/([^\/\#]*?)\/filmography$/
// @version             0.0.3
// ==/UserScript==


//RegExps
const regPeople = /^https?:\/\/www\.moviepilot.de\/people\/([^\/\#]*?)\/filmography$/;
const baseURL = 'https://www.moviepilot.de';

// Funktion, damit das Dokument erst fertig geladen wird
jQuery(document).ready(function(){
  const getURL = window.location.href.replace('.html', '');

  if (regPeople.test(getURL)){
    addRatingsToFilmography();
  }
});

function addRatingsToFilmography() {
  let $tables = jQuery('table');

  $tables.each(function() {
    let $table = jQuery(this);
    let $rows = $table.find('tr')

    $rows.each(function() {
      let $row = jQuery(this)
      let link = $row.find('td a').first()
      link = link.attr('href');
      let promise = makeAjaxCall(baseURL + link, "GET").then(appendEntry, function(reason){
          console.log("error in processing your request", reason);
      });

      promise.then (values => {
          $row.append(values);
      });

    })
  });

}

function appendEntry(data) {
  var ratingCircle = jQuery(data).find('._3ncdv ._2HXwc')[0];
  var rating = ratingCircle.innerText;
    var elem = jQuery('<td>')
    elem = elem[0];
    elem.innerText = rating;
    return elem;
}

function makeAjaxCall(url, methodType, callback) {
  return jQuery.ajax({
      url: url,
      method: methodType,
      dataType: 'html',
  });
}
