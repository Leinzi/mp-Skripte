// ==UserScript==
// @name          mp-avoid-clickgal
// @author        mitcharts, leinzi
// @description   Bilderstrecken auf Moviepilot umgehen
// @grant         none
// @downloadURL   https://raw.githubusercontent.com/Leinzi/mp-Skripte/master/mp-avoid-clickgal.user.js
// @include       /^(https?:\/\/www\.moviepilot.de\/news\/)(.*?)$/
// @version       1.11.0
// ==/UserScript==

const regWithoutSuffix        = /^(https?:\/\/www\.moviepilot.de\/news\/)([^\/\#]*?)$/;
const regFirstPageOne         = /^(https?:\/\/www\.moviepilot.de\/news\/)([^"]*?)\/(seite-1)$/;
const regLatterPages          = /^(https?:\/\/www\.moviepilot.de\/news\/)([^"]*?)\/(seite-([2-9]|2[0-6]))$/;

// gibt es nicht mehr?
const regWithCommentSuffix    = /^(https?:\/\/www\.moviepilot.de\/news\/)([^"]*?)\#(comments)$/;

// Funktion, damit das Dokument erst fertig geladen wird
if (document.readyState !== 'loading') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}

function init() {
  const isClicktrack = findNodes('.js--article--click-track, .js--pagination').length > 0;
  const getURL = window.location.href.replace('.html', '');

  if (isClicktrack) {
    const lastPageURL = findNodes('.js--pagination--last')[0].href;
    const pieces = lastPageURL.split('-');
    const pageCount = Number(pieces[pieces.length-1].split('.')[0]);

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
}

const findNodes = (query) => document.querySelectorAll(query);

function buildTableOfContents(defURL, pageCount) {
  const divider = '--------------------';

  const clickGalContent = document.createElement('div');
  clickGalContent.style.margin = '0 auto';
  clickGalContent.insertAdjacentHTML('beforeend', `<span><b>Inhaltsverzeichnis:</b></br>${divider}</span></br>`);
  const contentSpan = document.createElement('span');
  contentSpan.id = 'clickgal_content';
  clickGalContent.append(contentSpan);
  clickGalContent.insertAdjacentHTML('beforeend', `<span>${divider}</span></br>`);

  const clickGalDiv = document.createElement('div');
  clickGalDiv.style.display = 'flex';
  clickGalDiv.append(clickGalContent);

  const contentBody = document.querySelector('.article--content-body');
  contentBody.insertAdjacentHTML('afterend', '<hr>');
  contentBody.insertAdjacentElement('afterend', clickGalDiv);
  contentBody.insertAdjacentHTML('afterend', '<hr>');

  const pages = new Array(pageCount);
  for (let i = 2; i <= pageCount; i++) {
    pages[i-2] = makeAjaxCall(defURL + i).then(data => appendEntry(data, defURL + i), reason => {
        console.log("error in processing your request", reason);
    });
  }

  Promise.all(pages).then (values => {
    const container = document.getElementById('clickgal_content');
    values.forEach((value, index) => {
      container.append(value);
      if ((index + 1) % 10 === 0) {
        container.append(document.createElement('br'));
      }
    });
  });
}

function appendEntry(data, url) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'text/html');
  const header = doc.querySelector('h1.article--header--title')?.innerHTML;

  if(/Das könnte dich auch interessieren/.test(header)) {
    return '';
  } else {
    const elem = document.createElement('div');
    elem.insertAdjacentHTML('beforeend', `<span>${header}: </span></br>`);
    elem.insertAdjacentHTML('beforeend', `<a href="${url}">${url}</a></br>`);
    return elem;
  }
}

function makeAjaxCall(url) {
  return fetch(url).then(response => response.text());
}
