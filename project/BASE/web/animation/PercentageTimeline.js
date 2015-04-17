BASE.require([
    "BASE.web.animation.Timeline",
    "BASE.collections.Hashmap"
], function () {

    var Timeline = BASE.web.animation.Timeline;
    var Animation = BASE.web.animation.Animation;
    var Hashmap = BASE.collections.Hashmap;

    BASE.namespace("BASE.web.animation");

    var PercentageTimeline = function (duration) {
        Timeline.call(this);
        this._duration = duration;
    };

    PercentageTimeline.prototype = Object.create(Timeline.prototype);
    PercentageTimeline.prototype.constructor = PercentageTimeline;

    PercentageTimeline.prototype._calculateAnimations = function () {
        var self = this;
        self._animationItems.getValues().forEach(function (animationItem) {
            var offset = animationItem.startAt * self._duration;
            var duration = (animationItem.endAt * self._duration) - offset;

            animationItem.offset = offset;
            animationItem.animation._duration = duration;

        });
    };

    PercentageTimeline.prototype.add = function () {
        var self = this;
        var animationItems = Array.prototype.slice.call(arguments, 0);

        animationItems.forEach(function (animationItem) {
            if (typeof animationItem.startAt !== "number") {
                throw new Error("animationItem needs to have an startAt percentage property set.");
            }

            if (typeof animationItem.endAt !== "number") {
                throw new Error("animationItem needs to have an endAt percentage property set.");
            }

            if (!(animationItem.animation instanceof Animation)) {
                throw new Error("animationItem needs to have an animation property set thats an instanceof Animation.");
            }

            if ((animationItem.startAt < 0 && animationItem.startAt > 1) || (animationItem.endAt < 0 && animationItem.endAt > 1)) {
                throw new Error("startAt and endAt need to be within 0-1.");
            }

            if (animationItem.startAt > animationItem.endAt) {
                throw new Error("endAt needs to be greater than startAt.");
            }

            self._animationItems.add(animationItem, animationItem);
            self._calculateAnimations();

            if (animationItem.animation instanceof Timeline) {
                animationItem.animation._calculateAnimations();
            }
        });

    };

    BASE.web.animation.PercentageTimeline = PercentageTimeline;



});