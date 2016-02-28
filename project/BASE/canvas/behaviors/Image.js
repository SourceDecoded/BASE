BASE.namespace("BASE.canvas.behaviors");

BASE.canvas.behaviors.Image = function (image, left, top) {
    if (!image.complete) {
        throw new Error("Images need to be loaded before creating ImageViews.");
    }
    this.image = image;
    this.width = image.width;
    this.height = image.height;
    this.left = left || 0;
    this.top = top || 0;
    
};

BASE.canvas.behaviors.Image.prototype.draw = function (context, view) {
    var top = view.calculateTopPosition();
    var left = view.calculateLeftPosition();
    var width = view.width;
    var height = view.height;
    context.drawImage(this.image, 0, 0, this.image.width, this.image.height, left, top, width, height);
};