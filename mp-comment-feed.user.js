// ==UserScript==
// @name                MP-Kommentarfeed (experimentell)
// @description         Das Skript stellt den alten Kommentarfeed wieder her
// @author              leinzi
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-comment-feed.user.js
// @updateURL           https://github.com/Leinzi/mp-Skripte/raw/master/mp-comment-feed.user.js
// @match               https://www.moviepilot.de
// @version             0.7.1
// ==/UserScript==

const PER_PAGE = 20
const MAX_PAGES = 10

let currentPage = 1
let renderedComments = []

if (document.readyState !== 'loading') {
  commentFeedExtension()
} else {
  document.addEventListener('DOMContentLoaded', commentFeedExtension)
}

function commentFeedExtension() {
  addStylesheetToHead()
    .then(fetchAndBuildCommentFeed)
}

function fetchAndBuildCommentFeed() {
  const commentFeedURL = `https://www.moviepilot.de/api/comments?per_page=${PER_PAGE}&page=${currentPage}`
  makeAjaxRequest(commentFeedURL)
    .then(handleCommentsFeedRequest)
    .then(addCommentStreamToPage)
    .catch(handleErrors)
}

function handleCommentsFeedRequest(request) {
  return new Promise(function(resolve, reject) {
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

function addCommentStreamToPage(comments) {
  const dashboardSection = getElementByText('.sc-gsDKAQ', 'Dashboard')

  let commentStreamSection = document.querySelector('.commentfeed')
  let commentsContainer

  if (commentStreamSection) {
    commentsContainer = commentStreamSection.querySelector('.comments')
  } else {
    commentStreamSection = createElementFromHTML(commentStreamSectionHTML())
    commentsContainer = createElementFromHTML(commentsContainerHTML())
    commentStreamSection.append(commentsContainer)
    dashboardSection.after(commentStreamSection)
  }

  let titles = []

  for (let comment of comments) {
    titles.push(makeAjaxRequest(comment.commentable_url).then(fetchPageTitle))
  }

  Promise.all(titles).then(titles => {
    for (let i = 0; i < titles.length; i++) {
      let comment = comments[i]
      if (!renderedComments.includes(comment.id)) {
        let commentContainer = commentContainerElement(comment, titles[i])
        commentContainer.classList.add('-hidden')
        commentsContainer.append(commentContainer)

        let bodyWrappers = commentContainer.querySelectorAll('.comment--body-wrapper')
        for (let bodyWrapper of bodyWrappers) {
          if (bodyWrapper.offsetHeight > 250) {
            bodyWrapper.classList.add('-truncated')
            let readMoreElement = createElementFromHTML('<i class="comment--body-read-more">Weiterlesen</i>')
            bodyWrapper.after(readMoreElement)
            let shadowElement = createElementFromHTML('<div class="comment--body-shadow"></div>')
            bodyWrapper.append(shadowElement)

            readMoreElement.addEventListener('click', (event) => {
              bodyWrapper.classList.remove('-truncated')
              shadowElement.remove()
              readMoreElement.remove()
            })
          }
        }
        commentContainer.classList.remove('-hidden')
        renderedComments.push(comment.id)
      }
    }
    if (currentPage < MAX_PAGES) {
      addButton(commentStreamSection)
    }
  })
}

function addButton(commentStreamSection) {
  let buttonDiv = createElementFromHTML(`
    <div class="comments--button-more-wrapper"></div>
  `)
  let button = createElementFromHTML(`
    <button comments--button-more role="button" type="button">Weitere Kommentare laden</button>
  `)
  button.addEventListener('click', onClick)
  buttonDiv.append(button)

  Promise.resolve(commentStreamSection.append(buttonDiv))
}

function onClick(event) {
  let button = event.currentTarget
  currentPage = currentPage + 1

  fetchAndBuildCommentFeed()
  button.parentElement.remove()
}

function fetchPageTitle(request) {
  return new Promise(function(resolve, reject) {
    if (request.status == 200) {
      const dom = stringToHTML(request.response)
      const title = dom.querySelector('title').textContent.replace(' | Moviepilot.de', '')

      resolve(title)
    } else {
      reject(new Error('There was an error in processing your request'))
    }
  })
}

function addStylesheetToHead() {
  let style = document.createElement('style')
  style.type = 'text/css'
  style.append(document.createTextNode(stylesheetCSS()))

  return Promise.resolve(document.getElementsByTagName('head')[0].append(style))
}

// Elements
function commentContainerElement(comment, title) {
  const commentContainer = createElementFromHTML(commentsCommentHTML(comment, title))
  const commentBox = createElementFromHTML(`<div class="comment--box"></div>`)
  const commentWrapper = createElementFromHTML(`<div class="comment--wrapper"></div>`)
  const commentDiv = createElementFromHTML(commentHTML(comment))
  const commentPoster = createElementFromHTML(commentedItemPosterHTML(comment))

  commentWrapper.append(commentDiv)
  commentBox.append(commentWrapper)
  commentBox.append(commentPoster)
  commentContainer.append(commentBox)

  if (comment.replies.length > 0) {
    commentWrapper.append(commentRepliesElement(comment.replies))
  }

  return commentContainer
}

function commentRepliesElement(replies) {
  const commentReplies = createElementFromHTML(commentRepliesHTML())

  for (let reply of replies) {
    const commentReply = createElementFromHTML(commentHTML(reply))
    commentReplies.append(commentReply)
  }

  return commentReplies
}

// Templates
function commentStreamSectionHTML() {
  return `
    <div class="commentfeed">
      <div class="commentfeed--head">
        <div>
          <div class="commentfeed--header">
            <h2 class="commentfeed--title">
              <span class="commentfeed--highlighted">Aktuelle</span>
              Kommentare
            </h2>
          </div>
        </div>
      </div>
    </div>
  `
}

function commentsContainerHTML() {
  return `
    <div class="comments">
    </div>
  `
}

function commentsCommentHTML(comment, title) {
  return `
    <div class="comments--comment">
      ${commentedItemHTML(comment, title)}
    </div>
  `
}

function commentedItemHTML(comment, title) {
  return `
    <div class="comment-meta">
      <h3 class="comment-meta--title">
        <a href="${comment.commentable_url}">
          ${title}
        </a>
      </h3>
    </div>
  `
}

function commentedItemPosterHTML(comment) {
  if (comment.commentable_poster_url) {
    return `
      <a href="${comment.commentable_url}" class="comment--image-wrapper">
        <img class="comment--image" alt="${comment.commentable_title}" src="${comment.commentable_poster_url}" width="110" height="154">
      </a>
    `
  } else {
    return `
      <a href="${comment.commentable_url}" class="comment--image-wrapper">
        <div class="comment--image -placeholder">
          <div class="comment--image-placeholder-wrapper">
            <svg class="comment--image-placeholder" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.8 59.2c-.6-2.6-.9-5.3-.9-8.1C13.9 31.7 29.6 16 49 16s35 15.7 35 35.1-15.7 35.1-35 35.1c-15.5 0-28.6-10-33.3-23.9-.5.3-1.1.5-1.7.8-10.1 4.6-9.1 7.1-1.2 12.1 2 1.2 9.7 5 11.3 6.3 2.8 2.3 2 7.1-2.4 14.5H15c7.4-6.2 10.4-10.2 9.1-11.9-2.4-3-11.8-5.6-15.5-8.7-3.1-2.6-2.8-3.7-2.7-6.3.1-2.1 3.1-5.4 8.9-9.9zm14.8-9.6c5.2 0 9.4-4.2 9.4-9.4s-4.2-9.4-9.4-9.4-9.4 4.2-9.4 9.4 4.2 9.4 9.4 9.4zM50 54.7c2.6 0 4.7-2.1 4.7-4.7s-2.1-4.7-4.7-4.7-4.7 2.1-4.7 4.7 2.1 4.7 4.7 4.7zM52.6 38c5.2 0 9.4-4.2 9.4-9.4s-4.2-9.4-9.4-9.4-9.4 4.2-9.4 9.4 4.2 9.4 9.4 9.4zm18.9 18.9c5.2 0 9.4-4.2 9.4-9.4S76.7 38 71.5 38 62 42.3 62 47.5s4.3 9.4 9.5 9.4zm-13.6 23c5.2 0 9.4-4.2 9.4-9.4s-4.2-9.4-9.4-9.4-9.4 4.2-9.4 9.4 4.1 9.4 9.4 9.4zm-24.1-5.2c5.2 0 9.4-4.2 9.4-9.4s-4.2-9.4-9.4-9.4-9.4 4.2-9.4 9.4 4.2 9.4 9.4 9.4z" style="fill:#c2c2c2;"></path>
            </svg>
          </div>
        </div>
      </a>
    `
  }
}

function commentHTML(comment) {
  const username = comment.user_username
  const profilePath = comment.profile_path

  return `
    <div class="comment" itemprop="comment" itemscope="" itemtype="https://schema.org/Comment">
      <div class="comment--author">
        <a class="comment--author-avatar" href="${profilePath}" title="Zum Profil von ${username}">
          ${avatarHTML(comment.user_avatar)}
        </a>
        <div class="comment--author-name-and-timestamp">
          <a class="comment--author-name" href="${profilePath}" title="Zum Profil von ${username}">
            ${username}
          </a>
          ${commentAuthorTimestampHTML(comment)}
        </div>
        ${ratingHTML(comment.rating)}
      </div>
      <div class="comment--body-container">
        <div class="comment--body-wrapper">
          <div class="comment--body">
            <div>${comment.body}</div>
          </div>
        </div>
      </div>
    </div>
  `
}

function commentAuthorTimestampHTML(comment) {
  if (comment.body_updated_at_formatted) {
    return `
      <a class="comment--author-timestamp" href="${comment.comment_path}">
        <time title="${comment.created_at_formatted}">${comment.created_at_formatted}</time>
         | Geändert
        <time title="${comment.body_updated_at_formatted}">${comment.body_updated_at_formatted}</time>
      </a>
    `
  } else {
    return `
      <a class="comment--author-timestamp" href="${comment.comment_path}">
        <time title="${comment.created_at_formatted}">${comment.created_at_formatted}</time>
      </a>
    `
  }
}

function commentRepliesHTML() {
  return `
    <div class="comment--replies">
    <div>
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
    return `
      <span>${value}</span><span class="rating--circle-tiny-value">.5</span>
    `
  } else {
    return `
      <span>${value / 10}</span>
    `
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
    .commentfeed {
      padding-top: 18px;
      padding-bottom: 18px;
      box-sizing: border-box;
      display: flex;
      flex: 0 1 auto;
      flex-flow: row wrap;
      margin-right: -0.5rem;
      margin-left: -0.5rem;
    }
    .commentfeed--head {
      box-sizing: border-box;
      flex: 0 0 100%;
      padding-right: 0.5rem;
      padding-left: 0.5rem;
      max-width: 100%;
      display: block;
    }
    .commentfeed--header {
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
    .commentfeed--title {
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
    .commentfeed--title:before {
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
    .commentfeed--title:after {
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
    .commentfeed--highlighted {
      color: rgb(244, 100, 90);
    }

    .comments {
      margin: 16px 0;
    }
    .comments--comment {
      margin-bottom: 2rem;
    }

    .comment-meta {
      display: flex;
      align-items: center;
      padding-left: 16px;
      padding-right: 76px;
    }

    .comment-meta--title {
      font-family: 'Oswald', sans-serif;
      font-weight: 600;
      line-height: 29px;
      text-transform: uppercase;
    }

    .comment-meta--title > a {
      text-decoration: none;
    }

    .comment-meta--title > a:hover {
      color: rgb(244, 100, 90);
    }

    .comment--box {
      display: flex;
      gap: 16px;
    }

    .comment--wrapper {
      flex: 1;
    }

    .comment--image-wrapper {
      flex: 0 0 60px;
      width: 60px;
    }

    .comment--image {
      min-width: 60px;
      min-height: 80px;
      width: 60px;
      height: 80px;
    }
    .comment--image.-placeholder {
      position: relative;
    }
    .comment--image-placeholder-wrapper {
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
      height: 100%;
      background-color: #eceded;
    }
    .comment--image-placeholder {
      width: 70%;
      height: auto;
    }

    .comment {
      padding: 18px 12px;
      transition: opacity 0.5s ease-in 0s;
      background-color: rgb(236, 237, 237);
    }
    .comment--replies {
      margin-left: auto;
      width: 90%;
      margin-top: 10px;
    }
    .comment--replies .comment + .comment {
      margin-top: 10px;
    }
    .comment--author {
      display: flex;
      flex-wrap: nowrap;
      align-items: flex-start;
    }
    .comment--author-avatar {
      display: block;
      -webkit-box-flex: 0;
      flex-grow: 0;
      flex-shrink: 0;
      width: 40px;
      height: 40px;
    }
    .comment--author-name-and-timestamp {
      display: flex;
      flex-direction: column;
      padding-left: 9px;
      line-height: 1.25;
    }
    .comment--author-name {
      text-decoration: none;
      font-family: Oswald, sans-serif;
      font-stretch: normal;
      font-weight: 500;
      letter-spacing: 0.01875em;
    }
    .comment--author-name:hover {
      color: rgb(244, 100, 90);
    }
    .comment--author-timestamp {
      font-family: Oswald, sans-serif;
      font-stretch: normal;
      font-weight: 600;
      letter-spacing: 0.05em;
      margin-top: 2px;
      color: rgb(152, 152, 152);
      font-size: 12px;
      line-height: 1.5;
      text-decoration: none;
      text-transform: uppercase;
    }
    .comment--body-container {
      padding: 0px 3px;
      font-size: 15px;
      line-height: 24px;
    }
    .comment--body-wrapper {
      position: relative;
      height: auto;
      overflow: visible;
      padding-top: 1.25rem;
    }
    .comment--body-wrapper.-truncated {
      position: relative;
      max-height: 250px;
      overflow: hidden;
    }
    .comment--body-shadow {
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
    .comment--body-read-more {
      display: inline;
      transition: color 0.1s ease-in 0s;
      box-shadow: rgb(244 100 90) 0px -0.12em inset;
      cursor: pointer;
    }
    .comment--body p:first-of-type {
      margin-top: 0;
    }
    .comment--body p:last-of-type {
      margin-bottom: 0;
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

    [comments--button-more] {
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

    [comments--button-more]:hover {
      background-color: rgb(247, 142, 135);
      color: rgb(255, 255, 255);
    }

    .comments--button-more-wrapper {
      display: flex;
      -webkit-box-pack: center;
      justify-content: center;
      width: 100%;
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
  return new Promise(function(resolve, reject) {
    const httpRequest = new XMLHttpRequest()
    httpRequest.onload = function() {
      resolve(this)
    }
    httpRequest.onerror = function() {
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

function getElementByText(selector, text) {
  let matches = Array.prototype.slice.call(contains(selector, text))
  return matches[0]
}

function contains(selector, text) {
   let elements = document.querySelectorAll(selector)
   return Array.prototype.filter.call(elements, function(element) {
      return RegExp(text).test(element.textContent)
   })
}
