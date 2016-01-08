var map;
var win = $(this);
var itemPrototype = $('.item.wz-prototype');

function initYoutube() {
  gapi.client.setApiKey("AIzaSyDf_MlUhD3VU9fsg3LKBUAxkj81gNPWYB0");
  gapi.client.load("youtube", "v3", function() {
    console.log("cargo api");
  });

}

/*win.on( 'ui-view-resize ui-view-maximize ui-view-unmaximize', function(){
	console.log('max');
	var center = map.getCenter();
	google.maps.event.trigger(map, "resize");
	map.setCenter(center);
});*/

win.on( 'click', '.ui-input-search i' , function(){
  console.log('busco');

  var request = gapi.client.youtube.search.list({

     part: "snippet",
     type: "video",
     q: encodeURIComponent($(".ui-input-search input").val()).replace(/%20/g, "+"),
     maxResults: 3,
     order: "viewCount",
     publishedAfter: "2015-01-01T00:00:00Z"

   });

  request.execute(function(response) {

     var results = response.result;
     console.log(results);
     //$(".content").children().not( ".wz-prototype" ).remove();
     var videoItems  = [];
     $.each(results.items, function(index, item) {

       console.log(item);
       var clonedItem = itemPrototype.clone();
       clonedItem.removeClass('wz-prototype');
       clonedItem.children('h2').text(item.snippet.title);
       clonedItem.children('iframe').attr('src', '//www.youtube.com/embed/' + item.id.videoId);
       videoItems.push(clonedItem);
       //$(".content").append(tplawesome(data, [{"title":item.snippet.title, "videoid":item.id.videoId}]));

     });

     $(".content").append(videoItems);
  });

});

var interval = setInterval(function(){

  if( typeof gapi !== 'undefined' && typeof gapi.client !== 'undefined' ){
    clearInterval( interval );
    initYoutube();
  }

}, 50);
