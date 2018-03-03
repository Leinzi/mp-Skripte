// Extension for MoviePilot to load and add ratings from other movie websites with the help of Google
//
// "THE MOVIE-WARE LICENSE" (Revision 42):
// <rockschlumpf@googlemail.com> wrote this file. As long as you retain this notice you
// can do whatever your want with the content.  If you think it is worth it, feel free to
// send me a movie in return. Kevin Gaarmann
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
//
// To install, you need Greasemonkey: http://greasemonkey.mozdev.org/
// Then restart Firefox and revisit this script.
// Under Tools, there will be a new menu item to "Install User Script".
// Accept the default configuration and install.
//
// To uninstall, go to Tools/Manage User Scripts,
// select the script, and click Uninstall.
//
// --------------------------------------------------------------------
//
// ==UserScript==
// @name          MoviePilot Rating-Extension
// @version       2.15
// @downloadURL   https://github.com/kevgaar/MoviePilot-Rating-Extension/raw/master/mp-ratingextension.user.js
// @namespace     http://www.moviepilot.de/movies/*
// @description   Script, mit dem die Bewertungen von IMDb und anderen Plattformen ermittelt und angezeigt werden sollen
// @include       https://www.moviepilot.de/movies/*
// @exclude       https://www.moviepilot.de/movies/*/*
// @grant         GM.xmlHttpRequest
// @grant         GM_xmlhttpRequest

// ==/UserScript==
//debugger;
//-------Constants---------------
//Div-Names from every single rating. Used to show/hide the ratings via a checkbox
var C_SHOWRATINGS = 'showExtRatings';
var C_ID_IMDBRATING = 'imdbRating';
var C_ID_RTRATINGS = 'rtRatings';
var C_ID_RTTOMATOMETER = 'rtTomatometer';
var C_ID_RTCRITICSRATING = 'rtCritRating';
var C_ID_RTCOMMUNITYRATING = 'rtComRating';
var C_ID_MCRATINGS = 'mcMetacritic';
var C_ID_MCCRITICSRATING = 'mcCritRating';
var C_ID_MCCOMMUNITYRATING = 'mcComRating';
var C_ID_TMDBRATING = 'tmdbRating';
var C_ID_WIKIINFO = 'wikiInfo';

var DEBUG_MODE = false;
var VERBOSE = true;
//------/Constants---------------

var Refinery = new Refinery();
var MPRatingFactory = new MPRatingFactory();
var MPExtension = new MPExtension();

if(!MPExtension.setupExtension()){
        return false;
}

var movieData = MPExtension.getMovieData(); //Search MP for information
if(movieData === null ) {
        return false;
}
// Static variables shared by all instances of Rating
Rating.movieAliases = movieData[0];
Rating.movieYear = movieData[1];
Rating.correctness = {PERFECT: 0, GOOD: 1, OKAY: 2, BAD: 3, POOR: 4};

var tmdbRating = new Rating().ratingSite('TMDB').ratingSiteAbbr('TMDB').ratingId('tmdb').ratingDivId(C_ID_TMDBRATING).websiteURL('www.themoviedb.org/movie/').scrapperFunction(tmdbRatingScrapper).googleHookFunction(startOtherRatings).responseSiteHookFunction(collectEnglishMovieTitles).numberOfResultsIncluded(5).blacklist(new RegExp(/\s?TMDb$/i)).blacklist(new RegExp(/(?:(?=The Movie Database)The Movie Database|(?=The Movie)The Movie|(?=The)The)$/i)).blacklist(new RegExp(/Recommended Movies/i)).ratingLinkModifier(tmdbLinkModifier).ratingRequestModifier(tmdbRequestModifier);
var imdbRating = new Rating().ratingSite('IMDB').ratingSiteAbbr('IMDB').ratingRange('10').ratingId('imdb').ratingDivId(C_ID_IMDBRATING).websiteURL('www.imdb.com/title').googleRating().numberOfResultsIncluded(5).blacklist(new RegExp(/IMDb$/i)).blacklist(new RegExp(/TV Movie/i)).ratingRequestModifier(imdbRequestModifier);
var rtRating = new Rating().ratingSite('rotten tomatoes').ratingSiteAbbr('RT').ratingId('rt').ratingDivId(C_ID_RTRATINGS).websiteURL('www.rottentomatoes.com/m/').scrapperFunction(rtRatingScrapper).numberOfResultsIncluded(5).blacklist(new RegExp(/(?:(?=Rotten Tomatoes)Rotten Tomatoes|(?=Rotten)Rotten)$/i)).blacklist(new RegExp(Rating.movieYear+ " Original", "i")).ratingRequestModifier(rtRequestModifier);
var mcRating = new Rating().ratingSite('metacritic').ratingSiteAbbr('MC').ratingId('mc').ratingDivId(C_ID_MCRATINGS).websiteURL('www.metacritic.com/movie/').scrapperFunction(mcRatingScrapper).numberOfResultsIncluded(5).blacklist(new RegExp(/Metacritic$/i)).blacklist(new RegExp(/Reviews/i)).ratingRequestModifier(mcRequestModifier);
var wikiInfo = new Rating().ratingSite('Wikipedia').ratingSiteAbbr('wiki').ratingId('wiki').ratingDivId(C_ID_WIKIINFO).websiteURL('en.wikipedia.org').info().description('The Free Encyclopedia').numberOfResultsIncluded(5).blacklist(new RegExp(/(film)?\s*(?:(?=Wikipedia the free encyclopedia)Wikipedia the free encyclopedia|(?=Wikipedia the free)Wikipedia the free|(?=Wikipedia)Wikipedia)$/i)).googleRequestModifier(wikiRequestModifier);

MPExtension.addRating("imdb", imdbRating, [[C_ID_IMDBRATING, 'IMDB Bewertungen anzeigen']]);
MPExtension.addRating("rt", rtRating, [[C_ID_RTTOMATOMETER, 'RT Tomatormeter anzeigen'],[C_ID_RTCRITICSRATING, 'RT Kritiker Bewertungen anzeigen'],[C_ID_RTCOMMUNITYRATING, 'RT Community Bewertungen anzeigen']]);
MPExtension.addRating("mc", mcRating, [[C_ID_MCCRITICSRATING, 'MC Metascore anzeigen'],[C_ID_MCCOMMUNITYRATING, 'MC Community Bewertungen anzeigen']]);
MPExtension.addRating("tmdb", tmdbRating, [[C_ID_TMDBRATING, 'TMDb Bewertungen anzeigen']]);
MPExtension.addRating("wiki", wikiInfo, [[C_ID_WIKIINFO, 'Wikipedia Infos anzeigen']]);

MPExtension.setNotBannable("tmdb"); //Can not be disabled by the user, just be hidden

//Kicking off the search...
//The reason TMDB is kicked of first, is that TMDB is used to translate the german movie titles into english. The search with english titles is much more successfull. The other searches will be started by a hooked function of the TMDB rating.
MPExtension.queueRatingSearch("tmdb");
MPExtension.startRatingSearch();

function startOtherRatings() {
/* Function to start the search for ratings from other websites */
        if(DEBUG_MODE) {
                console.log("MP-R-Ext: TMDB: Start other rating requests.");
        }
        MPExtension.queueRatingSearch("imdb");
        MPExtension.queueRatingSearch("rt");
        MPExtension.queueRatingSearch("mc");
        MPExtension.queueRatingSearch("wiki");
        MPExtension.startRatingSearch();
}

