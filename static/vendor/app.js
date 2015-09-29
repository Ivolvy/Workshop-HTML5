var hotSpots = [];
var InteractWebCam = function() {
    var that = this;
	// config start
	this.OUTLINES = false;
	// config end

	this.content = $('#content');
	this.video1 = $('#webcam')[0];
	this.canvases = $('canvas');

	var resize = function () {
		var ratio = that.video1.width / that.video1.height;
		var w = $('body').width();
		var h = $('body').height();

		if (that.content.width() > w) {
			that.content.width(w);
			that.content.height(w / ratio);
		} else {
			that.content.height(h);
			that.content.width(h * ratio);
			that.content.width(w);
		}
		that.canvases.width(that.content.width());
		that.canvases.height(that.content.height());
	};

	$(window).resize(resize);
	$(window).ready(function () {
		resize();
	});

	var webcamError = function (e) {
		alert('Webcam error!', e);
	};

	if (navigator.getUserMedia) {
		navigator.getUserMedia({audio: true, video: true}, function (stream) {
			var url = window.URL || window.webkitURL;
			that.video1.src = url ? url.createObjectURL(stream) : stream;
            that.initialize();
		}, webcamError);
	} else {
		//error
	}

	this.lastImageData = '';
	this.canvasSource = $("#canvas-source")[0];
	this.canvasBlended = $("#canvas-blended")[0];

	this.contextSource = this.canvasSource.getContext('2d');
	this.contextBlended = this.canvasBlended.getContext('2d');

	// mirror video
	this.contextSource.translate(this.canvasSource.width, 0);
	this.contextSource.scale(-1, 1);


	window.requestAnimFrame = (function () {
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function (callback) {
				window.setTimeout(callback, 1000 / 60);
			};
	})();


	$(window).on('start resize', this.getCoords);

};

InteractWebCam.prototype.initialize = function() {
    $('.introduction').fadeOut();
    $('.allow').fadeOut();
    $('.loading').delay(300).fadeIn();
    interactWebCam.start();
};

InteractWebCam.prototype.start = function() {
    $('#hotSpots').fadeIn();
    $(this.canvasSource).delay(600).fadeIn();
    $(this.canvasBlended).delay(600).fadeIn();
    $('#canvas-highlights').delay(600).fadeIn();
    $(window).trigger('start');
    interactWebCam.update();
};

InteractWebCam.prototype.update = function() {
    interactWebCam.drawVideo();
    interactWebCam.blend();
    interactWebCam.checkAreas();
    requestAnimFrame(interactWebCam.update);
};

InteractWebCam.prototype.drawVideo = function() {
    this.contextSource.drawImage(this.video1, 0, 0, this.video1.width, this.video1.height);
};

InteractWebCam.prototype.blend = function() {
    var width = this.canvasSource.width;
    var height = this.canvasSource.height;
    // get webcam image data
    var sourceData = this.contextSource.getImageData(0, 0, width, height);
    // create an image if the previous image doesn’t exist
    if (!this.lastImageData) this.lastImageData = this.contextSource.getImageData(0, 0, width, height);
    // create a ImageData instance to receive the blended result
    var blendedData = this.contextSource.createImageData(width, height);
    // blend the 2 images
    interactWebCam.differenceAccuracy(blendedData.data, sourceData.data, this.lastImageData.data);
    // draw the result in a canvas
    this.contextBlended.putImageData(blendedData, 0, 0);
    // store the current webcam image
    this.lastImageData = sourceData;
};

InteractWebCam.prototype.fastAbs = function(value) {
    // funky bitwise, equal Math.abs
    return (value ^ (value >> 31)) - (value >> 31);
};

InteractWebCam.prototype.threshold = function(value) {
    return (value > 0x15) ? 0xFF : 0;
};

InteractWebCam.prototype.differenceAccuracy = function(target, data1, data2) {
    if (data1.length != data2.length) return null;
    var i = 0;
    while (i < (data1.length * 0.25)) {
        var average1 = (data1[4 * i] + data1[4 * i + 1] + data1[4 * i + 2]) / 3;
        var average2 = (data2[4 * i] + data2[4 * i + 1] + data2[4 * i + 2]) / 3;
        var diff = this.threshold(this.fastAbs(average1 - average2));
        target[4 * i] = diff;
        target[4 * i + 1] = diff;
        target[4 * i + 2] = diff;
        target[4 * i + 3] = 0xFF;
        ++i;
    }
};

InteractWebCam.prototype.checkAreas = function() {
    var data;

    for (var h = 0; h < hotSpots.length; h++) {
        var blendedData = this.contextBlended.getImageData(hotSpots[h].x, hotSpots[h].y, hotSpots[h].width, hotSpots[h].height);
        var i = 0;
        var average = 0;
        while (i < (blendedData.data.length * 0.25)) {
            // make an average between the color channel
            average += (blendedData.data[i * 4] + blendedData.data[i * 4 + 1] + blendedData.data[i * 4 + 2]) / 3;
            ++i;
        }
        // calculate an average between the color values of the spot area
        average = Math.round(average / (blendedData.data.length * 0.25));
        if (average > 10) {
            // over a small limit, consider that a movement is detected
            data = {confidence: average, spot: hotSpots[h]};
            $(data.spot.el).trigger('motion', data);
        }
    }
};

InteractWebCam.prototype.getCoords = function() {
    $('#hotSpots').children().each(function (i, el) {
        var ratio = $("#canvas-highlights").width() / $('video').width();
        hotSpots[i] = {
            x: this.offsetLeft / ratio,
            y: this.offsetTop / ratio,
            width: this.scrollWidth / ratio,
            height: this.scrollHeight / ratio,
            el: el
        };
    });
    if (this.OUTLINES) interactWebCam.highlightHotSpots();
};

InteractWebCam.prototype.highlightHotSpots = function() {
    var that = this;

    this.canvasHighlights = $("#canvas-highlights")[0];
    this.ctxHighLights = this.canvasHighlights.getContext('2d');
    this.canvasHighlights.width = this.canvasHighlights.width;

    hotSpots.forEach(function (o, i) {
        that.ctxHighLights.strokeStyle = 'rgba(0,255,0,0.6)';
        that.ctxHighLights.lineWidth = 1;
        that.ctxHighLights.strokeRect(o.x, o.y, o.width, o.height);
    });
};

InteractWebCam.prototype.stopWebcam = function(){
    this.video1.pause();
    this.video1.src = "";

    this.contextSource.clearRect(0, 0, this.canvasSource.width, this.canvasSource.height);
    this.contextBlended.clearRect(0, 0, this.canvasBlended.width, this.canvasBlended.height);

    $("#canvas-source").addClass('hidden');
    $("#canvas-blended").addClass('hidden');

};

var interactWebCam = new InteractWebCam();