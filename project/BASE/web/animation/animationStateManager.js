BASE.require([
    "Date.now",
    "BASE.async.Future"
], function () {

    BASE.namespace("BASE.web.animation");

    var emptyFnWithReturnAnimation = function (animation) { return animation; };

    var animationStateManager = {}

    animationStateManager.pausedState = {
        play: function (animation) {
            animation.notify({
                type: "play",
                progress: animation._progress
            });

            var now = Date.now();
            animation._startTime = now;
            animation._currentTime = now;
            animation.animationManager.register(animation);
            animation._currentState = animationStateManager.forwardState;
            return animation;
        },
        pause: emptyFnWithReturnAnimation,
        reverse: function (animation) {
            animation.notify({
                type: "reverse",
                progress: animation._progress
            });

            var now = Date.now();
            animation._startTime = now;
            animation._currentTime = now;
            animation.animationManager.register(animation);
            animation._currentState = animationStateManager.reverseState;
            return animation;
        },
        tick: emptyFnWithReturnAnimation,
        restart: function (animation) {
            animation.notify({
                type: "restart",
                progress: animation._progress
            });

            animation._progress = 0;
            return this.play(animation);
        }
    };

    animationStateManager.forwardState = {
        play: emptyFnWithReturnAnimation,
        pause: function (animation) {
            animation.notify({
                type: "pause",
                progress: animation._progress
            });

            animation.animationManager.unregister(animation);
            animation._currentState = animationStateManager.pausedState;
            return animation;
        },
        reverse: function (animation) {
            animation.notify({
                type: "reverse",
                progress: animation._progress
            });

            var now = Date.now();
            animation._startTime = now;
            animation._currentTime = now;
            animation._currentState = animationStateManager.reverseState;
            return animation;
        },
        tick: function (animation, now) {
            var lastTime = animation._currentTime;

            if (now > lastTime) {
                var change = (now - lastTime) * animation._timeScale;
                var progress = animation._progress + (change / animation._duration);
                animation.seek(progress, now);

                if (progress >= 1) {
                    animation.animationManager.unregister(animation);
                    animation._currentState = animationStateManager.finishedState;
                }

                animation.notify({
                    type: "tick",
                    progress: progress
                });
            }

            return animation;
        },
        restart: animationStateManager.pausedState.restart
    };

    animationStateManager.reverseState = {
        play: function (animation) {
            animation.notify({
                type: "play",
                progress: animation._progress
            });

            var now = Date.now();
            animation._startTime = now;
            animation._currentTime = now;
            animation._currentState = animationStateManager.forwardState;
            return animation;
        },
        pause: function (animation) {
            animation.notify({
                type: "pause",
                progress: animation._progress
            });

            animation.animationManager.unregister(animation);
            animation._currentState = animationStateManager.pausedState;
            return animation;
        },
        reverse: emptyFnWithReturnAnimation,
        tick: function (animation, now) {
            var lastTime = animation._currentTime;

            if (now > lastTime) {
                var change = (now - lastTime) * animation._timeScale;
                var progress = animation._progress - (change / animation._duration);
                animation.seek(progress, now);

                if (progress <= 0) {
                    animation.animationManager.unregister(animation);
                    animation._currentState = animationStateManager.finishedState;
                }

                animation.notify({
                    type: "tick",
                    progress: progress
                });
            }

            return animation;
        },
        restart: animationStateManager.pausedState.restart
    };



    animationStateManager.finishedState = animationStateManager.pausedState;

    BASE.web.animation.animationStateManager = animationStateManager;
});