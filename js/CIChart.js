"use strict";

/**
@constructor  
@param {Element} $div to build CIChart. Width and height are inherited from this div
@param {string} title
@param {HistogramData} histogramData for initial setup chart
@para {float} trueMean is the true mean of the distribution
*/
var CIChart =function ($div, title, histogramData, trueMean){
    var self = this; // Capture reference to 'this' to use in closures
    this.$div = $div;
    this.histogramData = histogramData;
    this.trueMean = trueMean;
    var width = $div.width();
    var numberOfBins = histogramData.numberOfBins();
    this.topInset = 16;
    this.bottomInset = 16;
    this.leftInset = 45;
    this.contentWidth = width - this.leftInset;
    var columnWidth = Math.floor(this.contentWidth / numberOfBins);
    this.columnWidth = columnWidth;
    // Create a canvas for drawing axes and stat visual indicators
    var $canvas = $('<canvas width="' + $div.width() + '" height="' + $div.height() + '" class="chart"></canvas>');
    $canvas.css('zIndex', 1);
    $div.append($canvas);
    this.$canvas = $canvas;

    // Create title
    this.$title = $('<div class="absolute">' + title + '</div>');
    this.$div.append(this.$title);
    this.$title.offset({ left : $div.offset().left + this.leftInset });
    // Create the box that contains columns and bars
    var $histogramContentArea = $('<div class="histogram_content"></div>');
    $histogramContentArea.css('top', this.topInset);
    $histogramContentArea.css('bottom', this.bottomInset);
    $histogramContentArea.css('left', this.leftInset - 1);
    $histogramContentArea.css('right', 0);
    this.$div.append($histogramContentArea);
    this.$histogramContentArea = $histogramContentArea;

    // Draw axes
    this.drawAxes(trueMean);

    return this;
};


//Draw Axes. TrueMean is for plotting the Y-axis marking the true mean of the parent distribution
CIChart.prototype.drawAxes = function(trueMean) {
    var numberOfBins = this.histogramData.numberOfBins();
    var bottomInset = this.bottomInset;
    var leftInset = this.leftInset;
    var tickMarkHeight = 5;
    var canvas = this.$canvas.get(0);
    var context = canvas.getContext('2d');
    context.beginPath();
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    context.moveTo(leftInset - 0.5, this.topInset);
    // Draw Y axis (trueMean)
    var myWidth = Math.floor(this.columnWidth*this.histogramData.numberOfBins());
    var values = this.histogramData.values;
    var axisMin = parseFloat(values[0]);
    var axisMax = parseFloat(values[numberOfBins-1]);
    var axisRange = axisMax-axisMin;
    var truePoint = (parseFloat(trueMean)-axisMin)/axisRange;
    context.moveTo(Math.floor(truePoint * myWidth)+this.leftInset, this.topInset);
    context.lineTo(Math.floor(truePoint * myWidth)+this.leftInset, canvas.height-bottomInset - 0.5); 
    // Draw X axis
    context.moveTo(leftInset - 0.5 , canvas.height - bottomInset - 0.5);
    context.lineTo(this.columnWidth * numberOfBins + leftInset, canvas.height - bottomInset - 0.5);
    // Draw horizontal tick marks
    for (var i = 0; i < numberOfBins; i++) {
        var x = (i * this.columnWidth) - 0.5 + leftInset;
        context.moveTo(x, canvas.height - bottomInset);
        context.lineTo(x, canvas.height - bottomInset + tickMarkHeight);
    }
    context.stroke();
    context.fillStyle = 'black';
    context.font = '9px Times New Roman';
    // Draw horizontal axis labels
    var values = this.histogramData.values;
    context.textAlign = 'center'; // Restore text align setting
    context.fillText(values[0], leftInset, canvas.height - bottomInset + 12);
    context.fillText(values[Math.floor(numberOfBins/8*1)], leftInset+45, canvas.height - bottomInset+12);
    context.fillText(values[Math.floor(numberOfBins/8*2)], leftInset+85, canvas.height - bottomInset+12);
    context.fillText(values[Math.floor(numberOfBins/8*3)], leftInset+125, canvas.height - bottomInset+12);
    context.fillText(values[Math.floor(numberOfBins/8*4)], leftInset+165, canvas.height - bottomInset+12);
    context.fillText(values[Math.floor(numberOfBins/8*5)], leftInset+205, canvas.height - bottomInset+12);
    context.fillText(values[Math.floor(numberOfBins/8*6)], leftInset+245, canvas.height - bottomInset+12);
    context.fillText(values[Math.floor(numberOfBins/8*7)], leftInset+285, canvas.height - bottomInset+12);       
    context.fillText(values[numberOfBins - 1], leftInset+325, canvas.height - bottomInset + 12);
};

