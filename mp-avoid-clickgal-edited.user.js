// ==UserScript==
// @name          mp-avoid-clickgal-edited
// @author        leinzi
// @description	  Bilderstrecken auf Moviepilot umgehen
// @grant         none
// @require				https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// @include       http://www.moviepilot.de/news/*
// @include       https://www.moviepilot.de/news/*
// @version       1.07.1
// ==/UserScript==

// jQuery-Konflikte loesen
//
this.$ = this.jQuery = jQuery.noConflict(true);

  var isclicktrack = $('.js--article--click-track');
  var GetURL = $(location).attr('href');
  var EditURL = '';
  var UseURL = '';
//  var pageCount = 90;

  js--article--click-track

    console.log('Hallo');
  if (isclicktrack.length > 0) {
    console.log('Hallo');
    var lastPageURL = ('.js--pagination--last').attr('href');
    var pieces = lastPageURL.split('-');
    var pageCount = Number(pieces[pieces.length-1].split('.')[0]);
    console.log(pageCount);
    if (/^(http:\/\/www\.moviepilot.de\/news\/)([^\/\#]*?)$/.test(window.location.href)) {
      UseURL = GetURL + '/seite-';
      $('.article--content-body').after('<p id=clickgal_cont_p></p>');
      $('.article--content-body').after('<hr></hr>');
      $('#clickgal_cont_p').append('<span id=clickgal_index><strong>Inhaltsverzeichnis:</strong></br>--------------------</span></br>');
      $('#clickgal_cont_p').append('<span id=clickgal_content></span>');
      $('#clickgal_cont_p').append('<span id=clickgal_content>--------------------</span></br>');
      $('#clickgal_cont_p').append('<hr></hr>');
      //    for (var i = 0; i < pageCount.length; i++) {
      for (var i = 0; i < pageCount - 1; i++) {
        $.ajax({
          url: UseURL + (pageCount - i),
          type: 'GET',
          dataType: 'html',
          async: false,
          success: function (data) {
            var html = $('<div>').html(data);
            var Ergebnis1 = html.find('h1.article--header--title').html();
            var Ergebnis2 = html.find('div.article--coverimage-caption').html();
            if((pageCount - i - 1) % 10 == 0){
              $('#clickgal_content').prepend('</br>');
            }
            $('#clickgal_content').prepend('<a href="' + this.url + '">' + this.url + '</a></br>');
            $('#clickgal_content').prepend('<span id=clickgal_index_' + i + '>' + Ergebnis1 + ': </span></br>');
          }
        });
      }
    }
    if (/^(http:\/\/www\.moviepilot.de\/news\/)([^"]*?)\/(seite-1)$/.test(window.location.href)) {
      EditURL = GetURL.slice(0, - 1);
      UseURL = EditURL;
      $('.article--content-body').after('<p id=clickgal_cont_p></p>');
      $('.article--content-body').after('<hr></hr>');
      $('#clickgal_cont_p').append('<span id=clickgal_index><strong>Inhaltsverzeichnis:</strong></br>--------------------</span></br>');
      $('#clickgal_cont_p').append('<span id=clickgal_content></span>');
      $('#clickgal_cont_p').append('<span id=clickgal_content>--------------------</span></br>');
      $('#clickgal_cont_p').append('<hr></hr>');
      //    for (var i = 0; i < pageCount.length; i++) {
      for (var i = 0; i < pageCount - 1; i++) {
        $.ajax({
          url: UseURL + (pageCount - i),
          type: 'GET',
          dataType: 'html',
          async: false,
          success: function (data) {
            var html = $('<div>').html(data);
            var Ergebnis1 = html.find('h1.article--header--title').html();
            var Ergebnis2 = html.find('div.article--coverimage-caption').html();
            if((pageCount - i - 1) % 10 == 0){
              $('#clickgal_content').prepend('</br>');
            }
            $('#clickgal_content').prepend('<a href="' + this.url + '">' + this.url + '</a></br>');
            $('#clickgal_content').prepend('<span id=clickgal_index_' + i + '>' + Ergebnis1 + ': </span></br>');
          }
        });
      }
    }
    if (/^(http:\/\/www\.moviepilot.de\/news\/)([^"]*?)\/(seite-([2-9]|2[0-6]))$/.test(window.location.href)) {
    }
    if (/^(http:\/\/www\.moviepilot.de\/news\/)([^"]*?)\#(comments)$/.test(window.location.href)) {
      EditURL = GetURL.slice(0, - 9);
      UseURL = EditURL + '/seite-';
      $('.article--content-body').after('<p id=clickgal_cont_p></p>');
      $('.article--content-body').after('<hr></hr>');
      $('#clickgal_cont_p').append('<span id=clickgal_index><strong>Inhaltsverzeichnis:</strong></br>--------------------</span></br>');
      $('#clickgal_cont_p').append('<span id=clickgal_content></span>');
      $('#clickgal_cont_p').append('<span id=clickgal_content>--------------------</span></br>');
      $('#clickgal_cont_p').append('<hr></hr>');
      //    for (var i = 0; i < pageCount.length; i++) {
      for (var i = 0; i < pageCount - 1; i++) {
        $.ajax({
          url: UseURL + (pageCount - i),
          type: 'GET',
          dataType: 'html',
          async: false,
          success: function (data) {
            var html = $('<div>').html(data);
            var Ergebnis1 = html.find('h1.article--header--title').html();
            var Ergebnis2 = html.find('div.article--coverimage-caption').html();
            if((pageCount - i - 1) % 10 == 0){
              $('#clickgal_content').prepend('</br>');
            }
            $('#clickgal_content').prepend('<a href="' + this.url + '">' + this.url + '</a></br>');
            $('#clickgal_content').prepend('<span id=clickgal_index_' + i + '>' + Ergebnis1 + ': </span></br>');
          }
        });
      }
    }
    if (/^(https:\/\/www\.moviepilot.de\/news\/)([^\/\#]*?)$/.test(window.location.href)) {
      UseURL = GetURL + '/seite-';
      $('.article--content-body').after('<p id=clickgal_cont_p></p>');
      $('.article--content-body').after('<hr></hr>');
      $('#clickgal_cont_p').append('<span id=clickgal_index><strong>Inhaltsverzeichnis:</strong></br>--------------------</span></br>');
      $('#clickgal_cont_p').append('<span id=clickgal_content></span>');
      $('#clickgal_cont_p').append('<span id=clickgal_content>--------------------</span></br>');
      $('#clickgal_cont_p').append('<hr></hr>');
      //    for (var i = 0; i < pageCount.length; i++) {
      for (var i = 0; i < pageCount - 1; i++) {
        $.ajax({
          url: UseURL + (pageCount - i),
          type: 'GET',
          dataType: 'html',
          async: false,
          success: function (data) {
            var html = $('<div>').html(data);
            var Ergebnis1 = html.find('h1.article--header--title').html();
            var Ergebnis2 = html.find('div.article--coverimage-caption').html();
            if((pageCount - i - 1) % 10 == 0){
              $('#clickgal_content').prepend('</br>');
            }
            $('#clickgal_content').prepend('<a href="' + this.url + '">' + this.url + '</a></br>');
            $('#clickgal_content').prepend('<span id=clickgal_index_' + i + '>' + Ergebnis1 + ': </span></br>');
          }
        });
      }
    }
    if (/^(https:\/\/www\.moviepilot.de\/news\/)([^"]*?)\/(seite-1)$/.test(window.location.href)) {
      EditURL = GetURL.slice(0, - 1);
      UseURL = EditURL;
      $('.article--content-body').after('<p id=clickgal_cont_p></p>');
      $('.article--content-body').after('<hr></hr>');
      $('#clickgal_cont_p').append('<span id=clickgal_index><strong>Inhaltsverzeichnis:</strong></br>--------------------</span></br>');
      $('#clickgal_cont_p').append('<span id=clickgal_content></span>');
      $('#clickgal_cont_p').append('<span id=clickgal_content>--------------------</span></br>');
      $('#clickgal_cont_p').append('<hr></hr>');
      //    for (var i = 0; i < pageCount.length; i++) {
      for (var i = 0; i < pageCount - 1; i++) {
        $.ajax({
          url: UseURL + (pageCount - i),
          type: 'GET',
          dataType: 'html',
          async: true,
          success: function (data) {
            var html = $('<div>').html(data);
            var Ergebnis1 = html.find('h1.article--header--title').html();
            var Ergebnis2 = html.find('div.article--coverimage-caption').html();
            if((pageCount - i - 1) % 10 == 0){
              $('#clickgal_content').prepend('</br>');
            }
            $('#clickgal_content').prepend('<a href="' + this.url + '">' + this.url + '</a></br>');
            $('#clickgal_content').prepend('<span id=clickgal_index_' + i + '>' + Ergebnis1 + ': </span></br>');
          }
        });
      }
    }
    if (/^(https:\/\/www\.moviepilot.de\/news\/)([^"]*?)\/(seite-([2-9]|2[0-6]))$/.test(window.location.href)) {
    }
    if (/^(https:\/\/www\.moviepilot.de\/news\/)([^"]*?)\#(comments)$/.test(window.location.href)) {
      EditURL = GetURL.slice(0, - 9);
      UseURL = EditURL + '/seite-';
      $('.article--content-body').after('<p id=clickgal_cont_p></p>');
      $('.article--content-body').after('<hr></hr>');
      $('#clickgal_cont_p').append('<span id=clickgal_index><strong>Inhaltsverzeichnis:</strong></br>--------------------</span></br>');
      $('#clickgal_cont_p').append('<span id=clickgal_content></span>');
      $('#clickgal_cont_p').append('<span id=clickgal_content>--------------------</span></br>');
      $('#clickgal_cont_p').append('<hr></hr>');
      //    for (var i = 0; i < pageCount.length; i++) {
      for (var i = 0; i < pageCount - 1; i++) {
        $.ajax({
          url: UseURL + (pageCount - i),
          type: 'GET',
          dataType: 'html',
          async: false,
          success: function (data) {
            var html = $('<div>').html(data);
            var Ergebnis1 = html.find('h1.article--header--title').html();
            var Ergebnis2 = html.find('div.article--coverimage-caption').html();
            if((pageCount - i - 1) % 10 == 0){
              $('#clickgal_content').prepend('</br>');
            }
            $('#clickgal_content').prepend('<a href="' + this.url + '">' + this.url + '</a></br>');
            $('#clickgal_content').prepend('<span id=clickgal_index_' + i + '>' + Ergebnis1 + ': </span></br>');
          }
        });
      }
    }
  }
