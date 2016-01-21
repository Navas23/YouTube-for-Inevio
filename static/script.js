var map;
var win = $(this);
var videoItemPrototype = $('.video-item.wz-prototype');
var state = 0; // 0 == startScreen, 1 == listScreen; 2 == playing
var videoPlayer = $('.playing-screen iframe');

function initYoutube() {
  gapi.client.setApiKey("AIzaSyDf_MlUhD3VU9fsg3LKBUAxkj81gNPWYB0");
  gapi.client.load("youtube", "v3", function() {
    console.log("cargo api");
  });

}

var loadList = function( searchQuery ){

  $('.list-screen .video-item').not('.wz-prototype').remove();

  var request = gapi.client.youtube.search.list({

     part: "id,snippet",
     type: "video",
     q: encodeURIComponent( searchQuery ).replace(/%20/g, "+"),
     maxResults: 10

   });

  request.execute(function(response) {

     var results = response.result;
     var videoItems  = [];
     $.each(results.items, function(index, item) {

       var clonedItem = videoItemPrototype.clone();
       clonedItem.removeClass('wz-prototype');
       clonedItem.data('videoId', item.id.videoId);
       clonedItem.find('.thumbnail figure i').css( 'background-image', 'url(' + item.snippet.thumbnails.medium.url  + ')' );
       clonedItem.find('.video-info .title').text( item.snippet.title );
       clonedItem.find('.video-info .channel').text( item.snippet.channelTitle );
       clonedItem.find('.video-info .date').text( item.snippet.publishedAt );
       clonedItem.find('.video-info .description').text( item.snippet.description );
       //clonedItem.children('iframe').attr('src', '//www.youtube.com/embed/' + item.id.videoId);
       videoItems.push(clonedItem);
       //$(".content").append(tplawesome(data, [{"title":item.snippet.title, "videoid":item.id.videoId}]));

     });

    $('.video-list').append(videoItems);
    state = 1;
  });

}

var backToList = function (){

  if( state == 2 ){

    $('.list-screen').animate({

      'margin-left': '0px'},800
      ,function(){
        $('.ui-header').removeClass('playing');
        $('.ui-window-content').removeClass('playing');
      }

    );

    $('.playing-screen').animate({
      'left': '864px'},800, function(){
        videoPlayer.attr('src', '');
      }
    );

  }

}

var playVideo = function ( videoId ){

  videoPlayer.attr('src', '//www.youtube.com/embed/' + videoId + '?autoplay=1');

  $('.list-screen').animate({

    'margin-left': '-864px'},800
    ,function(){
      $('.ui-header').addClass('playing');
      $('.ui-window-content').addClass('playing');
      state = 2;
    }

  );

  $('.playing-screen').animate({
    'left': '0px'},800
  );

}

win.on( 'click', '.ui-input-search .search-icon i' , function(){

  //loadList( $(this).parents('.ui-input-search').find('input').val() );

})

.on( 'click', '.video-item .title, .video-item .thumbnail' , function(){

  playVideo( $(this).parents('.video-item').data('videoId') );

})

.on( 'click', '.ui-header .arrow i' , function(){

  backToList();

})

.key( 'enter', function(){

  var searchQuery;

  if( state == 0 ){

    $('.ui-header .ui-input-search input').val( $('.startScreen .ui-input-search input').val() );
    $('.startScreen').animate({
      'margin-top': '-536px'},800
      ,function(){
        $('.startScreen').css('display', 'none');
        $('.ui-header.firstStart').removeClass('firstStart');
        $('.ui-window-content.firstStart').removeClass('firstStart');
      }
    );
    searchQuery = $('.startScreen .ui-input-search input').val();

  }else if( state == 1 ){

    searchQuery = $('.ui-header .ui-input-search input').val();

  }else{

    searchQuery = $('.ui-header .ui-input-search input').val();
    backToList();

  }

  loadList( searchQuery );

});

var interval = setInterval(function(){

  if( typeof gapi !== 'undefined' && typeof gapi.client !== 'undefined' ){
    clearInterval( interval );
    initYoutube();
  }

}, 50);
