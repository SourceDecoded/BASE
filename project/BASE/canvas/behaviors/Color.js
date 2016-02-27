BASE.namespace("BASE.canvas.behaviors");

BASE.canvas.behaviors.Color = function (red, green, blue, alpha) {
    this.red = red || 0;
    this.green = green || 0;
    this.blue = blue || 0;
    this.alpha = alpha || 1;
};

BASE.canvas.behaviors.Color.prototype.withInRange = function (value, min, max) {
    var value = value > min ? value : min;
    return value < max ? value: max;
};

BASE.canvas.behaviors.Color.prototype.createRgba = function (red, green, blue, alpha) {
    var red = this.withInRange(red, 0, 255);
    var green = this.withInRange(green, 0, 255);
    var blue = this.withInRange(blue, 0, 255);
    var alpha = this.withInRange(alpha, 0, 1);
    
    return "rgba(" + red + "," + green + "," + blue + "," + alpha + ")";
};

BASE.canvas.behaviors.Color.prototype.draw = function (context, view) {
    var color = this.createRgba(this.red, this.green, this.blue, this.alpha);
    var top = view.calculateTopPosition();
    var left = view.calculateLeftPosition();
    var width = view.width;
    var height = view.height;
    
    context.fillStyle = color;
    context.fillRect(left, top, width, height);
};