function collectEnglishMovieTitles(tmdbResponse) {
/* Hooked function for translating german movie titles into english. Results in better google results */
        if(DEBUG_MODE) {
                console.log("MP-R-Ext: TMDB: Collecting movie titles.");
        }
        
        //query english titles
        var titles = [];
        var length;
        var match;
        var country;
        var type;
        
        // default page
        var titleDiv = tmdbResponse.querySelector("div.title > h2 > a ");
        if (titleDiv !== null) {
                var title = titleDiv.childNodes[0].nodeValue
                length = Rating.movieAliases.length;
                match = Refinery.refineString(title);
                pushStringToSet(Rating.movieAliases, Refinery.refineString(match));
                moveStringToFirstPosition(Rating.movieAliases, Refinery.refineString(match));
                if(length < Rating.movieAliases.length) {
                        MPExtension.addTitleToMP(match);
                }
        }
        
        // release-info page
        var titleSpan = tmdbResponse.querySelector("span[itemprop=name]");
        if(titleSpan !== null) {
                match = titleSpan.innerHTML;
                length = Rating.movieAliases.length;
                pushStringToSet(Rating.movieAliases, Refinery.refineString(match));
                moveStringToFirstPosition(Rating.movieAliases, Refinery.refineString(match));
                if(length < Rating.movieAliases.length) {
                        MPExtension.addTitleToMP(match);
                }
        }
        
        var table = tmdbResponse.querySelectorAll("table.new > tbody");
        if(table !== null && table.length >= 2) {
                table = table[1];
                for(var i = 0; i < table.children.length; i++) {
                        country = table.children[i].children[2].innerHTML;
                        type = table.children[i].children[1].innerHTML;
                        if(country == "US" && (type == "" || type == "short title" || type =="Modern Title")) {
                                match = table.children[i].children[0].innerHTML;
                                length = Rating.movieAliases.length;
                                addStringToSet(Rating.movieAliases, Refinery.refineString(match));
                                if(length < Rating.movieAliases.length) {
                                        MPExtension.addTitleToMP(match);
                                }
                        }
                }
        }
        startOtherRatings(); // start rating search
}

/* Request modifiers - transform the request URL */
function tmdbRequestModifier(url) {
        var refinedUrl = url.match(/(https?:\/\/)?www\.themoviedb\.org\/movie\/.*?(?=(\?|\/))/);
        if(refinedUrl !== null) {
                refinedUrl = refinedUrl[0];
        } else {
                return url.replace(/((\?language=[a-z]{2}(-[A-Z]{2})?|\/de)?$)/, '?language=en');
        }
        //return refinedUrl + "/release-info?language=en";
        return refinedUrl + "?language=en";
}
function tmdbLinkModifier(url) {
        var refinedUrl = url.match(/(https?:\/\/)?www\.themoviedb\.org\/movie\/.*?(?=(\?|\/))/);
        if(refinedUrl !== null) {
                refinedUrl = refinedUrl[0];
        } else {
                refinedUrl = url;
        }
        
        return refinedUrl.replace(/((\?language=[a-z]{2}(-[A-Z]{2})?|\/de)?$)/, '?language=en'); //the english website is needed
}
function imdbRequestModifier(url) {
        var refinedUrl = url.match(/(https?:\/\/)?www\.imdb\.com\/title\/.*?(?=(\?|\/))/);
        if(refinedUrl !== null) {
                return refinedUrl[0];
        }
        return url;
}
function mcRequestModifier(url) {
        var refinedUrl = url.match(/(https?:\/\/)?www\.metacritic\.com\/movie\/.*?(?=(\?|\/))/);
        if(refinedUrl !== null) {
                return refinedUrl[0];
        }
        return url;
}

function rtRequestModifier(url) {
        var refinedUrl = url.match(/(https?:\/\/)?www\.rottentomatoes\.com\/m\/.*?(?=(\?|\/))/);
        if(refinedUrl !== null) {
                return refinedUrl[0];
        }
        return url;
}

function wikiRequestModifier(url) {
        return url+"+film";
}

