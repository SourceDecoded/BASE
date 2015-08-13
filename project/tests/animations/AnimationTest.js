BASE.require([
    "jQuery",
    "BASE.web.animation.Animation"
], function () {

    var Animation = BASE.web.animation.Animation;

    var target1 = { x: 0, y: 0 };

    AnimationTest = function (elem, tags, scope) {
        var self = this;
        var $elem = $(elem);
        var $log = $(tags["log"]);
        var $runAnimation = $(tags["run-animation"]);
        var $jamThread = $(tags["jam-thread"]);

        var log = function (message) {
            var text = document.createTextNode(message);
            var div = document.createElement("div");
            div.appendChild(text);

            $log.append(div);
        };

        var animationOne = new Animation({
            target: target1,
            properties: {
                x: {
                    from: 0,
                    to: 200
                }
            },
            easing: "easeOutExpo",
            duration: 1000
        });

        var jamThread = function (duration) {
            duration = typeof duration === "number" ? duration : 2000;
            var startTime = Date.now();
            var elapsedTime = 0;

            while (elapsedTime < duration) {
                elapsedTime = Date.now() - startTime;
            }
        };

        var runAnimation = function () {
            animationOne.restart();
            log("Started Animation");
            animationOne.playToEndAsync().then(function () {
                log("Ended Animation");
            }).ifCanceled(function () {
                log("Canceled Animation");
            });
        };

        $jamThread.on("click", function() {
            jamThread(4000);
        });

        $runAnimation.on("click", runAnimation);

    };

});