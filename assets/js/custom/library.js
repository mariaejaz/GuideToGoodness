var searchfor;
var pageToken;
var page;
var pageNum;
var pageSize = 10;
var audio;
var video;
var prevPageToken = '';
var nextPageToken = '';

var libraryUrl = 'http://' + window.location.host + window.location.pathname;


/**************************************/
/***            Video Api           ***/
/**************************************/


function setupSearchVideo(){

    gapi.load('client', function() {

        gapi.client.setApiKey('AIzaSyCFInI73JZhSnphVWp7gDfibZUvbBkkqVE');

        gapi.client.load('youtube', 'v3', function() {

            onSearchVideo(function() {
                pageSortDisplayList();
                return;
            });

        });
    });
}

function onSearchVideo(callback) {

    var request = gapi.client.youtube.search.list({
        q: '("Shaykh Babikir"|"Sheikh Babikir"|"Sheikh Ahmed Babikir"|"Shaykh Ahmed Babikir") "' + searchfor + '" -insulting',
        part: 'snippet',
        order: 'date',
        type: 'video',
        maxResults : pageSize,
        pageToken : pageToken
    });

    request.execute(function(response) {

        if(response !== undefined && response.items !== undefined && response.items.length > 0) {

            prevPageToken = (response.prevPageToken !== undefined ? response.prevPageToken : '');
            nextPageToken = (response.nextPageToken !== undefined ? response.nextPageToken : '');

            $(response.items)
            .each(function()
            {
                var contenturl = 'youtube&videoId=' + this.id.videoId;
                var title = this.snippet.title;
                var imageurl = this.snippet.thumbnails.high.url;
                var description = this.snippet.description;
                var date = this.snippet.publishedAt;
                var icon = '<i class="fa fa-youtube-play mobile-only"></i>';

                $('ul#resultList').append(buildListItem(contenturl, title, imageurl, description, date, icon));
            });
        }
        callback();
    });
}

/**************************************/
/***            Audio Api           ***/
/**************************************/

function onSearchAudio(callback) {

    YUI().use('yql', function(Y){
        var query = 'select guid.content, title, description, pubDate '
                    + 'from rss('+ (searchfor == "" ? pageNum*pageSize : 0) +') '
                    + 'where url = "http://www.youmouteki.com/babikir/podcast.xml" '
                    + 'and (title like "%' + searchfor + '%" or description like "%'+ searchfor +'%") '
                    + 'limit ' + pageSize + ' offset ' + ((pageNum*pageSize)-pageSize);

        var q = Y.YQL(query, function(audio) {

            if( audio.query !== undefined && audio.query.count > 0 && audio.query.results !== null ) {

                $(audio.query.results.item)
                .each(function()
                {
                    var contenturl = this.guid;
                    var title = this.title;
                    var imageurl = '';
                    var description = this.description;
                    var date = this.pubDate;
                    var icon = '<i class="fa fa-headphones mobile-only"></i>';

                    $('ul#resultList').append(buildListItem(contenturl, title, imageurl, description, date, icon));
                });
            }
            callback();
        });
    });
}

/**************************************/
/***            Build List          ***/
/**************************************/

function buildList() {

    $("#loader").show();

    if(!audio && !video)
    {
        pageSortDisplayList();
        return;
    }
    if(audio && !video)
    {
        onSearchAudio(function() {
            pageSortDisplayList();
            return;
        });
    } 
    if(video && !audio)
    {
        setupSearchVideo();
    }
    if(audio && video)
    {
        onSearchAudio(function() {
            setupSearchVideo();
        });
    } 
}



function buildListItem(contenturl, title, imageurl, description, date, icon) {

    var formattedDate = formatDate(new Date(date));

    return   '<li class="row image centered" data-date="' + new Date(date) + '">' + 
    '<div class="2u left">' +
    '<a href=listen.html'+ '?url=' + contenturl + '>' +
    '<img src="' + (imageurl != '' ? imageurl : 'images/SheikhBabikir_hqdefault.jpg') + '"/>' + 
    '</a></div>' +
    '<div class="8u right"><h2>'+
    '<a href=listen.html'+ '?url=' + contenturl + '>' +
    title + '</a></h2>' +
    '<p>' + icon + '  <em>' + formattedDate + '</em> ' + description + '</p>' +
    '</div></li>'
}


/**************************************/
/***            Page & Sort         ***/
/**************************************/

function pageSortDisplayList() {

    $("#loader").hide();
    if ($('ul#resultList li').length > 0) {
        sortListByDate();
        nextPreviousButtons();
    }
    else if (pageNum > 1) noMoreResults();
    else noResults(); 
}

/**************************************/
/***            Sort List           ***/
/**************************************/

