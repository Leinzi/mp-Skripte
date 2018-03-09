// ==UserScript==
// @name                MP-Cleanup (jQuery)
// @description	        Moviepilot generell bereinigen
// @grant               none
// @require							https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js 
// @include	        		/^(https?:)\/\/(.+\.)?(moviepilot.de)\/(.*)$/
// @exclude							/^(https?:)\/\/(.+\.)?(moviepilot.de)\/serie\/(.*)$/
// ==/UserScript==

// jQuery-Konflikte loesen
this.$ = this.jQuery = jQuery.noConflict(true);

// Funktion, damit das Dokument erst fertig geladen wird
$(document).ready(function(){

// Variablendefinitionen
// Hinweis: 'i' wird bewusst ausgelassen
var articleadvertisement1 = $(".article--article-advertising");
var articleadvertisement2 = $(".js--consumptions--widget-poster");
var articleauthorsidebar = $(".user--authorbox");
var articlesocialbar = $(".article--social-header-bar");
var articlesocialbarshare = $ (".article--social-header-bar--share");
var boxmoresidebar = $(".box-more");
var commentsarticle = $(".h3");
var communitybox = $(".banner--vdt");
var keywords = $(".keywords");
var footer = $(".footer_ng--secondary");
var footervideo = $(".video--player--footer");
var newssidebar = $(".news-sidebar");
var separatorssidebar = $(".seperators");
var subsocial = $(".navigation--sub--social");
var themenlongnews = $(".cards--grid");
var themensidebar = $(".lists--timeline");
var toplistsidebar = $(".lists--toplist");
var toptrailer = $(".home--trailer-slider");
var trendingbox = $(".lists--toplist");
var vormerkbox = $(".widget--followships");
var vorschlaege = $("#home_personal_recommendations");
var werbungsidebar = $(".advertisement--medium-rectangle");
var video = $(".showheroes--sidebar");
  
var adsOuter			= $("#ads-outer");
console.log(adsOuter);
adsOuter.remove();

//improveStyle();  
  
// Funktionen etc.
if ( /^http:\/\/www.moviepilot.de\/(.*)\s*$/im.test(window.location.href) ){
footer.remove();
footervideo.remove();
}

if ( /^(http:)\/\/(.+\.)?(moviepilot.de)\/myprofile/.test(window.location.href) || /^(http:)\/\/(.+\.)?(moviepilot.de)\/users\/(.*$)/.test(window.location.href) ){

}
  
else if ( /^(http:)\/\/(.+\.)?(moviepilot.de)/.test(window.location.href) ){
boxmoresidebar.remove();
//communitybox.remove();
newssidebar.remove();
subsocial.remove();
//toplistsidebar.remove();
toptrailer.remove();
//trendingbox.remove();
vormerkbox.remove();
vorschlaege.remove();
werbungsidebar.remove();
}
  
if ( /^(http:)\/\/(.+\.)?(moviepilot.de)\/news\/(.*$)/.test(window.location.href) ){
articleadvertisement1.remove();
articleadvertisement2.remove();
//articleauthorsidebar.remove();
//articlesocialbar[0].remove();
articlesocialbarshare.remove();
commentsarticle.remove();
keywords.remove();
separatorssidebar.remove();
themenlongnews.remove();
themensidebar.remove();
video.remove();
}
  
if ( /^(http:)\/\/(.+\.)?(moviepilot.de)\/movies\/(.*$)/.test(window.location.href) ){

}
  
if ( /^(http:)\/\/(.+\.)?(moviepilot.de)\/serie\/(.*$)/.test(window.location.href) ){

}
   
if ( /^(http:)\/\/(.+\.)?(moviepilot.de)\/suche(.*$)/.test(window.location.href) ){
 
}
  
// Funktionen etc.
if ( /^https:\/\/www.moviepilot.de\/(.*)\s*$/im.test(window.location.href) ){
footer.remove();
footervideo.remove();
}

if ( /^(https:)\/\/(.+\.)?(moviepilot.de)\/myprofile/.test(window.location.href) || /^(https:)\/\/(.+\.)?(moviepilot.de)\/users\/(.*$)/.test(window.location.href) ){

}
  
else if ( /^(https:)\/\/(.+\.)?(moviepilot.de)/.test(window.location.href) ){
boxmoresidebar.remove();
//communitybox.remove();
newssidebar.remove();
subsocial.remove();
//toplistsidebar.remove();
toptrailer.remove();
//trendingbox.remove();
vormerkbox.remove();
vorschlaege.remove();
werbungsidebar.remove();
}
  
if ( /^(https:)\/\/(.+\.)?(moviepilot.de)\/news\/(.*$)/.test(window.location.href) ){
articleadvertisement1.remove();
articleadvertisement2.remove();
//articleauthorsidebar.remove();
//articlesocialbar[0].remove();
articlesocialbarshare.remove();
commentsarticle.remove();
keywords.remove();
separatorssidebar.remove();
themenlongnews.remove();
themensidebar.remove();
video.remove();
}
  
if ( /^(https:)\/\/(.+\.)?(moviepilot.de)\/movies\/(.*$)/.test(window.location.href) ){

}
  
if ( /^(https:)\/\/(.+\.)?(moviepilot.de)\/serie\/(.*$)/.test(window.location.href) ){

}
   
if ( /^(https:)\/\/(.+\.)?(moviepilot.de)\/suche(.*$)/.test(window.location.href) ){
 
}

});

function improveStyle() {
  $('#page').css({'width': '100%', 'max-width': '80%'});
  $('#sidebar').css({'width': '30%'});
  $('#main').css({'width': '65%'});
  $('.layout--wrapped-content').css({'width': '100%'});
  
  $('._3CAHP').css({'max-width': '80%'});
  
}
