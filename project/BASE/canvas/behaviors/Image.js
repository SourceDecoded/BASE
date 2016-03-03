BASE.namespace("BASE.canvas.behaviors");

BASE.canvas.behaviors.Image = function (image, left, top) {
    if (!image.complete) {
        throw new Error("Images need to be loaded before creating ImageViews.");
    }
    this.image = image;
    this.width = image.width;
    this.height = image.height;
};


BASE.canvas.behaviors.Image.prototype.setView = function (view) {
    this.view = view;
};

BASE.canvas.behaviors.Image.prototype.draw = function (context, x, y, width, height) {
    var startX = 0;
    var startY = 0;
    
    if (x < 0) {
        startX = -x;
        width += x;
        x = 0;
    }
    
    if (y < 0) {
        startY = -y;
        height += y;
        y = 0;
    }
    
    context.drawImage(this.image, startX, startY, width, height, x, y, width, height);
};