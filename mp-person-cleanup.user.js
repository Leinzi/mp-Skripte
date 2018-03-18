// ==UserScript==
// @name                MP-People-Cleanup (jQuery)
// @description         Peronenseiten auf Moviepilot bereinigen
// @author              leinzi
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-person-cleanup.user.js
// @require             https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// @include             /^(https?:\/\/www\.moviepilot.de\/people\/)([^\/\#]*?)$/
// @version             0.1.8
// ==/UserScript==

// jQuery-Konflikte loesen
this.$ = this.jQuery = jQuery.noConflict(true);

//RegExps
var regPeople = /^(https?:\/\/www\.moviepilot.de\/people\/)([^\/\#]*?)$/

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
    cleanUpPeoplePage();
  }
});

function cleanUpPeoplePage() {
  $('#ads-outer').remove();
  $('.advertisement--medium-rectangle').remove();

  removeEmptyParagraphs();
  // Übersicht
  // Blocksatz
  // $('.person--description').css({'text-align': 'justify'});
  // $('.comment--replies--list').css({'text-align': 'justify'});
  // $('.comment--body').css({'text-align': 'justify'});

  //Rubriken verstecken
  // jQuery('.js--content-editor--sidebar').remove();

  restructureSidebar();

  var mainContent = jQuery('.js--content-editor');

  var personSection = document.createElement('section');
  personSection.setAttribute('class', 'main-person');
  mainContent.prepend(personSection);
  var personDetailsDiv = jQuery('.person--details');
  var personDetailsMore = jQuery('.person--collapsible--more');
  appendSelectionTo(personSection, personDetailsDiv);
  appendSelectionTo(personSection, personDetailsMore);

  var fanButton = $('#become_fan');
  fanButton.css({'margin-bottom': '10px'});
  var addToListDiv = document.createElement('div');
  addToListDiv.setAttribute('id', 'add_to_lists');
  addToListDiv.css({'margin-left': '10px', 'margin-bottom': '20px'});

  var addToListButton = $('.add_to_list_button');
  appendSelectionTo(addToListDiv, addToListButton);
  fanButton.after(addToListDiv);

  //Videos
  $('.trailer_play_button').hide();
  $('.sidebar_trailer_pure, .sidebar_trailer_pure_background').css({'margin': '0', 'width': 'auto'});

videoDiv.after(document.createElement('hr'));

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
  jQuery('#sidebar hr').remove();

  var sidebar = jQuery('#sidebar');

  var sidebarDiv = document.createElement('div');
  sidebarDiv.setAttribute('class', 'sidebar-sections');

  sidebar.prepend(sidebarDiv);

  var videoSection = buildVideoSectionForSidebar();
  sidebarDiv.append(videoSection);
  sidebarDiv.append(buildSectionDivider());

  var tvSection = buildTVSectionForSidebar();
  sidebarDiv.append(tvSection);
  sidebarDiv.append(buildSectionDivider());

  var listSection = buildListSectionForSidebar();
  sidebarDiv.append(listSection);
  sidebarDiv.append(buildSectionDivider());

  var collabSection = buildCollabSectionForSidebar();
  sidebarDiv.append(collabSection);
  sidebarDiv.append(buildSectionDivider());

  var photoSection = buildPhotoSectionForSidebar();
  sidebarDiv.append(photoSection);
  sidebarDiv.append(buildSectionDivider());

  var fansSection = buildFansSectionForSidebar();
  sidebarDiv.append(fansSection);
  sidebarDiv.append(buildSectionDivider());
}

function buildVideoSectionForSidebar(){
  var videoSection = document.createElement('section');
  videoSection.setAttribute('class', 'sidebar-video');

  var videoHeader = jQuery('h4:contains("Videos zu")');
  videoHeader.addClass('sidebar-video-header');

  appendSelectionTo(videoSection, videoHeader);

  return videoSection;
}

function buildTVSectionForSidebar(){
  var tvSection = document.createElement('section');
  tvSection.setAttribute('class', 'sidebar-tv');

  var tvHeader = jQuery('h4:contains("im Fernsehen")');
  tvHeader.addClass('sidebar-tv-header');

  var tvItems = jQuery('.consumption_item_tv');

  appendSelectionTo(tvSection, tvHeader);
  appendSelectionTo(tvSection, tvItems);

  return tvSection;
}

function buildListSectionForSidebar(){
  var listSection = document.createElement('section');
  listSection.setAttribute('class', 'sidebar-lists');

  var listDiv = jQuery('div.page-updater.lists');

  appendSelectionTo(listSection, listDiv);

  return listSection;
}

function buildCollabSectionForSidebar(){
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

function buildPhotoSectionForSidebar(){
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

function buildFansSectionForSidebar(){
  var fansSection = document.createElement('section');
  fansSection.setAttribute('class', 'sidebar-fans');

  var fansDiv = jQuery('#sidebar_followers');

  appendSelectionTo(fansSection, fansDiv);

  return fansSection;
}
