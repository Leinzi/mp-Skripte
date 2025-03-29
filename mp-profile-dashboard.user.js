// ==UserScript==
// @name                MP-Profil-Dashboard (experimentell)
// @description         Das Skript entfernt das offizielle Dashboard und ersetzt es durch ein neues, das dem früheren Dashboard ähnlicher ist.
// @author              leinzi
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-profile-dashboard.user.js
// @updateURL           https://github.com/Leinzi/mp-Skripte/raw/master/mp-profile-dashboard.user.js
// @match               https://www.moviepilot.de/users/*/dashboard
// @version             0.1.0
// ==/UserScript==

const PER_PAGE = 20
const MAX_PAGES = 20

let currentPage = 1
let renderedActivities = []
let myFeed = true
let signedIn = false

if (document.readyState !== 'loading') {
  activityFeedExtension()
} else {
  document.addEventListener('DOMContentLoaded', activityFeedExtension)
}

function activityFeedExtension() {
  let sessionURL = 'https://www.moviepilot.de/api/session'
  makeAjaxRequest(sessionURL)
    .then(handleSessionRequest)
    .then(fetchAndBuildActivityFeed)
    .then(addStylesheetToHead)
}

function handleSessionRequest(sessionRequest) {
  return new Promise(function (resolve, reject) {
    if (sessionRequest.status == 200) {
      let data = JSON.parse(sessionRequest.response)
      if (data.type === 'RegisteredUser') {
        signedIn = true
      } else {
        signedIn = false
      }
      resolve(signedIn)
    } else {
      reject(new Error('There was an error in processing your request'))
    }
  })
}

function addButton(commentStreamSection) {
  let buttonDiv = createElementFromHTML('<div class="activities--button-more-wrapper"></div>')
  let button = createElementFromHTML('<button activities--button-more role="button" type="button">Weitere Kommentare laden</button>')
  button.addEventListener('click', onClick)
  buttonDiv.append(button)

  Promise.resolve(commentStreamSection.append(buttonDiv))
}

function onClick(event) {
  let button = event.currentTarget
  currentPage = currentPage + 1

  fetchAndBuildActivityFeed()
  button.parentElement.remove()
}

function fetchAndBuildActivityFeed() {
  const stream = ((signedIn && myFeed) ? 'activity_feed' : 'community_feed')
  const activityFeedURL = `https://www.moviepilot.de/api/users/${stream}?per_page=${PER_PAGE}&page=${currentPage}`
  makeAjaxRequest(activityFeedURL)
    .then(handleActivityFeedRequest)
    .then(addActivitesToStream)
    .catch(handleErrors)
}

function handleActivityFeedRequest(request) {
  return new Promise(function (resolve, reject) {
    if (request.status == 200) {
      const data = JSON.parse(request.response)
      if (data.hasOwnProperty('results')) {
        resolve(data.results)
      } else {
        reject(new Error('No comments found.'))
      }
    } else {
      reject(new Error('There was an error in processing your request'))
    }
  })
}

