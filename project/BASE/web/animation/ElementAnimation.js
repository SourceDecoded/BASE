BASE.require([
    "BASE.web.animation.Animation"
], function () {

    BASE.namespace("BASE.web.animation");

    var Animation = BASE.web.animation.Animation;

    //**************************************************************************************//
    //*                                   Renderers                                        *//
    //**************************************************************************************//
    var integerUnitRegEx = /^(\d+\.?\d+)+(.*?)$/i;
    var numberUnitHandler = function (beginningValue, endingValue, progress, duration, easingFunction) {
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

        return value + unit;
    };

    var transformHandler = function () { };
    var colorHandler = function () { };

    //**************************************************************************************//
    //*                                  End of Renderers                                  *//
    //**************************************************************************************//

    var propertyRenderers = {
        width: numberUnitHandler,
        height: numberUnitHandler,
        top: numberUnitHandler,
        right: numberUnitHandler,
        bottom: numberUnitHandler,
        left: numberUnitHandler,
        fontSize: numberUnitHandler,
        border: numberUnitHandler,
        margin: numberUnitHandler,
        padding: numberUnitHandler,
        transform: transformHandler
    };

    var ElementAnimation = function (config) {
        if (config.target instanceof Element) {
            config.target = config.target.style;
        }

        Animation.call(this, config);
    };

    ElementAnimation.prototype = Object.create(Animation.prototype);
    ElementAnimation.prototype.constructor = ElementAnimation;

    ElementAnimation.prototype.render = function (progress) {
        var self = this;
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

            if (typeof beginningValue === "undefined") {
                beginningValues[property] = target[property];
                beginningValue = target[property];
            }

            var handler = propertyRenderers[property];

            if (typeof handler !== "function") {
                throw new Error("Doesn't support '" + property + "' style animations.");
            }

            value = handler(beginningValue, endingValue, progress, duration, easingFunction);

            this._progress = progress;

            // This will be more optimal. Don't set the value unless it changes.
            if (target[property] !== value) {
                target[property] = value;
            }
        }

        return this;
    };

    BASE.web.animation.ElementAnimation = ElementAnimation;

});





