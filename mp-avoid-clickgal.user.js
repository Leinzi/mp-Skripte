// ==UserScript==
// @name          mp-avoid-clickgal
// @author        mitcharts, leinzi
// @description   Bilderstrecken auf Moviepilot umgehen
// @grant         none
// @downloadURL   https://raw.githubusercontent.com/Leinzi/mp-Skripte/master/mp-avoid-clickgal.user.js
// @require       https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// @include       /^(https?:\/\/www\.moviepilot.de\/news\/)(.*?)$/
// @version       1.08.8
// ==/UserScript==

// jQuery-Konflikte loesen
//
this.$ = this.jQuery = jQuery.noConflict(true);

var regWithoutSuffix        = /^(https?:\/\/www\.moviepilot.de\/news\/)([^\/\#]*?)$/;
var regFirstPageOne         = /^(https?:\/\/www\.moviepilot.de\/news\/)([^"]*?)\/(seite-1)$/;
var regLatterPages          = /^(https?:\/\/www\.moviepilot.de\/news\/)([^"]*?)\/(seite-([2-9]|2[0-6]))$/;

// gibt es nicht mehr?
var regWithCommentSuffix    = /^(https?:\/\/www\.moviepilot.de\/news\/)([^"]*?)\#(comments)$/;

var pages;

// Funktion, damit das Dokument erst fertig geladen wird
$(document).ready(function(){
  var isclicktrack = $('.js--article--click-track, .js--pagination');
  var getURL = window.location.href.replace('.html', '');

  if (isclicktrack.length > 0) {
    var lastPageURL = $('.js--pagination--last').attr('href');
    var pieces = lastPageURL.split('-');
    var pageCount = Number(pieces[pieces.length-1].split('.')[0]);

    if (regWithoutSuffix.test(getURL)) {
      buildTableOfContents(getURL + '/seite-', pageCount);
    } else if (regFirstPageOne.test(getURL)) {
      buildTableOfContents(getURL.slice(0, - 1), pageCount);
    } else if (regLatterPages.test(getURL)) {
      // do nothing
    } else if (regWithCommentSuffix.test(getURL)) {
      buildTableOfContents(getURL.slice(0, - 9) + '/seite-', pageCount);
    }
  }
});

function buildTableOfContents(defURL, pageCount) {
  var divider = '--------------------';

  var clickGalContent = $('<div style="margin: 0 auto"></div>');
  clickGalContent.append('<span><b>Inhaltsverzeichnis:</b></br>'+ divider +'</span></br>');
  clickGalContent.append('<span id=clickgal_content></span>');
  clickGalContent.append('<span>'+ divider +'</span></br>');

  var clickGalDiv = $('<div style="display=flex"');
  clickGalDiv.append('<hr>');
  clickGalDiv.append(clickGalContent);
  clickGalDiv.append('<hr>');

  var contentBody = $('.article--content-body');
  contentBody.append(clickGalDiv);

  pages = new Array(pageCount);
  for (var i = 2; i < pageCount; i++) {
    pages[i-2] = makeAjaxCall(defURL + i, "GET").then(appendEntry, function(reason){
        console.log("error in processing your request", reason);
    });
  }

  Promise.all(pages).then (values => {
    for (var i = 0; i < values.length; i++) {
      $('#clickgal_content').append(values[i]);
      if ((i + 1) % 10 == 0) {
        $('#clickgal_content').append('<br>');
      }
    }
  });
}

function appendEntry(data, i) {
  var header = $(data).find('h1.article--header--title').html();

  var elem = $('<div>')
  elem.append('<span>' + header + ': </span></br>');
  elem.append('<a href="' + this.url + '">' + this.url + '</a></br>');
  return elem;
}

function makeAjaxCall(url, methodType, callback) {
  return $.ajax({
      url: url,
      method: methodType,
      dataType: 'html'
  });
}