function addActivitesToStream(activities) {
  let commentStreamSection = document.querySelector('.activityfeed')

  if (!commentStreamSection) {
    const dashboardSection = getElementByText(document, '.sc-ewnqHT', 'Dashboard')
    const parentSection = dashboardSection.parentElement
    commentStreamSection = createElementFromHTML(activityStreamSectionHTML())

    let switchDiv = createElementFromHTML('<div class="activityfeed--buttons"></div>')
    let myFeedButton = createElementFromHTML('<div role="button" tabindex="0" class="activityfeed--button">Mein Feed</div>')
    let communityFeedButton = createElementFromHTML('<div role="button" tabindex="0" class="activityfeed--button">Community Feed</div>')

    communityFeedButton.classList.toggle('-active', !myFeed)
    myFeedButton.classList.toggle('-active', myFeed)

    myFeedButton.addEventListener('click', (event) => {
      if (!myFeed) {
        myFeed = true
        currentPage = 1
        renderedActivities = []
        communityFeedButton.classList.toggle('-active', !myFeed)
        myFeedButton.classList.toggle('-active', myFeed)

        let activitiesContainerWrapper = document.querySelector('.activityfeed--activities')
        if (activitiesContainerWrapper) {
          activitiesContainerWrapper.innerHTML = ''
        }
        fetchAndBuildActivityFeed()
      }
    })
    communityFeedButton.addEventListener('click', (event) => {
      if (myFeed) {
        myFeed = false
        currentPage = 1
        renderedActivities = []
        communityFeedButton.classList.toggle('-active', !myFeed)
        myFeedButton.classList.toggle('-active', myFeed)

        let activitiesContainerWrapper = document.querySelector('.activityfeed--activities')
        if (activitiesContainerWrapper) {
          activitiesContainerWrapper.innerHTML = ''
        }
        fetchAndBuildActivityFeed()
      }
    })

    commentStreamSection.append(switchDiv)
    if (signedIn) {
      switchDiv.append(myFeedButton)
    }
    switchDiv.append(communityFeedButton)

    //dashboardSection.remove()
    parentSection.replaceChildren(commentStreamSection)
  }

  let activitiesContainerWrapper = commentStreamSection.querySelector('.activityfeed--activities')
  if (!activitiesContainerWrapper) {
    activitiesContainerWrapper = createElementFromHTML('<div class="activityfeed--activities"></div>')
    commentStreamSection.append(activitiesContainerWrapper)
  }

  let activitiesContainer = activitiesContainerWrapper.querySelector('.activities')
  if (!activitiesContainer) {
    activitiesContainer = createElementFromHTML(activitiesContainerHTML())
    activitiesContainerWrapper.append(activitiesContainer)
  }

  for (let activity of activities) {
    const name = activity.user_username
    const timestamp = activity.created_at_timestamp

    if (!renderedActivities.some((element) => element.name == name && element.timestamp == timestamp)) {
      let activityContainer = activityContainerElement(activity)
      activityContainer.classList.add('-hidden')
      activitiesContainer.append(activityContainer)

      let bodyWrappers = activityContainer.querySelectorAll('.activity--body-wrapper')
      for (let bodyWrapper of bodyWrappers) {
        let actionsElement = createElementFromHTML('<div class="activity--body-actions"></div>')

        if (bodyWrapper.offsetHeight > 250) {
          bodyWrapper.classList.add('-truncated')
          let readMoreElement = createElementFromHTML('<i class="activity--body-read-more">Weiterlesen</i>')
          actionsElement.append(readMoreElement)
          let shadowElement = createElementFromHTML('<div class="activity--body-shadow"></div>')
          bodyWrapper.append(shadowElement)

          readMoreElement.addEventListener('click', (event) => {
            bodyWrapper.classList.remove('-truncated')
            shadowElement.remove()
            readMoreElement.remove()
          })
        }
        let text = 'Zum Kommentar'
        if (activity.feed_type == 'article') {
          text = 'Zum Artikel'
        }
        let goToElement = createElementFromHTML(`<a class="activity--body-link" href="${activity.path}">${text}</a>`)
        actionsElement.append(goToElement)
        bodyWrapper.after(actionsElement)
      }
      activityContainer.classList.remove('-hidden')
      renderedActivities.push({ name, timestamp })
    }
  }
  if (currentPage < MAX_PAGES) {
    addButton(activitiesContainerWrapper)
  }
}

function addStylesheetToHead() {
  let style = document.createElement('style')
  style.type = 'text/css'
  style.append(document.createTextNode(stylesheetCSS()))

  return Promise.resolve(document.getElementsByTagName('head')[0].append(style))
}

// Elements
function activityContainerElement(activity) {
  const type = activity.feed_type
  let rating = activity.rating

  let html = `
    <div class="activities--activity -${type}">
      <div class="activity--box">
        <div class="activity--wrapper">
          <div class="activity -${type}">
            <div class="activity--header">
              <div class="activity--author">
                ${authorHTML(activity)}
              </div>
              ${activityMetaHTML(activity)}
              ${ratingHTML(rating)}
            </div>
            ${activityBodyHTML(activity)}
          </div>
        </div>
        <div class="activity--poster">
          ${posterHTML(activity)}
        </div>
      </div>
    </div>
  `

  return createElementFromHTML(html)
}

