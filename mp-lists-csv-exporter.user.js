// ==UserScript==
// @name                MP-Lists-CSV-Exporter (native Javascript)
// @description         Listen als CSV für letterboxd exportieren
// @author              leinzi
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-lists-csv-exporter.user.js
// @include             /^https?:\/\/www\.moviepilot.de\/liste\/([^\/\#]*?)
// @version             0.0.2
// ==/UserScript==

const LIST_REGEXP = /^https?:\/\/www\.moviepilot.de\/liste\/([^\/\#]+)/
// MP does not use human-readable class names.
const INFO_CONTAINER_SELECTOR = '.sc-1emzowo-2.fTqPpj'

const LIST_ENTRY_SELECTOR = 'li.sc-1vkm4r8-0, li.sc-1ioy8ev-0'
const LIST_ENTRY_TYPE_SELECTOR = '[itemprop="item"]'
const LIST_ENTRY_TITLE_SELECTOR = '.sc-19p2d3f-4'
const LIST_ENTRY_YEAR_SELECTOR = '[itemprop="copyrightYear"]'
const LIST_ENTRY_COMMENT_SELECTOR = '.sc-1yx9cu0-7'

let filename = 'my_data'

if (document.readyState !== 'loading') {
  listExporter()
} else {
  document.addEventListener('DOMContentLoaded', listExporter)
}

function listExporter() {
  let match = LIST_REGEXP.exec(window.location.href)
  if (match) {
    filename = match[1]
    addExportLink()
  }
}

function collectListEntries() {
  let listEntries = document.querySelectorAll(LIST_ENTRY_SELECTOR)
  return Array.from(listEntries).map(entry => new ListEntry(entry))
}

function addExportLink() {
  let link = document.createElement('div')
  link.classList.add('sc-1emzowo-1')
  link.classList.add('eBvZom')
  link.textContent = 'Export as CSV'
  link.addEventListener('click', clickLink)

  let infoContainer = document.querySelector(INFO_CONTAINER_SELECTOR)
  infoContainer.appendChild(link)
}

function clickLink() {
  let listEntries = collectListEntries()
  listEntries = listEntries.filter(entry => entry.type.includes('Movie'))

  const csvOutput = "Title,Year,Review\n" + listEntries.map(e => e.toCSV()).join("\n")
  const csvBlob = new Blob([csvOutput], { type: 'text/csv' })
  const blobURL = URL.createObjectURL(csvBlob)

  let link = document.createElement("a")
  link.href = blobURL
  link.download = `${filename}.csv`
  link.click()

  setTimeout(() => {
    URL.revokeObjectORL(blobURL)
  }, 500)
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
