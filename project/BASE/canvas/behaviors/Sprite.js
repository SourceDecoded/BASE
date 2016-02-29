BASE.namespace("BASE.canvas.behaviors");

BASE.require(["BASE.web.animation.Animation"], function () {
    var Animation = BASE.web.animation.Animation;
    
    var Sprite = function (image, spriteWidth, duration, easing) {
        if (!image.complete) {
            throw new Error("Images need to be loaded before creating ImageViews.");
        }
        
        var canvas = document.createElement("canvas");
        var imageContext = canvas.getContext("2d");
        
        this.width = image.width;
        this.height = image.height;
        this.imageContext = imageContext;
        this.count = parseInt(this.width / spriteWidth, 10);
        this.index = 0;
        this.spriteWidth;
        this.animation = new Animation({
            target: this,
            properties: {
                index: {
                    from: 0,
                    to: count
                }
            },
            easing: easing,
            duration: duration
        });
        
        imageContext.drawImage(image, 0, 0);
    };
    
    Sprite.prototype.restart = function () {
        this.animation.restart();
    };
    
    Sprite.prototype.pause = function () {
        this.animation.pause();
    };
    
    Sprite.prototype.play = function () {
        this.animation.play();
    };
    
    Sprite.prototype.seek = function (value) {
        this.animation.seek(value);
    };
    
    Sprite.prototype.draw = function (context, view) {
        var canvasTop = view.calculateTopPosition();
        var canvaseLeft = view.calculateLeftPosition();
        var spriteWidth = this.spriteWidth;
        var spriteHeight = this.height;
        var left = this.index * this.spriteWidth;
        
        context.drawImage(0, left, spriteWidth, spriteHeight, canvasTop, canvasLeft, spriteWidth, spriteHeight);
    };
    
    BASE.canvas.behaviors.Sprite = Sprite;

});