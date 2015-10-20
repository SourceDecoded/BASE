BASE.require([
    "BASE.web.animation.Animation"
], function () {
    
    BASE.namespace("BASE.web.animation");
    
    var Animation = BASE.web.animation.Animation;
    var integerUnitRegEx = /^(\-?\d*\.?\d+)+(.*?)$/i;
    var rgbRegEx = /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i;
    var rgbaRegEx = /^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+|\d\.\d+)\s*\)$/i;
    
    var colorAliases = {
        "transparent": "rgba(0,0,0,0)"
    };
    
    var parseHex = function (hex) {
        if (hex.indexOf("#") !== 0) {
            throw new Error("Invalid Hex.");
        }
        
        var rgb = {
            red: 0,
            green: 0,
            blue: 0,
            alpha: 1
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
        
        this.prepareTransformValues();

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
        borderTopWidth: "numberUnitHandler",
        borderBottomWidth: "numberUnitHandler",
        borderRightWidth: "numberUnitHandler",
        borderLeftWidth: "numberUnitHandler",
        borderTopColor: "colorHandler",
        borderBottomColor: "colorHandler",
        borderLeftColor: "colorHandler",
        borderRightColor: "colorHandler",
        marginTop: "numberUnitHandler",
        marginBottom: "numberUnitHandler",
        marginLeft: "numberUnitHandler",
        marginRight: "numberUnitHandler",
        paddingTop: "numberUnitHandler",
        paddingBottom: "numberUnitHandler",
        paddingLeft: "numberUnitHandler",
        paddingRight: "numberUnitHandler",
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
        var value;
        var element = this._element;
        
        for (property in properties) {
            propertyHandlerName = this.mapping[property]
            var handler = this[propertyHandlerName];
            
            if (typeof handler !== "function") {
                throw new Error("Doesn't support '" + property + "' style animations.");
            }
            
            value = this[propertyHandlerName](property, progress);
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
    
    ElementAnimation.prototype.rgbaHandler = function (beginningValue, endingValue, progress, duration, easingFunction) {
        var value;
        
        var beginningValues = beginningValue.match(rgbaRegEx);
        var endingValues = endingValue.match(rgbaRegEx);
        
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
    
    ElementAnimation.prototype.rgbHandler = function (beginningValue, endingValue, progress, duration, easingFunction) {
        var value;
        
        var beginningValues = beginningValue.match(rgbRegEx);
        var endingValues = endingValue.match(rgbRegEx);
        
        var redBeginningValue;
        var redEndingValue;
        var greenBeginningValue;
        var greenEndingValue;
        var blueBeginningValue;
        var blueEndingValue;
        var beginningAlphaValue;
        var endingAlphaValue;
        var red;
        var green;
        var blue;
        var alpha;
        
        if (beginningValues === null || endingValues === null) {
            
            beginningValues = beginningValues || beginningValue.match(rgbaRegEx);
            endingValues = endingValues || endingValue.match(rgbaRegEx);
            
            if (beginningValues === null || endingValues === null) {
                throw new Error("Couldn't parse rgb or rgba from values from one or both: " + beginningValue + ", " + endingValue);
            }
            
            redBeginningValue = parseInt(beginningValues[1], 10);
            redEndingValue = parseInt(endingValues[1], 10);
            
            greenBeginningValue = parseInt(beginningValues[2], 10);
            greenEndingValue = parseInt(endingValues[2], 10);
            
            blueBeginningValue = parseInt(beginningValues[3], 10);
            blueEndingValue = parseInt(endingValues[3], 10);
            
            beginningAlphaValue = parseFloat(beginningValues[4] || 1);
            endingAlphaValue = parseFloat(endingValues[4] || 1);
            
            red = parseInt(this.numberHandler(redBeginningValue, redEndingValue, progress, duration, easingFunction), 10);
            green = parseInt(this.numberHandler(greenBeginningValue, greenEndingValue, progress, duration, easingFunction), 10);
            blue = parseInt(this.numberHandler(blueBeginningValue, blueEndingValue, progress, duration, easingFunction), 10);
            alpha = this.numberHandler(beginningAlphaValue, endingAlphaValue, progress, duration, easingFunction);
            
            red = getRgbWithInRangeValue(red);
            green = getRgbWithInRangeValue(green);
            blue = getRgbWithInRangeValue(blue);
            
            value = "rgba(" + red + "," + green + "," + blue + ", " + alpha + ")";
            
            return value;
        }
        
        redBeginningValue = parseInt(beginningValues[1], 10);
        redEndingValue = parseInt(endingValues[1], 10);
        
        greenBeginningValue = parseInt(beginningValues[2], 10);
        greenEndingValue = parseInt(endingValues[2], 10);
        
        blueBeginningValue = parseInt(beginningValues[3], 10);
        blueEndingValue = parseInt(endingValues[3], 10);
        
        red = parseInt(this.numberHandler(redBeginningValue, redEndingValue, progress, duration, easingFunction), 10);
        green = parseInt(this.numberHandler(greenBeginningValue, greenEndingValue, progress, duration, easingFunction), 10);
        blue = parseInt(this.numberHandler(blueBeginningValue, blueEndingValue, progress, duration, easingFunction), 10);
        
        red = getRgbWithInRangeValue(red);
        green = getRgbWithInRangeValue(green);
        blue = getRgbWithInRangeValue(blue);
        
        value = "rgb(" + red + "," + green + "," + blue + ")";
        
        return value;
    };
    
    ElementAnimation.prototype.prepareTransformValues = function () {
        var element = this._element;
        
        if (typeof element._scaleX === "undefined") {
            element._scaleX = "1";
            element._scaleY = "1";
            element._scaleZ = "1";
            element._rotateX = "0deg";
            element._rotateY = "0deg";
            element._rotateZ = "0deg";
            element._translateX = "0";
            element._translateY = "0";
            element._translateZ = "0";
        }
    };
    
    ElementAnimation.prototype.applyTransform = function () {
        var element = this._element;
        var transform = "scaleX(" + element._scaleX + ") scaleY(" + element._scaleY + ") scaleZ(" + element._scaleZ + ")";
        transform += " rotateX(" + element._rotateX + ") rotateY(" + element._rotateY + ") rotateZ(" + element._rotateZ + ")";
        transform += " translateX(" + element._translateX + ") translateY(" + element._translateY + ") translateZ(" + element._translateZ + ")";
        
        this._element.style.webkitTransform = transform;
        this._element.style.mozTransform = transform;
        this._element.style.msTransform = transform;
        this._element.style.transform = transform;
    };
    
    ElementAnimation.prototype.scaleXHandler = function (property, progress) {
        var element = this._element;
        var beginningValue = parseFloat(this.getBeginningValue(property));
        var endingValue = parseFloat(this.getEndingValue(property));
        var duration = this._duration;
        var easingFunction = this._easingFunction;
        
        var value = this.numberHandler(beginningValue, endingValue, progress, duration, easingFunction);
        element["_" + property] = value;
        
        this.applyTransform();
    };
    
    ElementAnimation.prototype.scaleYHandler = ElementAnimation.prototype.scaleXHandler;
    ElementAnimation.prototype.scaleZHandler = ElementAnimation.prototype.scaleXHandler;
    
    ElementAnimation.prototype.rotateXHandler = function (property, progress) {
        var element = this._element;
        var value;
        
        value = this.calculateNumberUnit(property, progress);
        element["_" + property] = value;
        
        this.applyTransform();
    };
    
    ElementAnimation.prototype.rotateYHandler = ElementAnimation.prototype.rotateXHandler;
    ElementAnimation.prototype.rotateZHandler = ElementAnimation.prototype.rotateXHandler;
    ElementAnimation.prototype.translateXHandler = ElementAnimation.prototype.rotateXHandler;
    ElementAnimation.prototype.translateYHandler = ElementAnimation.prototype.rotateXHandler;
    ElementAnimation.prototype.translateZHandler = ElementAnimation.prototype.rotateXHandler;
    
    ElementAnimation.prototype.calculateColor = function (property, progress) {
        var value;
        var beginningValue = this.getBeginningValue(property);
        var endingValue = this.getEndingValue(property);
        var duration = this._duration;
        var easingFunction = this._easingFunction;
        
        beginningValue = colorAliases[beginningValue.toLowerCase()] || beginningValue;
        endingValue = colorAliases[endingValue.toLowerCase()] || endingValue;
        
        if (beginningValue.indexOf("#") === 0) {
            beginningValue = convertHexToRgb(beginningValue);
        }
        
        if (endingValue.indexOf("#") === 0) {
            endingValue = convertHexToRgb(endingValue);
        }
        
        return this.rgbHandler(beginningValue, endingValue, progress, duration, easingFunction);
    };
    
    ElementAnimation.prototype.colorHandler = function (property, progress) {
        var element = this._element;
        var value = this.calculateColor(property, progress);
        element.style[property] = value;
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
    
    ElementAnimation.prototype.calculateNumberUnit = function (property, progress) {
        var value;
        var beginningValue = this.getBeginningValue(property);
        var endingValue = this.getEndingValue(property);
        var duration = this._duration;
        var easingFunction = this._easingFunction;
        
        var beginningResults = integerUnitRegEx.exec(beginningValue);
        var endingResults = integerUnitRegEx.exec(endingValue);
        
        var unit = beginningResults[2];
        
        if (typeof unit === "undefined") {
            throw new Error("Please use units for the '" + property + "', e.g. 10px, or 10%, 10em");
        }
        
        var beginningInteger = parseInt(beginningResults[1], 10);
        var endingInteger = parseInt(endingResults[1], 10);
        var value = this.numberHandler(beginningInteger, endingInteger, progress, duration, easingFunction);
        
        return value += unit;
    };
    
    ElementAnimation.prototype.numberUnitHandler = function (property, progress) {
        var element = this._element;
        var value = this.calculateNumberUnit(property, progress);
        element.style[property] = value;
    };
    
    ElementAnimation.prototype.cacluateDecimal = function (property, progress) {
        var value;
        var beginningValue = this.getBeginningValue(property);
        var endingValue = this.getEndingValue(property);
        var duration = this._duration;
        var easingFunction = this._easingFunction;
        
        beginningValue = parseFloat(beginningValue);
        endingValue = parseFloat(endingValue);
        
        return this.numberHandler(beginningValue, endingValue, progress, duration, easingFunction);

    };
    
    ElementAnimation.prototype.decimalHandler = function (property, progress) {
        var element = this._element;
        var value = this.cacluateDecimal(property, progress);
        element.style[property] = value;
    };
    
    BASE.web.animation.ElementAnimation = ElementAnimation;

});