function MPExtension() {
        /* Base class for the MoviePilot Rating Extension
        * Sets up the Extension and lets you add new ratings from other websites
        */
        var ratingAnchor; //Div element. Hook point for children, especially ratings containers
        var ratings = [];
        var checkboxes = []; //Collection of Checkboxes; To show/hide different ratings.
        var checkboxRelation = [];
        var ratingQueue = [];
        var self = this;
        
        this.setupExtension = function() {
        /* Setting up the extension
        * Creation of control elements
        */
                if(!fixMPLayout()) {
                        return false;
                }
                var bewertung = document.getElementsByClassName('forecastcount')[0];
                var parent = bewertung.parentNode;
                
                var ratingExtensionDiv = createElementWithId('div', 'ratingExtension');
                var extRatingsDiv = createElementWithId('div', 'extRatings');
                var ratingExtensionControlDiv = createElementWithId('div', 'ratingExtControl');
                var hr1 = document.createElement('hr');
                var hr2 = document.createElement('hr');
                var toggleContentButton = createElementWithId('span', 'toggleContentButton');
                var showSettingsButton = createElementWithId('span', 'settingsButton');
                var toStringButton = createElementWithId('span', 'toStringButton');
                
                ratingExtensionControlDiv.style.margin = '0px 0px 0px 25px';
                toggleContentButton.style.color = '#9C9C9C';
                toggleContentButton.style.cursor = 'pointer';
                
                if(getInfoFromLocalStorage(C_SHOWRATINGS)){ //Ask local storage if the ratings should be visible and which text should be displayed
                        extRatingsDiv.style.display = 'inline';
                        toggleContentButton.innerHTML = 'Suche deaktivieren';
                } else {
                        extRatingsDiv.style.display = 'none';
                        toggleContentButton.innerHTML = 'Suche aktivieren';
                }
                toggleContentButton.onclick = onToggleContentButtonClick;
                
                showSettingsButton.style.color = '#9C9C9C';
                showSettingsButton.style.cursor = 'pointer';
                showSettingsButton.innerHTML = 'Einstellungen';
                showSettingsButton.onclick = onSettingButtonClick;
                
                toStringButton.style.color = '#9C9C9C';
                toStringButton.style.cursor = 'pointer';
                toStringButton.innerHTML = 'toString';
                toStringButton.onclick = onToStringButtonClick;
                
                hr1.style.margin = '5px 0px 5px 0px';
                hr2.style.margin = '5px 0px 5px 0px';
                
                ratingExtensionDiv.appendChild(hr1);
                ratingExtensionDiv.appendChild(extRatingsDiv);
                ratingExtensionDiv.appendChild(hr2);
                ratingExtensionControlDiv.appendChild(toggleContentButton);
                ratingExtensionControlDiv.appendChild(document.createTextNode(' | '));
                ratingExtensionControlDiv.appendChild(showSettingsButton);
                ratingExtensionControlDiv.appendChild(document.createTextNode(' | '));
                ratingExtensionControlDiv.appendChild(toStringButton);
                ratingExtensionDiv.appendChild(ratingExtensionControlDiv);
                parent.insertBefore(ratingExtensionDiv, bewertung.nextSibling);
                
                ratingAnchor = extRatingsDiv;
                return true;
        };
        
        function fixMPLayout() {
        /* Modifies MPs structure - all ratings have to look alike... */
                var userAction = document.getElementsByClassName('movie_user_action')[0];
                var criticsCount = document.getElementsByClassName('criticscount')[0];
                var contentCount = document.getElementsByClassName('contentcount')[0];
                var huge = document.getElementsByClassName('huge');
                var quite = document.getElementsByClassName('quite');
                
                if(userAction === null || criticsCount === null || contentCount === null || huge === null || quite === null) {
                        if(DEBUG_MODE) {
                                console.log("MP-R-Ext: Function fixMPLayout. Structure changed.");
                        }
                        return false;
                }
                
                userAction.style.width   = "180px";
                userAction.style.margin  = "0px 25px 0px 25px";
                userAction.style.padding = "0px";
                userAction.style.float   = "left";
                
                criticsCount.style.width   = "180px";
                criticsCount.style.margin  = "0px 25px 0px 25px";
                criticsCount.style.padding = "0px";
                criticsCount.style.float   = "left";
                
                
                criticsCount.children[1].replaceChild(document.createTextNode("Kritiker"), criticsCount.children[1].childNodes[0]);
                
                contentCount.style.width   = "180px";
                contentCount.style.margin  = "0px 25px 0px 25px";
                contentCount.style.padding = "0px";
                contentCount.style.float   = "left";
                
                for (i = 0; i < huge.length; i++) {
                        huge[i].style.width   = "35px";
                        huge[i].style.margin  = "10px 3px 0px 0px";
                        huge[i].style.padding = "0px";
                        huge[i].style.float   = "left";
                        huge[i].style.textAlign   = "center";
                }
                
                for (i = 0; i < quite.length; i++) {
                        quite[i].style.margin  = "0px";
                        quite[i].style.padding = "0px";
                        quite[i].style.float   = "left";
                }
                
                return true;
        }
        
        this.addTitleToMP = function(title) {
                var titlesTooltip = document.querySelector("#titlesTooltip")
                if(titlesTooltip == null) {
                
                        var movieData = document.getElementsByClassName('movie--data');
                        var atTitles = movieData[0];
                        atTitles.children[0].style.display = "inline-block";

                        tmdbTitles = document.createElement("div");
                        tmdbTitles.style.display = "inline-block";
                        tmdbTitles.id = "tmdbTitles";
                        
                        var info = document.createElement("span");
                        
                        info.innerHTML = "?";
                        info.style.width = "14px"
                        info.style.height = "14px"
                        info.style.textAlign = "center"
                        info.style.borderRadius = "7px";
                        info.style.fontSize = "12px";
                        info.style.color = "#FFFFFF";
                        info.style.background = "#9C9C9C";
                        info.style.display = "inherit";
                        info.style.margin = "0px 0px 0px 3px"

                        var tooltipText = "<b>Titles from TMDb:</b><br>- "+title;
                        var tooltip = document.createElement('span');
                        tooltip.id = "titlesTooltip";
                        tooltip.innerHTML = tooltipText;
                        tooltip.style.visibility = "hidden";
                        tooltip.style.color = "#FFFFFF";
                        tooltip.style.textAlign = "left";
                        tooltip.style.margin = "0px 0px 0px 8px";
                        tooltip.style.borderRadius = "6px";
                        tooltip.style.background = "#696969";
                        tooltip.style.position = "absolute";
                        tooltip.style.zIndex = "1";
                        tooltip.style.opacity = "0";
                        tooltip.style.transition = "opacity 1s";
                        tooltip.style.display = "inherit";

                        info.appendChild(tooltip);
                        info.onmouseover = function(){tooltip.style.visibility = "visible"; tooltip.style.opacity = "1";};
                        info.onmouseout = function(){tooltip.style.visibility = "hidden"; tooltip.style.opacity = "0";};

                        tmdbTitles.appendChild(info);
                        atTitles.appendChild(tmdbTitles);
                } else {
                        titlesTooltip.innerHTML += "<br>- "+title;
                }
        }
        
        this.appendNewContainer = function(id) {
        /* Adding a new rating container */
                ratingAnchor.appendChild(createElementWithId('div', id));
                return this;
        };
        
        function createElementWithId(element, id) {
        /* Ceating a new HTML element with an ID */
                var newDiv = document.createElement(element);
                newDiv.id = id;
                return newDiv;
        }
        
        function onToggleContentButtonClick() {
        /* Handler for Click Event - toggleContentButton */
                var content = document.getElementById('extRatings');
                var button = document.getElementById('toggleContentButton');
                if(content.style.display == 'inline') { //toogling button description and local storage information
                        content.style.display = 'none';
                        button.innerHTML = 'Suche aktivieren';
                        setInfoInLocalStorage(C_SHOWRATINGS, false);
                } else {
                        content.style.display = 'inline';
                        button.innerHTML ='Suche deaktivieren';
                        setInfoInLocalStorage(C_SHOWRATINGS, true);;
                        self.startRatingSearch();
                }
        }
        
        function onSettingButtonClick() {
        /* Handler for Click Event - settingsButton
        * Creates and shows the settings on demand
        */
                var overlay = document.getElementById('overlay');
                if(overlay !== null) {
                        overlay.style.visibility = 'visible';
                } else {
                        overlay = addSettingsOverlay();
                        document.getElementById('ratingExtension').appendChild(overlay);
                        overlay.style.visibility = 'visible';
                }
        }
        
        function addSettingsOverlay(){
        /* Creation of the settings for the extension */
                var overlayDiv = document.createElement('div');
                var overlayContentDiv = document.createElement('div');
                var exitButton = document.createElement('a');
                
                overlayDiv.id               = 'overlay';
                overlayDiv.style.visibility = 'hidden';
                overlayDiv.style.position   = 'absolute';
                overlayDiv.style.left       = '0px';
                overlayDiv.style.top        = '0px';
                overlayDiv.style.width      = '100%';
                overlayDiv.style.height     = '100%';
                overlayDiv.style.textAlign  = 'center';
                overlayDiv.style.zIndex     = '1000';
                
                overlayContentDiv.style.width           = '300px';
                overlayContentDiv.style.margin          = '100px auto';
                overlayContentDiv.style.backgroundColor = '#fff';
                overlayContentDiv.style.border          = 'solid #000';
                overlayContentDiv.style.padding         = '15px';
                overlayContentDiv.style.textAlign       = 'left';
                
                exitButton.innerHTML = 'Einstellungen schließen';
                exitButton.onclick = function() {document.getElementById('overlay').style.visibility = 'hidden';};
                
                for(var i = 0; i < checkboxes.length; i++) {
                        overlayContentDiv.appendChild(checkboxes[i]);
                }
                
                overlayContentDiv.appendChild(exitButton);
                overlayDiv.appendChild(overlayContentDiv);
                return overlayDiv;
        }
        
        function appendNewCheckbox(id, description){
        /* Add a new checkbox to the settings overlay
        * Checking/unchecking it will show/hide a Div container with the ID <id>
        */
                checkboxes.push(getCheckBoxFor(id, description));
                return this;
        }
        
        function getCheckBoxFor(id, infoText) {
        /* Creation of a chekbox
        * Registers its <id> in the local storage for future access
        */
                var label = document.createElement('label');
                var checkBox = document.createElement('input');
                
                label.appendChild(checkBox);
                label.appendChild(document.createTextNode(' '+infoText));
                label.appendChild(document.createElement('br'));
                
                checkBox.id = id+'CheckBox';
                checkBox.type = 'checkbox';
                checkBox.checked = getInfoFromLocalStorage(id);
                checkBox.onchange = function() {
                        setInfoInLocalStorage(id, this.checked);
                        if(this.checked) {
                                var parent = checkboxRelation[id]; //Get childs' parent
                                var alreadyStarted = ratings[parent][2];
                                if(alreadyStarted === false) {
                                        self.startRatingSearch();
                                } else {
                                        var element = document.getElementById(id);
                                        if(element !== null) {
                                                element.style.display = 'inline';
                                        } else {
                                                element = document.getElementById(parent);
                                                element.style.display = 'inline';
                                        }
                                }
                        } else {
                                var element = document.getElementById(id);
                                if(element !== null) {
                                        element.style.display = 'none';
                                } else {
                                        var parent = checkboxRelation[id];
                                        element = document.getElementById(parent);
                                        element.style.display = 'none';
                                }
                        }
                };
                return label;
        }
        
        this.getMovieData = function() {
        /* Get important inforation from the MP website: Movie titles, year */
                var movieHeadline = document.getElementsByClassName('movie--headline');
                var movieData = document.getElementsByClassName('movie--data');
                var movieDataClearfix = document.getElementsByClassName('movie--data clearfix');
                
                if(movieHeadline === null || movieData === null || movieDataClearfix === null) {
                        if(DEBUG_MODE) {
                                console.log("MP-R-Ext: Function getMovieData. Structure changed.");
                        }
                        return null;
                }
                
                var titles = [];
                addStringToSet(titles, Refinery.refineString(movieHeadline[0].innerHTML)); //MP movie title
                getMovieAliases(movieData[0].children[0].innerHTML).forEach(function(currentValue, index, array){addStringToSet(titles, Refinery.refineString(currentValue));}); //MP alternative titles
                
                var year;
                var i = 0;
                do{	//Fetch movie year
                        i++;
                        if(movieDataClearfix[0].children[i] !== undefined) {
                                year = movieDataClearfix[0].children[i].innerHTML.match(/\d\d\d\d/);
                        }
                } while (year === null && i < 5);
                if(year === null) {
                        year = "";
                }
                return [titles, year];
        };
        
        function getMovieAliases(aliasString) {
        /* Get movie aliases from a string */
                var aliases = aliasString.split(/\s?\/\sAT:\s?|\s?;\s?|\s?\/\s?/g); // Usual delimiters are '\ AT:', ';' and '/'
                return aliases;
        };
        
        this.addRatingToContainer = function(ratingAbbr, ratingObject) {
        /* Append a rating to its container
        * Choosing a specific container for every rating creates a steady sequence
        */
                var element = document.getElementById(ratingAbbr);
                if(element !== null) {
                        element.appendChild(ratingObject);
                } else if(DEBUG_MODE) {
                        console.log("Rating couldn't be added: Rating unknown.")
                }
        };
        
        this.addRating = function(ratingAbbr, ratingObject, checkboxInformation) {
        /* Add a rating to the extension.
         * @ratingAbbr - String, Abbrivation of the rating website
         * @ratingObject - Rating, a rating class object
         * @checkboxInformation - List of tuples, every single rating of a website with a discription
         */
                ratings[ratingAbbr] = [ratingObject, checkboxInformation, false, false];
                self.appendNewContainer(ratingAbbr);
                checkboxInformation.forEach(function(currentValue, index, array) {
                        var checkboxId = currentValue[0];
                        var description = currentValue[1];
                        appendNewCheckbox(checkboxId, description);
                        checkboxRelation[checkboxId] = ratingAbbr;
                });
        };

        this.queueRatingSearch = function(ratingAbbr) {
        /* Queue a rating for search execution */
                if(ratingAbbr in ratings) {
                        ratingQueue.push(ratingAbbr)
                } else if(DEBUG_MODE) {
                        console.log("Rating unknown.")
                }
        };

        this.startRatingSearch = function() {
        /* Start the search for a Rating */
                if(getInfoFromLocalStorage(C_SHOWRATINGS)) {
                        ratingQueue.forEach(function(currentValue, index, value) {
                                runSearch(currentValue);
                        });
                }
        };
        
        function runSearch(ratingAbbr) {
        /* Run the search for a specific rating */
                if (ratingAbbr in ratings) {
                        var userStartSettings = false; //Check in the local storage user settings if the search should be started
                        ratings[ratingAbbr][1].forEach(function(currentValue, index, array){
                                userStartSettings = (userStartSettings || getInfoFromLocalStorage(currentValue[0]))
                        });
                        
                        var alreadyStarted = ratings[ratingAbbr][2]; //Check if the search has already been started
                        var isNotBannable = ratings[ratingAbbr][3]; //Check if the search can be forbidden
                        if ((isNotBannable || userStartSettings) && alreadyStarted === false) { //Start the search?
                                ratings[ratingAbbr][2] = true;
                                ratings[ratingAbbr][0].getRating();
                        }
                } else if(DEBUG_MODE) {
                        console.log("Search couldn't be startet: Rating unknown.")
                }
        }
        
        this.setNotBannable = function(ratingAbbr) {
        /* A rating should not be disabled */
                if (ratingAbbr in ratings) {
                        ratings[ratingAbbr][3] = true;
                } else if(DEBUG_MODE) {
                        console.log("Rating unknown.")
                }
        };
        
        function onToStringButtonClick() {
                var string = ratingsToString();
                window.prompt("Copy to clipboard: Ctrl+C, Enter", string);
        };
        
        
        function ratingsToString() {
                var resultString = "";
                var mpCommunity = document.querySelector("div.contentcount");
                var otherRatings = document.querySelectorAll("div.criticscount");
                
                var rating = mpCommunity.children[0].innerHTML;
                var ratingRange = "10";
                var ratingCount = mpCommunity.querySelector("span[itemprop=ratingCount]").innerHTML;
                var ratingInfo = "MP Community";
                var tabs = "\t";
                resultString += rating+"/"+ratingRange+"\t"+ratingInfo+"\t(Bewertungen: "+ratingCount+")";
                
                rating = otherRatings[0].children[0].innerHTML;
                var ratingRange = "10";
                ratingCount = otherRatings[0].children[1].children[1].innerHTML.match(/\d*/)[0];
                ratingInfo = "MP Kritiker";
                tabs = "\t";
                resultString += "\n"+rating+"/"+ratingRange+tabs+ratingInfo+"\t\t(Bewertungen: "+ratingCount+")";
                
                for(var i = 1; i < otherRatings.length; i++) {
                        if(otherRatings[i].style.display == "inline") {
                                rating = otherRatings[i].children[0].innerHTML;
                                if(rating.match(/\d\.?\d?\d?/)) {
                                        ratingRange = otherRatings[i].children[1].childNodes[4].innerHTML.match(/\d{1,3}$/)[0];
                                        ratingCount = otherRatings[i].children[1].children[1].innerHTML.match(/\d*/)[0];
                                        ratingInfo = otherRatings[i].children[1].childNodes[0].nodeValue;

                                        var tabsCount = 4 - (ratingInfo.length / 4);
                                        tabs = "\t";
                                        for(var j = 1; j < tabsCount; j++) {
                                                tabs += "\t";
                                        }
                                        resultString += "\n"+rating+"/"+ratingRange+"\t"+ratingInfo +tabs+"(Bewertungen: "+ratingCount+")";
                                }
                        }
                }
                return resultString;
        }
}

