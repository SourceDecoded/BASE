(function () {
    
    var emptyFn = function () { };
    
    TimerStateManager = function () {
    };
    
    TimerStateManager.prototype.playingState = {
        play: emptyFn,
        pause: function (timer) {
            var lastDuration = timer.currentDuration();
            timer.durations.push(lastDuration);
            
            timer.state = this.pausedState;
        },
        now: function (timer) {
            return timer.durations.reduce(function (accumlatedValue, next) {
                return accumlatedValue += next;
            }, 0) + timer.currentDuration();
        },
        setTimeScale: function (timer, scale) {
            timer.pause();
            timer.timeScale = scale;
            timer.play();
        }
    };
    
    TimerStateManager.prototype.pausedState = {
        play: function (timer) {
            timer.lastStartTime = performance.now();
            timer.state = this.playingState;
        },
        pause: emptyFn,
        now: function (timer) {
            return timer.durations.reduce(function (accumlatedValue, next) {
                return accumlatedValue += next;
            }, 0);
        },
        setTimeScale: function (timer, scale) {
            timer.timeScale = scale;
        }
    };
    
    var stateManager = new TimerStateManager();
    
    Timer = function () {
        this.performance = performance;
        this.timeScale = 1;
        this.lastStartTime = 0;
        this.durations = [];
        this.stateManager = stateManager;
        this.state = stateManager.pausedState;
    };
    
    Timer.prototype.currentDuration = function () {
        return (this.performance.now() - this.lastStartTime) * this.timeScale;
    };
    
    Timer.prototype.play = function () {
        this.state.play.call(this.stateManager, this);
    };
    
    Timer.prototype.pause = function () {
        this.state.pause.call(this.stateManager, this);
    };
    
    Timer.prototype.now = function () {
        return this.state.now.call(this.stateManager, this);
    };
    
    Timer.prototype.setTimeScale = function (value) {
        if (typeof value !== "number" || value < 0) {
            throw new Error("value needs to be a number and greater than 0.");
        }
        this.state.setTimeScale.call(this.stateManager, this, value);
    };
    
    BASE.namespace("BASE.canvas");
    
    BASE.canvas.Timer = Timer;

}());