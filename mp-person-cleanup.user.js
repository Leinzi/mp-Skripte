// ==UserScript==
// @name                MP-People-Cleanup (jQuery)
// @description         Peronenseiten auf Moviepilot bereinigen
// @author              leinzi
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-person-cleanup.user.js
// @require             https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// @include             /^(https?:\/\/www\.moviepilot.de\/people\/)([^\/\#]*?)$/
// @version             0.1.2
// ==/UserScript==

// jQuery-Konflikte loesen
this.$ = this.jQuery = jQuery.noConflict(true);

//RegExps
var regPeople = /^(https?:\/\/www\.moviepilot.de\/people\/)([^\/\#]*?)$/

// Funktion, damit das Dokument erst fertig geladen wird
$(document).ready(function(){

  // Variablendefinitionen
  // var communitybox = $(".banner--vdt");
  // var separatorssidebar = $(".seperators");
  // var subsocial = $(".navigation--sub--social");
  // var themensidebar = $(".lists--timeline");
  // var vormerkbox = $(".widget--followships");

  var getURL = window.location.href.replace('.html', '');

  // cleanUpHeader();
  // cleanUpFooter();
  // cleanUpSidebar();
  // cleanUpMiddleBar();
  // cleanUpMainPage();

  // justifyTextContent();

  if (regPeople.test(getURL)){
    cleanUpPeoplePage();
  }
});

function cleanUpPeoplePage() {
  cleanUpEmptyParagraphs();
  // Übersicht
  // Blocksatz
  $('.person--description').css({'text-align': 'justify'});
  $('.comment--replies--list').css({'text-align': 'justify'});
  $('.comment--body').css({'text-align': 'justify'});

  //Rubriken verstecken
  jQuery('.js--content-editor--sidebar').remove();
  jQuery('#sidebar hr').remove();

  var sidebar = jQuery('#sidebar');

  var videoSection = document.createElement('section');
  videoSection.setAttribute('class', 'sidebar-video');
  sidebar.prepend(videoSection);
  var videoHeader = jQuery('h4:contains("Videos zu")');
  videoHeader.addClass('sidebar-video-header');
  appendSelectionTo(videoSection, videoHeader);

  var tvSection = document.createElement('section');
  tvSection.setAttribute('class', 'sidebar-tv');
  videoSection.after(tvSection);
  var tvHeader = jQuery('h4:contains("im Fernsehen")');
  tvHeader.addClass('sidebar-tv-header');
  appendSelectionTo(tvSection, tvHeader);

  var tvItems = jQuery('.consumption_item_tv');
  appendSelectionTo(tvSection, tvItems);

  var listSection = document.createElement('section');
  listSection.setAttribute('class', 'sidebar-lists');
  tvSection.after(listSection);
  var listDiv = jQuery('div.page-updater.lists');
  appendSelectionTo(listSection, listDiv);

  var collabSection = document.createElement('section');
  collabSection.setAttribute('class', 'sidebar-collab');
  var collabHeader = jQuery('h4:contains("arbeitet oft zusammen mit")');
  collabHeader.addClass('sidebar-collab-header');
  var collabList = collabHeader.next('ul');
  collabList.addClass('sidebar-collab-list');
  appendSelectionTo(collabSection, collabHeader);
  appendSelectionTo(collabSection, collabList);
  listSection.after(collabSection);

  var photoSection = document.createElement('section');
  photoSection.setAttribute('class', 'sidebar-photos');
  var photoHeader = jQuery('h4:contains("Bilder:")');
  photoHeader.addClass('sidebar-photo-header');
  var photoList = photoHeader.next('.movie-photos');
  photoList.addClass('sidebar-photo-list');
  var photoMore = photoList.next('.box-more');
  photoMore.addClass('sidebar-photo-more');
  appendSelectionTo(photoSection, photoHeader);
  appendSelectionTo(photoSection, photoList);
  appendSelectionTo(photoSection, photoMore);
  collabSection.after(photoSection);

  var fansSection = document.createElement('section');
  fansSection.setAttribute('class', 'sidebar-fans');
  var fansDiv = jQuery('#sidebar_followers');
  appendSelectionTo(fansSection, fansDiv);
  photoSection.after(fansSection);


  var mainContent = jQuery('.js--content-editor');

  var personSection = document.createElement('section');
  personSection.setAttribute('class', 'main-person');
  mainContent.prepend(personSection);
  var personDetailsDiv = jQuery('.person--details');
  var personDetailsMore = jQuery('.person--collapsible--more');
  appendSelectionTo(personSection, personDetailsDiv);
  appendSelectionTo(personSection, personDetailsMore);

  //Videos
  $('.trailer_play_button').hide();

videoDiv.after(document.createElement('hr'));



}

function appendSelectionTo(parent, selection){
  selection.each(function(){
    parent.append(this);
  });
}

function cleanUpEmptyParagraphs(){
  jQuery('p').each(function() {
      var $this = jQuery(this);
      if($this.html().replace(/\s|&nbsp;/g, '').length == 0)
          $this.remove();
  });
}

// function cleanUpMiddleBar(){
//   var recentNews = $(".article--footer-elements > .cards--grid");
//   recentNews.remove();
//   var newsKeywords = $(".keywords");
//   //newsKeywords.remove();
//   var adNews = $(".article--article-advertising");
//   adNews.remove();
//   var socialMediaBar = $(".article--social-header-bar--share");
//   socialMediaBar.remove();
//   var newsShopping = $(".js--consumptions--widget-poster");
//   newsShopping.remove();
// }
//
// function cleanUpSidebar(){
//   var sidebarWerbung = $('#ad-rectangle1-outer');
//   sidebarWerbung.remove();
//   var sidebarTrending = $(".lists--toplist");
//   //sidebarTrending.remove();
//   var sidebarWerbung2 = $(".advertisement--medium-rectangle");
//   sidebarWerbung2.remove();
//   var sidebarNews = $(".news-sidebar");
//   sidebarNews.remove();
//   var sidebarVideo = $(".showheroes--sidebar");
//   sidebarVideo.remove();
//   var sidebarShopping = $(".consumptions--widget-list--items");
//   sidebarShopping.remove();
// }
//
// function cleanUpFooter(){
//   var footerVideo = $(".video--player--footer");
//   footerVideo.remove();
//   var footerLinks = $(".footer_ng--secondary");
//   footerLinks.remove();
//   var footerElements = $('article--footer-elements');
//   footerElements.remove();
// }
//
// function cleanUpHeader(){
//   var headerBanner = $("#ads-outer");
//   headerBanner.remove();
// }
//
// function cleanUpMainPage() {
//   var topTrailer = $(".home--trailer-slider");
//   topTrailer.remove();
//   var topRecommendation = $("#home_personal_recommendations");
//   topRecommendation.remove();
// }
//
// function justifyTextContent(){
//   // News-Artikel
//   $('.article--content-wrapper').css({'margin': '40px 0 0 0', 'text-align': 'justify'});
//   // Filmdetailseiten
//   $('.movie--summary').css({'text-align': 'justify'});
//   // Kommentare
//   $('.js--comments').css({'text-align': 'justify'});
//   // Darstellerübersicht
//   $('.person--description').css({'text-align': 'justify'});
//
// }
