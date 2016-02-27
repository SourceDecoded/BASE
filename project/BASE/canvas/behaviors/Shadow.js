BASE.namespace("BASE.canvas.behaviors");

BASE.canvas.behaviors.Shadow = function (red, green, blue, alpha, blur, offsetX , offsetY) {
    this.red = red || 0;
    this.green = green || 0;
    this.blue = blue || 0;
    this.alpha = alpha || 1;
    this.blur = blur || 0;
    this.offsetX = offsetX || 0;
    this.offsetY = offsetY || 0;
};

BASE.canvas.behaviors.Shadow.prototype.withInRange = function (value, min, max) {
    var value = value > min ? value : min;
    return value < max ? value: max;
};

BASE.canvas.behaviors.Shadow.prototype.createRgba = function (red, green, blue, alpha) {
    var red = this.withInRange(red, 0, 255);
    var green = this.withInRange(green, 0, 255);
    var blue = this.withInRange(blue, 0, 255);
    var alpha = this.withInRange(alpha, 0, 1);
    
    return "rgba(" + red + "," + green + "," + blue + "," + alpha + ")";
};

BASE.canvas.behaviors.Shadow.prototype.draw = function (context, view) {
    var color = this.createRgba(this.red, this.green, this.blue, this.alpha);
    var blur = this.blur;
    var top = view.calculateTopPosition() + blur;
    var left = view.calculateLeftPosition() + blur;
    var width = view.width - (blur * 2);
    var height = view.height - (blur * 2);
    
    context.fillStyle = color;
    context.shadowColor = color;
    context.shadowBlur = this.blur;
    context.shadowOffsetX = this.offsetX;
    context.shadowOffsetY = this.offsetY;
    context.fillRect(left, top, width, height);
};

