BASE.namespace("BASE.canvas.behaviors");

BASE.canvas.behaviors.Color = function (red, green, blue, alpha) {
    this.red = red || 0;
    this.green = green || 0;
    this.blue = blue || 0;
    this.alpha = alpha || 1;
};

BASE.canvas.behaviors.Color.prototype.setView = function (view) {
    this.view = view;
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

BASE.canvas.behaviors.Color.prototype.draw = function (context, x, y, width, height) {
    var color = this.createRgba(this.red, this.green, this.blue, this.alpha);
    var view = this.view;
    x = x || view.x;
    y = y || view.y;
    width = width || view.width;
    height = height || view.height;
    
    x = Math.max(x, view.x);
    y = Math.max(y, view.y);
    
    var right = Math.min(x + width, view.x + view.width);
    var bottom = Math.min(y + height , view.y + view.height);
    
    width = right - x;
    height = bottom - y;
    
    if (width > 0 && height > 0) {
        context.fillStyle = color;
        context.fillRect(x, y, width, height);
    }
};