function activityMetaHTML(activity) {
  const type = activity.feed_type

  if (type == 'followship') {
    if (activity.item_type == 'Person') {
      return `
      <span class="activity--meta">
        ist jetzt Fan von
        <a href="${activity.url}" movie-title>${activity.title}</a>
      </span>
    `
    } else {
      return `
      <span class="activity--meta">
        merkte sich
        <a href="${activity.url}" movie-title>${activity.title}</a>
        ${parseMetaShort(activity)}
        vor
      </span>
    `
    }
  } else if (type == 'rating') {
    return `
      <span class="activity--meta">
        bewertete
        <a href="${activity.url}" movie-title>${activity.title}</a>
        ${parseMetaShort(activity)}
      </span>
    `
  } else if (type == 'comment') {
    return `
      <span class="activity--meta">
        kommentierte
        <a href="${activity.url}" movie-title>${activity.title}</a>
      </span>
    `
  } else if (type == 'friend') {
    return `
      <span class="activity--meta">
        ist jetzt mit
        <a href="${activity.friend_url}" movie-title>${activity.friend_username}</a>
        befreundet
      </span>
    `
  } else if (type == 'article') {
    return `
      <span class="activity--meta">
        veröffentlichte
        <a href="${activity.url}" movie-title>${activity.title}</a>
      </span>
    `
  } else if (type == 'muting') {
    return `
      <span class="activity--meta">
        ignoriert jetzt
        <a href="${activity.url}" movie-title>${activity.title}</a>
        ${parseMetaShort(activity)}
      </span>
    `
  } else if (type == 'watching') {
    return `
      <span class="activity--meta">
        schaut jetzt
        <a href="${activity.url}" movie-title>${activity.title}</a>
        ${parseMetaShort(activity)}
      </span>
    `
  }
}

// Templates
function activityStreamSectionHTML() {
  return `
    <div class="activityfeed">
      <div class="activityfeed--head">
        <div>
          ${sectionHeaderHTML('Mein', 'Dashboard')}
        </div>
      </div>
    </div>
  `
}

function sectionHeaderHTML(highlightedText, otherText) {
  return `
    <div class="section-header">
      <h2 class="section-header--title">
        <span class="section-header--highlighted">${highlightedText}</span>
        ${otherText}
      </h2>
    </div>
  `
}

function activitiesContainerHTML() {
  return '<div class="activities"></div>'
}

function posterHTML(activity) {
  if (activity.feed_type == 'friend') {
    return `
      <a href="${activity.user_url}" class="poster author--avatar">
        ${avatarHTML(activity.friend_avatar)}
      </a>
    `
  } else if (activity.poster) {
    return `
      <a href="${activity.url}" class="poster">
        <img class="poster--image" alt="${activity.title}" src="${activity.poster}" width="110" height="154">
      </a>
    `
  } else {
    return `
      <a href="${activity.url}">
        <div class="poster--image -placeholder">
          <div class="poster--image-placeholder-wrapper">
            <svg class="poster--image-placeholder" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.8 59.2c-.6-2.6-.9-5.3-.9-8.1C13.9 31.7 29.6 16 49 16s35 15.7 35 35.1-15.7 35.1-35 35.1c-15.5 0-28.6-10-33.3-23.9-.5.3-1.1.5-1.7.8-10.1 4.6-9.1 7.1-1.2 12.1 2 1.2 9.7 5 11.3 6.3 2.8 2.3 2 7.1-2.4 14.5H15c7.4-6.2 10.4-10.2 9.1-11.9-2.4-3-11.8-5.6-15.5-8.7-3.1-2.6-2.8-3.7-2.7-6.3.1-2.1 3.1-5.4 8.9-9.9zm14.8-9.6c5.2 0 9.4-4.2 9.4-9.4s-4.2-9.4-9.4-9.4-9.4 4.2-9.4 9.4 4.2 9.4 9.4 9.4zM50 54.7c2.6 0 4.7-2.1 4.7-4.7s-2.1-4.7-4.7-4.7-4.7 2.1-4.7 4.7 2.1 4.7 4.7 4.7zM52.6 38c5.2 0 9.4-4.2 9.4-9.4s-4.2-9.4-9.4-9.4-9.4 4.2-9.4 9.4 4.2 9.4 9.4 9.4zm18.9 18.9c5.2 0 9.4-4.2 9.4-9.4S76.7 38 71.5 38 62 42.3 62 47.5s4.3 9.4 9.5 9.4zm-13.6 23c5.2 0 9.4-4.2 9.4-9.4s-4.2-9.4-9.4-9.4-9.4 4.2-9.4 9.4 4.1 9.4 9.4 9.4zm-24.1-5.2c5.2 0 9.4-4.2 9.4-9.4s-4.2-9.4-9.4-9.4-9.4 4.2-9.4 9.4 4.2 9.4 9.4 9.4z" style="fill:#c2c2c2;"></path>
            </svg>
          </div>
        </div>
      </a>
    `
  }
}

