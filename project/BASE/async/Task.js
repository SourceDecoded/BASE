BASE.require([
    "BASE.async.Future"
], function () {
    BASE.namespace("BASE.async");
    
    var CheapObservable = BASE.util.LiteObservable;
    var Future = BASE.async.Future;
    var emptyFn = function () { };
    
    var Task = (function () {
        
        var Task = function () {
            var self = this;
            
            BASE.assertNotGlobal(self);
            
            var observers = new CheapObservable();
            
            var futures = Array.prototype.slice.call(arguments, 0);
            var completedFutures = [];
            var _started = false;
            
            futures.forEach(function (future, index) {
                if (typeof future === "function") {
                    futures[index] = new Future(future);
                }
            });
            
            self.value = undefined;
            
            var _defaultState = {
                whenAll: function (callback) {
                    var listener = function () {
                        callback(futures);
                    };
                    observers.observeType("whenAll", listener);
                },
                whenAny: function (callback) {
                    var listener = function (event) {
                        callback(event.future);
                    };
                    
                    observers.observeType("whenAny", listener);
                    
                    completedFutures.forEach(function (future) {
                        callback(future);
                    });
                },
                onComplete: function (callback) {
                    var listener = function () {
                        callback();
                    };
                    
                    observers.observeType("onComplete", listener);
                },
                ifCanceled: function (callback) {
                    var listener = function (event) {
                        callback();
                    };
                    observers.observeType("canceled", listener);
                }
            };
            
            var _startedState = {
                whenAll: _defaultState.whenAll,
                whenAny: _defaultState.whenAny,
                onComplete: _defaultState.onComplete,
                ifCanceled: _defaultState.ifCanceled
            };
            
            var _canceledState = {
                whenAll: emptyFn,
                whenAny: emptyFn,
                onComplete: function (callback) {
                    callback();
                },
                ifCanceled: function (callback) {
                    callback();
                }
            };
            
            var _finishedState = {
                whenAll: function (callback) {
                    callback(completedFutures);
                },
                whenAny: function (callback) {
                    completedFutures.forEach(function (future) {
                        callback(future);
                    });
                },
                onComplete: function (callback) {
                    callback();
                },
                ifCanceled: emptyFn
            };
            
            var _state = _defaultState;
            
            self.whenAll = function (callback) {
                _state.whenAll(callback);
                return self;
            };
            
            self.whenAny = function (callback) {
                _state.whenAny(callback);
                return self;
            };
            
            self.onComplete = function (callback) {
                _state.onComplete(callback);
                return self;
            };
            
            self.ifCanceled = function (callback) {
                _state.ifCanceled(callback);
                return self;
            };
            
            self.cancel = function () {
                futures.forEach(function (future) {
                    future.cancel();
                });
                return self;
            };
            
            self.add = function () {
                if (completedFutures.length === 0) {
                    futures.push.apply(futures, arguments);
                } else {
                    throw new Error("Cannot add to a task when it has already finished.");
                }
                return self;
            };
            
            self.start = function () {
                if (_started === false) {
                    _started = true;
                    _state = _startedState
                    if (futures.length > 0) {
                        futures.forEach(function (future) {
                            
                            future["try"]();
                            future["finally"](function () {
                                _notify(future);
                            });
                            
                            future.ifCanceled(_cancel);
                        });
                    } else {
                        fireComplete();
                    }
                }
                return self;
            };
            
            self.toFuture = function () {
                return new Future(function (setValue) {
                    self.start().whenAll(setValue);
                });
            };
            
            var fireComplete = function () {
                _state = _finishedState;
                
                var whenAll = {
                    type: "whenAll",
                    futures: completedFutures
                }
                observers.notify(whenAll);
                
                var onComplete = {
                    type: "onComplete"
                };
                observers.notify(onComplete);

            };
            
            var _notify = function (future) {
                completedFutures.push(future);
                var whenAny = {
                    type: "whenAny",
                    future: future
                };
                observers.notify(whenAny);
                
                if (_state !== _canceledState && completedFutures.length === futures.length) {
                    fireComplete();
                }
            };
            
            var _cancel = function () {
                if (_state !== _finishedState && _state !== _canceledState) {
                    _state = _canceledState;
                    observers.notify({ type: "canceled" });
                    
                    var onComplete = {
                        type: "onComplete"
                    };
                    observers.notify(onComplete);
                }
            };
            
            return self;
        };
        
        return Task;
    }());
    
    BASE.async.Task = Task;
});