function addStringToSet(array, string){
/* Adds a string at the highest index of an array of unique strings (simple JavaScript push), if the string isn't found in it */
        var i = 0;
        var found = false;
        var regEx = new RegExp("^"+string+"$", "i");
        while(i < array.length && found === false) {
                if(array[i].search(regEx) >= 0) {
                        found = true;
                }
                i++;
        }
        if(found !== true) {
                array.push(string);
        }
}

function pushStringToSet(array, string){
/* Pushes a string to index 0 of an array of unique strings, if the string isn't found in it */
        var i = 0;
        var found = false;
        var regEx = new RegExp("^"+string+"$", "i");
        while(i < array.length && found === false) {
                if(array[i].search(regEx) >= 0) {
                        found = true;
                }
                i++;
        }
        if(found !== true) {
                array.unshift(string);
        }
}

function moveStringToFirstPosition(array, string) {
        var i = 0;
        var found = false;
        var regEx = new RegExp("^"+string+"$", "i");
        while(i < array.length && found === false) {
                if(array[i].search(regEx) >= 0) {
                        found = true;
                }
                i++;
        }
        if(found === true && array.length > 1) {
                var swap = array[0];
                array[0] = string;
                array[i-1] = swap;
        }
}

function matchInArray(array, expression) {
/* Search an array of string for a regular expression */
        for(var i = 0; i < array.length; i++) {
                if(array[i].match(expression)) {
                        return true;
                }
        }
        return false;
}