function activityBodyHTML(activity) {
  if (activity.feed_type == 'comment') {
    return `
      <div class="activity--body-container">
        <div class="activity--body-wrapper">
          <div class="activity--body">
            <div>${activity.body}</div>
          </div>
        </div>
      </div>
    `
  } else if (activity.feed_type == 'article') {
    return `
      <div class="activity--body-container">
        <div class="activity--body-wrapper">
          <div class="activity--body">
            <div>${activity.teaser}</div>
          </div>
        </div>
      </div>
    `
  } else {
    return ''
  }
}

function authorHTML(activity) {
  const username = activity.user_username
  const profilePath = `/users/${activity.user_permalink}`
  let timestampHTML

  if (activity.feed_type == 'comment') {
    timestampHTML = `
      <a class="author--timestamp" href="${activity.path}">
        <time title="${formattedTimestamp(activity.created_at_timestamp)}">${formattedTimestampSince(activity.created_at_timestamp)}</time>
      </a>
    `
  } else {
    timestampHTML = `
      <span class="author--timestamp">
        <time title="${formattedTimestamp(activity.created_at_timestamp)}">${formattedTimestampSince(activity.created_at_timestamp)}</time>
      </span>
    `
  }

  return `
    <div class="author">
      <a class="author--avatar" href="${profilePath}" title="Zum Profil von ${username}">
        ${avatarHTML(activity.user_avatar)}
      </a>
      <a class="author--name" href="${profilePath}" title="Zum Profil von ${username}">
        ${username}
      </a>
      ${timestampHTML}
    </div>
  `
}

function ratingHTML(rating) {
  if (rating) {
    return `
      <div class="rating">
        <i class="rating--verbalization">${rating.verbalization}</i>
        ${ratingCircleHTML(rating)}
      </div>
    `
  } else {
    return ''
  }
}

