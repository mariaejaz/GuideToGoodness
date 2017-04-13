$(document).ready(function(){

  $.ajax({
    type: "GET",
    url: 'https://graph.facebook.com/sheikhbabikir/posts?access_token=261767227503405|c0e1fdc5b6713e835db93aa3d55a3519',
    dataType: 'json',
    error: function(){
      console.log('Unable to load facebook feed, Incorrect path or invalid feed');
    },
    success: function(response){
      var element = document.getElementById('facebook');
      var html = '';

      for (i = 0; i < 3; i++) { 
        var posturl = 'http://www.facebook.com/' + response.data[i].id; 
        html += '<li><span class="left"><span class="date"><a href="' + posturl + '" target="_blank">' 
        + dateFormatter(response.data[i].created_time) + '</a></span><strong></strong></span>' +
        '<span class="right"><a href="' + posturl + '" target="_blank">' + 
        (response.data[i].message !== undefined ? response.data[i].message.substring(0,150) + '...' : response.data[i].story) + '</a></span></li>';
      }

      element.innerHTML = html;
    }
  });

});

function dateFormatter(date) {
  date = moment(date);
  var monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return monthNamesShort[date.month()] +'<b>'+ date.date() +'</b>';
}