function Rating () {
        /* Rating class
        * Search automation for ratings of different movie websites
        * You can either use the rating Google provides on their results or write your own scrapper for a rating from any website and "hook" it to this rating
        */
        var self = this;
        
        var ratingSite="";	//Required; Full name of the website
        var ratingSiteAbbr = ""; //Required; Abbrivation of the websites name
        var description = "";	//(Only for the type Info) Short description of the website
        var websiteURL=""; //Required; URL of the website; Used for the search
        var ratingRange="10"; //[Used by standard Google rating scrapper] (Default) Range of the Rating
        var ratingId="";	//[Used by standard Google rating scrapper] Required; ID of the Div-container where the rating will be added
        var ratingDivId=""; //[Used by standard Google rating scrapper] Required; ID of the ratings Div-container
        var googleRequest="";
        var googleRequestModifier = function(url) {return url;}; 	//Modify Googles request URL
        var ratingRequest="";
        var ratingRequestModifier = function(url) {return url;};	//Modify the request URL of the rating website
        var ratingLinkModifier = function(url) {return url;}; // Modify the Link to the rating website
        var ratingSourceTypes = {EXTERN: 0, GOOGLE: 1, INFO:2};		//Type of the rating; EXTERN for own rating scrapper, GOOGLE for standard Google scrapper, INFO for a information website without rating
        var ratingSourceType = ratingSourceTypes.EXTERN;		//Current type of the rating
        var numberOfResultsIncluded = 1;	//Number of Google results that should be included in a search
        var excludeUnplausibleYear = false;	//Should a result be excluded if the movie years aren't matching?
        var googleHookFunction = null; //Hooked function; Will be called after a successfull google request
        var responseSiteHookFunction = null; //Hooked function; Will be called after a successfull rating website request
        var scrapperFunction = null;	//Scrapper function
        var estCorrectness = Rating.correctness.LOW;	//Estimated correctness of a rating result
        var blacklistedStrings = []; //Backlist of regular expressions, that will be deleted from char sequences like titles and infos
        
        var callback;
        var SEARCH_GOOGLE_RESULT_INFO = false;	//Search Googles infos to a result for matches too
        var LINK_WEBSITES = true;	//Link the websites
        var LET_ME_GOOGLE_THAT = true;	//Link the Google request if a search is failing
        var REQ_TIMEOUT = 10000;
        var REQ_SYNCHRONOUS = false;
        
        this.ratingSite = function(string) {ratingSite = string; return this;};
        this.ratingSiteAbbr = function(string) {ratingSiteAbbr = string; return this;};
        this.description = function(string) {description = string; return this;};
        this.ratingRange = function(string) {ratingRange = string; return this;};
        this.ratingId = function(string) {ratingId = string; return this;};
        this.ratingDivId = function(string) {ratingDivId = string; return this;};
        this.websiteURL = function(string) {websiteURL = string; return this;};
        this.googleRequestModifier = function(func) {googleRequestModifier = func; return this;};
        this.ratingRequestModifier = function(func) {ratingRequestModifier = func; return this;};
        this.ratingLinkModifier = function(func) {ratingLinkModifier = func; return this;};
        this.externRating = function() {ratingSourceType = ratingSourceTypes.EXTERN; return this;};
        this.googleRating = function() {ratingSourceType = ratingSourceTypes.GOOGLE; return this;};
        this.info = function() {ratingSourceType = ratingSourceTypes.INFO; return this;};
        this.numberOfResultsIncluded = function(number) {numberOfResultsIncluded = number; return this;};
        this.excludeUnplausibleYear = function(boolean) {excludeUnplausibleYear = boolean; return this;};
        this.googleHookFunction = function(func) {googleHookFunction = func; return this;};
        this.responseSiteHookFunction = function(func) {responseSiteHookFunction = func; return this;};
        this.scrapperFunction = function(func) {scrapperFunction = func; return this;};
        this.blacklist = function(regex) {blacklistedStrings.push(regex); return this;};
        
        this.getRating = function() {
        /* Kick off the search */
                googleRequest = "https://www.google.de/search?q=site:"+websiteURL+"+"+Rating.movieAliases[0].replace(/ /g,"+")+((Rating.movieYear !== '') ? "+"+Rating.movieYear : '');
                googleRequest = googleRequestModifier(googleRequest);
                googleRequest = Refinery.encode(googleRequest);
                if(DEBUG_MODE) {
                        log("Google request: "+googleRequest);
                }
                callback = handleGoogleResponse; // Setting a callback function; Will be called in an anonymous function in sendRequest
                sendRequest(googleRequest);
        };
        
        function handleGoogleResponse(request, response) {
        /* Handler for Google response */
                if(DEBUG_MODE) {
                        log("Google request successfull.");
                }
                
                var googleResponse = parseToHTMLElement(response.responseText);
                var googleResults = googleResponse.getElementsByClassName("g", 5);
                var bestResult = getBestGoogleResult(googleResults);
                
                if(bestResult !== null) {
                        if(DEBUG_MODE) {
                                log("Plausible google result found.");
                        }
                        ratingRequest = bestResult[0];
                        ratingRequest = ratingRequestModifier(ratingRequest);
                        
                        if(ratingSourceType == ratingSourceTypes.GOOGLE) {
                                var rating = getRatingByGoogle(bestResult[1]);
                                if(LINK_WEBSITES) {
                                        MPExtension.addRatingToContainer(ratingId, MPRatingFactory.wrapRatingWithLink(rating, ratingRequest));
                                } else {
                                        MPExtension.addRatingToContainer(ratingId, rating);
                                }
                        } else if(ratingSourceType == ratingSourceTypes.INFO) {
                                var info = MPRatingFactory.buildInfo(ratingSite,description, estCorrectness, ratingDivId);
                                MPExtension.addRatingToContainer(ratingId, MPRatingFactory.wrapRatingWithLink(info, ratingRequest));
                        } else {	//Type EXTERN
                                callback = handleRatingSiteResponse;
                                if(DEBUG_MODE) {
                                        log("Rating site request: "+ratingRequest);
                                }
                                sendRequest(ratingRequest);
                        }
                } else {
                        if(DEBUG_MODE) {
                                log("No plausible google result.");
                        }
                        if(googleHookFunction !== null) {
                                googleHookFunction();
                        }
                        if(LET_ME_GOOGLE_THAT) {
                                MPExtension.addRatingToContainer(ratingId, MPRatingFactory.wrapRatingWithLink(MPRatingFactory.getNotFoundRating(ratingSite, ratingRange, ratingDivId), request));
                        } else {
                                MPExtension.addRatingToContainer(ratingId, MPRatingFactory.getNotFoundRating(ratingSite, ratingRange, ratingDivId));
                        }
                }
        }
        
        function handleRatingSiteResponse (request, response) {
        /* Handler for rating site response */
                if(DEBUG_MODE) {
                        log("Rating site request successfull.");
                }
                var ratingSiteResponse = parseToHTMLElement(response.responseText)
                if(responseSiteHookFunction !== null) {
                        responseSiteHookFunction(ratingSiteResponse);
                }
                if(scrapperFunction !== null) {
                        var rating = scrapperFunction(ratingSiteResponse, estCorrectness);
                        var ratingRequest = ratingLinkModifier(request);
                        if(LINK_WEBSITES) {
                                MPExtension.addRatingToContainer(ratingId, MPRatingFactory.wrapRatingWithLink(rating, ratingRequest));
                        } else {
                                MPExtension.addRatingToContainer(ratingId, rating);
                        }
                } else {
                        log("No scrapper function defined.");
                }
        }
        
       function getBestGoogleResult(googleResults) {
        /* Result-Scrapper for Google
        * Checks the results for plausibility
        *
        * return   Array: Link zum Ergebnis und HTML des Google-Ergebnisses oder null
        */
                var bestCorrectnessResult = 0;
                var bestSpamResult = 0;
                var bestResultIndex = 0;
                var foundCounter = 0;
                var correctnessIndicator = 0;
                var spamIndicator = 0;
                var googleResultURLs = [];
                var movieAliases = Rating.movieAliases;

                if(DEBUG_MODE && VERBOSE) {
                        log(googleResults.length + " results found. " + numberOfResultsIncluded + " results included.");
                }
                
                for(var k = 0; k < googleResults.length && k < numberOfResultsIncluded; k++) {
                        var currentResult = googleResults[k];
                        var link = currentResult.getElementsByTagName("a")[0];
                        var title = link.innerHTML;
                        var url = link.href;
                        var infoDiv = "";
                        
                        if(!excludeUnplausibleYear || title.search(Rating.movieYear) > 0) {
                                if(SEARCH_GOOGLE_RESULT_INFO) {
                                        infoDiv = currentResult.getElementsByClassName("st")[0].outerHTML;
                                }
                                title = Refinery.refineString(title)
                                var regExp;
                                for(var l = 0; l < blacklistedStrings.length; l++) { //delete unwanted strings
                                        title = title.replace(blacklistedStrings[l], '');
                                }
                                title = title.replace(Rating.movieYear, '');
                                title = Refinery.refineString(title);
                                var titleSplits = title.split(' ');
                                
                                //Try to match movie titles with the results (and result infos)
                                var j = 0;
                                correctnessIndicator = 0;
                                spamIndicator = 0;
                                while(j < movieAliases.length && (bestCorrectnessResult < 1 || bestSpamResult < 1)) {
                                        foundCounter = 0;
                                        var movieAliasSplits = movieAliases[j].split(' ');
                                        // Heuristic - at least half of the movie titles words have to be found in a result
                                        for(var i = 0; i < movieAliasSplits.length; i++) {
                                                var regExp = new RegExp('(^|\\s|>)'+movieAliasSplits[i]+'(\\s|$)', 'i');
                                                if(matchInArray(titleSplits, regExp) || (SEARCH_GOOGLE_RESULT_INFO && infoDiv.search(regExp) >= 0)) {
                                                        foundCounter++;
                                                }
                                        }
                                        correctnessIndicator = Math.round((foundCounter/movieAliasSplits.length)*100)/100;
                                        spamIndicator = Math.round((foundCounter/titleSplits.length)*100)/100;
                                        if(url.search(websiteURL) >= 0 && correctnessIndicator >= 0.5 && spamIndicator >= 0.5) { //Threshold for accepted results
                                                if(DEBUG_MODE && VERBOSE) {
                                                        log("Result "+(k+1)+" matched. Correct: "+correctnessIndicator+" Spam: "+spamIndicator);
                                                }
                                                if(correctnessIndicator > bestCorrectnessResult || ( correctnessIndicator >= bestCorrectnessResult && spamIndicator > bestSpamResult)) {
                                                        if (DEBUG_MODE && VERBOSE) {
                                                                log("New best: Result "+(k+1)+" Correct: "+correctnessIndicator+" Spam: "+spamIndicator);
                                                        }
                                                        bestResultIndex = k;
                                                        bestCorrectnessResult = correctnessIndicator;
                                                        bestSpamResult = spamIndicator;
                                                } else if (DEBUG_MODE && VERBOSE) {
                                                        log("Close: Result "+(k+1)+" Correct: "+correctnessIndicator+" Spam: "+spamIndicator);
                                                }
                                        } else if (DEBUG_MODE && VERBOSE) {
                                                log("Result "+(k+1)+" was excluded: Correct: "+correctnessIndicator+" Spam: "+spamIndicator);
                                        }
                                        j++;
                                }
                        } else {
                                if(DEBUG_MODE && VERBOSE) {
                                        log("Result "+(k+1)+" was excluded: Wrong Year.");
                                }
                        }
                }
                var indicator = bestCorrectnessResult * bestSpamResult;
                if(indicator >= 0.25) {
                        if (DEBUG_MODE && VERBOSE) {
                                log("Final result: "+(bestResultIndex+1)+". Correct: "+bestCorrectnessResult+" Spam: "+bestSpamResult+" Result: "+indicator);
                        }
                        if(indicator == 1) { //all words were found
                	        estCorrectness = Rating.correctness.PERFECT;
                        } else if(indicator >= 0.75) {
                	        estCorrectness = Rating.correctness.GOOD;
                        } else if(indicator >= 0.5) {
                	        estCorrectness = Rating.correctness.OKAY;
                        } else if(indicator >= 0.25) {
                	        estCorrectness = Rating.correctness.BAD;
                        }
                        return [googleResults[bestResultIndex].getElementsByTagName("a")[0].href, googleResults[bestResultIndex]];
                } else {
                        return null;
                }
        }
        
        function getRatingByGoogle(googleResult) {
        /* Standard scrapper for Googles ratings */

                var ratingDiv = googleResult.querySelector("div.f.slp")
                if(ratingDiv !== null && ratingDiv.childNodes.length >= 2) {
                        var ratingText = Refinery.refineHTML(ratingDiv.childNodes[1].nodeValue);
                        ratingText = ratingText.match(/\d,?\d?\/10 - \d(\d|\.)*/);
                        if(ratingText !== null) {
                                ratingText = ratingText[0].split('-')
                                var rating = ratingText[0].trim();
                                var ratingCount = ratingText[1].trim()
                                return MPRatingFactory.buildRating(Refinery.refineRating(rating), ratingSiteAbbr, Refinery.refineRatingCount(ratingCount), ratingRange, estCorrectness, ratingDivId);
                        }
                }
                return MPRatingFactory.getNotYetRating(ratingSiteAbbr, ratingRange, estCorrectness, ratingId);
        }
        
        function sendRequest(request) {
        /* Absetzen eines Requests
        *
        * request      Ziel-URL mit Request
        * source       Anzeige-Information
        */
                if (this.REQ_SYNCHRONOUS) {  //synchronous or asynchronous
                        var response = GM.xmlHttpRequest({
                        	method: 'GET',
                        	url: request,
                        	synchronous: this.REQ_SYNCHRONOUS,
                        	timeout: this.REQ_TIMEOUT,
                        	ontimeout: function(response) {console.log("Timeout(MP-Rating-Extension):  "+request);}
                        });
                        if(response.status == 200) {
                        	ratingObject.callback(request, response);
                        } else {
                        	alert("Error: No synchornous operation.");
                        }
                } else {
                        GM.xmlHttpRequest({
                                method: 'GET',
                                url: request,
                                synchronous: this.REQ_SYNCHRONOUS,
                                timeout: this.REQ_TIMEOUT,
                                onreadystatechange: function(response) {
                                        if(response.readyState == 4) {
                                                if(response.status == 200) { //Successfull request
                                                        callback(request, response);
                                                } else if(response.status >= 500 && response.status < 600) { //Server error
                                                        var rating = null;
                                                        if(DEBUG_MODE) {
                                                                log("ERROR: Status-Code: " + response.status)
                                                        }
                                                        if(response.finalUrl.match(/(ipv4|ipv6).google.(de|com)\/sorry/) !== null) { //Blocked by Google; Too many requests
                                                                MPExtension.appendNewContainer('google');
                                                                rating = MPRatingFactory.wrapRatingWithLink(MPRatingFactory.buildInfo('Google blocked','Click and enter captcha to unlock', 'google'), request);
                                                                MPExtension.addRatingToContainer('google', rating);
                                                        }
                                                } else { //Default error
                                                        if(DEBUG_MODE) {
                                                                log("ERROR: Status-Code: " + response.status)
                                                        }
                                                        rating = MPRatingFactory.getErrorRating(ratingSite, ratingRange, ratingDivId);
                                                        MPExtension.addRatingToContainer(ratingId, rating);
                                                }
                                        }
                                }
                        });
                }
        }
        
        function parseToHTMLElement(html) {
        /* Parse a  */
                var htmlObject = document.createElement("html");
                htmlObject.innerHTML = html;
                return htmlObject;
        }

        function log(info) {
        /* Predefined logging method */
                console.log("MP-R-Ext: "+ratingSiteAbbr+": "+info);
        }
}

