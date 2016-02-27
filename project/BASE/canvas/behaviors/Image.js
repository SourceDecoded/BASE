BASE.namespace("BASE.web.canvas.behaviors");

BASE.canvas.behaviors.Image = function (image) {
    if (!image.complete) {
        throw new Error("Images need to be loaded before creating ImageViews.");
    }
    
    var canvas = document.createElement("canvas");
    var imageContext = canvas.getContext("2d");
    this.width = image.width;
    this.height = image.height;
    
    imageContext.drawImage(image, 0, 0);
    
    this.imageContext = imageContext;
};

BASE.canvas.behaviors.Image.prototype.draw = function (context, view) {
    var top = view.calculateTopPosition();
    var left = view.calculateLeftPosition();
    var width = view.width;
    var height = view.height;
    
    context.putImageData(this.imageContext.getImageData(0, 0, view.width, view.height), top, left);
};