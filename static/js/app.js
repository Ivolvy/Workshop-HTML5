//INITIALIZE FLICKITY
var elem = document.querySelector('.presentation-gallery');
var flkty = new Flickity( elem, {
    // options
    wrapAround: false,
    prevNextButtons: false,
    pageDots: true,
    contain: true,
    draggable: false
});


/** VARS **/

var localStream;

var i = 0;
var maxConnectLoad = 50;
var maxSlideLoad = 35;

var interval = 1/maxConnectLoad;
var intervalSlide = 1/maxSlideLoad;
var progressLoad = 0;

var sliderIndex = 0;
var maxSliderIndex = 2;


var loadLeft = 0;
var loadRight = 0;
var leftI = 0;
var rightI = 0;

var timeoutConnect;
var timeoutLeft;
var timeoutRight;

// For debug
/*$(window).on('motion', function(ev, data){
 //console.log('detected motion at', new Date(), 'with data:', data);
 var spot = $(data.spot.el);
 spot.addClass('active');
 setTimeout(function(){
 spot.removeClass('active');
 }, 230);
 });*/

/** INIT CIRCLES EVENTS*/

$('#circleConnection').on('motion', function(){
    //alert($(".userLink").attr("data-user"));
    i++;

    progressLoad += interval;
    circleConnect.circleProgress('value', progressLoad);

    fireConnectButton();
});

//Go to page on circle motion
$('#goToLeftSlide').on( 'motion', function(){
    if(sliderIndex > 0){
        leftI++;

        loadLeft += intervalSlide;
        goToLeftSlide.circleProgress('value', loadLeft);

        fireLeftSlide();
    }
});

$('#goToRightSlide').on( 'motion', function(){
    if(sliderIndex < maxSliderIndex){
        rightI++;

        loadRight += intervalSlide;
        goToRightSlide.circleProgress('value', loadRight);

        fireRightSlide();
    }
});


/** FIRE CIRCLES EVENTS*/

function fireLeftSlide(){
    clearTimeout(timeoutLeft);
    if(leftI >= maxSlideLoad){
        leftI = 0;
        sliderIndex--;
        flkty.select(parseInt(sliderIndex));
        loadLeft = 0;
        goToLeftSlide.circleProgress('value', loadLeft);
    }
    else {
        timeoutLeft = setTimeout(function () {
            leftI = 0;
            loadLeft = 0;
            goToLeftSlide.circleProgress('value', loadLeft);
        }, 500);
    }
}

function fireRightSlide(){
    clearTimeout(timeoutRight);
    if(rightI >= maxSlideLoad){
        rightI = 0;
        sliderIndex++;
        flkty.select(parseInt(sliderIndex));
        loadRight = 0;
        goToRightSlide.circleProgress('value', loadRight);

        //insert the circleConnect on the hotSpots div
        $("#hotSpots").append('<div id="circleConnection"></div>');
        loadCircleConnect();

    }
    else {
        timeoutRight = setTimeout(function () {
            rightI = 0;
            loadRight = 0;
            goToRightSlide.circleProgress('value', loadRight);
        }, 500);
    }
}

//Create and load position of circleConnect in hotSpots tab
function loadCircleConnect(){
    //create a circle in circleLoading.js
    createCircleConnect();

    //update the hotSpots tabs and set the position of the new element
    interactWebCam.getCoords();

    $('#circleConnection').on('motion', function(){
        //alert($(".userLink").attr("data-user"));
        i++;

        progressLoad += interval;
        circleConnect.circleProgress('value', progressLoad);

        fireConnectButton();
    });
}


//if the button is fired a certain time, we hit the appropriate action
function fireConnectButton(){
    clearTimeout(timeoutConnect);
    if(i >= maxConnectLoad){
        i = 0;
        //launch action
        interactWebCam.stopWebcam();

        //connectVideo.askCall($(".userLink").attr("data-user"));
        connectVideo.connectUser($(".userLink").attr("data-user"));

        $("#hotSpots").css({'display': 'none'});
        $("#colorFont").css({'display': 'none'});
    }
    else {
        timeoutConnect = setTimeout(function () {
            i = 0;
            progressLoad = 0;
            circleConnect.circleProgress('value', progressLoad);
        }, 500);
    }
}
