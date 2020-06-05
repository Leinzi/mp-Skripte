// ==UserScript==
// @name                MP-People-Ratings (jQuery)
// @description         Filmbewertungen auf Filmographien anzeigen
// @author              leinzi
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-people-ratings.user.js
// @require             https://code.jquery.com/jquery-3.5.1.min.js
// @include             /^(https?:\/\/www\.moviepilot.de\/people\/)([^\/\#]*?)\/filmography$/
// @version             0.0.1
// ==/UserScript==

// jQuery-Konflikte loesen
this.$ = this.jQuery = jQuery.noConflict(true);

//RegExps
var regPeople = /^(https?:\/\/www\.moviepilot.de\/people\/)([^\/\#]*?)\/filmography$/;

var sidebarSections = [];
var mainSections = [];

// Funktion, damit das Dokument erst fertig geladen wird
$(document).ready(function(){

  var getURL = window.location.href.replace('.html', '');

  // cleanUpHeader();
  // cleanUpFooter();
  // restructureSidebar();
  // cleanUpMiddleBar();
  // cleanUpMainPage();

  // justifyTextContent();

  if (regPeople.test(getURL)){
    alert('läuft');
    // cleanUpPeoplePage();
  }
});

function cleanUpPeoplePage() {
  $('#ads-outer').remove();
  $('.advertisement--medium-rectangle').remove();
  jQuery('hr').hide();

  removeEmptyParagraphs();
  // Übersicht
  // Blocksatz
  // $('.person--description').css({'text-align': 'justify'});
  // $('.comment--replies--list').css({'text-align': 'justify'});
  // $('.comment--body').css({'text-align': 'justify'});

  //Rubriken verstecken
  // jQuery('.js--content-editor--sidebar').remove();

  restructureSidebar();
  $('sidebar-list hr').remove();
  restructureMainContent();

  //Videos
  $('.trailer_play_button').hide();
  $('.sidebar_trailer_pure, .sidebar_trailer_pure_background').css({'margin': '0', 'width': 'auto'});

}

function appendSelectionTo(parent, selection){
  selection.each(function(){
    parent.append(this);
  });
}

function removeEmptyParagraphs(){
  jQuery('p').each(function() {
      var $this = jQuery(this);
      if($this.html().replace(/\s|&nbsp;/g, '').length == 0)
          $this.remove();
  });
}

function buildSectionDivider(){
  var hLine = document.createElement('hr');
  return hLine;
}

function restructureSidebar() {

  var sidebar = jQuery('#sidebar');

  var sidebarDiv = document.createElement('div');
  sidebarDiv.setAttribute('class', 'sidebar-sections');

  sidebar.prepend(sidebarDiv);

  var videoSection = buildVideoSection();
  sidebarDiv.append(videoSection);
  sidebarDiv.append(buildSectionDivider());

  var tvSection = buildTVSection();
  sidebarDiv.append(tvSection);
  sidebarDiv.append(buildSectionDivider());

  var listSection = buildListSection();
  sidebarDiv.append(listSection);
  sidebarDiv.append(buildSectionDivider());

  var collabSection = buildCollabSection();
  sidebarDiv.append(collabSection);
  sidebarDiv.append(buildSectionDivider());

  var photoSection = buildPhotoSection();
  sidebarDiv.append(photoSection);
  sidebarDiv.append(buildSectionDivider());

  var fansSection = buildFansSection();
  sidebarDiv.append(fansSection);
  sidebarDiv.append(buildSectionDivider());
}

function buildVideoSection(){
  var videoSection = document.createElement('section');
  videoSection.setAttribute('class', 'sidebar-video');

  var videoHeader = jQuery('h4:contains("Videos zu")');
  videoHeader.addClass('sidebar-video-header');

  appendSelectionTo(videoSection, videoHeader);

  return videoSection;
}

function buildTVSection(){
  var tvSection = document.createElement('section');
  tvSection.setAttribute('class', 'sidebar-tv');

  var tvHeader = jQuery('h4:contains("im Fernsehen")');
  tvHeader.addClass('sidebar-tv-header');

  var tvItems = jQuery('.consumption_item_tv');

  appendSelectionTo(tvSection, tvHeader);
  appendSelectionTo(tvSection, tvItems);

  return tvSection;
}

function buildListSection(){
  var listSection = document.createElement('section');
  listSection.setAttribute('class', 'sidebar-lists');

  var listDiv = jQuery('div.page-updater.lists');

  appendSelectionTo(listSection, listDiv);

  return listSection;
}

function buildCollabSection(){
  var collabSection = document.createElement('section');
  collabSection.setAttribute('class', 'sidebar-collab');

  var collabHeader = jQuery('h4:contains("arbeitet oft zusammen mit")');
  collabHeader.addClass('sidebar-collab-header');

  var collabList = collabHeader.next('ul');
  collabList.addClass('sidebar-collab-list');

  appendSelectionTo(collabSection, collabHeader);
  appendSelectionTo(collabSection, collabList);

  return collabSection;
}

function buildPhotoSection(){
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

  return photoSection;
}

function buildFansSection(){
  var fansSection = document.createElement('section');
  fansSection.setAttribute('class', 'sidebar-fans');

  var fansDiv = jQuery('#sidebar_followers');

  appendSelectionTo(fansSection, fansDiv);

  return fansSection;
}

function restructureMainContent() {
  var mainContent = jQuery('.js--content-editor');

  var mainContentDiv = document.createElement('div');
  mainContentDiv.setAttribute('class', 'main-sections');

  mainContent.prepend(mainContentDiv);

  var personSection = buildPersonDetailsSection();
  mainContentDiv.append(personSection);
  mainContentDiv.append(buildSectionDivider());

  var movieSection = buildMovieSection();
  mainContentDiv.append(movieSection);
  mainContentDiv.append(buildSectionDivider());

  var newsSection = buildNewsSection();
  mainContentDiv.append(newsSection);
  mainContentDiv.append(buildSectionDivider());

  var commentsSection = buildCommentsSection();
  mainContentDiv.append(commentsSection);

  moveAddToListButton();
}

function buildPersonDetailsSection() {
  var personSection = document.createElement('section');
  personSection.setAttribute('class', 'main-person');

  var personDetailsDiv = jQuery('.person--details');

  var personDetailsMore = jQuery('.person--collapsible--more');

  appendSelectionTo(personSection, personDetailsDiv);
  appendSelectionTo(personSection, personDetailsMore);

  return personSection;
}

function moveAddToListButton() {
  var fanButton = $('#become_fan');
  fanButton.css({'margin-bottom': '10px'});

  var addToListDiv = document.createElement('div');
  addToListDiv.setAttribute('id', 'add_to_lists');
  $(addToListDiv).css({'margin-left': '10px', 'margin-bottom': '20px'});

  var addToListButton = $('.add_to_list_button');
  addToListButton.removeClass('float_right');

  appendSelectionTo(addToListDiv, addToListButton);
  fanButton.after(addToListDiv);
}

function buildMovieSection() {
  var movieSection = document.createElement('section');
  movieSection.setAttribute('class', 'main-person-movies');

  var movieHeader = jQuery('.person--movies--title');
  var movieSubHeader = jQuery('.person--movies--subtitle');
  var moviePosters = jQuery('.movie-posters');
  var movieMore = moviePosters.next('.box-more');

  appendSelectionTo(movieSection, movieHeader);
  appendSelectionTo(movieSection, movieSubHeader);
  appendSelectionTo(movieSection, moviePosters);
  appendSelectionTo(movieSection, movieMore);

  return movieSection;
}

function buildNewsSection() {
  var newsSection = document.createElement('section');
  newsSection.setAttribute('class', 'main-person-news');

  var newsHeader = jQuery('.person--articles--title');
  var newsSubHeader = jQuery('.person--articles--subtitle');
  var newsEntries = jQuery('.news');
  var newsMore = newsEntries.next('.box-more');

  appendSelectionTo(newsSection, newsHeader);
  appendSelectionTo(newsSection, newsSubHeader);
  appendSelectionTo(newsSection, newsEntries);
  appendSelectionTo(newsSection, newsMore);

  return newsSection;
}

function buildCommentsSection() {
  var commentsSection = document.createElement('section');
  commentsSection.setAttribute('class', 'main-person-comments');

  var commentsHeader = jQuery('h2:contains("Kommentare zu")');
  var commentsDiv = jQuery('.comments.js--comments.is-initialized');

  appendSelectionTo(commentsSection, commentsHeader);
  appendSelectionTo(commentsSection, commentsDiv);

  return commentsSection;
}
