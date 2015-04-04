BASE.require([
    "BASE.web.animation.Animation",
    "BASE.web.animation.animationStateManager",
    "BASE.collections.Hashmap"
], function () {

    BASE.namespace("BASE.web.animation");

    var Animation = BASE.web.animation.Animation;
    var Hashmap = BASE.collections.Hashmap;
    var animationStateManager = BASE.web.animation.animationStateManager;

    var Timeline = function (config) {
        Animation.call(this, config);

        this._animationItems = new Hashmap();
        this._iterationCount = 1;
    };

    var sortForPlay = function (firstItem, secondItem) {
        return (secondItem.offset + secondItem.animation._duration) - (firstItem.offset + firstItem.animation._duration);
    };

    var sortForReverse = function (firstItem, secondItem) {
        return firstItem.offset - secondItem.offset;
    };

    Timeline.prototype = Object.create(Animation.prototype);
    Timeline.prototype.constructor = Timeline;

    Timeline.prototype.calculateDuration = function () {
        return this._animationItems.getValues().reduce(function (duration, animationItem) {
            var animationTotalDuration = animationItem.offset + animationItem.animation._duration;
            if (animationTotalDuration > duration) {
                return animationTotalDuration;
            }
            return duration;
        }, 0);
    };

    Timeline.prototype.add = function () {
        var animationItems = Array.prototype.slice.call(arguments, 0);
        var self = this;

        animationItems.forEach(function (animationItem) {
            if (typeof animationItem.offset !== "number") {
                throw new Error("animationItem needs to have an offset property set.");
            }

            if (!(animationItem.animation instanceof Animation)) {
                throw new Error("animationItem needs to have an animation property set thats an instanceof Animation.");
            }

            self._animationItems.add(animationItem, animationItem);
        });

        this._duration = this.calculateDuration();
    };

    Timeline.prototype.remove = function (animation) {
        this._animationItems.remove(animationItem);
    };

    Timeline.prototype.render = function () {
        var progress = this._progress;
        var timelineDuration = this._duration;
        var currentTime = progress * timelineDuration;
        var timeScale = this._timeScale;
        var now = Date.now();

        var sortFunction = sortForPlay;

        if (this._currentState === animationStateManager.reverseState) {
            sortFunction = sortForReverse;
        }

        var animationsItems = this._animationItems.getValues();
        animationsItems.sort(sortFunction);

        animationsItems.forEach(function (animationItem) {
            var duration = animationItem.animation._duration;
            var offset = animationItem.offset;
            var animation = animationItem.animation;

            animation.setTimeScale(timeScale);

            if (currentTime >= offset && currentTime <= offset + duration) {
                var difference = currentTime - offset;
                var animationProgress = difference / duration;
                animation.seek(animationProgress, now);
            }

            // Based on the direction we are going we need to set the animations accordingly.
            // We need to set the animation if it isn't already set.
            if (currentTime > offset + duration && animation._progress !== 1) {
                animation.seek(1);
            }

            if (currentTime < offset && animation._progress !== 0) {
                animation.seek(0);
            }
        });
    };

    BASE.web.animation.Timeline = Timeline;

});