// ==UserScript==
// @name                MP-Kommentarfeed (experimentell)
// @description         Das Skript stellt den alten Kommentarfeed wieder her
// @author              leinzi
// @grant               none
// @downloadURL         https://github.com/Leinzi/mp-Skripte/blob/master/mp-comment-feed.user.js
// @match               https://www.moviepilot.de
// @version             0.2.1
// ==/UserScript==

if (document.readyState !== 'loading') {
  buildCommentFeed()
} else {
  document.addEventListener('DOMContentLoaded', buildCommentFeed)
}

function buildCommentFeed() {
  let commentFeedURL = 'https://www.moviepilot.de/api/comments?per_page=20'
  makeAjaxRequest(commentFeedURL)
    .then(createCommentsFromFeed)
    .then(buildCommentStream)
    .then(addStylesheetToHead)
    .catch(handleErrors)
}

function createCommentsFromFeed(feedRequest) {
  return new Promise(function(resolve, reject) {
    if (feedRequest.status == 200) {
      let data = JSON.parse(feedRequest.response)
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

function addStylesheetToHead() {
  let style = document.createElement('style')
  style.type = 'text/css'
  style.append(document.createTextNode('.comments { margin: 16px 0 }'))
  style.append(document.createTextNode('.comments--comment { margin-bottom: 20px }'))

  style.append(document.createTextNode('.comment { padding: 18px 12px; transition: opacity 0.5s ease-in 0s; background-color: rgb(255, 255, 255); box-shadow: rgb(20 20 20 / 18%) 0px 0px 7px 0px; }'))
  style.append(document.createTextNode('.comment--replies { margin-left: auto; width: 90%; margin-top: 10px; }'))
  style.append(document.createTextNode('.comment--replies .comment + .comment { margin-top: 10px; }'))

  style.append(document.createTextNode('.comment--author { display: flex; flex-wrap: nowrap; align-items: flex-start; }'))
  style.append(document.createTextNode('.comment--author-avatar { display: block; -webkit-box-flex: 0; flex-grow: 0; flex-shrink: 0; width: 40px; height: 40px; }'))
  style.append(document.createTextNode('.comment--author-name-and-timestamp { display: flex; flex-direction: column; -webkit-box-flex: 1; flex-grow: 1;  padding-left: 9px; line-height: 1.25; }'))
  style.append(document.createTextNode('.comment--author-name { text-decoration: none; font-family: Oswald, sans-serif; font-stretch: normal; font-weight: 500; letter-spacing: 0.01875em; }'))
  style.append(document.createTextNode('.comment--author-timestamp { font-family: Oswald, sans-serif; font-stretch: normal; font-weight: 600; letter-spacing: 0.05em; margin-top: 2px; color: rgb(152, 152, 152); font-size: 12px; line-height: 1.5; text-decoration: none; text-transform: uppercase; }'))

  style.append(document.createTextNode('.comment--body-container { margin: 15px 0px; padding: 0px 3px; font-size: 15px; line-height: 24px; }'))
  style.append(document.createTextNode('.comment--body-wrapper { position: relative; }'))
  style.append(document.createTextNode('.comment--body-wrapper.-full { height: auto; overflow: visible; }'))
  style.append(document.createTextNode('.comment--body-wrapper.-truncated { height: 120px; overflow: hidden; }'))

  style.append(document.createTextNode('.avatar { position: relative; width: 100%; height: 0px; padding-bottom: 100%; overflow: hidden; background: rgb(152, 152, 152); }'))
  style.append(document.createTextNode('.avatar--container { width: inherit; min-width: 1px; height: inherit; min-height: 1px; }'))
  style.append(document.createTextNode('.avatar--image { position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; }'))
  style.append(document.createTextNode('.avatar--image.-no-image { display: flex; justify-content: center; align-items: center; }'))
  style.append(document.createTextNode('.avatar--image-svg { font-family: Oswald, sans-serif; font-stretch: normal; font-weight: 600; letter-spacing: 0.06em; }'))

  document.getElementsByTagName('head')[0].append(style);
  return Promise.resolve(true)
}

function buildCommentStream(comments) {
  let firstSection = document.querySelector('.sc-gsDKAQ.sc-czc4w4-0.fPGaEA.fSrRRt')

  let section = document.createElement('div')
  section.classList.add('sc-gsDKAQ')
  section.classList.add('sc-czc4w4-0')
  section.classList.add('fPGaEA')
  section.classList.add('iXAenB')

  let subsection = document.createElement('div')
  section.classList.add('sc-dkPtRN')
  section.classList.add('xjahx')

  let subsubsection = document.createElement('div')

  let headlineSection = document.createElement('div')
  headlineSection.classList.add('sc-17tyxji-0')
  headlineSection.classList.add('ftMabG')

  let headline = document.createElement('h2')
  headline.classList.add('sc-17tyxji-1')
  headline.classList.add('cWQoCs')
  headline.classList.add('sc-1x7lpda-0')
  headline.classList.add('eyJHDC')

  let headlineSpan = document.createElement('span')
  headlineSpan.classList.add('sc-17tyxji-2')
  headlineSpan.classList.add('fFLDzv')
  headlineSpan.innerText = 'Aktuelle'

  section.append(subsection)
  subsection.append(subsubsection)
  subsubsection.append(headlineSection)
  headlineSection.append(headline)
  headline.append(headlineSpan)
  headline.append(' Kommentare')

  let commentsContainer = document.createElement('div')
  commentsContainer.classList.add('comments')

  let titles = []

  for (let comment of comments) {
    let commentableURL = comment.commentable_url
    titles.push(makeAjaxRequest(commentableURL).then(fetchPageTitle))
  }

  Promise.all(titles).then(values => {
    for (let i = 0; i < values.length; i++) {
      let commentContainer = buildCommentContainer(comments[i], values[i])
      commentsContainer.append(commentContainer)
    }
    section.append(commentsContainer)
    firstSection.after(section)
  })
}

function fetchPageTitle(request) {
  return new Promise(function(resolve, reject) {
    if (request.status == 200) {
      let dom = stringToHTML(request.response)
      let title = dom.querySelector('title').textContent
      title = title.replace(' | Moviepilot.de', '')
      resolve(title)
    } else {
      reject(new Error('There was an error in processing your request'))
    }
  })
}

// Helper
function buildCommentContainer(comment, title) {
  let commentContainer = document.createElement('div')
  commentContainer.classList.add('comments--comment')

  let commentedItem = document.createElement('div')

  let commentedItemTitle = document.createElement('h3')
  commentedItemTitle.style = "font-family: 'Oswald', sans-serif; font-weight: 600; line-height: 29px; text-transform: uppercase;"

  let commentedItemLink = document.createElement('a')
  commentedItemLink.setAttribute('href', comment.commentable_url)
  commentedItemLink.innerText = title
  commentedItemLink.style = 'text-decoration: none;'

  commentContainer.append(commentedItem)
  commentedItem.append(commentedItemTitle)
  commentedItemTitle.append(commentedItemLink)

  let commentDiv = buildCommentDiv(comment)
  commentContainer.append(commentDiv)

  if (comment.replies.length > 0) {
    let repliesDiv = document.createElement('div')
    repliesDiv.classList.add('comment--replies')

    for(let reply of comment.replies) {
      let replyDiv = buildCommentDiv(reply)
      repliesDiv.append(replyDiv)
    }
    commentContainer.append(repliesDiv)
  }

  return commentContainer
}

function buildCommentDiv(comment) {
  let commentDiv = document.createElement('div')
  commentDiv.classList.add('comment')
  commentDiv.setAttribute('itemprop', "comment")
  commentDiv.setAttribute('itemscope', "")
  commentDiv.setAttribute('itemtype', "https://schema.org/Comment")

  let commentAuthor = buildCommentAuthorDiv(comment)
  let commentBody = buildCommentBodyDiv(comment)

  commentDiv.append(commentAuthor)
  commentDiv.append(commentBody)
  return commentDiv
}

function buildCommentAuthorDiv(comment) {
  const username = comment.user_username
  const profilePath = comment.profile_path

  let commentAuthor = document.createElement('div')
  commentAuthor.classList.add('comment--author')

  let commentAuthorAvatar = document.createElement('a')
  commentAuthorAvatar.classList.add('comment--author-avatar')
  commentAuthorAvatar.setAttribute('title', `Zum Profil von ${username}`)
  commentAuthorAvatar.setAttribute('href', profilePath)

  let userAvatar = buildUserAvatar(comment.user_avatar)

  let commentAuthorNameAndTimestamp = document.createElement('div')
  commentAuthorNameAndTimestamp.classList.add('comment--author-name-and-timestamp')

  let commentAuthorName = document.createElement('a')
  commentAuthorName.classList.add('comment--author-name')
  commentAuthorName.setAttribute('title', `Zum Profil von ${username}`)
  commentAuthorName.setAttribute('href', profilePath)
  commentAuthorName.innerHTML = username

  let commentAuthorTimestamp = document.createElement('a')
  commentAuthorTimestamp.classList.add('comment--author-timestamp')
  commentAuthorTimestamp.setAttribute('href', comment.comment_path)

  let commentAuthorTimestampCreated = document.createElement('time')
  commentAuthorTimestampCreated.setAttribute('title', comment.created_at_formatted)
  commentAuthorTimestampCreated.innerHTML = comment.created_at_formatted

  commentAuthorAvatar.setAttribute('title', `Zum Profil von ${username}`)
  commentAuthorAvatar.setAttribute('href', profilePath)

  commentAuthorTimestamp.append(commentAuthorTimestampCreated)
  if (comment.body_updated_at_formatted) {
    let commentAuthorTimestampEdited = document.createElement('time')
    commentAuthorTimestampEdited.setAttribute('title', comment.body_updated_at_formatted)
    commentAuthorTimestampEdited.innerHTML = comment.body_updated_at_formatted

    commentAuthorTimestamp.append(' | Geändert ')
    commentAuthorTimestamp.append(commentAuthorTimestampEdited)
  }
  commentAuthorNameAndTimestamp.append(commentAuthorName)
  commentAuthorNameAndTimestamp.append(commentAuthorTimestamp)
  commentAuthorAvatar.append(userAvatar)
  commentAuthor.append(commentAuthorAvatar)
  commentAuthor.append(commentAuthorNameAndTimestamp)
  if (comment.hasOwnProperty('rating')) {
    let commentAuthorRating = buildRating(comment.rating)
    commentAuthor.append(commentAuthorRating)
  }
  return commentAuthor
}

function buildRating(rating) {
  let commentAuthorRating = document.createElement('div')
  commentAuthorRating.style = "display: flex; flex-wrap: nowrap; -webkit-box-align: center; align-items: center; margin-top: 4px;"

  let commentAuthorRatingWord = document.createElement('i')
  commentAuthorRatingWord.style = "display: block; margin-right: 12px;"
  commentAuthorRatingWord.innerText = rating.verbalization
  commentAuthorRating.append(commentAuthorRatingWord)

  if (rating.value) {
    let commentAuthorRatingCircle = document.createElement('div')
    commentAuthorRatingCircle.style = "position: relative; border-radius: 50%; overflow: hidden; width: 40px; height: 40px; border: 3px solid #dcdcdc;"

    let commentAuthorRatingCircleNumber1 = document.createElement('div')
    commentAuthorRatingCircleNumber1.style = "position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); line-height: 0;"

    let commentAuthorRatingCircleNumber2 = document.createElement('div')
    commentAuthorRatingCircleNumber2.style = "font-family: Oswald,sans-serif; font-weight: 700; letter-spacing: -.02em; position: relative; top: -0.05em;  transition: color .1s linear; color: #f4645a; line-height: .9; text-align: center; white-space: nowrap; font-size: 20px;"

    let commentAuthorRatingCircleNumber3 = document.createElement('span')
    commentAuthorRatingCircleNumber3.innerText = `${rating.value / 10}`

    commentAuthorRating.append(commentAuthorRatingCircle)
    commentAuthorRatingCircle.append(commentAuthorRatingCircleNumber1)
    commentAuthorRatingCircleNumber1.append(commentAuthorRatingCircleNumber2)
    commentAuthorRatingCircleNumber2.append(commentAuthorRatingCircleNumber3)
  }

  return commentAuthorRating
}

function buildCommentBodyDiv(comment) {
  let commentBodyContainer = document.createElement('div')
  commentBodyContainer.classList.add('comment--body-container')

  let commentBodyWrapper = document.createElement('div')
  commentBodyWrapper.classList.add('comment--body-wrapper')
  commentBodyWrapper.classList.add('-full')

  let commentBody = document.createElement('div')
  commentBody.classList.add('comment--body')

  let commentBodyContent = document.createElement('div')
  commentBodyContent.innerHTML = comment.body

  commentBody.append(commentBodyContent)
  commentBodyWrapper.append(commentBody)
  commentBodyContainer.append(commentBodyWrapper)

  return commentBodyContainer
}

function buildUserAvatar(userAvatar) {
  let avatar = document.createElement('div')
  avatar.classList.add('avatar')

  let avatarContainer = document.createElement('div')
  avatarContainer.classList.add('avatar--container')

  let avatarImage = null

  if (userAvatar.hasOwnProperty('image_id')) {
    avatarImage = document.createElement('img')
    avatarImage.classList.add('avatar--image')
    avatarImage.setAttribute('alt', userAvatar.username)
    avatarImage.setAttribute('src', `https://assets.cdn.moviepilot.de/files/${userAvatar.image_id}/fill/40/40/${userAvatar.image_filename}`)
    avatarImage.setAttribute('srcset', `https://assets.cdn.moviepilot.de/files/${userAvatar.image_id}/fill/80/80/${userAvatar.image_filename} 2x`)
    avatarImage.setAttribute('width', '40')
    avatarImage.setAttribute('height', '40')
  } else {
    avatarImage = document.createElement('div')
    avatarImage.classList.add('avatar--image')
    avatarImage.classList.add('-no-image')

    let avatarSvg = document.createElement('div')
    avatarSvg.classList.add('avatar--image-svg')
    avatarSvg.innerText = userAvatar.initials

    avatar.style.backgroundColor = userAvatar.background
    avatarImage.append(avatarSvg)
  }

  avatarContainer.append(avatarImage)
  avatar.append(avatarContainer)
  return avatar
}

// Utilities
function stringToHTML(string) {
  let dom = document.createElement('div')
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

function handleErrors(error) {
  console.error(error.message)
}
