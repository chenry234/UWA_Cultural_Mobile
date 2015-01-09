function render_tweets(data) {

    $.each(data, function (id, item) {
        var template = $.templates("#tweetTemplate");

        var image_url = '';

        if (item.retweeted) {
            if (item.retweeted_status.entities.hasOwnProperty("media")) {
                image_url = item.retweeted_status.entities.media[0].media_url;
            }
        } else if (item.entities.hasOwnProperty("media")) {
            image_url = item.entities.media[0].media_url;
        }

        var response = {
            "text": item.text,
            "image": image_url
        };

        var htmlOutput = template.render(response);

        $("#tweets").append(htmlOutput);
    });
}


/*
 * retrieves and saves the information about the blogs in the local storage from blogger
 */
function saveTweets() {

    cb.__call(
        "statuses_userTimeline",
        {
            user_id: "@david_glance"
        },
        function (reply) {

            localStorage["twitterData"] = JSON.stringify(reply);

            render_tweets(reply);

        }
    );

}

var timeout = 100;
/*
 * adds the blog summaries into the blog page.
 */
function loadTweets() {


    if (localStorage["twitterData"]) {

        var tweets = document.getElementById("tweets");

        if (!tweets) {
            return;
        }

        var twitter_data = $.parseJSON(localStorage["twitterData"]);

        render_tweets(twitter_data);
    }
}
