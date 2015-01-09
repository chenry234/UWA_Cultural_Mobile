/*
 * Tests to see if HTML5 local storage is supported on this browser (should always be)
 */


function notifyApp() {
    if(typeof androidAppProxy !== "undefined"){
        androidAppProxy.showMessage("Message from JavaScript");
    } else {
        alert("Running outside Android app");
    }
}

function supports_localstorage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

/*
 * returns the value of a key in the localStorage
 */
function getLocalStorageValue(key) {
    var value = localStorage[key];
    return value;
}

/*
 * Returns the size of an object
 */
function size (obj) {
    if (!obj) {
        return 0;
    }
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}


/*
 * Show the dropdown content when the title/opening part in touched
 */
function showContent(clicked, content, image) {
    $("#"+content).show();
    document.getElementById(clicked).onclick = function () {hideContent(clicked, content, image)};
    document.getElementById(image).src = "images/open.png";
}

/*
 * Hides the dropdown content when the title/opening part in touched
 */
function hideContent(clicked, content, image) {
    $("#"+content).hide();
    document.getElementById(clicked).onclick = function () {showContent(clicked, content, image)};
    document.getElementById(image).src = "images/close.png";
}

/*
 * Decides which css document is to be used based on the type of device
 * running the app.
 */
function selectCSS() {
    var agent = navigator.userAgent;
    if (agent.indexOf('iPad') != -1) {
        loadcss('css/ipad.css');
    } else if (agent.indexOf('iPhone') != -1) {
        loadcss('css/iphone.css');
    } else {
        loadcss('css/iphone.css');
    }
}

function isiPad() {
    var agent = navigator.userAgent;
    if (agent.indexOf('iPad') != -1) {
        return true;
    }

    return false;
}


function getMyID() {
    if (!localStorage['myID']) {
        localStorage['myID'] = generateUUID();
    }

    return localStorage["myID"];
}

function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

/*
 * Takes an argument in form YYYY/MM/DD an converts it to a fromat like 1st September 2014
 */
