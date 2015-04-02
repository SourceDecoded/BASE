BASE.require([
    "BASE.web.animation.Animation"
], function () {

    BASE.namespace("BASE.web.animation");

    var Animation = BASE.web.animation.Animation;

    //**************************************************************************************//
    //*                                   Renderers                                        *//
    //**************************************************************************************//
    var numberHandler = function (beginningValue, endingValue, progress, duration, easingFunction) {
        var change = endingValue - beginningValue;
        var currentTime = progress * duration;

        if (change !== 0) {
            value = easingFunction(currentTime, beginningValue, change, duration);
        } else {
            value = endingValue;
        }

        return value;
    };

    var integerUnitRegEx = /^(\d+\.?\d+)+(.*?)$/i;
    var numberUnitHandler = function (beginningValue, endingValue, progress, duration, easingFunction) {
        var beginningResults = integerUnitRegEx.exec(beginningValue);
        var endingResults = integerUnitRegEx.exec(endingValue);

        var unit = beginningResults[2];
        var beginningInteger = parseInt(beginningResults[1], 10);
        var endingInteger = parseInt(endingResults[1], 10);
        var value = numberHandler(beginningInteger, endingInteger, progress, duration, easingFunction);

        return value + unit;
    };

    var decimalHandler = function (beginningValue, endingValue, progress, duration, easingFunction) {
        beginningValue = parseFloat(beginningValue);
        endingValue = parseFloat(endingValue);

        var value = numberHandler(beginningValue, endingValue, progress, duration, easingFunction);

        return value;
    };

    var transformHandler = function () { };

    var parseHex = function (hex) {
        if (hex.indexOf("#") !== 0) {
            throw new Error("Invalid Hex.");
        }

        var rgb = {
            red: 0,
            green: 0,
            blue: 0
        };

        if (hex.length === 4) {
            rgb.red = parseInt(hex.charAt(1) + hex.charAt(1), 16);
            rgb.green = parseInt(hex.charAt(2) + hex.charAt(2), 16);
            rgb.blue = parseInt(hex.charAt(3) + hex.charAt(3), 16);
        } else {
            rgb.red = parseInt(hex.substr(1, 2), 16);
            rgb.green = parseInt(hex.substr(3, 2), 16);
            rgb.blue = parseInt(hex.substr(5, 2), 16);
        }

        return rgb;
    };

    var convertHexToRgb = function (hex) {
        var rgb = parseHex(hex);
        return "rgb(" + rgb.red + "," + rgb.green + "," + rgb.blue + ")";
    };

    var getRgbWithInRangeValue = function (value) {
        value = value < 0 ? 0 : value;
        value = value > 255 ? 255 : value;

        return value;
    };

    var hexHandler = function (beginningValue, endingValue, progress, duration, easingFunction) {
        var beginningValues = parseHex(beginningValue);
        var endingValues = parseHex(endingValue);

        var red = parseInt(numberHandler(beginningValues.red, endingValues.red, progress, duration, easingFunction), 10);
        var green = parseInt(numberHandler(beginningValues.green, endingValues.green, progress, duration, easingFunction), 10);
        var blue = parseInt(numberHandler(beginningValues.blue, endingValues.blue, progress, duration, easingFunction), 10);

        return "#" + getRgbWithInRangeValue(red).toString(16) + getRgbWithInRangeValue(green).toString(16) + getRgbWithInRangeValue(blue).toString(16);
    };

    var rgbRegEx = /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i;
    var rgbHandler = function (beginningValue, endingValue, progress, duration, easingFunction) {
        var beginningValues = beginningValue.match(rgbRegEx);
        var endingValues = endingValue.match(rgbRegEx);

        if (beginningValues === null || endingValues === null) {
            throw new Error("Cannot parse rgb, rgba isn't supported yet.");
        }

        var red = parseInt(numberHandler(parseInt(beginningValues[1], 10), parseInt(endingValues[1], 10), progress, duration, easingFunction), 10);
        var green = parseInt(numberHandler(parseInt(beginningValues[2], 10), parseInt(endingValues[2], 10), progress, duration, easingFunction), 10);
        var blue = parseInt(numberHandler(parseInt(beginningValues[3], 10), parseInt(endingValues[3], 10), progress, duration, easingFunction), 10);

        return "rgb(" + getRgbWithInRangeValue(red) + "," + getRgbWithInRangeValue(green) + "," + getRgbWithInRangeValue(blue) + ")";
    };

    var colorHandler = function (beginningValue, endingValue, progress, duration, easingFunction) {
        if (beginningValue.indexOf("#") === 0) {
            beginningValue = convertHexToRgb(beginningValue);
        }

        if (endingValue.indexOf("#") === 0) {
            endingValue = convertHexToRgb(endingValue);
        }

        return rgbHandler(beginningValue, endingValue, progress, duration, easingFunction);
    };

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
        transform: transformHandler,
        opacity: decimalHandler,
        color: colorHandler,
        backgroundColor: colorHandler
    };

    var ElementAnimation = function (config) {
        this._element = null;

        if (config.target instanceof Element) {
            this._element = config.target;
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

            if (typeof endingValue === "object" && endingValue !== null) {
                endingValue = endingValues[property].to;
            }

            if (typeof beginningValue === "undefined") {
                // If there isn't a default from get the value off the object.
                if (typeof properties[property].from !== "undefined") {
                    beginningValue = properties[property].from;
                } else {
                    beginningValue = target[property];
                }

                beginningValues[property] = beginningValue;
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





