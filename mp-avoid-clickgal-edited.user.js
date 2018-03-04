// ==UserScript==
// @name          mp-avoid-clickgal-edited
// @author        mitcharts, leinzi
// @description	  Bilderstrecken auf Moviepilot umgehen
// @grant         none
// @require				https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// @include       /^(https?:\/\/www\.moviepilot.de\/news\/)(.*?)$/
// @version       1.07.1
// ==/UserScript==

// jQuery-Konflikte loesen
//
this.$ = this.jQuery = jQuery.noConflict(true);

var regWithoutSuffix        = /^(https?:\/\/www\.moviepilot.de\/news\/)([^\/\#]*?)$/;
var regFirstPageOne         = /^(https?:\/\/www\.moviepilot.de\/news\/)([^"]*?)\/(seite-1)$/;
var regLatterPages          = /^(https?:\/\/www\.moviepilot.de\/news\/)([^"]*?)\/(seite-([2-9]|2[0-6]))$/;

// gibt es nicht mehr?
var regWithCommentSuffix    = /^(https?:\/\/www\.moviepilot.de\/news\/)([^"]*?)\#(comments)$/;

// Funktion, damit das Dokument erst fertig geladen wird
$(document).ready(function(){
  var isclicktrack = $('.js--article--click-track');
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
  var contentBody = $('.article--content-body');
  contentBody.after('<p id=clickgal_cont_p></p>');
  contentBody.after('<hr>');

  var clickGalContP = $('#clickgal_cont_p');
  clickGalContP.append('<span id=clickgal_index><strong>Inhaltsverzeichnis:</strong></br>'+ divider +'</span></br>');
  clickGalContP.append('<span id=clickgal_content></span>');
  clickGalContP.append('<span id=clickgal_bottom>'+ divider +'</span></br>');
  clickGalContP.append('<hr>');

  for (var i = 1; i < pageCount - 1; i++) {
    $.ajax({
      url: defURL + (pageCount - i),
      type: 'GET',
      dataType: 'html',
      async: false,
      success: function (data) {
        var html = $('<div>').html(data);
        var header = html.find('h1.article--header--title').html();
        if((pageCount - i - 1) % 10 == 0){
          $('#clickgal_content').prepend('</br>');
        }
        $('#clickgal_content').prepend('<a href="' + this.url + '">' + this.url + '</a></br>');
        $('#clickgal_content').prepend('<span id=clickgal_index_' + i + '>' + header + ': </span></br>');
      }
    });
  }
}
