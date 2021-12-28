// ==UserScript==
// @name                MP-Lists-CSV-Exporter (native Javascript)
// @description         Listen als CSV für letterboxd exportieren
// @author              leinzi
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-lists-csv-exporter.user.js
// @include             /^https?:\/\/www\.moviepilot.de\/liste\/([^\/\#]*?)
// @version             0.0.1
// ==/UserScript==

const LIST_REGEXP = /^https?:\/\/www\.moviepilot.de\/liste\/([^\/\#]*?)/
// MP does not use human-readable class names.
const INFO_CONTAINER_SELECTOR = '.sc-3xa03o-0'

const LIST_ENTRY_SELECTOR = 'li[itemprop="itemListElement"]'
const LIST_ENTRY_TYPE_SELECTOR = '[itemprop="item"]'
const LIST_ENTRY_TITLE_SELECTOR = '.sc-19p2d3f-4'
const LIST_ENTRY_YEAR_SELECTOR = '[itemprop="copyrightYear"]'
const LIST_ENTRY_COMMENT_SELECTOR = '.sc-1yx9cu0-7'

if (document.readyState !== 'loading') {
  listExporter()
} else {
  document.addEventListener('DOMContentLoaded', listExporter)
}

function listExporter() {
  if (LIST_REGEXP.test(window.location.href)) {
    addExportLink()
  }
}

function collectListEntries() {
  let listEntries = document.querySelectorAll(LIST_ENTRY_SELECTOR)
  return Array.from(listEntries).map(entry => new ListEntry(entry))
}

function addExportLink() {
  let link = document.createElement('a')
  link.classList.add('sc-1vogpeu-0')
  link.classList.add('dxHqXO')
  link.textContent = 'Export as CSV'
  link.addEventListener('click', clickLink)

  let infoContainer = document.querySelector(INFO_CONTAINER_SELECTOR)
  let linkContainer = document.createElement("div")
  linkContainer.classList.add('sc-3xa03o-1')
  linkContainer.classList.add('iEMWUQ')
  linkContainer.appendChild(link)
  infoContainer.appendChild(linkContainer)
}

function clickLink() {
  let listEntries = collectListEntries()
  listEntries = listEntries.filter(entry => entry.type.includes('Movie'))

  let csvContent = "data:text/csv;charset=utf-8,"
  csvContent += "Title,Year,Review\n"
  csvContent += listEntries.map(e => e.toCSV()).join("\n")

  let encodedUri = encodeURI(csvContent)
  let link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", "my_data.csv")
  link.click()
}

// Utilities
function stringToHTML(string) {
  let dom = document.createElement('div')
  dom.innerHTML = string
  return dom
}

class ListEntry {
  constructor(listEntry) {
    let typeElement = listEntry.querySelector(LIST_ENTRY_TYPE_SELECTOR)
    let titleElement = listEntry.querySelector(LIST_ENTRY_TITLE_SELECTOR)
    let yearElement = listEntry.querySelector(LIST_ENTRY_YEAR_SELECTOR)
    let commentElement = listEntry.querySelector(LIST_ENTRY_COMMENT_SELECTOR)

    this.type = typeElement ? typeElement.getAttribute('itemtype') : ''
    this.title = titleElement ? titleElement.textContent : ''
    this.year = yearElement ? yearElement.textContent : ''
    this.comment = commentElement ? commentElement.textContent : ''
  }

  toCSV() {
    return [this.title, this.year, this.comment].map(value => JSON.stringify(value)).join(',')
  }
}
