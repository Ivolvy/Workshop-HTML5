var circleConnect;
var goToLeftSlide = $('#goToLeftSlide');
var goToRightSlide = $('#goToRightSlide');

goToLeftSlide.circleProgress({
    startAngle: -Math.PI / 4 * 3,
    value: 0,
    lineCap: 'round',
    animation: false,
    fill: { gradient: ['#E2407B', '#C11047'] }
});

goToRightSlide.circleProgress({
    startAngle: -Math.PI / 4 * 3,
    value: 0,
    lineCap: 'round',
    animation: false,
    fill: { gradient: ['#E2407B', '#C11047'] }
});

function createCircleConnect (){
     circleConnect = $('#circleConnection');

    circleConnect.circleProgress({
        startAngle: -Math.PI / 4 * 3,
        value: 0,
        lineCap: 'round',
        animation: false,
        fill: { gradient: ['#E2407B', '#C11047'] }
    });

}