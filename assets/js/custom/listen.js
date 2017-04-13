var contentUrl;
var backUrl = 'library.html'


/**************************************/
/***            Video               ***/
/**************************************/

function fetchVideoData(videoId) {

	var key = 'AIzaSyCFInI73JZhSnphVWp7gDfibZUvbBkkqVE';

	var query = 'https://www.googleapis.com/youtube/v3/videos?id='+ videoId +'&key='+ key +'&part=snippet';

	$.ajax({
		url: query, 
		dataType: "jsonp",
		success: function(data){

			if(data !== undefined && data.items.length > 0) {

				var video = data.items[0].snippet;
				
				$('#_title').text(video.title);
				$('#_date').text( formatDate(new Date(video.publishedAt)) );
				$('#_description').text(video.description);
				document.title =  video.title + ' - ' + document.title;
				setupSocialShare();
			}
			else{
				$("#media-wrapper").hide();
				$('#_description').text('No video found for this request.');
			}       
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log (textStatus, + ' | ' + errorThrown);
		}
	});
}

/**************************************/
/***            Audio               ***/
/**************************************/

function fetchAudioData() {

    YUI().use('yql', function(Y){
        var query = 'select guid.content, title, description, pubDate '
                    + 'from rss '
                    + 'where url = "http://www.youmouteki.com/babikir/podcast.xml" '
                    + 'and guid.content = "' + contentUrl + '" limit 1';

        var q = Y.YQL(query, function(audio) {

            if( audio.query !== undefined && audio.query.count > 0 && audio.query.results !== null ) {

                $('#_title').text(audio.query.results.item.title);
				$('#_date').text( formatDate(new Date(audio.query.results.item.pubDate)) );
				$('#_description').text(audio.query.results.item.description);
				document.title =  audio.query.results.item.title + ' - ' + document.title;
				setupSocialShare();
            }
            else{
				$("#media-wrapper").hide();
				$('#_description').text('No audio found for this request.');
			} 
        });
    });
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
/***            Setup          ***/
/**************************************/

function setupMediaPalyer(){

	if(contentUrl.match(/(youtube)/)) {

		var videoId = getUrlParameter('videoId');

		$("html,body").scrollTop(30);
		$("#media-wrapper").html('<iframe src="http://www.youtube.com/embed/'+ videoId +'?autoplay=1" frameborder="0" allowfullscreen></iframe>');

		fetchVideoData(videoId);
		return;
	}

	if(contentUrl.match(/(mp3|m4a)/)) {
		$("#media-wrapper")
			.html('<audio oncanplay="onCanPlay()" oncanplaythrough="onCanPlayThrough()" controls autoplay><source src="" type="audio/mpeg"></audio>')
			.css('padding-bottom','4%')
			.hide();
		$("#media-wrapper source").attr("src", contentUrl);
		$("#loader").show();

		fetchAudioData();
		return;
	}

	if(contentUrl.match(/(m4v)/)) {

		$("html,body").scrollTop(30);
		$("#media-wrapper").html('<video oncanplay="onCanPlay()" oncanplaythrough="onCanPlayThrough()" controls autoplay><source src="" type="video/mp4"></video>').hide();
		$("#media-wrapper source").attr("src", contentUrl);
		$("#loader").show();

		fetchAudioData();
		return;
	}
}

function onCanPlay() { 
    $("#media-wrapper").show(); 
	$("#loader").hide();
    $("#slow-warning").show();
}

function onCanPlayThrough() { 
   	$("#slow-warning").hide();
}

function setupBackButton(){

	if(document.referrer.toLowerCase().indexOf("library") >= 0 ) {
		backUrl = document.referrer;
		$('#back').html('Back');
	}

	$('#back').click(function(){
		window.location.href = backUrl;
		return false;
	});	
}

function setupSocialShare(){

	$("#share").jsSocials({
		url: window.location.href,
    	text:  document.title + ' - ' + $('#_description').text(),
		showLabel: false,
    	showCount: false,
    	shareIn: "popup",
        shares: ["email", { share: "twitter", via: "SheikhBabikir" }, "facebook", "whatsapp"]
    });
}

/**************************************/
/***            Intialiser          ***/
/**************************************/

$(document).ready(function()
{
	contentUrl = getUrlParameter('url');

	setupMediaPalyer();
	setupBackButton();
});
