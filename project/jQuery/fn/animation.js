BASE.require([
    "jQuery",
    "BASE.async.delay",
    "BASE.web.easings"
], function () {

    var easings = BASE.web.easings;

    jQuery.fn.animation = function (properties) {
        var elem = this[0];
        var $elem = $(this[0]);
        var animationFuture = $elem.data("animationFuture");
        var name = properties.name || "";
        var duration = properties.duration || 0;
        var easing = easings[properties.easing] || "linear";

        if (animationFuture) {
            animationFuture.cancel();
        }

        var reset = function () {
            $elem.css({
                animation: ""      
            });
        };

        $elem.css({
            animation: name + " " + duration + "ms " + easing + " forwards"
        });

        animationFuture = BASE.async.delay(properties.duration);
        $elem.data("animationFuture", animationFuture);

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