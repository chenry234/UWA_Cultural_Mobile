/* JavaScript for http://uwa.edu.au/campus-map.
 * Replacement for the old gmap2.js, which used the deprecated
 * Maps API v2; this one uses v3.
 *
 * Still depends on the PHP from the old gmap_new project.
 *
 * Author: Scott Young (11 Dec 2013)
 * */


function initialize() {
    var spinner = new Spinner().spin();

    $("#spindiv").append(spinner.el);

    campusMap.init();

   spinner.stop();
}

google.maps.event.addDomListener(window, 'load', initialize);

// Create a namespace for campus map data.
campusMap = {
    markers: [],
    positionMarkers: [],
    infoWindows: [],
    index_url: 'xml/',
    clearMarkers: function(markerList) {
        markerList = markerList || campusMap.markers;
        $(markerList).each(function() {
            this.setMap(null);
        }); markerList.length = 0;
    }
};


// points of interest weigh ~80kb uncompressed; this wrapper function lets us
// load and cache them on demand
var withPoi = function(func) {
    if (campusMap.poi === undefined) {
        $.getJSON('xml/mappoints.json', function(data) {
            campusMap.poi = data
            func()
        });
    } else {
        func();
    }
};

// these will be passed into $.fn by campusMap.init
campusMap.plugins = {

    // convert an XML tag from search results to a simple map
    xmlToMap: function() {
        var params = {}
        var xmlTag = $(this);
        $(['name', 'lat', 'lng', 'id']).each(function() {
            params[this] = xmlTag.attr(this);
        });
        return params;
    },

    // add a marker to the map based on data-* attributes
    addMarker: function() {
        // window.scrollTo(0,100); // scroll back up near top of page
        $('#maptabs a:first').tab('show');
        var params = this.data();
        var pos = new google.maps.LatLng(params.lat, params.lng);
        var marker = new google.maps.Marker({
            position: pos, title: params.name, map: campusMap.map,
            animation: google.maps.Animation.DROP,
            optimized: false,
            color: '#00f'
        });
        // keep track of it for later removal
        this.data('marker', marker);
        campusMap.markers.push(marker);
        return this;
    },

    // centre marker and add InfoWindow associated with <li>
    addInfoWindow: function() {
        var params = $(this).data();

        // clear existing info windows
        $(campusMap.infoWindows).each(function() {
            this.close();
        }); campusMap.infoWindows.length = 0;

        // pan into view
        campusMap.map.panTo(params.marker.position);
        // add infoWindow
        var infoWindow = new google.maps.InfoWindow({
            content: '<div class="iw" id="ginfowindow">' + params.name +  '</div>'
        });
        infoWindow.open(campusMap.map, params.marker);
        // keep track of it for later removal
        campusMap.infoWindows.push(infoWindow);


        return this;
    },



    // render <marker> tags from category list
    renderIndexCategories: function() {
        this.each(function() {
            var params = $(this).xmlToMap();
            //aHeader = $('<li/>').addClass('category')
            //    .text(params.name).appendTo('#index ul').wrapInner('<a>');
            addSubCategories(params.name);
        });
    }

}; // end plugins



function errorCallback() {}

function updateMyLocation(lat, long) {
    // var myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var myLatLng = new google.maps.LatLng(lat, long);


    var posMarker = new google.maps.Marker({position:myLatLng,
        map:campusMap.map,
        optimized: false,
        icon:'icons/bluedot.png',
        zIndex:5});

    if (posMarker != null) {
        campusMap.clearMarkers(campusMap.positionMarkers);
        campusMap.positionMarkers.push(posMarker)
    }

}

function createControl(controlDiv, map, label, location)
{
    controlDiv.style.padding = '5px';
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = 'white';
    controlUI.style.border='1px solid';
    controlUI.style.cursor = 'pointer';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Set map to London';
    controlDiv.appendChild(controlUI);
    var controlText = document.createElement('div');
    controlText.style.fontFamily='Arial,sans-serif';
    controlText.style.fontSize='12px';
    controlText.style.paddingLeft = '4px';
    controlText.style.paddingRight = '4px';
    controlText.innerHTML = '<b>' + label + '<b>'
    controlUI.appendChild(controlText);

    if (label == "My Location") {
        // Setup click-event listener: simply set the map to London
        google.maps.event.addDomListener(controlUI, 'click', function() {
            map.setCenter(campusMap.positionMarkers[0].getPosition());
        });

    } else {
        // Setup click-event listener: simply set the map to London
        google.maps.event.addDomListener(controlUI, 'click', function() {
            map.setCenter(location);
        });
    }

}


