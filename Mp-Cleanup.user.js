// ==UserScript==
// @name                MP-Cleanup (jQuery)
// @description         Moviepilot generell bereinigen
// @grant               none
// @downloadURL         https://raw.githubusercontent.com/Leinzi/mp-Skripte/master/Mp-Cleanup.user.js
// @require             https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// @include             /^(https?:)\/\/(.+\.)?(moviepilot.de)\/(.*)$/
// @exclude             /^(https?:)\/\/(.+\.)?(moviepilot.de)\/serie\/(.*)$/
// @version             1.0.6
// ==/UserScript==

// jQuery-Konflikte loesen
this.$ = this.jQuery = jQuery.noConflict(true);

// Funktion, damit das Dokument erst fertig geladen wird
$(document).ready(function(){

  // Variablendefinitionen
  // Hinweis: 'i' wird bewusst ausgelassen
  var communitybox = $(".banner--vdt");
  var separatorssidebar = $(".seperators");
  var subsocial = $(".navigation--sub--social");
  var themensidebar = $(".lists--timeline");
  var vormerkbox = $(".widget--followships");

  cleanUpHeader();
  cleanUpFooter();
  cleanUpSidebar();
  cleanUpMiddleBar();
  cleanUpMainPage();

  justifyTextContent();
});

function cleanUpMiddleBar(){
  var recentNews = $(".cards--grid");
  recentNews.remove();
  var newsKeywords = $(".keywords");
  //newsKeywords.remove();
  var adNews = $(".article--article-advertising");
  adNews.remove();
  var socialMediaBar = $(".article--social-header-bar--share");
  socialMediaBar.remove();
  var newsShopping = $(".js--consumptions--widget-poster");
  newsShopping.remove();
}

function cleanUpSidebar(){
  var sidebarWerbung = $('#ad-rectangle1-outer');
  sidebarWerbung.remove();
  var sidebarTrending = $(".lists--toplist");
  //sidebarTrending.remove();
  var sidebarWerbung2 = $(".advertisement--medium-rectangle");
  sidebarWerbung2.remove();
  var sidebarNews = $(".news-sidebar");
  sidebarNews.remove();
  var sidebarVideo = $(".showheroes--sidebar");
  sidebarVideo.remove();
  var sidebarShopping = $(".consumptions--widget-list--items");
  sidebarShopping.remove();
}

function cleanUpFooter(){
  var footerVideo = $(".video--player--footer");
  footerVideo.remove();
  var footerLinks = $(".footer_ng--secondary");
  footerLinks.remove();
  var footerElements = $('article--footer-elements');
  footerElements.remove();
}

function cleanUpHeader(){
  var headerBanner = $("#ads-outer");
  headerBanner.remove();
}

function cleanUpMainPage() {
  var topTrailer = $(".home--trailer-slider");
  topTrailer.remove();
  var topRecommendation = $("#home_personal_recommendations");
  topRecommendation.remove();
}

function justifyTextContent(){
  // News-Artikel
  $('.article--content-wrapper').css({'margin': '40px 0 0 0', 'text-align': 'justify'});
  // Filmdetailseiten
  $('.movie--summary').css({'text-align': 'justify'});
  // Kommentare
  $('.js--comments').css({'text-align': 'justify'});
}
