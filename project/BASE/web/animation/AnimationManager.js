BASE.require([
    "requestAnimationFrame",
    "Date.now",
    "Function.prototype.bind",
    "BASE.async.Future"
], function () {
    BASE.namespace("BASE.web.animation");
    
    var AnimationManager = function () {
        this._currentRequesetAnimationFrame = null;
        this._animations = [];
        this._lastTime = 0;
        this._fps = 100;
        this._refreshRateInMilliseconds = 1000 / this._fps;
        
        this._requestCallback = function (time) {
            this.tick(time);
        };
        this._requestCallback = this._requestCallback.bind(this);
        this.setFramesPerSecond(this._fps);
    };
    
    AnimationManager.prototype.setFramesPerSecond = function (fps) {
        this._fps = fps;
        this._refreshRateInMilliseconds = 1000 / fps;
    };
    
    AnimationManager.prototype.getFramesPerSecond = function () {
        return this._fps;
    };
    
    AnimationManager.prototype.checkRequestToStartOrStop = function () {
        var self = this;
        var animations = this._animations;
        if (this._currentRequesetAnimationFrame === null && animations.length > 0) {
            this._currentRequesetAnimationFrame = requestAnimationFrame(this._requestCallback);
        }
    };
    
    AnimationManager.prototype.tick = function (time) {
        var x;
        var self;
        var animation;
        var animationsCopy;
        var animations = this._animations;
        var length = animations.length;
        var now = Date.now();
        
        var elapsedTime = time - this._lastTime;
        
        // Throttle this to be the specified frames per second.
        if (elapsedTime >= this._refreshRateInMilliseconds) {
            this._lastTime = time;
            
            if (length > 0) {
                animationsCopy = animations.slice(0);
                
                animationsCopy.forEach(function (animation) {
                    animation.tick(now);
                });
                
                this._currentRequesetAnimationFrame = requestAnimationFrame(this._requestCallback);

            } else {
                this._currentRequesetAnimationFrame = null;
            }
        } else {
            this._currentRequesetAnimationFrame = requestAnimationFrame(this._requestCallback);
        }
    };
    
    AnimationManager.prototype.now = function () {
        return Date.now();
    };
    
    AnimationManager.prototype.register = function (animation) {
        var index = this._animations.indexOf(animation);
        if (index === -1) {
            this._animations.push(animation);
            this.checkRequestToStartOrStop();
        }
    };
    
    AnimationManager.prototype.unregister = function (animation) {
        var index = this._animations.indexOf(animation);
        if (index >= 0) {
            this._animations.splice(index, 1);
        }
    };
    
    BASE.web.animation.AnimationManager = AnimationManager;
});