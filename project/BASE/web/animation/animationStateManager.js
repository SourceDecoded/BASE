BASE.require([
    "Date.now",
    "BASE.async.Future"
], function () {

    BASE.namespace("BASE.web.animation");

    var animationStateManager = {};

    var emptyFnWithReturnAnimation = function (animation) { return animation; };

    var forwardPause = function (animation) {
        animation.notify({
            type: "pause",
            progress: animation._progress
        });

        animation._currentState = animationStateManager.forwardPausedState;
        animation.animationManager.unregister(animation);
        return animation;
    };

    var reversePause = function (animation) {
        animation.notify({
            type: "pause",
            progress: animation._progress
        });

        animation._currentState = animationStateManager.reversePausedState;
        animation.animationManager.unregister(animation);
        return animation;
    };

    var play = function (animation) {
        animation.notify({
            type: "play",
            progress: animation._progress
        });

        var now = Date.now();
        animation._currentTime = now;
        animation._currentState = animationStateManager.forwardState;
        animation.animationManager.register(animation);
        return animation;
    };

    var stop = function (animation) {
        animation.notify({
            type: "stop",
            progress: animation._progress
        });

        var now = Date.now();
        animation._currentTime = now;
        animation._currentState = animationStateManager.stoppedState;
        animation.animationManager.unregister(animation);
        return animation;
    };

    var reverse = function (animation) {
        animation.notify({
            type: "reverse",
            progress: animation._progress
        });

        var now = Date.now();
        animation._currentTime = now;
        animation._currentState = animationStateManager.reverseState;
        animation.animationManager.register(animation);
        return animation;
    };

    var restartForward = function (animation) {
        animation.notify({
            type: "restart",
            progress: 0
        });

        animation.seek(0);
        return animation;
    };

    var restartReverse = function (animation) {
        animation.notify({
            type: "restart",
            progress: 1
        });

        animation.seek(1);
        return animation;
    };

    var getProgressValueWithBounds = function (progressValue) {
        if (progressValue > 1) {
            progressValue = 1;
        }

        if (progressValue < 0) {
            progressValue = 0;
        }
        return progressValue;
    };

    var render = function (animation, currentTime, progress) {
        progress = getProgressValueWithBounds(progress);
        animation._currentTime = typeof currentTime !== "number" ? Date.now() : currentTime;
        animation._progress = progress;
        animation.render();
    };

    animationStateManager.forwardPausedState = {
        seek: function (animation, progress, now) {
            if (animation._progress >= 1) {
                return;
            }

            if (animation._progress <= 0) {
                animation.notify({
                    type: "start",
                    progress: 0
                });
            }

            render(animation, now, progress);

            if (progress >= 1) {
                animation.notify({
                    type: "end",
                    progress: 1
                });
            }
        },
        play: play,
        stop: stop,
        pause: emptyFnWithReturnAnimation,
        reverse: reverse,
        tick: emptyFnWithReturnAnimation,
        restart: restartForward
    };

    animationStateManager.reversePausedState = {
        seek: function (animation, progress, now) {
            if (animation._progress <= 0) {
                return;
            }

            if (animation._progress >= 1) {
                animation.notify({
                    type: "end"
                });
            }

            render(animation, now, progress);

            if (progress <= 0) {
                animation.notify({
                    type: "start"
                });
            }
        },
        play: play,
        stop: stop,
        pause: emptyFnWithReturnAnimation,
        reverse: reverse,
        tick: emptyFnWithReturnAnimation,
        restart: restartReverse
    };

    animationStateManager.forwardState = {
        seek: animationStateManager.forwardPausedState.seek,
        play: emptyFnWithReturnAnimation,
        stop: stop,
        pause: forwardPause,
        reverse: reverse,
        tick: function (animation, now) {
            var lastTime = animation._currentTime;

            if (now > lastTime) {
                var change = (now - lastTime) * animation._timeScale;
                var progress = animation._progress + (change / animation._duration);

                this.seek(animation, progress, now);

                if (progress >= 1) {
                    animation.iterations++;

                    if (animation.iterations >= animation.repeat) {
                        this.stop(animation);
                    } else {
                        if (animation.repeatDirection === 0) {
                            animation.restart();
                        } else {
                            this.reverse(animation);
                        }
                    }
                }

                animation.notify({
                    type: "tick",
                    progress: progress
                });
            }

            return animation;
        },
        restart: restartForward
    };

    animationStateManager.reverseState = {
        seek: animationStateManager.reversePausedState.seek,
        play: play,
        stop: stop,
        pause: reversePause,
        reverse: emptyFnWithReturnAnimation,
        tick: function (animation, now) {
            var lastTime = animation._currentTime;

            if (now > lastTime) {
                var change = (now - lastTime) * animation._timeScale;
                var progress = animation._progress - (change / animation._duration);

                this.seek(animation, progress, now);

                if (progress <= 0) {
                    animation.iterations++;

                    if (animation.iterations >= animation.repeat) {
                        this.stop(animation);
                    } else {
                        if (animation.repeatDirection === 0) {
                            animation.restart();
                        } else {
                            this.play(animation);
                        }
                    }
                }

                animation.notify({
                    type: "tick",
                    progress: progress
                });
            }

            return animation;
        },
        restart: restartReverse
    };

    animationStateManager.stoppedState = {
        seek: function (animation, progress, now) {
            if (progress > 1) {
                progress = 1;
            }

            if (progress < 0) {
                progress = 0;
            }

            animation._progress = progress;
            animation._currentTime = now;

            //Stop won't render it because it is stopped. Use paused if you want it to render.

            return animation;
        },
        play: play,
        stop: emptyFnWithReturnAnimation,
        pause: forwardPause,
        reverse: reverse,
        tick: emptyFnWithReturnAnimation,
        restart: restartForward
    };

    BASE.web.animation.animationStateManager = animationStateManager;
});