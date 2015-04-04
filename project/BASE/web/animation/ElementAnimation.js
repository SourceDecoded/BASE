BASE.require([
    "BASE.web.animation.Animation"
], function () {

    BASE.namespace("BASE.web.animation");

    var Animation = BASE.web.animation.Animation;
    var integerUnitRegEx = /^(\-?\d*\.?\d+)+(.*?)$/i;
    var rgbRegEx = /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i;

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

    ElementAnimation.prototype.mapping = {
        width: "numberUnitHandler",
        height: "numberUnitHandler",
        top: "numberUnitHandler",
        right: "numberUnitHandler",
        bottom: "numberUnitHandler",
        left: "numberUnitHandler",
        fontSize: "numberUnitHandler",
        border: "numberUnitHandler",
        margin: "numberUnitHandler",
        padding: "numberUnitHandler",
        opacity: "decimalHandler",
        color: "colorHandler",
        backgroundColor: "colorHandler",
        rotateX: "rotateXHandler",
        rotateY: "rotateYHandler",
        rotateZ: "rotateZHandler",
        scaleX: "scaleXHandler",
        scaleY: "scaleYHandler",
        scaleZ: "scaleZHandler",
        translateX: "translateXHandler",
        translateY: "translateYHandler",
        translateZ: "translateZHandler"
    };

    ElementAnimation.prototype.render = function () {
        var progress = this._progress;
        var properties = this._properties;
        var propertyHandlerName;
        var property;

        for (property in properties) {
            propertyHandlerName = this.mapping[property]
            var handler = this[propertyHandlerName];

            if (typeof handler !== "function") {
                throw new Error("Doesn't support '" + property + "' style animations.");
            }

            this[propertyHandlerName](property, progress);
        }

        return this;
    };

    ElementAnimation.prototype.getEndingValue = function (property) {
        var endingValue = this._properties[property];
        if (typeof endingValue === "object" && endingValue !== null) {
            endingValue = endingValue.to;
        }
        return endingValue;
    };

    ElementAnimation.prototype.getBeginningValue = function (property) {
        var beginningValue = this._beginningValues[property];
        var properties = this._properties;

        if (typeof beginningValue === "undefined") {
            // If there isn't a default from get the value off the object.
            if (typeof properties[property].from !== "undefined") {
                beginningValue = properties[property].from;
            } else {
                beginningValue = this._target[property];
            }

            if (beginningValue === "" || typeof beginningValue === "undefined") {
                throw new Error("Couldn't find beginning value for property '" + property + "'.");
            }

            this._beginningValues[property] = beginningValue;
        }

        if (typeof beginningValue === "undefined") {
            throw new Error("Couldn't find beginning value for property: " + property + ". Try setting a 'from' value in the configuration of the aniimation.");
        }

        return beginningValue;
    };

    ElementAnimation.prototype.rgbHandler = function (beginningValue, endingValue, progress, duration, easingFunction) {
        var value;

        var beginningValues = beginningValue.match(rgbRegEx);
        var endingValues = endingValue.match(rgbRegEx);

        if (beginningValues === null || endingValues === null) {
            throw new Error("Cannot parse rgb, rgba isn't supported yet.");
        }

        var redBeginningValue = parseInt(beginningValues[1], 10);
        var redEndingValue = parseInt(endingValues[1], 10);

        var greenBeginningValue = parseInt(beginningValues[2], 10);
        var greenEndingValue = parseInt(endingValues[2], 10);

        var blueBeginningValue = parseInt(beginningValues[3], 10);
        var blueEndingValue = parseInt(endingValues[3], 10);

        var red = parseInt(this.numberHandler(redBeginningValue, redEndingValue, progress, duration, easingFunction), 10);
        var green = parseInt(this.numberHandler(greenBeginningValue, greenEndingValue, progress, duration, easingFunction), 10);
        var blue = parseInt(this.numberHandler(blueBeginningValue, blueEndingValue, progress, duration, easingFunction), 10);

        red = getRgbWithInRangeValue(red);
        green = getRgbWithInRangeValue(green);
        blue = getRgbWithInRangeValue(blue);

        value = "rgb(" + red + "," + green + "," + blue + ")";

        return value;
    };

    ElementAnimation.prototype.prepareTransformValues = function () {
        var element = this._element;

        if (typeof element.style.scaleX === "undefined") {
            element.style.scaleX = "1";
            element.style.scaleY = "1";
            element.style.scaleZ = "1";
            element.style.rotateX = "0deg";
            element.style.rotateY = "0deg";
            element.style.rotateZ = "0deg";
            element.style.translateX = "0px";
            element.style.translateY = "0px";
            element.style.translateZ = "0px";
        }
    };

    ElementAnimation.prototype.applyTransform = function () {
        var element = this._element;
        var transform = "scaleX(" + element.style.scaleX + ") scaleY(" + element.style.scaleY + ") scaleZ(" + element.style.scaleZ + ")";
        transform += "rotateX(" + element.style.rotateX + ") rotateY(" + element.style.rotateY + ") rotateZ(" + element.style.rotateZ + ")";
        transform += "translateX(" + element.style.translateX + ") translateY(" + element.style.translateY + ") translateZ(" + element.style.translateZ + ")";

        this._element.style.webkitTransform = transform;
        this._element.style.mozTransform = transform;
        this._element.style.msTransform = transform;
        this._element.style.transform = transform;
    };

    ElementAnimation.prototype.scaleXHandler = function (property, progress) {
        var element = this._element;
        var beginningValue = parseInt(this.getBeginningValue(property), 10);
        var endingValue = parseInt(this.getEndingValue(property), 10);
        var duration = this._duration;
        var easingFunction = this._easingFunction;

        this.prepareTransformValues();

        var value = this.numberHandler(beginningValue, endingValue, progress, duration, easingFunction);
        element.style[property] = value;

        this.applyTransform();
    };

    ElementAnimation.prototype.scaleYHandler = ElementAnimation.prototype.scaleXHandler;
    ElementAnimation.prototype.scaleZHandler = ElementAnimation.prototype.scaleXHandler;

    ElementAnimation.prototype.rotateXHandler = function (property, progress) {
        var element = this._element;
        this.prepareTransformValues();
        this.numberUnitHandler(property, progress);

        this.applyTransform();
    };

    ElementAnimation.prototype.rotateYHandler = ElementAnimation.prototype.rotateXHandler;
    ElementAnimation.prototype.rotateZHandler = ElementAnimation.prototype.rotateXHandler;
    ElementAnimation.prototype.translateXHandler = ElementAnimation.prototype.rotateXHandler;
    ElementAnimation.prototype.translateYHandler = ElementAnimation.prototype.rotateXHandler;
    ElementAnimation.prototype.translateZHandler = ElementAnimation.prototype.rotateXHandler;

    ElementAnimation.prototype.colorHandler = function (property, progress) {
        var value;
        var beginningValue = this.getBeginningValue(property);
        var endingValue = this.getEndingValue(property);
        var duration = this._duration;
        var easingFunction = this._easingFunction;

        if (beginningValue.indexOf("#") === 0) {
            beginningValue = convertHexToRgb(beginningValue);
        }

        if (endingValue.indexOf("#") === 0) {
            endingValue = convertHexToRgb(endingValue);
        }

        value = this.rgbHandler(beginningValue, endingValue, progress, duration, easingFunction);

        this._target[property] = value;
    };

    ElementAnimation.prototype.numberHandler = function (beginningValue, endingValue, progress, duration, easingFunction) {
        var value;
        var change = endingValue - beginningValue;
        var currentTime = progress * duration;

        if (change !== 0) {
            value = easingFunction(currentTime, beginningValue, change, duration);
        } else {
            value = endingValue;
        }

        return value.toFixed(5);
    };

    ElementAnimation.prototype.numberUnitHandler = function (property, progress) {
        var value;
        var beginningValue = this.getBeginningValue(property);
        var endingValue = this.getEndingValue(property);
        var duration = this._duration;
        var easingFunction = this._easingFunction;

        var beginningResults = integerUnitRegEx.exec(beginningValue);
        var endingResults = integerUnitRegEx.exec(endingValue);

        var unit = beginningResults[2];
        var beginningInteger = parseInt(beginningResults[1], 10);
        var endingInteger = parseInt(endingResults[1], 10);
        var value = this.numberHandler(beginningInteger, endingInteger, progress, duration, easingFunction);

        value += unit;
        this._target[property] = value;
    };

    ElementAnimation.prototype.decimalHandler = function (property, progress) {
        var value;
        var beginningValue = this.getBeginningValue(property);
        var endingValue = this.getEndingValue(property);
        var duration = this._duration;
        var easingFunction = this._easingFunction;

        beginningValue = parseFloat(beginningValue);
        endingValue = parseFloat(endingValue);

        var value = this.numberHandler(beginningValue, endingValue, progress, duration, easingFunction);

        this._target[property] = value;
    };

    BASE.web.animation.ElementAnimation = ElementAnimation;

});