function rtRatingScrapper(rtResponse, estCorrectness) {
/* Rating-Scrapper for Rotten Tomatoes */
        var rt_div = document.createElement('div');
        rt_div.id = C_ID_RTRATINGS;
        
        // critics
        var queryResult = rtResponse.querySelectorAll("div.tomato-left > div > div.superPageFontColor");
        if(queryResult.length >=4) {
                var critAvrRating   = queryResult[0].innerText.match(/\d(\.|,)?\d?/);
                var critRatingCount = queryResult[1].innerText.match(/\d(\d|,|\.)*/);
                var critFresh       = queryResult[2].innerText.match(/\d(\d|,|\.)*/);
                var critRotten      = queryResult[3].innerText.match(/\d(\d|,|\.)*/);
                if(critRatingCount !== null) {
                        critRatingCount = critRatingCount[0]
                }
                if(critFresh !== null && critRotten !== null && critRatingCount !== null) {
                        critFresh = critFresh[0];
                        critRotten = critRotten[0];
                        rt_div.appendChild(MPRatingFactory.buildRating(Math.round((critFresh/critRatingCount)*100), 'RT Tomatometer', Refinery.refineRatingCount(critRatingCount), '100', estCorrectness, C_ID_RTTOMATOMETER));
                } else {
                        rt_div.appendChild(MPRatingFactory.getNotYetRating('RT Tomatometer', '100', estCorrectness, C_ID_RTTOMATOMETER));
                }
                if(critAvrRating !== null && critRatingCount !== null) {
                        critAvrRating = critAvrRating[0];
                        rt_div.appendChild(MPRatingFactory.buildRating(critAvrRating, 'RT Kritiker', Refinery.refineRatingCount(critRatingCount), '10', estCorrectness, C_ID_RTCRITICSRATING));
                } else {
                        rt_div.appendChild(MPRatingFactory.getNotYetRating('RT Kritiker', '100', estCorrectness, C_ID_RTCRITICSRATING));
                }
        } else {
                rt_div.appendChild(MPRatingFactory.getNotYetRating('RT Tomatometer', '100', estCorrectness, C_ID_RTTOMATOMETER));
                rt_div.appendChild(MPRatingFactory.getNotYetRating('RT Kritiker', '10', estCorrectness, C_ID_RTCRITICSRATING));
        }
        
        // Audience
        var queryResult = rtResponse.querySelectorAll("div.audience-info > div");
        if( queryResult.length >= 2) {
                var audAvrRating   = queryResult[0].innerText.match(/\d\.?\d?/);
                var audRatingCount = queryResult[1].innerText.match(/\d(\d|,|\.)*/);
                if(audAvrRating !== null && audRatingCount !== null) {
                        audAvrRating = audAvrRating[0];
                        audRatingCount = audRatingCount[0];
                        rt_div.appendChild(MPRatingFactory.buildRating(Refinery.refineRating(audAvrRating), 'RT Community', Refinery.refineRatingCount(audRatingCount), '5', estCorrectness, C_ID_RTCOMMUNITYRATING));
                } else {
                        rt_div.appendChild(MPRatingFactory.getNotYetRating('RT Community', '5', estCorrectness, C_ID_RTCOMMUNITYRATING));
                }
        } else {
                rt_div.appendChild(MPRatingFactory.getNotYetRating('RT Community', '5', estCorrectness, C_ID_RTCOMMUNITYRATING));
        }
        
        return rt_div;
}