function ratingCircleHTML(rating) {
  if (rating.hasOwnProperty('value')) {
    if (rating.top) {
      return `
        <div class="rating--circle">
          ${ratingBorderHTML(rating.value)}
          <div class="rating--circle-inner">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="22.5" height="22.5">
              <g>
                <path fill="#f4645a" d="M50 85.9A379.3 379.3 0 0 1 17.3 56C11 49 8 39.7 9.3 31.7c1-6.2 4.9-11.6 10.5-14.6 3.2-1.9 6.7-2.9 10.4-2.9 9.8 0 16.6 7.8 16.7 7.9l3.1 3.5 3.1-3.6c.1-.1 7-7.9 16.7-7.9 3.7 0 7.2 1 10.4 2.9 5.6 3 9.5 8.4 10.5 14.6a30.4 30.4 0 0 1-8 24.4A379.3 379.3 0 0 1 50 85.9z"></path>
              </g>
            </svg>
          </div>
        </div>
      `
    } else if (rating.flop) {
      return `
        <div class="rating--circle">
          ${ratingBorderHTML(rating.value)}
          <div class="rating--circle-inner">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="22.5" height="22.5">
              <path fill="#f4645a" d="M50.3 11h-.5A39.8 39.8 0 0 0 11 51.3v17.6c0 4.7 7.8 4 11.3 4h10l-.1 8.9c0 3.1 2 7.2 11.6 7.2h12.5c9.6 0 11.6-4.1 11.6-7.2l-.1-8.9h10c3.5 0 11.3.6 11.3-4V51.3A40 40 0 0 0 50.3 11zM35.4 61.7c-6.5 0-11.7-5.2-11.7-11.7s5.2-11.7 11.7-11.7c6.5 0 11.7 5.2 11.7 11.7 0 6.5-5.2 11.7-11.7 11.7zm30.2 0c-6.5 0-11.7-5.2-11.7-11.7 0-6.5 5.2-11.7 11.7-11.7 6.5 0 11.7 5.2 11.7 11.7 0 6.5-5.2 11.7-11.7 11.7z"></path>
            </svg>
          </div>
        </div>
      `
    } else {
      return `
        <div class="rating--circle">
          ${ratingBorderHTML(rating.value)}
          <div class="rating--circle-inner">
            <div class="rating--circle-value">
              ${numberRatingHTML(rating.value)}
            </div>
          </div>
        </div>
      `
    }
  } else if (rating.verbalization == "Vorgemerkt") {
    return `
      <div class="rating--circle">
        ${ratingBorderHTML(0)}
        <div class="rating--circle-inner">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="29.25" height="29.25">
            <path fill="#f4645a" d="M79.8 42.9a4 4 0 0 0-3.8-2.7H59L53.8 24a4 4 0 0 0-7.5 0L41 40.2H24a4 4 0 0 0-2.3 7.2l13.8 10-5.4 16.1a3.9 3.9 0 0 0 .6 3.5 4 4 0 0 0 3.2 1.6 3.9 3.9 0 0 0 2.3-.8L50 68l13.8 10a3.9 3.9 0 0 0 2.3.8 4 4 0 0 0 3.2-1.6 3.9 3.9 0 0 0 .6-3.5l-5.3-16.3 13.8-10a4 4 0 0 0 1.4-4.5z"></path>
          </svg>
        </div>
      </div>
    `
  } else {
    return ''
  }
}

function numberRatingHTML(value) {
  if (value % 10 == 5) {
    value = Math.floor(value / 10)
    return `<span>${value}</span><span class="rating--circle-tiny-value">.5</span>`
  } else {
    return `<span>${value / 10}</span>`
  }
}

function ratingBorderHTML(value) {
  return `
    <svg class="rating--border" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 100 100">
      <circle fill="#fff" cx="50%" cy="50%" r="50"></circle>
      <circle stroke="#dcdcdc" fill="transparent" cx="50%" cy="50%" r="50" stroke-width="14"></circle>
      <circle class="rating--colored-border" fill="transparent" cx="50%" cy="50%" r="50" stroke-dasharray="314.2" stroke-dashoffset="${(100 - value) * Math.PI}" stroke-width="14"></circle>
    </svg>
  `
}

function avatarHTML(userAvatar) {
  const backgroundColor = userAvatar.hasOwnProperty('background') ? userAvatar.background : 'rgb(152, 152, 152)'

  return `
    <div class="avatar" style="background-color: ${backgroundColor}">
     <div class="avatar--container">
       ${avatarImageHTML(userAvatar)}
     </div>
   </div>
  `
}

function avatarImageHTML(userAvatar) {
  if (userAvatar.hasOwnProperty('image_id')) {
    return `
      <img class="avatar--image" alt="${userAvatar.username}" src="https://assets.cdn.moviepilot.de/files/${userAvatar.image_id}/fill/40/40/${userAvatar.image_filename}" srcset="https://assets.cdn.moviepilot.de/files/${userAvatar.image_id}/fill/80/80/${userAvatar.image_filename} 2x" width="40" height="40">
    `
  } else {
    return `
      <div class="avatar--image -no-image">
        <div class="avatar--image-svg">${userAvatar.initials}</div>
      </div>
    `
  }
}

