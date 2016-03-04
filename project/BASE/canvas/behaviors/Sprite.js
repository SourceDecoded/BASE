BASE.require(["BASE.canvas.Rect"], function () {
    var Rect = BASE.canvas.Rect;
    BASE.namespace("BASE.canvas.behaviors");
    
    BASE.require(["BASE.web.animation.Animation"], function () {
        var Animation = BASE.web.animation.Animation;
        
        var Sprite = function (image, spriteWidth, duration, easing) {
            if (!image.complete) {
                throw new Error("Images need to be loaded before creating ImageViews.");
            }
            var self = this;
            var canvas = document.createElement("canvas");
            this.image = image;
            this.width = image.width;
            this.height = image.height;
            this.count = parseInt(this.width / spriteWidth, 10);
            this.index = 0;
            this.spriteWidth = spriteWidth;
            this.view = null;
            this.animation = new Animation({
                target: this,
                properties: {
                    index: {
                        from: 0,
                        to: this.count
                    }
                },
                easing: easing,
                duration: duration
            });
            
            this.animation.repeat = Infinity;
            this.animation.observe("tick", function () {
                if (self.view) {
                    self.view.dirty = true;
                }
            });
        };
        
        Sprite.prototype.setView = function (view) {
            this.view = view;
            this.animation.play();
        };
        
        Sprite.prototype.removeView = function (view) {
            this.view = null;
            this.animation.stop().seek(0);
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
        
        Sprite.prototype.draw = function (context, viewRect) {
            var x = Math.floor(this.index) * this.spriteWidth;
            var intersection = Rect.getIntersection(this.view, viewRect);
            if (intersection) {
                var startX = this.view.x - intersection.x;
                var startY = this.view.y - intersection.y;
                
                context.drawImage(this.image, -startX + x, -startY , intersection.width, intersection.height, intersection.x - viewRect.x, intersection.y - viewRect.y, intersection.width, intersection.height);
            }
        };
        
        BASE.canvas.behaviors.Sprite = Sprite;

    });
});