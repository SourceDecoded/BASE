BASE.require(["BASE.canvas.Rect"], function () {
    var Rect = BASE.canvas.Rect;
    
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
    
    BASE.canvas.behaviors.Image.prototype.draw = function (context, viewRect) {
        var intersection = Rect.getIntersection(this.view, viewRect);
        if (intersection) {
            var startX = this.view.x - intersection.x;
            var startY = this.view.y - intersection.y;
            
            context.drawImage(this.image, -startX, -startY, intersection.width, intersection.height, intersection.x - viewRect.x, intersection.y - viewRect.y, intersection.width, intersection.height);
        }
    };
});