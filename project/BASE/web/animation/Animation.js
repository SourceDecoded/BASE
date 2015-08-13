﻿BASE.require([
    "requestAnimationFrame",
    "Date.now",
    "Function.prototype.bind",
    "BASE.async.Future",
    "BASE.web.animation.AnimationManager",
    "BASE.web.animation.animationStateManager",
    "BASE.web.animation.easings"
], function () {

    BASE.namespace("BASE.web.animation");

    var easings = BASE.web.animation.easings;
    var AnimationManager = BASE.web.animation.AnimationManager;
    var animationStateManager = BASE.web.animation.animationStateManager;
    var Future = BASE.async.Future;

    var makeTickPercentageObservers = function (observers) {
        for (var x = 0; x <= 100 ; x++) {
            observers[x] = [];
        }
    };

    var returnObserver = function (observer) {
        return observer;
    };

    var Observer = function (callback, unbind) {
        var self = this;
        this._callback = callback;
        this._currentState = Observer.prototype.stateManager.started;
        this.unbind = unbind || function () { };
    };

    Observer.prototype.stateManager = {
        stopped: {
            start: function (observer) {
                observer._currentState = Observer.prototype.stateManager.started;
                return observer;
            },
            stop: returnObserver,
            callback: returnObserver
        },
        started: {
            start: returnObserver,
            stop: function (observer) {
                observer._currentState = Observer.prototype.stateManager.stopped;
                return observer;
            },
            callback: function (observer, event) {
                observer._callback(event);
                return observer;
            }
        }
    };

    Observer.prototype.stop = function () {
        return this._currentState.stop(this);
    };

    Observer.prototype.start = function () {
        return this._currentState.start(this);
    };

    Observer.prototype.callback = function (event) {
        return this._currentState.callback(this, event);
    };

    Observer.prototype.dispose = function () {
        return this.unbind()
    };

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
        this._currentState = animationStateManager.stoppedState;

        this.iterations = 0;
        this.repeat = 1;
        this.repeatDirection = 0;

        this._observers = {
            play: [],
            stop: [],
            pause: [],
            restart: [],
            reverse: [],
            seek: [],
            tick: [],
            end: [],
            start: []
        };

        makeTickPercentageObservers(this._observers);

        if (typeof config.easing === "string") {
            this._easingFunction = easings[config.easing];
        } else if (typeof config.easing === "function") {
            this._easingFunction = config.easing;
        } else {
            this._easingFunction = easings.linear;
        }

    };

    Animation.prototype.animationManager = new AnimationManager();

    Animation.prototype._saveBeginningValues = function () {
        var target = this._target;
        var beginningValues = this._beginningValues;
        var properties = this._properties;

        Object.keys(properties).forEach(function (property) {
            beginningValues[property] = target[property];
        });
    };

    Animation.prototype.play = function () {
        return this._currentState.play(this);
    };

    Animation.prototype.stop = function () {
        this._currentState.stop(this);
        this.seek(0);
        return this;
    };

    Animation.prototype.observeAtTick = function (percentage, callback) {
        percentage = percentage * 100;
        if (typeof percentage === "number" && percentage >= 0 && percentage <= 100) {
            percentage = parseInt(percentage);
            return this.observe(percentage.toString(), callback);
        }

        throw new Error("Invalid Argument Exception: percentage must be a decimal, and with in 0-1");
    };

    Animation.prototype.playToEndAsync = function () {
        var self = this;
        self.stop();
        return new Future(function (setValue, setError, cancel, ifCanceled) {

            var disposeAllObservers = function () {
                reverseObserver.dispose();
                endObserver.dispose();
                stopObserver.dispose();
            };

            var endObserver = self.observe("end", function () {
                disposeAllObservers();
                setValue();
            });

            var canceledCallback = function (event) {
                disposeAllObservers();
                cancel(event.type);
            };

            var stopObserver = self.observe("stop", canceledCallback);
            var reverseObserver = self.observe("reverse", canceledCallback);

            ifCanceled(function () {
                self.stop();
            });

            self.play();
        });
    };

    Animation.prototype.reverseToStartAsync = function () {
        var self = this;
        self.stop();

        return new Future(function (setValue, setError, cancel, ifCanceled) {

            var disposeAllObservers = function () {
                startObserver.dispose();
                stopObserver.dispose();
                playObserver.dispose();
            };

            var startObserver = self.observe("start", function () {
                disposeAllObservers();
                setValue();
            });

            var canceledCallback = function (event) {
                disposeAllObservers();
                cancel(event.type);
            };

            var stopObserver = self.observe("stop", canceledCallback);
            var playObserver = self.observe("play", canceledCallback);

            ifCanceled(function () {
                self.stop();
            });

            self.reverse();

        });
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

    Animation.prototype.notify = function (event) {
        var type = event.type;
        if (Array.isArray(this._observers[type])) {
            this._observers[type].forEach(function (observer) {
                observer.callback(event);
            });
        }
    };

    Animation.prototype.tick = function (time) {
        var value = this._currentState.tick(this, time);
        return value;
    };

    Animation.prototype.invalidate = function () {
        this._progress = 0;
        this._currentState = animationStateManager.pausedState;
        return this;
    };

    Animation.prototype.getProgress = function () {
        return this._progress;
    };

    Animation.prototype.setTimeScale = function (timeScale) {
        this._timeScale = timeScale;
    };

    Animation.prototype.getTimeScale = function () {
        return this._timeScale;
    };

    Animation.prototype.seek = function (progressValue, now) {
        this._currentState.seek(this, progressValue, now);
        return this;
    };

    Animation.prototype.observe = function (type, callback) {
        var self = this;

        if (typeof type !== "string") {
            throw new Error("Need to supply a type.");
        }

        var callbacks = this._observers[type];

        if (typeof callbacks === "undefined") {
            throw new Error("Unknown type to observe to. Here is a list of types to observe to: play, stop, pause, restart, reverse, seek, tick, end, start");
        }

        var observer = new Observer(callback, function () {
            var index = callbacks.indexOf(observer);
            if (index >= 0) {
                callbacks.splice(index, 1);
            }
        });

        callbacks.push(observer);

        return observer;
    };

    Animation.prototype.render = function () {
        var self = this;
        var progress = this._progress;
        var beginningValues = this._beginningValues;
        var endingValues = this._properties;
        var duration = this._duration;
        var easingFunction = this._easingFunction;
        var target = this._target;
        var properties = this._properties;
        var length = properties.length;
        var beginningValue;
        var endingValue;
        var property;
        var value;

        for (property in properties) {
            //beginningValue, endingValue, currentTime, duration, easing
            var beginningValue = beginningValues[property];
            var endingValue = endingValues[property];

            if (typeof endingValue === "object" && endingValue !== null) {
                beginningValue = endingValue.from;
                endingValue = endingValue.to;
            }

            if (typeof beginningValue === "undefined") {
                beginningValues[property] = target[property];
                beginningValue = target[property];
            }

            if (typeof beginningValue !== "number" || typeof endingValue !== "number") {
                throw new Error("Default renderer is only able to animate integers. Set the renderer in the config to handle custom values.");
            }

            var change = endingValue - beginningValue;
            var currentTime = progress * duration;

            if (change !== 0) {
                value = easingFunction(currentTime, beginningValue, change, duration);
            } else {
                value = endingValue;
            }

            // This will be more optimal. Don't set the value unless it changes.
            if (target[property] !== value) {
                target[property] = value;
            }
        }

        return this;
    };

    Animation.REPEAT_DEFAULT = 0;
    Animation.REPEAT_ALTERATE = 1;

    BASE.web.animation.Animation = Animation;

});