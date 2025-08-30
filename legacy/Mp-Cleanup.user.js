// ==UserScript==
// @name                MP-Cleanup
// @description         Moviepilot generell bereinigen
// @author              mitcharts, leinzi
// @grant               none
// @downloadURL         https://raw.githubusercontent.com/Leinzi/mp-Skripte/master/Mp-Cleanup.user.js
// @include             /^(https?:)\/\/(.+\.)?(moviepilot.de)\/(.*)$/
// @exclude             /^(https?:)\/\/(.+\.)?(moviepilot.de)\/serie\/(.*)$/
// @version             1.2.1
// ==/UserScript==

if (document.readyState !== 'loading') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}

function init() {
  cleanUpHeader();
  cleanUpFooter();
  cleanUpSidebar();
  cleanUpMiddleBar();
  cleanUpMainPage();
  justifyTextContent();
}

function cleanUpMiddleBar() {
  const recentNews = document.querySelector('.article--footer-elements > .cards--grid');
  if (recentNews) recentNews.remove();

  const newsKeywords = document.querySelector('.keywords');
  // if (newsKeywords) newsKeywords.remove();

  const adNews = document.querySelector('.article--article-advertising');
  if (adNews) adNews.remove();

  const socialMediaBar = document.querySelector('.article--social-header-bar--share');
  if (socialMediaBar) socialMediaBar.remove();

  const newsShopping = document.querySelector('.js--consumptions--widget-poster');
  if (newsShopping) newsShopping.remove();
}

function cleanUpSidebar() {
  const sidebarWerbung = document.querySelector('#ad-rectangle1-outer');
  if (sidebarWerbung) sidebarWerbung.remove();

  const sidebarTrending = document.querySelector('.lists--toplist');
  // if (sidebarTrending) sidebarTrending.remove();

  const sidebarWerbung2 = document.querySelector('.advertisement--medium-rectangle');
  if (sidebarWerbung2) sidebarWerbung2.remove();

  const sidebarNews = document.querySelector('.news-sidebar');
  if (sidebarNews) sidebarNews.remove();

  const sidebarVideo = document.querySelector('.showheroes--sidebar');
  if (sidebarVideo) sidebarVideo.remove();

  const sidebarShopping = document.querySelector('.consumptions--widget-list--items');
  if (sidebarShopping) sidebarShopping.remove();
}

function cleanUpFooter() {
  const footerVideo = document.querySelector('.video--player--footer');
  if (footerVideo) footerVideo.remove();

  const footerLinks = document.querySelector('.footer_ng--secondary');
  if (footerLinks) footerLinks.remove();

  const footerElements = document.querySelector('article--footer-elements');
  if (footerElements) footerElements.remove();
}

function cleanUpHeader() {
  const headerBanner = document.querySelector('#ads-outer');
  if (headerBanner) headerBanner.remove();
}

function cleanUpMainPage() {
  const topTrailer = document.querySelector('.home--trailer-slider');
  if (topTrailer) topTrailer.remove();

  const topRecommendation = document.querySelector('#home_personal_recommendations');
  if (topRecommendation) topRecommendation.remove();
}

function justifyTextContent() {
  document.querySelectorAll('.article--content-wrapper').forEach((el) => {
    el.style.margin = '40px 0 0 0';
    el.style.textAlign = 'justify';
  });

  document.querySelectorAll('.movie--summary').forEach((el) => {
    el.style.textAlign = 'justify';
  });

  document.querySelectorAll('.js--comments').forEach((el) => {
    el.style.textAlign = 'justify';
  });

  document.querySelectorAll('.person--description').forEach((el) => {
    el.style.textAlign = 'justify';
  });
}
