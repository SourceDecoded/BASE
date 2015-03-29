BASE.require([
    "requestAnimationFrame",
    "Date.now",
    "Function.prototype.bind",
    "BASE.async.Future"
], function () {

    BASE.namespace("BASE.web");

    var emptyFnWithReturnAnimation = function (animation) { return animation; };

    var easings = {
        easeInQuad: function (t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        easeOutQuad: function (t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        easeInOutQuad: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        },
        easeInCubic: function (t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        easeOutCubic: function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        easeInOutCubic: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        },
        easeInQuart: function (t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        easeOutQuart: function (t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeInOutQuart: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },
        easeInQuint: function (t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        easeOutQuint: function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        easeInOutQuint: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        },
        easeInSine: function (t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        easeOutSine: function (t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        easeInOutSine: function (t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        },
        easeInExpo: function (t, b, c, d) {
            return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },
        easeOutExpo: function (t, b, c, d) {
            return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },
        easeInOutExpo: function (t, b, c, d) {
            if (t == 0) return b;
            if (t == d) return b + c;
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        easeInCirc: function (t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        easeOutCirc: function (t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },
        easeInOutCirc: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        },
        easeInElastic: function (t, b, c, d) {
            var s = 1.70158; var p = 0; var a = c;
            if (t == 0) return b; if ((t /= d) == 1) return b + c; if (!p) p = d * .3;
            if (a < Math.abs(c)) { a = c; var s = p / 4; }
            else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        easeOutElastic: function (t, b, c, d) {
            var s = 1.70158; var p = 0; var a = c;
            if (t == 0) return b; if ((t /= d) == 1) return b + c; if (!p) p = d * .3;
            if (a < Math.abs(c)) { a = c; var s = p / 4; }
            else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
        },
        easeInOutElastic: function (t, b, c, d) {
            var s = 1.70158; var p = 0; var a = c;
            if (t == 0) return b; if ((t /= d / 2) == 2) return b + c; if (!p) p = d * (.3 * 1.5);
            if (a < Math.abs(c)) { a = c; var s = p / 4; }
            else var s = p / (2 * Math.PI) * Math.asin(c / a);
            if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
        },
        easeInBack: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        easeOutBack: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeInOutBack: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        },
        easeInBounce: function (t, b, c, d) {
            return c - easings.easeOutBounce(d - t, 0, c, d) + b;
        },
        easeOutBounce: function (t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
            }
        },
        easeInOutBounce: function (t, b, c, d) {
            if (t < d / 2) return easings.easeInBounce(t * 2, 0, c, d) * .5 + b;
            return easings.easeOutBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
        },
        linear: function (t, b, c, d) {
            return c * t / d + b;
        }
    };

    var TickHandlerManager = function () {
        this.handlers = [];
        this.regExes = [];

        this.defaultHandler = function (beginningValue, endingValue, currentTime, duration, easing) {
            return endingValue;
        };
    };

    TickHandlerManager.prototype.add = function (regEx, handler) {
        if (typeof handler !== "function") {
            throw new Error("The handler needs to be a function.");
        }

        if (!(regEx instanceof RegExp)) {
            throw new Error("The regEx needs to be a Regular Expression.");
        }

        this.regExes.push(regEx);
        this.handlers.push(handler);
    };

    TickHandlerManager.prototype.remove = function (regEx) {
        var index = regExes.indexOf(regEx);

        if (index > -1) {
            this.regExes.splice(index, 1);
            this.handlers.splice(index, 1);
        }
    };

    TickHandlerManager.prototype.getHandler = function (value) {
        var self = this;
        var handler = this.defaultHandler;

        this.regExes.some(function (regEx, index) {
            var match = regEx.test(value);
            if (match) {
                handler = self.handlers[index];
            }
            return match;
        });

        return handler;
    };

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

        // Throttle this to be specified frames per second.
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

    AnimationManager.prototype.register = function (animation) {
        this._animations.push(animation);
        this.checkRequestToStartOrStop();
    };

    AnimationManager.prototype.unregister = function (animation) {
        var index = this._animations.indexOf(animation);
        if (index >= 0) {
            this._animations.splice(index, 1);
        }
    };

    var AnimationStateManager = function () { };

    AnimationStateManager.prototype.defaultState = {
        play: function (animation) {
            animation._startTime = Date.now();
            animation._currentTime = Date.now();
            animation._saveBeginningValues();
            animation.animationManager.register(animation);
            animation._currentState = AnimationStateManager.prototype.forwardState;
            return animation;
        },
        pause: emptyFnWithReturnAnimation,
        reverse: emptyFnWithReturnAnimation,
        tick: emptyFnWithReturnAnimation,
        restart: function (animation) {
            return this.play(animation);
        }
    };

    AnimationStateManager.prototype.forwardState = {
        play: emptyFnWithReturnAnimation,
        pause: function (animation) {
            animation.animationManager.unregister(animation);
            animation._currentState = AnimationStateManager.prototype.pausedState;
            return animation;
        },
        reverse: function (animation) {
            animation._startTime = Date.now();
            animation._currentState = AnimationStateManager.prototype.reverseState;
            return animation;
        },
        tick: function (animation, now) {
            var lastTime = animation._currentTime;

            if (now < lastTime) {
                throw new Error("Impossible time. Previous tick was greater than the current tick.");
            }

            var change = now - lastTime;
            animation._currentTime = now;
            var progress = animation._progress = animation._progress + (change / animation._duration);
            animation._progress = progress = progress > 1 ? 1 : progress;
            animation.render(progress);

            if (progress === 1) {
                animation.animationManager.unregister(animation);
                animation._currentState = AnimationStateManager.prototype.finishedState;
            }

            return animation;
        },
        restart: AnimationStateManager.prototype.defaultState.restart
    };

    AnimationStateManager.prototype.reverseState = {
        play: function (animation) {
            animation._startTime = Date.now();
            animation._currentState = AnimationStateManager.prototype.forwardState;
            return animation;
        },
        pause: function (animation) {
            animation.animationManager.unregister(animation);
            animation._currentState = AnimationStateManager.prototype.pausedState;
            return animation;
        },
        reverse: emptyFnWithReturnAnimation,
        tick: function (animation, now) {
            var lastTime = animation._currentTime;

            if (now < lastTime) {
                throw new Error("Impossible time. Previous tick was greater than the current tick.");
            }

            var change = now - lastTime;
            animation._currentTime = now;
            var progress = animation._progress = animation._progress - (change / animation._duration);
            animation._progress = progress = progress < 0 ? 0 : progress;
            animation.render(progress);

            if (progress === 0) {
                animation.animationManager.unregister(animation);
                animation._currentState = AnimationStateManager.prototype.finishedState;
            }

            return animation;
        },
        restart: AnimationStateManager.prototype.defaultState.restart
    };

    AnimationStateManager.prototype.pausedState = {
        play: function (animation) {
            animation._startTime = Date.now();
            animation._currentTime = Date.now();
            animation.animationManager.register(animation);
            animation._currentState = AnimationStateManager.prototype.forwardState;
            return animation;
        },
        pause: emptyFnWithReturnAnimation,
        reverse: function (animation) {
            animation._startTime = Date.now();
            animation._currentTime = Date.now();
            animation.animationManager.register(animation);
            animation._currentState = AnimationStateManager.prototype.reverseState;
            return animation;
        },
        tick: emptyFnWithReturnAnimation,
        restart: AnimationStateManager.prototype.defaultState.restart
    };

    AnimationStateManager.prototype.finishedState = AnimationStateManager.prototype.pausedState;


    var Animation = function (config) {
        var self = this;
        config = config || {};

        this._target = config.target || {};
        this._currentTime = 0;
        this._timeScale = 1;
        this._duration = config.duration || 0;
        this._progress = 0;
        this._properties = config.properties || {};
        this._beginningValues = {};
        this._startTime = 0;
        this._currentRequestAnimationFrameId = null;
        this._currentState = AnimationStateManager.prototype.defaultState;
        this._propertyHandlers = {};
        this._lastValues = {};

        if (typeof config.easing === "string") {
            this._easingFunction = easings[config.easing]
        } else if (typeof config.easing === "function") {
            this._easingFunction = config.easing;
        } else {
            this._easingFunction = easings.linear;
        }


        this._getTickHandlers();
    };

    Animation.prototype.tickHandlerManager = new TickHandlerManager();
    Animation.prototype.animationManager = new AnimationManager();

    Animation.prototype._getTickHandler = function (propertyName, value) {
        var self = this;
        var tickHandlerManager = this.tickHandlerManager;
        var handlers = self._propertyHandlers;

        var handler = handlers[propertyName];
        if (typeof handler !== "function") {
            handler = handlers[propertyName] = tickHandlerManager.getHandler(value);
        }

        return handler;
    };

    Animation.prototype._getTickHandlers = function () {
        var self = this;
        var target = this._target;
        var properties = this._properties;

        Object.keys(properties).forEach(function (property) {
            self._getTickHandler(property, properties[property]);
        });
    };

    Animation.prototype._saveBeginningValues = function () {
        var target = this._target;
        var beginningValues = this._beginningValues;
        var lastValues = this._lastValues;

        Object.keys(target).forEach(function (property) {
            beginningValues[property] = target[property];
            lastValues[property] = target[property];
        });
    };

    Animation.prototype.play = function () {
        return this._currentState.play(this);
    };

    Animation.prototype.pause = function () {
        return this._currentState.pause(this);
    };

    Animation.prototype.restart = function () {
        return this._currentState.restart(this);
    };

    Animation.prototype.reverse = function () {
        return this._currentState.reverse(this);
    };

    Animation.prototype.tick = function (time) {
        return this._currentState.tick(this, time);
    };

    Animation.prototype.invalidate = function () {
        this._saveBeginningValues();
        this._currentState = AnimationStateManager.prototype.defaultState;
        return this;
    };

    Animation.prototype.getProgress = function () {
        return this._progress;
    };

    Animation.prototype.seek = function (progressValue) {
        if (progressValue >= 0 && progressValue <= 1) {
            this._currentTime = Date.now();
            this._progress = progressValue;
            this.render(progressValue);
        } else {
            throw new Error("progressValue needs to be with in this range (0-1).");
        }

        return this;
    };

    Animation.prototype.render = function (progress) {
        var self = this;
        var beginningValues = this._beginningValues;
        var endingValues = this._properties;
        var duration = this._duration;
        var propertyHandlers = this._propertyHandlers;
        var easingFunction = this._easingFunction;
        var target = this._target;
        var lastValues = this._lastValues;
        var properties = this._properties;
        var length = properties.length;
        var beginningValue;
        var endingValue;
        var handler;
        var property;

        for (property in properties) {
            //beginningValue, endingValue, currentTime, duration, easing
            var beginningValue = beginningValues[property];
            var endingValue = endingValues[property];
            var handler = propertyHandlers[property];

            if (typeof beginningValue === "undefined") {
                beginningValues[property] = target[property];
                lastValues[property] = target[property];
                beginningValue = target[property];
            }

            var value = handler(beginningValue, endingValue, progress, duration, easingFunction);

            // This will be more optimal. Don't set the value unless it changes.
            if (lastValues[property] !== value) {
                target[property] = value;
                lastValues[property] = value;
            }
        }

        return this;
    };

    //Integer Unit Tick Handler
    integerUnitTickHandler = function (beginningValue, endingValue, progress, duration, easingFunction) {
        var beginningResults = integerUnitRegEx.exec(beginningValue);
        var endingResults = integerUnitRegEx.exec(endingValue);

        var unit = beginningResults[2];
        var beginningInteger = parseInt(beginningResults[1], 10);
        var endingInteger = parseInt(endingResults[1], 10);
        var change = endingInteger - beginningInteger;
        var currentTime = progress * duration;
        var value;

        if (change !== 0) {
            var value = easingFunction(currentTime, beginningInteger, change, duration);
        } else {
            value = endingInteger;
        }

        return parseInt(value, 10) + unit;
    };

    integerUnitRegEx = /^(\d+)(.*?)$/i;

    Animation.prototype.tickHandlerManager.add(integerUnitRegEx, integerUnitTickHandler);

    BASE.web.Animation = Animation;
    BASE.web.TickHandlerManager = TickHandlerManager;

});