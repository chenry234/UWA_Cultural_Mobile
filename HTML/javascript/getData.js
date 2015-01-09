/***************************************************************************
 Blog Functions
 ***************************************************************************/


/*
    Henry's functions
*/



/*
 * retrieves and saves the information about the blogs in the local storage from blogger
 */
function saveBlogPosts(label) {

    var dataStr = {};
    //if (label == 'All') {
    //    dataStr = {'key':'AIzaSyBhfbDWz0p_hbenbKiB-WM2yd0H3W-3nPo'};
    //} else {
        dataStr = {'key':'AIzaSyBhfbDWz0p_hbenbKiB-WM2yd0H3W-3nPo', 'labels': label};
    //}

    var j = 0;




    $.ajax({
        url: 'https://www.googleapis.com/blogger/v3/blogs/1016693928356849717/posts',
        type: 'GET',
        data: dataStr,
        cache: false,
        success: function (data, textStatus, jqXHR) {
            var blogData = {};
            $.each( data["items"], function( i, item ) {
                blogData[j] = {
                    "id":item["id"],
                    "title": item["title"],
                    "content": getContent(item["content"]),
                    "summary": getString(item["content"], "Summary:"),
                    "image": getString(item["content"], "Image:")
                };

                j++;
            });

            localStorage["blogData"+label] = JSON.stringify(blogData);


            loadBlogSummaries(label);

            var number = numberUnread();
            if (number>0) {
                // document.getElementById("news&dates").innerHTML = "News & Dates ("+number+")";
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {

            var blog = document.getElementById("blog");
            if (blog) {
                var entry = document.createElement("div");
                entry.className = "news-item-cont";
                entry.innerHTML = "<p>No news articles found.</p>";
                blog.appendChild(entry);
            }
        }
    });

}

var timeout = 100;
/*
 * adds the blog summaries into the blog page.
 */
function loadBlogSummaries(label) {


    if (localStorage["blogData"+label]) {

        var blog = document.getElementById("blog");

        if (!blog) {
            return;
        }

        var blogs = $.parseJSON(localStorage["blogData"+label]);
        $.each(blogs, function( id, item ) {
            var entry = document.createElement("div");
            entry.className = "news-item-cont tweet-container";
            entry.innerHTML = "<div class=\"news-image tweet-container \" style='background: url("+item["image"]+") 50% 50%;background-size:100%'><div class=\"news-info\"><h2>"+item["title"]+"</h2></div></div><p>"+item["summary"]+"</p><div class='read-more'><a href=\"news-item.html?id="+id+"&Topic="+label+"\">Read more</a></div>";
            blog.appendChild(entry);
        });
    } else {
        timeout += timeout;
        setTimeout(function(){saveBlogPosts(label);},timeout);
    }
}

/*
 * Sets up the blog item page with all the content for a single blog post.
 */
function loadBlogPost(id, label) {
    var blog = $.parseJSON(localStorage["blogData"+label]);
    if (blog[id]) {

        document.getElementById("blog").innerHTML = "<div class=\"news-image\" style='background: url("+blog[id]["image"]+") 50% 50%;background-size:100%'><a></a><div class=\"news-info\"><h2>"+blog[id]["title"]+"</h2></div></div><p>"+blog[id]["content"]+"</p></div>";

        blogRead(blog[id], "readBlogs"+label);
    }

}

/*
 * Returns the number of unread blog posts
 */
function numberUnread() {
    var totalPosts =  0;
    if (localStorage["blogDataStudent"] && localStorage["isStudent"]=="yes") {
        totalPosts += size($.parseJSON(localStorage["blogDataStudent"]))
    }
    if (localStorage["blogDataTeacher"] && localStorage["isTeacher"]=="yes") {
        totalPosts += size($.parseJSON(localStorage["blogDataTeacher"]))
    }
    if (localStorage["blogDataParent"] && localStorage["isParent"]=="yes") {
        totalPosts += size($.parseJSON(localStorage["blogDataParent"]))
    }

    var totalRead = 0;
    var read = localStorage["readBlogsStudent"];
    if (read) {
        totalRead += read.split(",").length;
    }
    read = localStorage["readBlogsParent"];
    if (read) {
        totalRead += read.split(",").length;
    }
    read = localStorage["readBlogsTeacher"];
    if (read) {
        totalRead += read.split(",").length;
    }

    return totalPosts-totalRead;

}


/*
 * Marks the blog post as read
 */
function blogRead(id, location) {
    if (supports_localstorage()) {
        if (!blogIsRead(id, location)) {
            if (localStorage[location] == null || localStorage[location] == "") {
                localStorage[location] = id
            } else {
                localStorage[location] += "," + id;
            }
        }
    }
}


/*
 * checks o see if a blog post has been read
 */
function blogIsRead(id, location) {
    if (supports_localstorage()) {
        if (localStorage[location] == null || localStorage[location] == "") {
            return false;
        } else {
            if (localStorage[location].indexOf(id) >= 0) {
                return true;
            }
            return false;
        }
    }
}



/***************************************************************************
 Event Functions
 ***************************************************************************/

/*
 * Gets the events from Blogger and then displys them in a (div) with id blog
 */
function loadAll(category) {

   // if (label == 'All') {
   //     dataStr = {'key':'AIzaSyBhfbDWz0p_hbenbKiB-WM2yd0H3W-3nPo'};
   // } else {
   // }

    $.ajax({
        url: 'http://localhost:8080/json',
        type: 'GET',
        cache: false,
        success: function (data, textStatus, jqXHR) {
            saveData(data, category);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            loadEventSummaries(label);
        }
    });

}

// function getContent(data) {
//     var ptr = data.indexOf("Content:");
//     var content = data.substring(ptr + 15, data.length);
//     return content;
// }

// function getString(data, key) {
//     var ptr = data.indexOf(key);
//     var first = data.indexOf("{", ptr);
//     var last = data.indexOf("}", ptr);
//     var item = data.substring(first + 1, last);
//     return item;
// }


/*
 * returns an array of the event ids in chornological order
 */
function sortEvents(a, b) {

    if (a["date"] == b["date"] && a["time"] == b["time"]) {
        return 0;
    }

    if ((a["date"] > b["date"]) ||
        (a["date"] == b["date"] && a["time"] > b["time"])) {
        return 1;
    } else {
        return -1;
    }
}



/*
 * Saves the information about the blogs in the local storage from blogger
 */
function saveData(data, category) {
    switch(category) {
        case 'event':
            var eventData = [];

            var j = 0;

            $.each(data["events"], function(i,event) {
                var changeImage = "http://localhost:8080".concat(event.imageName);
                if (event.location === null) {
                    event.location = "Unknown"
                }

                eventData[j] = {
                    "id": event["id"],
                    "title":event["title"],
                    "details":event["details"],
                    "startDate": event["startDate"],
                    "endDate": event["endDate"],
                    "imageName":changeImage,
                    "location": event["location"],
                    "event_type": event["event_type"],
                    "duration" : event["duration"]
                };

                j++;
            });

            localStorage["eventData"] = JSON.stringify(eventData);
            break;

        case 'artist':
            var artistData = [];

            var j = 0;

            $.each(data["Artists"], function(i,artist) {
                var changeImage = "http://localhost:8080".concat(artist.imageName);

                artistData[j] = {
                    "id": artist["id"],
                    "title":artist["title"],
                    "details":artist["details"],
                    "imageName":changeImage
                };

                j++;
            });
            localStorage["artistData"] = JSON.stringify(artistData);
            break;

        case 'exhibition':
            var exhibitionData = [];
            var j = 0;

            $.each(data["exhibitions"], function(i, exhibition) {
                var changeImage = "http://localhost:8080".concat(exhibition.imageName);

                exhibitionData[j] = {
                    "id": exhibition["id"],
                    "title" : exhibition["title"],
                    "details" : exhibition["details"],
                    "startDate" : exhibition["startDate"],
                    "endDate" : exhibition["endDate"],
                    "imageName" : changeImage
                };
                j++;
            });
            localStorage["exhibitionData"] = JSON.stringify(exhibitionData);
            break;

    }
        
}



/*
 * Puts the summary of the events into a div with id "event"+label
 */
// function loadEventSummaries(label) {

//     if (localStorage["eventData"+label]) {


//         var event = document.getElementById("event");

//         if (!event) {
//             return;
//         }

//         var events = $.parseJSON(localStorage["eventData"+label]);

//         $.each(events, function( id, item ) {
//             // setTimeout(function(){alert('in event loop' + i);},200);
//             var entry = document.createElement("div");
//             entry.className = "news-item-cont event tweet-container";
//             entry.innerHTML = "<div class=\"news-image tweet-container\" style='background: url("+ item["image"]+") 50% 50%;background-size:100%'><div class=\"event-info\"><h2>" + item["title"]+"</h2><h3>" +
//                 getDateString(item["date"])+" " + item["location"]+"</h3></div></div><p>" + item["summary"]+"</p><div class='read-more'><a href=\"event-item.html?id="+id+"&Topic="+label+"\">Read more</a></div>";
//             event.appendChild(entry);
//         });
//     } else {
//         var entry = document.createElement("div");
//         entry.className = "news-item-cont event";
//         entry.innerHTML = "<p>No events found.</p>";
//         event.appendChild(entry);
//     }
// }


function fixDateAndTime(date) {
    var dateOrTime = date.split("T")
    var parts = dateOrTime[0].split("-");
    var months = ["January", "February", "March", "April", 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var dateString = months[parseInt(parts[1]) - 1] + " ";

    var day = parseInt(parts[2]);
        if (day %10 == 1) {
            dateString = dateString + parts[2] + "st ";
        } else if (day %10 == 2) {
            dateString = dateString + parts[2] + "nd ";
        } else if (day %10 == 3) {
            dateString = dateString + parts[2] + "rd ";
        } else {
            dateString = dateString + parts[2] +"th ";
        }
    
    dateString = dateString + " " + parts[0];

    var time = dateOrTime[1].replace(/:00.000Z/, "");
    var hourMinute = time.split(":");

    dateString = dateString + " " + time;

    if(parseInt(hourMinute[0]) > 11) {
           dateString = dateString + "PM"
        } else {
           dateString = dateString + "AM"
    }
    return dateString
}


/*
 * Takes an argument in form YYYY/MM/DD an converts it to a fromat like 1st September 2014
 */
// function getDateString(date) {
//     var parts = date.split("/");
//     if (parts.length == 3) {

//         numericDate = parts[2] + '/' + parts[1] + '/' + parts[0];

//         var months = ["January", "February", "March", "April", 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

//         var dateString = months[parseInt(parts[1])] + " " + parts[2];

//         var day = parseInt(parts[0]);
//         if (day == 1) {
//             dateString = "1st "+dateString;
//         } else if (day == 2) {
//             dateString = "2nd "+dateString;
//         } else if (day == 3) {
//             dateString = "3rd "+dateString;
//         } else {
//             dateString = parts[0]+"th "+dateString;
//         }

//         return numericDate;
//     }

//     return date;
// }


/*
 * Takes a time in 24 hrs and converts it to 12hr time
 */
function getTimeString(time) {
    var hour = parseInt(time.substr(0,1));
    var min = parseInt(time.substr(2,3));
    var timeString = "";
    if (hour < 12) {
        timeString = hour + ":" + min +"am";
    } else if (hour == 0) {
        timeString = "12:" + min +"am";
    } else {
        hour -= 12;
        timeString = hour + ":" + min +"pm";
    }
}

/*
 * returns true if the first event is before the second, otherwise returns false
 */
function isBefore(eventId1, eventId2, eventData) {
    var date1 = eventData[eventId1]["date"].split("/");
    var date2 = eventData[eventId2]["date"].spilt("/");
    if (parseInt(date1[0]) < parseInt(date2)) {
        return true;
    } else if (parseInt(date[1]) < parseInt(date2[1])) {
        return true;
    } else if (parseInt(date[2]) < parseInt(date2[2])) {
        return true;
    } else if (parseInt(eventData[eventId1]["time"]) < parseInt(eventData[eventId2]["time"])) {
        return true;
    }
    return false;
}

/*
 * puts the content of an event into the events-item page
 */




// function loadEvent(id) {
//     var blog = $.parseJSON(localStorage["eventDataAll"]);
//     if (blog[id]) {

//         document.getElementById("event").innerHTML = "<div class=\"news-image\" style='background: url("["image"]") 50% 50%;background-size:100%'><a></a><div class=\"event-info\"><h2>" +blog[id]["title"]+"</h2><h3>"+blog[id]["time"]+" "+blog[id]["date"]+" "+blog[id]["location"]+"</h3></div></div><p>"+blog[id]["content"]+"</p></div>";

//     }
// }

/*
 * loads the event summaries into a dropdown div tag
 */
function dropdownEvents(clicked, content, image, label) {
    getEvents(label);
    showContent(clicked, content, image);
}