function stylesheetCSS() {
  return `
    .activityfeed {
      padding-top: 18px;
      padding-bottom: 18px;
      box-sizing: border-box;
      display: flex;
      flex: 0 1 auto;
      flex-flow: row wrap;
      margin-right: -0.5rem;
      margin-left: -0.5rem;
    }

    .activityfeed--activities {
      width: 100%;
    }

    .activityfeed--buttons {
      display: flex;
      position: relative;
      z-index: 0;
      max-width: 100%;
      padding-bottom: 20px;
      overflow: auto hidden;
      will-change: scroll-position;
      margin: 0px auto;
    }

    .activityfeed--button {
      font-family: Oswald, sans-serif;
      font-stretch: normal;
      font-weight: 500;
      letter-spacing: 0.05em;
      transition: color 0.1s ease-in 0s;
      text-decoration: none;
      font-size: 12px;
      line-height: 1.5em;
      text-transform: uppercase;
      position: relative;
      flex: 1 1 100%;
      width: 100%;
      max-width: 144px;
      height: 34px;
      padding: 8px 12px;
      outline: 0px;
      text-align: center;
      white-space: nowrap;
      cursor: pointer;
    }

    .activityfeed--button.-active {
      max-width: initial;
      transition: background-color 0.1s ease-in 0s;
      color: rgb(255, 255, 255);
      background-color: rgb(244, 100, 90);
    }

    .activityfeed--head {
      box-sizing: border-box;
      flex: 0 0 100%;
      padding-right: 0.5rem;
      padding-left: 0.5rem;
      max-width: 100%;
      display: block;
    }

    .section-header {
      display: flex;
      position: relative;
      -webkit-box-align: center;
      align-items: center;
      -webkit-box-pack: center;
      justify-content: center;
      width: 100%;
      margin-bottom: 18px;
      overflow: hidden;
    }

    .section-header--title {
      display: inline-block;
      font-family: Oswald, sans-serif;
      font-stretch: normal;
      font-weight: 600;
      font-size: 28px;
      line-height: 1.13;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      position: relative;
      z-index: 2;
      margin: 0px;
      color: rgb(20, 20, 20);
      margin-bottom: 2px;
    }

    .section-header--title:before {
      content: "";
      background: rgb(236, 237, 237);
      height: 1px;
      width: 300%;
      position: absolute;
      top: 50%;
      left: -18px;
      transform: translate(-100%, -50%);
      z-index: 1;
    }

    .section-header--title:after {
      content: "";
      background: rgb(236, 237, 237);
      height: 1px;
      width: 300%;
      position: absolute;
      top: 50%;
      right: -18px;
      transform: translate(100%, -50%);
      z-index: 1;
    }

    .section-header--highlighted {
      color: rgb(244, 100, 90);
    }

    .activities {
      margin: 16px 0;
      padding: 0 16px;
      width: 100%;
    }

    .activities--activity {
      margin-bottom: 2rem;
    }

    .activity {
      padding: 18px 12px;
      background-color: rgb(236, 237, 237);
    }

    .activity.-comment {
      background-color: rgb(236, 237, 237);
    }

    .activity.-rating {
      background-color: rgb(246, 242, 251);
    }

    .activity.-followship {
      background-color: rgb(255, 228, 227);
    }

    .activity--box {
      display: grid;
      grid-template-columns: auto 60px;
      gap: 16px;
      align-items: start;
    }

    .activity--wrapper {
    }

    .activity--body-container {
      padding: 0px 3px;
      font-size: 15px;
      line-height: 24px;
    }

    .activity--body-wrapper {
      position: relative;
      height: auto;
      overflow: visible;
      padding-top: 1.25rem;
      word-break: break-word;
    }

    .activity--body-wrapper.-truncated {
      position: relative;
      max-height: 250px;
      overflow: hidden;
    }

    .activity--body-shadow {
      display: block;
      position: absolute;
      right: 0px;
      bottom: 0px;
      left: 0px;
      height: 35px;
      background: linear-gradient(rgba(255, 255, 255, 0), rgba(236, 237, 237, 0.99));
      pointer-events: none;
      color: rgba(255, 255, 255, 0);
    }

    .activity--body-actions {
      display: flex;
    }

    .activity--body-read-more {
      display: inline;
      transition: color 0.1s ease-in 0s;
      box-shadow: rgb(244 100 90) 0px -0.12em inset;
      cursor: pointer;
    }

    .activity--body-link {
      display: inline;
      font-family: Oswald, sans-serif;
      font-stretch: normal;
      font-weight: 600;
      letter-spacing: 0.05em;
      font-size: 12px;
      text-decoration: none;
      text-transform: uppercase;
      margin-left: auto;
    }
    .activity--body-link:hover {
      color: rgb(244, 100, 90);
    }

    .activity--body p:first-of-type {
      margin-top: 0;
    }

    .activity--body p:last-of-type {
      margin-bottom: 0;
    }

    .activity--poster {
      width: 60px;
    }

    .activity--header {
      display: flex;
      align-items: center;
      gap: 0 12px;
    }

    .activity--author {
      flex-grow: 0;
    }

    .activity--meta [movie-title] {
      text-decoration: none;
      font-family: Oswald, sans-serif;
      font-stretch: normal;
      letter-spacing: 0.01875em;
      font-weight: 600;
      line-height: 29px;
    }

    .activity--meta [movie-title]:hover {
      color: rgb(244, 100, 90);
    }

    .avatar {
      position: relative;
      width: 100%;
      height: 0px;
      padding-bottom: 100%;
      overflow: hidden;
      border-radius: 50%;
    }

    .avatar--container {
      width: inherit;
      min-width: 1px;
      height: inherit;
      min-height: 1px;
    }

    .avatar--image {
      position: absolute;
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100%;
    }

    .avatar--image.-no-image {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .avatar--image-svg {
      font-family: Oswald, sans-serif;
      font-stretch: normal;
      font-weight: 600;
      letter-spacing: 0.06em;
    }

    .rating {
      display: flex;
      flex-wrap: nowrap;
      -webkit-box-align: center;
      align-items: center;
      margin-left: auto;
    }

    .rating--verbalization {
      display: block;
      margin-right: 12px;
    }

    .rating--circle {
      position: relative;
      border-radius: 50%;
      overflow: hidden;
      width: 40px;
      height: 40px;
    }

    .rating--circle-inner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
      line-height: 0;
    }

    .rating--circle-value {
      font-family: Oswald,sans-serif;
      font-weight: 700;
      letter-spacing: -.02em;
      position: relative; top: -0.05em;
      transition: color .1s linear; color: #f4645a;
      line-height: .9;
      text-align: center;
      white-space: nowrap;
      font-size: 20px;
    }

    .rating--border {
      display: block;
      position: relative;
      transform: rotate(-90deg);
      transform-origin: center;
      border-radius: 50%;
      cursor: default;
      overflow: hidden;
    }

    .rating--colored-border {
      transition: stroke-dashoffset .3s,stroke .1s;
      transition-timing-function: linear;
      will-change: stroke-dashoffset;
      stroke: #f4645a;
    }

    .rating--circle-tiny-value {
      font-size: 58%;
    }

    [activities--button-more] {
      margin: 0px;
      overflow: visible;
      background: transparent;
      font-style: inherit;
      font-variant: inherit;
      -webkit-font-smoothing: inherit;
      appearance: none;
      font-family: Oswald, sans-serif;
      font-stretch: normal;
      font-weight: 600;
      letter-spacing: 0.06em;
      display: inline-block;
      outline: 0px;
      font-size: 15px;
      line-height: 1.67;
      text-align: center;
      text-decoration: none;
      text-transform: uppercase;
      cursor: pointer;
      width: 264px;
      padding: 7px 11px;
      border: 0px;
      color: rgb(255, 255, 255);
      user-select: none;
      background-color: rgb(244, 100, 90);
    }

    [activities--button-more]:hover {
      background-color: rgb(247, 142, 135);
      color: rgb(255, 255, 255);
    }

    .activities--button-more-wrapper {
      display: flex;
      -webkit-box-pack: center;
      justify-content: center;
      width: 100%;
    }

    .poster {
    }

    .poster--image {
      width: 100%;
      height: 100%;
    }

    .poster--image.-placeholder {
      position: relative;
    }

    .poster--image-placeholder-wrapper {
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      position: absolute;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
      -webkit-box-pack: center;
      -ms-flex-pack: center;
      justify-content: center;
      width: 100%;
      height: 80px;
      background-color: #eceded;
    }

    .poster--image-placeholder {
      width: 70%;
      height: auto;
    }

    .author {
      display: grid;
      grid-template-areas:
        "avatar name"
        "avatar timestamp";
      align-items: center;
      height: 44px;
      grid-template-columns: 40px auto;
      grid-template-rows: 26px 18px;
      gap: 0 9px;
    }

    .author--avatar {
      grid-area: avatar;
      display: block;
    }

    .author--name {
      grid-area: name;
      text-decoration: none;
      font-family: Oswald, sans-serif;
      font-stretch: normal;
      font-weight: 500;
      letter-spacing: 0.01875em;
    }

    .author--name:hover {
      color: rgb(244, 100, 90);
    }

    .author--timestamp {
      grid-area: timestamp;
      font-family: Oswald, sans-serif;
      font-stretch: normal;
      font-weight: 600;
      letter-spacing: 0.05em;
      color: rgb(152, 152, 152);
      font-size: 12px;
      line-height: 1.5;
      text-decoration: none;
      text-transform: uppercase;
    }
	`
}