/**
 * Clears the whole canvas
 */
CIChart.prototype.clearCanvas = function() {
  var canvas = this.$canvas.get(0);
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
};


/**
 * Redraw the canvas.
 */
CIChart.prototype.redraw = function(sampleCIs, trueMean) {
  this.clearCanvas();
  this.drawAxes(trueMean);
  this.drawCIs(sampleCIs);
};

/**
 * Reset Chart
 */
CIChart.prototype.resetChart= function(histogramData, sampleCIs, trueMean) {
  this.histogramData = histogramData;
  this.sampleCIs = sampleCIs;
  this.redraw(sampleCIs, trueMean);
};



/** 
 * Draw CIs.
 */
CIChart.prototype.drawCIs = function(sampleCIs) {
// chart margin coordinates:
// left= leftInset-0.5
// right= this.columnWidth * numberOfBins + leftInset
// bottom= canvas.height - bottomInset - 0.5
// top= this.topInset
    var numberOfBins = this.histogramData.numberOfBins();
    var bottomInset = this.bottomInset;
    var leftInset = this.leftInset;
    var tickMarkHeight = 5;
    var canvas = this.$canvas.get(0);
    var context = canvas.getContext('2d');
    var ciShift = Math.floor((canvas.height - bottomInset - 0.5 + this.topInset) /10)-1;
    var myWidth = Math.floor(this.columnWidth*this.histogramData.numberOfBins());
    context.beginPath();
    context.strokeStyle = 'blue';
    context.lineWidth = 2;
    context.moveTo(leftInset - 0.5, this.topInset);
 
    var values = this.histogramData.values;
    var axisMin = parseFloat(values[0]);
    var axisMax = parseFloat(values[numberOfBins-1]);
    var axisRange = axisMax-axisMin;
    var ciLength = sampleCIs.length;
    var maxRun = 30;
    if (ciLength<maxRun){
        maxRun = ciLength;
    }

    var leftPoint = 0;
    var meanPoint = 0;
    var rightPoint = 0;
    var shifting = 0;

    for (var i = 0; i < maxRun; i=i+3)
    {
//start making CIs
        leftPoint = (parseFloat(sampleCIs[i])-axisMin)/axisRange;
        meanPoint = (parseFloat(sampleCIs[i+1])-axisMin)/axisRange; 
        rightPoint= (parseFloat(sampleCIs[i+2])-axisMin)/axisRange;
        if (leftPoint<0){
            context.moveTo(this.leftInset+4,this.topInset+shifting*ciShift-4);
            context.lineTo(this.leftInset,this.topInset+shifting*ciShift);
            context.lineTo(this.leftInset+4,this.topInset+shifting*ciShift+4);
            context.moveTo(this.leftInset,this.topInset+shifting*ciShift);
        }else{
            context.moveTo(Math.floor(leftPoint * myWidth)+this.leftInset, this.topInset+shifting*ciShift-4);
            context.lineTo(Math.floor(leftPoint * myWidth)+this.leftInset, this.topInset+shifting*ciShift);
        };
        if(meanPoint<0){
        }else if(meanPoint>1){
        }else {
            context.lineTo(Math.floor(meanPoint * myWidth)+this.leftInset, this.topInset+shifting*ciShift);
            context.lineTo(Math.floor(meanPoint * myWidth)+this.leftInset, this.topInset+shifting*ciShift-4);
            context.moveTo(Math.floor(meanPoint * myWidth)+this.leftInset, this.topInset+shifting*ciShift);
        };
        if (rightPoint>1){
            context.lineTo(myWidth+this.leftInset, this.topInset+shifting*ciShift);
            context.lineTo(myWidth+this.leftInset-4, this.topInset+shifting*ciShift-4);
            context.moveTo(myWidth+this.leftInset, this.topInset+shifting*ciShift);
            context.lineTo(myWidth+this.leftInset-4, this.topInset+shifting*ciShift+4);
        }else{
            context.lineTo(Math.floor(rightPoint *myWidth)+this.leftInset, this.topInset+shifting*ciShift);
            context.lineTo(Math.floor(rightPoint *myWidth)+this.leftInset, this.topInset+shifting*ciShift-4);
        };
        shifting++;
    };


    context.stroke();
};
