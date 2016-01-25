var map;
var win = $(this);
var videoItemPrototype = $('.video-item.wz-prototype');
var state = 0; // 0 == startScreen, 1 == listScreen; 2 == playing; 3 == playingThumbnail
var videoPlayer = $('.playing-screen');
var nextPage = '';
var prevPage = '';

function initYoutube() {
  gapi.client.setApiKey("AIzaSyASBjTorVrmXi_JphTE3TaJvyHzg7bfyT4");
  gapi.client.load("youtube", "v3", function() {
    console.log("cargo api");
  });

}

var loadList = function( searchQuery, pageToken ){

  $('.list-screen .video-item').not('.wz-prototype').remove();

  if( typeof pageToken !== 'undefined' ){

    var request = gapi.client.youtube.search.list({

     part: "id,snippet",
     type: "video",
     pageToken: pageToken,
     q: encodeURIComponent( searchQuery ).replace(/%20/g, "+"),
     maxResults: 20

    });

  }else{

    var request = gapi.client.youtube.search.list({

     part: "id,snippet",
     type: "video",
     q: encodeURIComponent( searchQuery ).replace(/%20/g, "+"),
     maxResults: 15

    });

  }

  request.execute(function(response) {

     var results = response.result;
     var videoItems  = [];
     nextPage = results.nextPageToken || '';
     prevPage = results.prevPageToken || '';

     if( nextPage === '' ){
       $( '.next' ).prop( 'disabled' , true);
     }else{
       $( '.next' ).prop( 'disabled' , false);
     }

     if( prevPage === '' ){
       $( '.prev' ).prop( 'disabled' , true);
     }else{
       $( '.prev' ).prop( 'disabled' , false);
     }

     $.each(results.items, function(index, item) {

       var clonedItem = videoItemPrototype.clone();
       clonedItem.removeClass('wz-prototype');
       clonedItem.data('videoId', item.id.videoId);
       clonedItem.find('.thumbnail figure i').css( 'background-image', 'url(' + item.snippet.thumbnails.medium.url  + ')' );
       clonedItem.find('.video-info .title').text( item.snippet.title );
       clonedItem.find('.video-info .channel').text( item.snippet.channelTitle );
       clonedItem.find('.video-info .date').text( item.snippet.publishedAt );
       clonedItem.find('.video-info .description').text( item.snippet.description );
       videoItems.push(clonedItem);

     });

    $('.video-list').append(videoItems);
    if( state != 3){
      state = 1;
    }

  });

}

var backToList = function (){

  if( state == 2 ){

    $('.playing-screen').removeClass('full');

    $('.list-screen').transition({

      'margin-left': '0px'},800
      ,function(){
        $('.ui-header').removeClass('playing');
        $('.ui-window-content').removeClass('playing');
      }

    );

    var scaleWidth = 320 / parseInt( $('.ui-window-content').css('width') , 10 );
    var scaleHeight = 180 / parseInt( $('.ui-window-content').css('height') , 10 );

    $('.playing-screen').transition({
      right: '30px', bottom: '20px' ,
      '-webkit-transform': "scale(" + scaleWidth + "," + scaleHeight + ")", '-o-transform': "scale(" + scaleWidth + "," + scaleHeight + ")",
       '-moz-transform': "scale(" + scaleWidth + "," + scaleHeight + ")"
    },800,function(){

      var width = parseInt( $('.playing-screen').css('width') , 10 ) * scaleWidth;
      width = width.toString() + 'px';
      var height = parseInt( $('.playing-screen').css('height') , 10 ) * scaleHeight;
      height = height.toString() + 'px';

      $('.playing-cover').css({
        'width': width,
        'height': height,
        'right': '30px',
        'bottom': '20px'
      }).addClass('active');

      state = 3;

    });

  }else if ( state == 3 ) {

    $('.playing-screen, .playing-cover').transition({
      'opacity' : '0'},800, function(){

        $('.playing-cover').removeClass('active').css('opacity', '1');
        $('.playing-screen').removeClass('active');
        videoPlayer.attr('src', '');
        var rightValue = '-' + $('.ui-window-content').css('width');
        //console.log()
        $('.playing-screen').css({'right': rightValue,'bottom': '0px', 'width': '100%', 'opacity' : '1' ,
        '-webkit-transform': "scale(1)", '-o-transform': "scale(1)", '-moz-transform': "scale(1)" })

        $('.playing-cover').css({
          'width': 'inherit',
          'height': 'inherit',
          'right': '0px',
          'bottom': '0px'
        })

        state = 2;

      }
    );

  }

}