// Utilities
function stringToHTML(string) {
  const dom = document.createElement('div')
  dom.innerHTML = string
  return dom
}

function makeAjaxRequest(url) {
  return new Promise(function (resolve, reject) {
    const httpRequest = new XMLHttpRequest()
    httpRequest.onload = function () {
      resolve(this)
    }
    httpRequest.onerror = function () {
      reject(new Error("Network error"))
    }
    httpRequest.open('GET', url)
    httpRequest.send()
  })
}

function createElementFromHTML(htmlString) {
  return stringToHTML(htmlString).children[0]
}

function handleErrors(error) {
  console.error(`[MP-Kommentarfeed]: ${error.message}`)
}

function getElementByText(parent, selector, text) {
  let matches = Array.prototype.slice.call(contains(parent, selector, text))
  return matches[0]
}

function contains(parent, selector, text) {
  let elements = parent.querySelectorAll(selector)
  return Array.prototype.filter.call(elements, function (element) {
    return RegExp(text).test(element.textContent)
  })
}

function formattedTimestamp(timestampInSeconds) {
  const date = new Date(timestampInSeconds * 1000)
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }

  return date.toLocaleString('de-DE', options)
}

function formattedTimestampSince(timestampInSeconds) {
  const rtf = new Intl.RelativeTimeFormat('de')
  const seconds = Math.floor(((new Date().getTime() / 1000) - timestampInSeconds))
  const intervalAndTimePeriod = getIntervalAndTimePeriod(seconds)

  return rtf.format(-intervalAndTimePeriod.interval, intervalAndTimePeriod.timePeriod)
}

