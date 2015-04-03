BASE.require([
    "BASE.web.animation.Animation",
    "BASE.collections.Hashmap"
], function () {

    BASE.namespace("BASE.web.animation");

    var Animation = BASE.web.animation.Animation;
    var Hashmap = BASE.collections.Hashmap;

    var AnimationTimeline = function (config) {
        Animation.call(this, config);

        this._animationItems = new Hashmap();
        this._iterationCount = 1;
    };

    AnimationTimeline.prototype = Object.create(Animation.prototype);
    AnimationTimeline.prototype.constructor = AnimationTimeline;

    AnimationTimeline.prototype.calculateDuration = function () {
        return this._animationItems.getValues().reduce(function (duration, animationItem) {
            var animationTotalDuration = animationItem.offset + animationItem.animation._duration;
            if (animationTotalDuration > duration) {
                return animationTotalDuration;
            }
            return duration;
        }, 0);
    };

    AnimationTimeline.prototype.add = function () {
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

    AnimationTimeline.prototype.remove = function (animation) {
        this._animationItems.remove(animationItem);
    };

    AnimationTimeline.prototype.render = function (progress) {
        var timelineDuration = this._duration;
        var currentTime = progress * timelineDuration;
        var timeScale = this._timeScale;

        this._animationItems.getValues().forEach(function (animationItem) {
            var duration = animationItem.animation._duration;
            var offset = animationItem.offset;
            var animation = animationItem.animation;

            animation.setTimeScale(timeScale);

            if (currentTime >= offset && currentTime <= offset + duration) {
                var difference = currentTime - offset;
                var animationProgress = difference / duration;
                animation.seek(animationProgress);
            }

            // This will set the animation to the end, if the profress is past the animations time.
            if (currentTime > offset + duration) {
                animation.seek(1);
            }

            if (currentTime < offset) {
                animation.seek(0);
            }
        });
    };

    BASE.web.animation.AnimationTimeline = AnimationTimeline;

});