function getDateTimeString(date) {


    var months = ["January", "February", "March", "April", 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    var dateString = '';

    var year = date.substring(0,4);
    var month = months[parseInt(date.substring(5,7)) - 1];
    var day = date.substring(8,10);
    var hour = date.substring(11,13);
    var minute = date.substring(14,16);

    var dayInt = parseInt(day);
    if (dayInt == 1) {
        dateString = "1st ";
    } else if (dayInt == 2) {
        dateString = "2nd ";
    } else if (dayInt == 3) {
        dateString = "3rd ";
    } else {
        dateString = day + "th ";
    }


    dateString += " " + month + " " + year + " " + hour + ":" + minute;

    return dateString;
}


/*
 * Inserts the css document into the htl page.
 */
function loadcss(filename) {
    var fileref=document.createElement('link');
    fileref.setAttribute("rel","stylesheet");
    fileref.setAttribute("type","text/css");
    fileref.setAttribute("href", filename);
    document.getElementsByTagName("head")[0].appendChild(fileref);
}

/*
 * A funtion to be set as a checkbox's onchange function. It sets the corresponding
 * value in the localstorage to either yes or no.
 */
function checkboxChanged(id) {
    var checkbox = document.getElementById(id);
    if (checkbox.checked) {
        localStorage[id] = "yes";
    } else {
        localStorage[id] = "no";
    }
}


function whichHomePage() {
    if (!localStorage["homePage"] || localStorage["homePage"] == "HPUWA") {
        return "HPUWA";
    }

    return localStorage["homePage"];
}


function selectHomePage() {
    if (whichHomePage() == "HPUWA") {
        if (window.location.pathname.indexOf("home") < 0) {
            window.location.replace("home.html");
        }
    } else if (whichHomePage() == "HPAspire") {
        window.location.replace("aspire.html");
    } else if (whichHomePage() == "HPFairway") {
        window.location.replace("fairway.html")
    }

}

/*
 * A function called if the user is on (or near) the UWA Crawley campus. Sets the
 * local content link on the home page to UWA with it's link.
 */
function atUWA() {
    var link = document.getElementById("region-page");
    link.href = "";
    link.innerHTML = "UWA";
}

/*
 * opens the link with window.open() after adding the id of the link element that
 * was clicked to the list of visited links in the local storage if it is not
 * already in there.
 */
function openLink(link, id) {
    if (!localStorage["visitedLinks"]) {
        localStorage["visitedLinks"] = id;
    } else if (localStorage["visitedLinks"].indexOf(id) == -1) {
        localStorage["visitedLinks"] += ","+id;
    }

    document.getElementById(id).className += " visited";

    window.open(link, '_self');
}


/*
 * Checks the list of visited links for any that are on the current page. If any
 * are found adds the class 'visited' to the link element
 */
function checkForVisitedLinks() {
    if (localStorage["visitedLinks"]) {
        var linkIds = localStorage["visitedLinks"].split(",");
        for (var i = 0; i < linkIds.length; i++) {
            if (document.getElementById(linkIds[i])) {
                document.getElementById(linkIds[i]).className += " visited";

            }
        }
    }
}


/***************************************************************************
 Bookmark and Favourite functions
 ***************************************************************************/

/*
 * Adds the page to the favourites menu (via the localstorage)
 */
function addToFavourites(page) {
    if (supports_localstorage() && isFavourite(page) == "not-favourite") {
        if (localStorage["favourites"] == null || localStorage["favourites"] == "") {
            localStorage["favourites"] = page + ",";
        } else {
            var favs = localStorage["favourites"].split(",");
            localStorage["favourites"] = localStorage["favourites"] + page + ",";
        }
    } else {
        //alert("Favourites not supported on this browser :(");
    }
}


/*
 * Removes the given page from the favourites list
 */
function removeFromFavourites(page, id) {
    if (supports_localstorage) {
        var favourites = localStorage["favourites"].split(",");
        localStorage["favourites"] = "";
        for (i = 0; i < favourites.length; i++) {
            if (favourites[i] != page && favourites[i] != "") {
                localStorage["favourites"] = localStorage["favourites"] + favourites[i] + ",";
            }
        }

        if (id) {
            document.getElementById(id).innerHTML = "";
        }
    }
}


/*
 * Checks to see if a page is a favourite or not and changes the favourite icon accordingly
 */
function isFavourite(page) {
    if (supports_localstorage) {
        if (localStorage["favourites"]) {
            var favourites = localStorage["favourites"].split(",");
            for (i = 0; i < favourites.length; i++) {
                if (page == favourites[i]) {
                    return "favourite";
                }
            }
        }
        return "not-favourite";
    }
}

/*
 * Adds the page to the favourites menu (via the localstorage)
 */
function addToFavouritesExternal(page) {
    if (supports_localstorage()) {
        if (localStorage["favourites"] == null) {
            localStorage["favourites"] = page + ",";
        } else if (localStorage["favourites"].indexOf(page) == -1) {
            var favs = localStorage["favourites"].split(",");
            localStorage["favourites"] = localStorage["favourites"] + page + ",";
        }
    }
}


/*
 * Adds a list of links to all the bookmarked pages to the html element with
 * the given id.
 */
function addBookmarksToTagWithId(id) {
    if (supports_localstorage()) {
        if (localStorage["favourites"] != null || localStorage["favourites"] != "") {
            var favourites = localStorage["favourites"].split(",");
            var bookmarks = document.getElementById(id);
            for (i = 0; i < favourites.length; i++) {
                var item = favourites[i].split("~");
                if (item[1] != "" && item[1] != null) {
                    var link = document.createElement("div");
                    link.id = item[1];
                    if (item[0] == "") {
                        link.innerHTML = "<p ><a class=\"remove-bk\" onclick='removeFromFavourites(\""+favourites[i]+"\", \""+item[1]+"\");'>x</a>     <a onclick='window.open(\""+item[1]+"\");'>This page has no title</a></p>";
                    } else {
                        link.innerHTML = "<p ><a class=\"remove-bk\" onclick='removeFromFavourites(\""+favourites[i]+"\", \""+item[1]+"\");'>x</a>     <a onclick='window.open(\""+item[1]+"\");'>"+item[0]+"</a></p>";
                    }
                    bookmarks.appendChild(link);
                }
            }
        }
    }
}





/***************************************************************************
 Search Functions
 ***************************************************************************/

/*
 * Opens a search page for askUWA
 */
function searchAskUWA(questionField) {
    url = "http://www.ask.uwa.edu.au/app/answers/list/st/5/kw/" + document.getElementById(questionField).value.replace(/ /g, "%20");
    window.open(url, "_self");
}

/*
 * Opens a search page for askUWA
 */
function searchUWA(questionField) {
    url = "http://search.uwa.edu.au/search.html?site=search&hl=en&query=search&words=" + document.getElementById(questionField).value.replace(/ /g, "+");
    window.open(url, "_self");
}




/***************************************************************************
 Navigation Functions
 ***************************************************************************/

/*
 *Goes back one page just like in a bowser
 */
function goBack() {
    window.history.back();
}




/***************************************************************************
 YouTube Functions
 ***************************************************************************/

/*
 * gets a list of the playlists of a particular channel
 */
function getPlaylists() {
    $.ajax({
        url: 'https://www.googleapis.com/youtube/v3/playlists',
        type: 'GET',
        data: {part:'snippet', channelId:'UCykFBmzQsPXCyuiQUBHc2uA', key:'AIzaSyBhfbDWz0p_hbenbKiB-WM2yd0H3W-3nPo', maxResults:'50'},
        cache: false,
        success: function (data, textStatus, jqXHR) {
            var videoBox = document.getElementById("wrap");
            $.each( data["items"], function( i, item ) {
                var box = document.createElement("div");
                box.className = "playlist-view";
                box.innerHTML = "<div class='list-title' id='"+item["id"]+"title' onclick='showVideos(\""+item["id"]+"\");'><span class=\"expand\">"+item["snippet"]["title"]+"<img class=\"video-list-icon\" src='images/close.png' height='25' width='25' id='"+item["id"]+"image'></span></div><div id='"+item["id"]+"playlist'></div> ";
                videoBox.appendChild(box);
                showVideos(item["id"]);
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // alert("Failed youtube fetch " + errorThrown);
        }
    });
}


/*
 * gets a list of the videos in the given playlist
 */
function showVideos(playlistID) {
    $.ajax({
        url: 'https://www.googleapis.com/youtube/v3/playlistItems',
        type: 'GET',
        data: {part:'snippet', playlistId:playlistID, key:'AIzaSyBhfbDWz0p_hbenbKiB-WM2yd0H3W-3nPo', maxResults:'50'},
        cache: false,
        success: function (data, textStatus, jqXHR) {
            var location = document.getElementById(playlistID+"playlist");
            $.each( data["items"], function( i, item ) {
                var box = document.createElement("div");
                if (i == 5) {
                    var tmp = document.createElement("div");
                    tmp.id = playlistID+"MoreVideos";
                    location.appendChild(tmp);
                    location = tmp;
                    $("#"+playlistID+"MoreVideos").hide();
                }
                var title = removeLeadingUWA(item["snippet"]["title"]);
                box.className = "video-view";
                box.innerHTML = "<div class='video-thumbnail' onclick='openVideoPlayerPage(\""+item["snippet"]["resourceId"]["videoId"]+"\", \""+title+"\");'><img src='"+item["snippet"]["thumbnails"]["default"]["url"]+"'></div><div class='video-title'><p>"+title+"</p></div>";


                location.appendChild(box);
            });
            document.getElementById(playlistID + "image").src = "images/open.png";
            document.getElementById(playlistID + "title").onclick = function () {hideVideos(playlistID);
            };


            var showMore = document.createElement("p");
            showMore.onclick = function () {showMoreVideos(playlistID)};
            showMore.innerHTML = "Show All";
            showMore.id = playlistID+"showMore";
            showMore.className = "show-all-button";
            document.getElementById(playlistID+"playlist").appendChild(showMore);


        },
        error: function (jqXHR, textStatus, errorThrown) {
            // alert("Failed youtube fetch " + errorThrown);
        }
    });
}

/*
 * Removes a leading 'UWA ' from a string
 */
function removeLeadingUWA(string) {
    if (string.indexOf('UWA ') == 0) {
        return string.replace('UWA ', '');
    } else {
        return string;
    }
}

/*
 * Hides all the videos from view for the particular playlist
 */
function hideVideos(playlistID) {
    document.getElementById(playlistID + "image").src = "images/close.png"
    document.getElementById(playlistID + "title").onclick = function () {unhideVideos(playlistID)};
    $("#"+playlistID+"playlist").hide();
}

/*
 * Reveals all the videos from view for the particular playlist
 */
function unhideVideos(playlistID) {
    document.getElementById(playlistID + "image").src = "images/open.png";
    document.getElementById(playlistID + "title").onclick = function () {hideVideos(playlistID)};
    $("#"+playlistID+"playlist").show();
}

/*
 * Reveals all the videos in a playlist that were previously hidden. Called from
 * the videos page.
 */
function showMoreVideos(playlistID) {
    $("#"+playlistID+"MoreVideos").show();
    var showMore = document.getElementById(playlistID+"showMore");
    showMore.onclick = function () {showLessVideos(playlistID)};
    showMore.innerHTML = "Show Less";
}

/*
 * Hides all but the frst 5 videos in a given playlist.
 */
function showLessVideos(playlistID) {
    $("#"+playlistID+"MoreVideos").hide();
    var showMore = document.getElementById(playlistID+"showMore");
    showMore.onclick = function () {showMoreVideos(playlistID)};
    showMore.innerHTML = "Show All";
}

/*
 * Searches the UWAStudent channel for videos with the give keyword(s)
 */
function searchForVideos(searchString) {
    $.ajax({
        url: 'https://www.googleapis.com/youtube/v3/search',
        type: 'GET',
        data: {part:'snippet', channelId:'UCykFBmzQsPXCyuiQUBHc2uA', q:searchString, maxResults:15, key:'AIzaSyBhfbDWz0p_hbenbKiB-WM2yd0H3W-3nPo'},
        cache: false,
        success: function (data, textStatus, jqXHR) {
            var location = document.getElementById("wrap");
            location.innerHTML = "";



            $.each( data["items"], function( i, item ) {
                if (item["id"]["kind"] == "youtube#video") {


                    var box = document.createElement("div");
                    box.className = "playlist-view";
                    box.innerHTML = "<div class='list-title' id='"+item["id"]+"item['snippet']['title'] onclick=''><span class=\"expand\">"+item["snippet"]["title"]+"<img class=\"video-list-icon\" src='images/close.png' height='25' width='25' id='"+item["id"]+"image'></span></div><div class='video-thumbnail-first' onclick='openVideoPlayerPage(\""+item["id"]["videoId"]+"\", \""+item["snippet"]["title"]+"\");'><img src='"+item["snippet"]["thumbnails"]["default"]["url"]+"'></div><div class='video-title-first'><br\><p>"+item["snippet"]["description"]+"</p></div>";
                    // box.innerHTML = "<div class='list-title' id='"+item["id"]+"title' onclick='showVideos(\""+item["id"]+"\");'><span class=\"expand\">"+item["snippet"]["title"]+"<img class=\"video-list-icon\" src='images/close.png' height='25' width='25' id='"+item["id"]+"image'></span></div><div id='"+item["id"]+"playlist'></div> ";
                    location.appendChild(box);
                    // showVideos(item["id"]);

                    //var box = document.createElement("div");
                    // box.className = "playlist-view";
                    // box.innerHTML = "<div class='video-thumbnail-first' onclick='openVideoPlayerPage(\""+item["id"]["videoId"]+"\", \""+item["snippet"]["title"]+"\");'><img src='"+item["snippet"]["thumbnails"]["default"]["url"]+"'></div><div class='video-title-first'><h2>"+item["snippet"]["title"]+"</h2><p>"+item["snippet"]["description"]+"</p></div>";
                    //location.appendChild(box);
                }

            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // alert("Failed youtube fetch " + errorThrown);
        }
    });
}

/*
 * Opens the youtube video in a separate page
 */
function openVideoPlayerPage(id, title) {
    window.open("videoplayer.html?id="+id+"&title="+title, "_self");
}

/*
 * Called when videoplayer.html loads with arguments taken from the query string.
 * Adds html to the page and requests the description from youtube.
 */
function playVideo(videoId, title) {
    $.ajax({
        url: 'https://www.googleapis.com/youtube/v3/videos',
        type: 'GET',
        data: {part:'snippet', id:videoId, key:'AIzaSyBhfbDWz0p_hbenbKiB-WM2yd0H3W-3nPo'},
        cache: false,
        success: function (data, textStatus, jqXHR) {
            var videoBox = document.getElementById("wrap");
            document.getElementById("enlarged-image").innerHTML = "<div style='margin-bottom: 10px'><iframe width='100%' height='300px' src='http://www.youtube.com/embed/"+videoId+"'></iframe></div><div><p>"+title+"</p><p>"+data["items"][0]["snippet"]["description"]+"</p></div>";
        },
        error: function (jqXHR, textStatus, errorThrown) {
            document.getElementById("enlarged-image").innerHTML = "<div style='margin-bottom: 10px'><iframe width='100%' height='300px' src='http://www.youtube.com/embed/"+videoId+"'></iframe></div><div><p>"+title+"</p></div>";
        }
    });

}



/***************************************************************************
 Android Only functions
 ***************************************************************************/

/*
 * Should send the users device id and details to the notification server.
 * Doesn't work yet.
 */
function sendGCMKey(gcmKey) {
    $.ajax({
        url: 'http://notifications.csp.uwa.edu.au/register/',
        type: 'POST',
        data: {registration_id:gcmKey, device_type:'GCM', password:'12345nick', school: localStorage['school'], region:getLocationFromSchool(localStorage['school']), parent:localStorage['isParent'], student:localStorage['isStudent'], teacher:localStorage['isTeacher'], fairway:localStorage['isFairway'], aspire:localStorage['isAspire']
        },
        cache: false,
        success: function (data, textStatus, jqXHR) {alert(textStatus)},
        //   error: function (jqXHR, textStatus, errorThrown) {alert(textStatus+" ~ "+errorThrown)}
    });

}


/***************************************************************************
 Other functions
 ***************************************************************************/

/*
 * returns the value of the key inside the page's query string
 */
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[");
    name = name.replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


// Create Menu in different contexts

function initMenu(topic, page) {
    if (topic == "All") {

        $("#headerText").innerText = page;

        $("#divhome").show();

        $("#divabout").show();
        $("#divabout").attr("onclick","window.open('about.html', '_self')");

        $("#divvenues").show();
        $("#divvenues").attr("onclick","window.open('venues.html', '_self')");

        $("#divexhibitions").show();
        $("#divexhibitions").attr("onclick","window.open('exhibitions.html', '_self')");

        $("#divevents").show();
        $("#divevents").attr("onclick","window.open('events.html', '_self')");

        $("#divgallery").show();
        $("#divgallery").attr("onclick","window.open('gallery.html', '_self')");

        $("#divvideo").show();
        $("#divvideo").attr("onclick","window.open('video.html', '_self')");

    } else {
        // $("#headerText").html(topic + " " + page);

        $("#divhome").show();

        $("#divvenues").hide();

        $("#divexhibitions").hide();

        $("#divevents").show();
        $("#divevents").attr("onclick","window.open('events.html?Topic=" + topic + "', '_self')");

        $("#divsocial").show();
        $("#divsocial").attr("onclick","window.open('social.html?Topic=" + topic + "', '_self')");

        $("#divvideo").show();
        $("#divvideo").attr("onclick","window.open('video.html?Topic=" + topic + "', '_self')");


    }
}