function sortListByDate() {
    $("ul#resultList li").sort(function(a,b){
        return new Date($(b).attr("data-date")).getTime()  - new Date($(a).attr("data-date")).getTime() ;
    }).each(function(){
        $("ul#sortedList").append(this);
    });
}

/**************************************/
/***            Paging              ***/
/**************************************/

function nextPreviousButtons() {

    if ( pageNum == 1) $('#previous').addClass("button-disable");
    if ((video && nextPageToken === undefined) && (audio && $('ul#sortedList li').length < pageSize) || $('ul#sortedList li').length < pageSize) $('#next').addClass("button-disable");

    $('#previous').unbind().bind("click", function (e) {
        e.preventDefault();
        libraryUrl = libraryUrl + '?searchfor=' + $('#searchtext').val() + '&page=' + (pageNum > 1  ? pageNum - 1 : 1 ) +
        '&audio=' + audio + '&video=' + video +'&pageToken=' + prevPageToken;
        window.location.href = libraryUrl;
    });
    
    $('#next').unbind().bind("click", function (e) {
        e.preventDefault();
        libraryUrl = libraryUrl + '?searchfor=' + $('#searchtext').val() + '&page=' + (pageNum + 1 ) +
        '&audio=' + audio + '&video=' + video + '&pageToken=' + nextPageToken;
        window.location.href = libraryUrl;
    });
}

function noMoreResults(){
    $('ul#sortedList').text('No more results found');

    $('#next').addClass("button-disable");
    $('#previous').unbind().bind("click", function (e) {
        e.preventDefault();
        libraryUrl = libraryUrl + '?searchfor=' + $('#searchtext').val() + '&page=' + (pageNum > 1  ? pageNum - 1 : 1 ) +
        '&audio=' + audio + '&video=' + video + '&pageToken=' + prevPageToken;
        window.location.href = libraryUrl;
    });
}

function noResults(){
    $('ul#sortedList').text('No results for this search');

    $('#next').addClass("button-disable");
    $('#previous').addClass("button-disable");
}

/**************************************/
/***            General             ***/
/**************************************/

function getUrlParameter(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function formatDate(d) {

  var dd = d.getDate()
  if ( dd < 10 ) dd = '0' + dd

  var mm = d.getMonth()+1
  if ( mm < 10 ) mm = '0' + mm

  var yy = d.getFullYear() % 100
  if ( yy < 10 ) yy = '0' + yy

  return dd+'/'+mm+'/'+yy
}

/**************************************/
/***         Search & Filter        ***/
/**************************************/

function setupSearchFilter() {

    $('#searchtext').val(searchfor).unbind().bind("keyup", function (e) {
        if (event.which == 13) {
            $("#search").trigger('click');
        }
    });

    $('#search').unbind().bind("click", function (e) {
        e.preventDefault();
        libraryUrl = libraryUrl + '?searchfor=' + $('#searchtext').val() + '&page=1&audio=' + audio + '&video=' + video;
        window.location.href = libraryUrl;
    });

    $('#audio').prop('checked', audio).unbind().bind("click", function (e) {
        e.preventDefault();

        $(this).is(":checked") ? 
        (libraryUrl = libraryUrl + '?searchfor=' + $('#searchtext').val() + '&page=1&audio=true&video=' + video) :
        (libraryUrl = libraryUrl + '?searchfor=' + $('#searchtext').val() + '&page=1&audio=false&video=' + video)
        
        window.location.href = libraryUrl;
    });
    
    $('#video').prop('checked', video).unbind().bind("click", function (e) {
        e.preventDefault();

        $(this).is(":checked") ? 
        (libraryUrl = libraryUrl + '?searchfor=' + $('#searchtext').val() + '&page=1&audio=' + audio + '&video=true') :
        (libraryUrl = libraryUrl + '?searchfor=' + $('#searchtext').val() + '&page=1&audio=' + audio + '&video=false')
        
        window.location.href = libraryUrl;
    });

    $("#topics").click(function () {
        $topics= $(this);
        $tags = $('.tags');

        $($tags).slideToggle(500, function () {
            $($topics).html(function () {
                return $($tags).is(":visible") ? ('<i class="fa fa-minus-circle"></i>') : '<i class="fa fa-plus-circle"></i>';
            });
        });
    });
}


/**************************************/
/***            Intialiser          ***/
/**************************************/

$(document).ready(function()
{
    searchfor = getUrlParameter('searchfor'); 
    pageToken = getUrlParameter('pageToken');
    page = getUrlParameter('page');
    pageNum = !isNaN(parseInt(page)) ? parseInt(page) : 1;
    audio = getUrlParameter('audio') == 'false' ? false : true;
    video = getUrlParameter('video') == 'false' ? false : true;

    setupSearchFilter();

    buildList();
});