function getIntervalAndTimePeriod(seconds) {
  const secondsPerMinute = 60
  const secondsPerHour = 60 * secondsPerMinute
  const secondsPerDay = 24 * secondsPerHour
  const secondsPerMonth = 30 * secondsPerDay
  const secondsPerYear = 365 * secondsPerDay

  if (seconds > secondsPerYear) {
    return { interval: Math.floor(seconds / secondsPerYear), timePeriod: 'year' }
  } else if (seconds > secondsPerMonth) {
    return { interval: Math.floor(seconds / secondsPerMonth), timePeriod: 'month' }
  } else if (seconds > secondsPerDay) {
    return { interval: Math.floor(seconds / secondsPerDay), timePeriod: 'day' }
  } else if (seconds > secondsPerHour) {
    return { interval: Math.floor(seconds / secondsPerHour), timePeriod: 'hour' }
  } else if (seconds > secondsPerMinute) {
    return { interval: Math.floor(seconds / secondsPerMinute), timePeriod: 'minute' }
  } else {
    return { interval: seconds, timePeriod: 'second' }
  }
}

function parseMetaShort(activity) {
  if (activity.hasOwnProperty('meta_short')) {
    let metaShortElement = createElementFromHTML(`<div>${activity.meta_short}</div>`)
    let origin = metaShortElement.querySelector('[itemprop="countryOfOrigin"]')
    let year = metaShortElement.querySelector('[itemprop="copyrightYear"]')

    if (year && origin) {
      return `(${origin.textContent} ${year.textContent})`
    } else {
      return ''
    }
  } else {
    return ''
  }
}