function mcRatingScrapper(mcResponse, estCorrectness) {
/* Rating-Scrapper for Metacritic */
        var mc_div = document.createElement('div');
        mc_div.id = C_ID_MCRATINGS;
        
        var criticsDiv = mcResponse.querySelector("div.critics_col")
        var ratingValue = criticsDiv.querySelector("div.metascore_w")
        var posRatingCount = criticsDiv.querySelector("div.chart.positive > div > div.count");
        var mixRatingCount = criticsDiv.querySelector("div.chart.mixed > div > div.count");
        var negRatingCount = criticsDiv.querySelector("div.chart.negative > div > div.count");
        if(ratingValue !== null && posRatingCount !== null && mixRatingCount !== null && negRatingCount !== null) {
                var ratingCount = parseInt(Refinery.refineRatingCount(posRatingCount.innerHTML)) + parseInt(Refinery.refineRatingCount(mixRatingCount.innerHTML)) + parseInt(Refinery.refineRatingCount(negRatingCount.innerHTML))
                mc_div.appendChild(MPRatingFactory.buildRating(Refinery.refineRating(ratingValue.innerHTML), 'MC Metascore', ratingCount, '100', estCorrectness, C_ID_MCCRITICSRATING));
        } else {
                mc_div.appendChild(MPRatingFactory.getNotYetRating('MC Metascore', '100', estCorrectness, C_ID_MCCRITICSRATING));
        }
        
        var usersDiv = mcResponse.querySelector("div.users_col")
        var ratingValue = usersDiv.querySelector("div.metascore_w")
        var posRatingCount = usersDiv.querySelector("div.chart.positive > div > div.count");
        var mixRatingCount = usersDiv.querySelector("div.chart.mixed > div > div.count");
        var negRatingCount = usersDiv.querySelector("div.chart.negative > div > div.count");
        if(ratingValue !== null && posRatingCount !== null && mixRatingCount !== null && negRatingCount !== null) {
                var ratingCount = parseInt(Refinery.refineRatingCount(posRatingCount.innerHTML)) + parseInt(Refinery.refineRatingCount(mixRatingCount.innerHTML)) + parseInt(Refinery.refineRatingCount(negRatingCount.innerHTML))
                mc_div.appendChild(MPRatingFactory.buildRating(Refinery.refineRating(ratingValue.innerHTML), 'MC User Score', ratingCount, '10', estCorrectness, C_ID_MCCOMMUNITYRATING));
        } else {
                mc_div.appendChild(MPRatingFactory.getNotYetRating('MC User Score', '10', estCorrectness, C_ID_MCCOMMUNITYRATING));
        }
        return mc_div;
}

function tmdbRatingScrapper(tmdbResponse, estCorrectness) {
/* Rating-Scrapper for TheMovieDB */
        var tmdb_div;
        
        var rating = null;
        var ratingCount = null;
        
        //release-info page
        var ratingSpan = tmdbResponse.querySelector("span[itemprop=ratingValue]");
        var ratingCountSpan = tmdbResponse.querySelector("span[itemprop=ratingCount]");
        if(ratingSpan !== null && ratingCountSpan !== null) {
                rating =  ratingSpan.innerHTML;
                ratingCount = ratingCountSpan.innerHTML;
        } else {
                //common movie page
                var ratingSpan = tmdbResponse.querySelector("span.rating");
                if(ratingSpan !== null) {
                        rating = ratingSpan.innerHTML;
                }
        }
        
        if(rating !== null && ratingCount == null) {
                tmdb_div = MPRatingFactory.buildRating(Refinery.refineRating(rating), 'TMDB', "-", 10, estCorrectness,  C_ID_TMDBRATING);
        } else if(rating !== null && ratingCount !== null){
                tmdb_div = MPRatingFactory.buildRating(Refinery.refineRating(rating), 'TMDB', Refinery.refineRatingCount(ratingCount), 10, estCorrectness,  C_ID_TMDBRATING);
        } else {
                tmdb_div = MPRatingFactory.getNotYetRating('TMDB', 10, estCorrectness, C_ID_TMDBRATING);
        }
        
        return tmdb_div;
}

function MPRatingFactory() {
/* Factory for MP elements */

        this.buildRating = function(rating, source, ratingCount, range, estCorrectness, id) {
        /* Rebuild the rating structure of MP to show external ratings */
                var ratingWrapper = createWrapper(id);
                var ratingValue = createValue(rating);
                ratingWrapper.appendChild(ratingValue);
                var ratingInfo = createInfo(source, ratingCount+" Bewertungen", "Skala 0 bis "+range);
                ratingWrapper.appendChild(ratingInfo);
                if(estCorrectness != Rating.correctness.LOW) {
                        var estimatedCorrectness = createEstCorrectness(estCorrectness);
                        ratingWrapper.appendChild(estimatedCorrectness);
                }
                return ratingWrapper;
        };
        
        this.buildInfo = function(source, sourceInfo, estCorrectness, id) {
        /* Rebuild the rating structure of MP to show external information */
                var infoWrapper = createWrapper(id);
                var infoValue = createValue("i");
                infoWrapper.appendChild(infoValue);
                var sourceInfoSplit = sourceInfo.split(/(^.{0,20} )/);
                var infoInfo = createInfo(source, sourceInfoSplit[1], sourceInfoSplit[2]);
                infoWrapper.appendChild(infoInfo);
                if(estCorrectness != Rating.correctness.LOW) {
                        var estimatedCorrectness = createEstCorrectness(estCorrectness);
                        infoWrapper.appendChild(estimatedCorrectness);
                }
                return infoWrapper;
        };
        
        var createWrapper = function(id) {
        /* MPs rating wrapper*/
                var wrapper = document.createElement('div');
                wrapper.id            = id;
                wrapper.className     = "criticscount";
                wrapper.style.width   = "180px";
                wrapper.style.margin  = "0px 25px 0px 25px";
                wrapper.style.padding = "0px";
                wrapper.style.float   = "left";
                if(getInfoFromLocalStorage(id)) {
                        wrapper.style.display = 'inline';
                } else {
                        wrapper.style.display = 'none';
                }
                return wrapper;
        };
        
        var createValue = function(value) {
        /* MPs rating */
                var valueSpan = document.createElement('span');
                valueSpan.className     = "huge";
                valueSpan.innerHTML     = value;
                valueSpan.style.width   = "35px";
                valueSpan.style.margin  = "10px 3px 0px 0px";
                valueSpan.style.padding = "0px";
                valueSpan.style.float   = "left";
                valueSpan.style.textAlign = "center";
                return valueSpan;
        };
        
        var createInfo = function(title, description, descriptionExp) {
        /* MPs rating infos */
                var info = document.createElement('div');
                info.className     = "quite";
                info.style.margin  = "0px";
                info.style.padding = "0px";
                info.style.float   = "left";
                
                var infoSource = document.createTextNode(title);
                info.appendChild(infoSource);
                info.appendChild(document.createElement('br'));
                
                var infoDesc = document.createElement('span');
                infoDesc.innerHTML = description;
                info.appendChild(infoDesc);
                info.appendChild(document.createElement('br'));
                
                var infoDescExp = document.createElement('span');
                infoDescExp.className = "small";
                infoDescExp.innerHTML = descriptionExp;
                info.appendChild(infoDescExp);
                
                return info;
        };
        
        var createEstCorrectness = function(correctness) {
        /* Display for the estimated correctness of a added rating */
                var tooltipText = "Matching correctness is: ";
                var estimationInfo = document.createElement('div');
                estimationInfo.className     = "correctness";
                estimationInfo.style.margin  = "15px 10px 15px 0px";
                estimationInfo.style.padding = "0px";
                estimationInfo.style.float   = "right";
                
                var circle = document.createElement('div');
                circle.style.width = "10px";
                circle.style.height = "10px";
                circle.style.borderRadius = "5px";
                if(correctness == Rating.correctness.PERFECT) {
                        circle.style.color = "#00FF00";
                        circle.style.background = "#00FF00";
                        tooltipText = tooltipText+"Perfect";
                } else if(correctness == Rating.correctness.GOOD) {
                        circle.style.color = "#3FBF00";
                        circle.style.background = "#3FBF00";
                        tooltipText = tooltipText+"Good";
                } else if(correctness == Rating.correctness.OKAY) {
                        circle.style.color = "#FFFF00";
                        circle.style.background = "#FFFF00";
                        tooltipText = tooltipText+"Okay";
                }else if(correctness == Rating.correctness.BAD) {
                        circle.style.color = "#FF7F00";
                        circle.style.background = "#FF7F00";
                        tooltipText = tooltipText+"Bad";
                }
                
                var tooltip = document.createElement('span');
                tooltip.innerHTML = tooltipText;
                tooltip.style.visibility = "hidden";
                tooltip.style.width = "180px";
                tooltip.style.heigth = "14px";
                tooltip.style.color = "#FFFFFF";
                tooltip.style.textAlign = "center";
                tooltip.style.margin = "-5px 0px 0px 15px";
                tooltip.style.borderRadius = "6px";
                tooltip.style.background = "#696969";
                tooltip.style.position = "absolute";
                tooltip.style.zIndex = "1";
                tooltip.style.opacity = "0";
                tooltip.style.transition = "opacity 1s";
                
                circle.appendChild(tooltip);
                circle.onmouseover = function(){tooltip.style.visibility = "visible"; tooltip.style.opacity = "1";};
                circle.onmouseout = function(){tooltip.style.visibility = "hidden"; tooltip.style.opacity = "0";};
                
                estimationInfo.appendChild(circle);
                
                return estimationInfo;
        };
        
        this.getNotFoundRating = function(source, ratingRange, id) {
        /* Default rating for ratings that haven't been found */
                return this.buildRating('X', source, '0', ratingRange, Rating.correctness.LOW, id);
        };
        
        this.getNotYetRating = function(source, ratingRange, correctness, id) {
        /* Default rating for movies that have been found, but aren't released yet */
                return this.buildRating('-', source, '0', ratingRange, correctness, id);
        };
        
        this.getErrorRating = function(source, ratingRange, id) {
        /* Default rating for faulty requests */
                return this.buildRating('E', source, '0', ratingRange, Rating.correctness.LOW, id);
        };
        
        this.wrapRatingWithLink = function(rating, movieURL) {
        /* Wrap the MP rating structure in a link to the ratings website */
                var linkedRating = document.createElement('a');
                linkedRating.appendChild(rating);
                linkedRating.title = movieURL;
                linkedRating.href = movieURL;
                return linkedRating;
        };
}