var playVideo = function ( videoId ){

  $('.playing-screen').addClass('active');

  if( state != 3 || typeof videoId !== 'undefined' ){
    videoPlayer.attr('src', '//www.youtube.com/embed/' + videoId + '?autoplay=1&html5=1');
  }

  var width = $('.ui-window-content').css('width');
  width = '-' + width;

  $('.list-screen').transition({

    'margin-left': width},800
    ,function(){
      $('.ui-header').addClass('playing');
      $('.ui-window-content').addClass('playing');
      $('.playing-screen').addClass('full');
      state = 2;
    }

  );

  if ( state == 3 ){

    $('.playing-cover').removeClass('active');

    $('.playing-screen').transition({
      right: '0px', bottom: '0px' ,
      '-webkit-transform': "scale(1)", '-o-transform': "scale(1)",
       '-moz-transform': "scale(1)"
    },800,function(){

      $('.playing-cover').css({
        'width': 'inherit',
        'height': 'inherit',
        'right': '0px',
        'bottom': '0px'
      })

    });

  }else{

    $('.playing-screen').transition({
      'right': '0px'},800
    );

  }

}

win.on( 'click', '.ui-input-search .search-icon i' , function(){

  //loadList( $(this).parents('.ui-input-search').find('input').val() );

})

.on( 'click', '.video-item .title, .video-item .thumbnail' , function(){

  playVideo( $(this).parents('.video-item').data('videoId') );

})

.on( 'click', '.ui-header .arrow' , function(){

  backToList();

})

.on( 'click', '.pagination .prev' , function(){

  if( prevPage !== '' ){
    var searchQuery = $('.ui-header .ui-input-search input').val();
    loadList( searchQuery, prevPage );
    $('.list-screen').scrollTop( 0 );
  }

})

.on( 'click', '.pagination .next' , function(){

  if( nextPage !== '' ){
    var searchQuery = $('.ui-header .ui-input-search input').val();
    loadList( searchQuery, nextPage );
    $('.list-screen').scrollTop( 0 );
  }

})

.on( 'click' , '.playing-cover.active', function(e){

  if( state == 3 ){
    playVideo();
    $(this).removeClass('active');
  }

})

.on( 'click' , '.playing-cover.active i', function(e){

  backToList();
  e.stopPropagation();

})

.on( 'ui-view-resize-start' , function(e){

  if(state != 3){
    $('.playing-cover').addClass('active');
  }

})

.on( 'ui-view-resize-end' , function(e){

  if(state != 3){
    $('.playing-cover').removeClass('active');
  }

})

.key( 'enter', function(){

  var searchQuery;

  if( state == 0 ){

    var height = $('.ui-window-content').css('height');
    height = '-' + height;

    $('.ui-header .ui-input-search input').val( $('.startScreen .ui-input-search input').val() );
    $('.startScreen').transition({
      'margin-top': height},800
      ,function(){
        $('.startScreen').css('display', 'none');
        $('.ui-header.firstStart').removeClass('firstStart');
        $('.ui-window-content.firstStart').removeClass('firstStart');
      }
    );
    searchQuery = $('.startScreen .ui-input-search input').val();

  }else if ( state == 2) {

    searchQuery = $('.ui-header .ui-input-search input').val();
    backToList();

  }else{
    searchQuery = $('.ui-header .ui-input-search input').val();
  }

  loadList( searchQuery );

});

var interval = setInterval(function(){

  if( typeof gapi !== 'undefined' && typeof gapi.client !== 'undefined' ){
    clearInterval( interval );
    initYoutube();
  }

}, 50);
