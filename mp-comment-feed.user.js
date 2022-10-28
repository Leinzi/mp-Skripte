// ==UserScript==
// @name                MP-Kommentarfeed (experimentell)
// @description         Das Skript stellt den alten Kommentarfeed wieder her
// @author              leinzi
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/raw/master/mp-comment-feed.user.js
// @updateURL           https://github.com/Leinzi/mp-Skripte/raw/master/mp-comment-feed.user.js
// @match               https://www.moviepilot.de
// @version             0.4.2
// ==/UserScript==

if (document.readyState !== 'loading') {
  fetchAndBuildCommentFeed()
} else {
  document.addEventListener('DOMContentLoaded', fetchAndBuildCommentFeed)
}

function fetchAndBuildCommentFeed() {
  const commentFeedURL = 'https://www.moviepilot.de/api/comments?per_page=20'
  makeAjaxRequest(commentFeedURL)
    .then(handleCommentsFeedRequest)
    .then(addCommentStreamToPage)
    .then(addStylesheetToHead)
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
  const commentStreamSection = createElementFromHTML(commentStreamSectionHTML())
  const commentsContainer = createElementFromHTML(commentsContainerHTML())

  let titles = []

  for (let comment of comments) {
    titles.push(makeAjaxRequest(comment.commentable_url).then(fetchPageTitle))
  }

  Promise.all(titles).then(values => {
    for (let i = 0; i < values.length; i++) {
      commentsContainer.append(commentContainerElement(comments[i], values[i]))
    }
    commentStreamSection.append(commentsContainer)
    dashboardSection.after(commentStreamSection)
  })
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
  const commentDiv = createElementFromHTML(commentHTML(comment))

  commentContainer.append(commentDiv)
  if (comment.replies.length > 0) {
    commentContainer.append(commentRepliesElement(comment.replies))
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
    <div class="sc-gsDKAQ sc-czc4w4-0 fPGaEA iXAenB">
      <div class="sc-dkPtRN xjahx">
        <div>
          <div class="sc-17tyxji-0 ftMabG">
            <h2 class="sc-17tyxji-1 cWQoCs sc-1x7lpda-0 eyJHDC">
              <span class="sc-17tyxji-2 fFLDzv">Aktuelle</span>
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
      ${commentedItemPosterHTML(comment)}
      <h3 class="comment-meta--title"">
        <a href="${comment.commentable_url}">
          ${title}
        </a>
    </div>
  `
}

function commentedItemPosterHTML(comment) {
  if (comment.commentable_poster_url) {
    return `
      <img class="comment-meta--image" alt="${comment.commentable_title}" src="${comment.commentable_poster_url}" width="110" height="154">
    `
  } else {
    return `
      <div class="comment-meta--image -placeholder">
        <div class="comment-meta--image-placeholder-wrapper">
          <svg class="comment-meta--image-placeholder" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.8 59.2c-.6-2.6-.9-5.3-.9-8.1C13.9 31.7 29.6 16 49 16s35 15.7 35 35.1-15.7 35.1-35 35.1c-15.5 0-28.6-10-33.3-23.9-.5.3-1.1.5-1.7.8-10.1 4.6-9.1 7.1-1.2 12.1 2 1.2 9.7 5 11.3 6.3 2.8 2.3 2 7.1-2.4 14.5H15c7.4-6.2 10.4-10.2 9.1-11.9-2.4-3-11.8-5.6-15.5-8.7-3.1-2.6-2.8-3.7-2.7-6.3.1-2.1 3.1-5.4 8.9-9.9zm14.8-9.6c5.2 0 9.4-4.2 9.4-9.4s-4.2-9.4-9.4-9.4-9.4 4.2-9.4 9.4 4.2 9.4 9.4 9.4zM50 54.7c2.6 0 4.7-2.1 4.7-4.7s-2.1-4.7-4.7-4.7-4.7 2.1-4.7 4.7 2.1 4.7 4.7 4.7zM52.6 38c5.2 0 9.4-4.2 9.4-9.4s-4.2-9.4-9.4-9.4-9.4 4.2-9.4 9.4 4.2 9.4 9.4 9.4zm18.9 18.9c5.2 0 9.4-4.2 9.4-9.4S76.7 38 71.5 38 62 42.3 62 47.5s4.3 9.4 9.5 9.4zm-13.6 23c5.2 0 9.4-4.2 9.4-9.4s-4.2-9.4-9.4-9.4-9.4 4.2-9.4 9.4 4.1 9.4 9.4 9.4zm-24.1-5.2c5.2 0 9.4-4.2 9.4-9.4s-4.2-9.4-9.4-9.4-9.4 4.2-9.4 9.4 4.2 9.4 9.4 9.4z" style="fill:#c2c2c2;"></path>
          </svg>
        </div>
      </div>
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
    return `
      <div class="rating--circle">
        <div class="rating--circle-inner">
          <div class="rating--circle-value">
            <span>${rating.value / 10}</span>
          </div>
        </div>
      </div>
    `
  } else {
    return ''
  }
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
    .comments {
      margin: 16px 0;
    }
    .comments--comment {
      margin-bottom: 20px;
    }

    .comment-meta {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
    }
    .comment-meta--image {
      width: 55px;
      height: 77px;
      margin-right: 8px;
    }
    .comment-meta--image.-placeholder {
      position: relative;
    }
    .comment-meta--image-placeholder-wrapper {
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
    .comment-meta--image-placeholder {
      width: 70%;
      height: auto;
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

    .comment {
      padding: 18px 12px;
      transition: opacity 0.5s ease-in 0s;
      background-color: rgb(255, 255, 255);
      box-shadow: rgb(20 20 20 / 18%) 0px 0px 7px 0px;
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
      -webkit-box-flex: 1;
      flex-grow: 1;
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
      margin: 15px 0px;
      padding: 0px 3px;
      font-size: 15px;
      line-height: 24px;
    }
    .comment--body-wrapper {
      position: relative;
      height: auto;
      overflow: visible;
    }

    .avatar {
      position: relative;
      width: 100%;
      height: 0px;
      padding-bottom: 100%;
      overflow: hidden;
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
      margin-top: 4px;
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
      border: 3px solid #dcdcdc;
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
  console.error(error.message)
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