function Refinery() {
/* Collection of methods to refine several types of character sequences */
        
        var pattern = [];
        
        function addPattern(searchValue, newValue) {
                var regExp = new RegExp(searchValue, "g");
                pattern.push({searchValue, newValue, regExp});
        }
        addPattern("%E2%80%93",'-');
        addPattern("%25E2%2580%2593",'–');
        addPattern("%3C",'<');
        addPattern("%3E",'>');
        addPattern("%22",'"');
        addPattern("%20",' ');
        addPattern("&#x27;","'");
        addPattern("&#39;","'");
        
        addPattern("%C3%84","Ä"); //%C4|&Auml;|&#196;|
        addPattern("%C3%A4","ä"); //%E4|&auml;|&#228;|
        addPattern("%C3%96","Ö"); //%D6|&Ouml;|&#214;|
        addPattern("%C3%B6","ö"); //%F6|&ouml;|&#246;|
        addPattern("%C3%9C","Ü"); //%DC|&Uuml;|&#220;|
        addPattern("%C3%BC","ü"); //%FC|&uuml;|&#252;|
        
        addPattern("%C3%81","Á");
        addPattern("%C3%A1","á");
        addPattern("%C3%89","É");
        addPattern("%C3%A9","é");
        addPattern("%C3%8D","Í");
        addPattern("%C3%AD","í");
        addPattern("%C3%93","Ó");
        addPattern("%C3%B3","ó");
        addPattern("%C3%9A","Ú");
        addPattern("%C3%BA","ú");
        
        this.refineTitle = function(title) {
        /* Refine movie titles of MP */
                var refinedTitle = title.split("/ AT:")[0];  // Delete "AT" for "alternative titles"
                return refinedTitle;
        };
        
        this.refineString = function(string) {
        /* Refine strings */
                var refinedString = string;
                refinedString = this.refineHTML(refinedString);
                refinedString = refinedString.replace(/&amp;\s?/g, ''); //Delete encoded ampersand
                refinedString = refinedString.replace(/(\?|'|"|,|\(|\)|\.|&|-|–|—)/g, ''); // Delete unwanted characters
                refinedString = refinedString.replace(/(:)/g, ' ');
                refinedString = this.trimWhitespaces(refinedString);
                return refinedString;
        };
        
        this.trimWhitespaces = function(string) {
                var refinedString = string;
                refinedString = refinedString.replace(/\s\s+/g, ' ');
                refinedString = refinedString.replace(/(^\s+|\s+$)/g, ''); //Delete Whitespace at the beginning/end
                return refinedString;
        };
        
        this.refineRating = function(rating) {
        /* Refine/standardize ratings */
                var refinedRating = rating.replace(/,/,".");
                refinedRating = this.trimWhitespaces(refinedRating);
                refinedRating = refinedRating.split("/")[0];
                
                if(refinedRating.match(/\d\.?\d?\d?/)) {
                        return refinedRating;
                } else {
                        return '-';
                }
        };
        
        this.refineRatingCount = function(ratingCount) {
        /* Refine/standardize view counter */
                var refinedRatingCount = ratingCount.replace(/(\.|,)/g,"");
                refinedRatingCount = this.trimWhitespaces(refinedRatingCount);
                if(refinedRatingCount.match(/^\d+$/)) {
                        return refinedRatingCount;
                } else {
                        return "0";
                }
        };
        
        this.refineHTML = function(html) {
        /* Refine HTML / edit encoded HTML */
                var refinedHTML = encodeURI(html); //force uniform HTML
                refinedHTML = this.decode(refinedHTML); //use uniformed HTML to replace certain patterns (unicode/UTF-8/...) with known characters
                refinedHTML = refinedHTML.replace(/%(\d|[ABCDEF])(\d|[ABCDEF])/g,""); //delete all other possible patterns
                return refinedHTML;
        };
        
        this.encode = function(string) {
        /* translate known characters to patterns (unicode/UTF-8/...)  */
                var encodedString = string;
                for(var i = 0; i < pattern.length; i++) {
                        encodedString = encodedString.replace(pattern[i].newValue, pattern[i].searchValue);
                }
                return encodedString;
        };
        
        this.decode = function(string) {
        /* translate patterns (unicode/UTF-8/...) to known characters */
                var decodedString = string;
                for(var i = 0; i < pattern.length; i++) {
                        decodedString = decodedString.replace(pattern[i].regExp, pattern[i].newValue);
                }
                return decodedString;
        };
        
        return this;
}

//-----LOCALSTORAGE-ADAPTER------------
/* To store some binary information */

function getInfoFromLocalStorage(info) {
        if(typeof(Storage) !== "undefined") {
                var result = localStorage.getItem(info);
                        if(result === null) {  // not initialized
                        initializeLocalStorageFor(info);
                        return true;
                } else if (result == 'true') {
                        return true;
                } else {
                        return false;
                }
        } else {  //  no local storage support, default values are used
                return true;
        }
}

function setInfoInLocalStorage(info, value){
        if(typeof(Storage) !== "undefined") {
        localStorage.setItem(info, value.toString());
        }
}

function initializeLocalStorageFor(info) {
        setInfoInLocalStorage(info, true);
}
//-----/LOCALSTORAGE-ADAPTER-----------
