BASE.require([
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
        
        var now = animation.animationManager.now();
        animation._currentTime = now;
        animation._currentState = animationStateManager.forwardState;
        animation.animationManager.register(animation);
        
        animation.render();
        
        return animation;
    };
    
    var stop = function (animation) {
        var now = animation.animationManager.now();
        animation._currentTime = now;
        animation._currentState = animationStateManager.stoppedState;
        animation.animationManager.unregister(animation);
        return animation;
    };
    
    var stopWithNotifications = function (animation) {
        animation.notify({
            type: "stop",
            progress: animation._progress
        });
        return stop(animation);
    };
    
    var reverse = function (animation) {
        animation.notify({
            type: "reverse",
            progress: animation._progress
        });
        
        var now = animation.animationManager.now();
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
        
        animation.play();
        
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
    
    var notifyTickForward = function (animation, lastProgress, progress) {
        var lastPercentage = parseInt(lastProgress * 100);
        var percentage = parseInt(progress * 100);
        
        if (lastPercentage === 0 && lastPercentage !== percentage) {
            animation.notify({
                type: lastPercentage
            });
        }
        
        if (lastPercentage === percentage) {
            return;
        }
        
        for (var p = lastPercentage + 1; p <= percentage; p++) {
            animation.notify({
                type: p
            });
        }

    };
    
    var notifyTickReverse = function (animation, lastProgress, progress) {
        var lastPercentage = parseInt(lastProgress * 100);
        var percentage = parseInt(progress * 100);
        var p;
        
        if (lastPercentage === 100 && lastPercentage !== percentage) {
            animation.notify({
                type: lastPercentage
            });
        }
        
        if (lastPercentage === percentage) {
            return;
        }
        
        for (p = lastPercentage - 1; p >= percentage; p--) {
            animation.notify({
                type: p
            });
        }
    };
    
    var render = function (animation, currentTime, progress) {
        var lastProgress = animation._progress;
        
        progress = getProgressValueWithBounds(progress);
        animation._currentTime = typeof currentTime !== "number" ? animation.animationManager.now() : currentTime;
        animation._progress = progress;
        animation.render();
        
        animation.notify({
            type: "tick",
            progress: progress,
            lastProgress: lastProgress
        });
    };
    
    animationStateManager.forwardPausedState = {
        seek: function (animation, progress, now) {
            var lastProgress = animation._progress;
            
            if (lastProgress > progress) {
                animation._currentState = animationStateManager.reversePausedState;
                animation._currentState.seek(animation, progress, now);
                animation._currentState = animationStateManager.forwardPausedState;
                return;
            }
            
            if (animation._progress > 1) {
                return;
            }
            
            if (animation._progress <= 0) {
                animation.notify({
                    type: "start",
                    progress: 0
                });
            }
            
            render(animation, now, progress);
            notifyTickForward(animation, lastProgress, progress);
            
            if (progress >= 1) {
                animation.notify({
                    type: "end",
                    progress: 1
                });
            }
        },
        play: play,
        stop: stopWithNotifications,
        pause: emptyFnWithReturnAnimation,
        reverse: reverse,
        tick: emptyFnWithReturnAnimation,
        restart: restartForward
    };
    
    animationStateManager.reversePausedState = {
        seek: function (animation, progress, now) {
            var lastProgress = animation._progress;
            
            if (lastProgress < progress) {
                animation._currentState = animationStateManager.forwardPausedState;
                animation._currentState.seek(animation, progress, now);
                animation._currentState = animationStateManager.reversePausedState;
                return;
            }
            
            if (animation._progress < 0) {
                return;
            }
            
            if (animation._progress >= 1) {
                animation.notify({
                    type: "end"
                });
            }
            
            render(animation, now, progress);
            notifyTickReverse(animation, lastProgress, progress);
            
            if (progress <= 0) {
                animation.notify({
                    type: "start"
                });
            }
        },
        play: play,
        stop: stopWithNotifications,
        pause: emptyFnWithReturnAnimation,
        reverse: reverse,
        tick: emptyFnWithReturnAnimation,
        restart: restartReverse
    };
    
    animationStateManager.forwardState = {
        seek: animationStateManager.forwardPausedState.seek,
        play: emptyFnWithReturnAnimation,
        stop: stopWithNotifications,
        pause: forwardPause,
        reverse: reverse,
        tick: function (animation, now) {
            var lastTime = animation._currentTime;
            
            if (now > lastTime) {
                var change = (now - lastTime) * animation._timeScale;
                var progress = animation._progress + (change / animation._duration);
                
                if (progress >= 1) {
                    progress = 1;
                    animation.iterations++;
                    
                    if (animation.iterations >= animation.repeat) {
                        this.seek(animation, progress, now);
                        stop(animation);
                    } else {
                        this.seek(animation, progress, now);
                        if (animation.repeatDirection === 0) {
                            this.restart(animation);
                        } else {
                            this.reverse(animation);
                        }
                    }
                } else {
                    this.seek(animation, progress, now);
                }

            }
            
            return animation;
        },
        restart: restartForward
    };
    
    animationStateManager.reverseState = {
        seek: animationStateManager.reversePausedState.seek,
        play: play,
        stop: stopWithNotifications,
        pause: reversePause,
        reverse: emptyFnWithReturnAnimation,
        tick: function (animation, now) {
            var lastTime = animation._currentTime;
            
            if (now > lastTime) {
                var change = (now - lastTime) * animation._timeScale;
                var progress = animation._progress - (change / animation._duration);
                
                
                if (progress <= 0) {
                    progress = 0;
                    animation.iterations++;
                    
                    if (animation.iterations >= animation.repeat) {
                        this.seek(animation, progress, now);
                        stop(animation);
                    } else {
                        this.seek(animation, progress, now);
                        if (animation.repeatDirection === 0) {
                            this.restart(animation);
                        } else {
                            this.play(animation);
                        }
                    }
                } else {
                    this.seek(animation, progress, now);
                }

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