// expand category when clicked in index
// $('#index').on('click', '.category > a', function() {
function addSubCategories(category) {
    // close any other categories
    var justToggling = $(this).siblings('ul').length === 1;
    // $('#index .active').removeClass('active');
    // $('#index ul ul').slideUp(function(){$(this).remove()});
    // if (justToggling) return;

    // load sublist
    var $cat = $(this).parent().addClass('active');
    // var $list = $('<ul/>').appendTo($cat).hide();
    // var $list = $('<ul/>').appendTo(category);


    $.ajax({
        url: campusMap.index_url + category.replace(/ /g,'').toLowerCase() + '.xml',
        type: 'GET',
        dataType: 'text',
        success: function(data) {
            // Category results MUST NOT be manually parsed with $.parseXML.

            $('location', data).each(function() {
                var params = $(this).xmlToMap();
                $('<li class="result category ui-screen-hidden" />')
                    .text(params.name).data(params).appendTo('#index ul').wrapInner('<a href="#" class="ui-btn ui-btn-icon-right ui-icon-carat-r">');

                // $('<li class="result" />').text(params.name)
                //    .data(params).appendTo($list).wrapInner('<a>');
            });
            // $list.slideDown();
        },
        error: function(data) {
            alert('woops!'); //or whatever
            setTimeout(function(){alert('got dta' + data);},200);
        }
    });
};


campusMap.init = function() {


    // load jQuery plugins
    $.fn.extend(campusMap.plugins);

    var width = $( window ).width();
    var height = $( window ).height() - 260;

    $("#map_canvas").width(width - 37);

    if (isiPad()) {
        $("#map_canvas").height(height);
    } else {
        $("#map_canvas").height(height);
    }


    // start a map centred on UWA
    var latlng = new google.maps.LatLng(-31.980997,115.818000);
    campusMap.map = new google.maps.Map($('#map_canvas')[0], {
        zoom: 16,
        center: latlng,
        streetViewControl: false,
        mapTypeControl: false
    });


    var myLocControlDiv = document.createElement('div');
    var myLocControl = new createControl(myLocControlDiv, campusMap.map, 'My Location', null);
    campusMap.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(myLocControlDiv);


    var homeControlDiv = document.createElement('div');
    var homeControl = new createControl(homeControlDiv, campusMap.map, 'UWA', latlng);
    campusMap.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(homeControlDiv);


    // build index
    $.get(campusMap.index_url + 'categories.xml', function(data) {
        // Category results MUST NOT be manually parsed with $.parseXML.
        $('category', data).renderIndexCategories();
    });


    // mark location when clicked in search results or index
    $('#results, #index').on('click', '.result a', function() {
        campusMap.clearMarkers();
        $(this).parent().addMarker().addInfoWindow();

        var millisecondsToWait = 200;
        setTimeout(function () {
            google.maps.event.trigger(campusMap.map, 'resize');
            google.maps.event.trigger($('#map_canvas'), 'resize');
        }, millisecondsToWait);
    });


    // add accessibility features from JSON

    $('input[type="checkbox"]').change("click", function() {
    // $('#poi > label').on('vclick', function(event) {
        var category = $(this).val();
        var checked = $(this).prop('checked');
        var iconUrl = 'icons/' + category + '.png';
        withPoi(function() {
            var points = campusMap.poi[category];
            points['_markers'] = points['_markers'] || [];
            if (checked) {
                $.each(points, function() {
                    var latlng = new google.maps.LatLng(this.lat, this.lng);
                    var mkr = new google.maps.Marker({
                        position: latlng,
                        icon: iconUrl,
                        optimized: false,
                        map: campusMap.map
                    });
                    points['_markers'].push(mkr);
                });
            } else {
                campusMap.clearMarkers(points['_markers']);
            }
        });
    });



    // rightcol h3s can be used to toggle next div
    $('#poi h3')
        .click(function() {
            $(this).next().slideToggle();
        })
        .wrapInner('<a style="cursor: pointer;">')
        .append('&#x25BC;')
        .next().hide();

} // end init