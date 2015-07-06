BASE.require([
    "jQuery",
    "jQuery.support.transition",
    "jQuery.fn.isAnimating",
    "BASE.async.delay",
    "BASE.web.easings",
    "jQuery.fn.redraw",
    "String.prototype.trim"
], function () {

    var easings = BASE.web.easings;

    var docStyle = document.documentElement.style;
    global = window;

    var engine;
    if (global.opera && Object.prototype.toString.call(opera) === "[object Opera]") {
        engine = "presto";
    } else if ("MozAppearance" in docStyle) {
        engine = "gecko";
    } else if ("WebkitAppearance" in docStyle) {
        engine = "webkit";
    } else if (typeof navigator.cpuClass === "string") {
        engine = "trident";
    }

    var vendorPrefix = {
        trident: "-ms-",
        gecko: "-moz-",
        webkit: "-webkit-",
        presto: "-o-"
    }[engine];

    var vendorCss = {
        transform: vendorPrefix + "transform",
        translate: vendorPrefix + "translate"
    };

    var Future = BASE.async.Future;

    var getCurrentCss = function (elem) {
        var css = {};
        var styles = elem.style.cssText.split(";");
        styles.forEach(function (style) {
            if (style) {
                var keyValue = style.split(":");
                css[keyValue[0].trim()] = keyValue[1].trim();
            }
        });

        return css;
    };

    var toCssText = function (css) {
        return Object.keys(css).map(function (style) {
            return style + ":" + css[style];
        }).join(";");
    };

    jQuery.fn.transition = function (properties) {
        var elem = this[0];
        var $elem = $(this[0]);
        var toCss = getCurrentCss(elem);

        var reset = function () {
            toCss[vendorPrefix + "transition-property"] = "";
            toCss[vendorPrefix + "transition-duration"] = "";
            toCss[vendorPrefix + "transition-timing-function"] = "";
        };

        var animationFuture = new Future(function (setValue, setError) {
            var propertyNames = Object.keys(properties);
            var durations = [];
            var timingFunctions = [];
            var longestDuration = 0;

            if (!$.support.transition) {
                propertyNames.forEach(function (name) {
                    property = properties[name];
                    if (typeof property.to !== "undefined") {
                        toCss[name] = property.to;
                    }
                });

                elem.style.cssText = toCssText(toCss);
                setValue();

            } else {
                propertyNames.forEach(function (key) {
                    var property = properties[key];
                    var duration = property.duration;

                    if (typeof duration !== "number") {
                        property.duration = duration = 1000;
                    }

                    if (duration > longestDuration) {
                        longestDuration = duration;
                    }

                    if (typeof property.from !== "undefined") {
                        $elem.css(key, property.from).redraw();
                    }

                    durations.push(property.duration + "ms");

                    if (typeof property.easing === "string" && easings[property.easing]) {
                        timingFunctions.push(easings[property.easing]);
                    } else {
                        timingFunctions.push("linear");
                    }

                    if (typeof property.to !== "undefined") {
                        toCss[key] = property.to;
                        if (vendorCss[key]) {
                            toCss[vendorCss[key]] = property.to;
                        }
                    }

                });

                var currentTransitionProperty = propertyNames.join(", ");
                var currentTransitionDuration = durations.join(", ");
                var currentTransitionTimingFunction = timingFunctions.join(", ");

                toCss[vendorPrefix + "transition-property"] = currentTransitionProperty;
                toCss[vendorPrefix + "transition-duration"] = currentTransitionDuration;
                toCss[vendorPrefix + "transition-timing-function"] = currentTransitionTimingFunction;

                toCss["transition-property"] = currentTransitionProperty;
                toCss["transition-duration"] = currentTransitionDuration;
                toCss["transition-timing-function"] = currentTransitionTimingFunction;

                // For hardware accelerating on iOS.
                if (typeof properties["transform"] === "undefined") {
                    toCss[vendorPrefix + "transform"] = "translate3d(0, 0, 0)";
                }
                if (typeof properties["perspective"] === "undefined") {
                    toCss[vendorPrefix + "perspective"] = "1000";
                }

                toCss[vendorPrefix + "backface-visibility"] = "hidden";

                elem.style.cssText = toCssText(toCss);

                BASE.async.delay(longestDuration).then(function () {
                    setValue();
                }).ifError(setError);
            }

        });

        return animationFuture.then(function () {
            reset();
        }).ifCanceled(function () {
            reset();
        }).ifError(function () {
            reset();
        }).ifTimedOut(function () {
            reset();
        });

    };


});