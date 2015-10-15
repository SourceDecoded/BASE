(function () {
    
    
    var global = (function () { return this; }());
    global.console = global.console || { log: function () { }, error: function () { } }
    
    var emptyFn = function () { };
    
    if (typeof BASE !== "undefined") {
        return;
    }
    
    if (!Object.hasOwnProperty("keys")) {
        Object.keys = function (object) {
            var name;
            var result = [];
            for (name in object) {
                if (Object.prototype.hasOwnProperty.call(object, name)) {
                    result.push(name);
                }
            }
            
            return result;
        };
    }
    
    if (!Array.hasOwnProperty("isArray")) {
        Array.isArray = function (value) {
            return Object.prototype.toString.call(value) === "[object Array]";
        };
    }
    
    if (!Array.prototype.hasOwnProperty("every")) {
        Array.prototype.every = function (fn, thisp) {
            var i;
            var length = this.length;
            for (i = 0; i < length; i += 1) {
                if (this.hasOwnProperty(i) && !fn.call(thisp, this[i], i, this)) {
                    return false;
                }
            }
            return true;
        };
    }
    
    if (!Array.prototype.hasOwnProperty("some")) {
        Array.prototype.some = function (fn, thisp) {
            var i;
            var length = this.length;
            for (i = 0; i < length; i += 1) {
                if (this.hasOwnProperty(i) && fn.call(thisp, this[i], i, this)) {
                    return true;
                }
            }
            return false;
        };
    }
    
    if (!Array.prototype.hasOwnProperty("filter")) {
        Array.prototype.filter = function (fn, thisp) {
            var i;
            var length = this.length;
            var result = [];
            var value;
            
            for (i = 0; i < length; i += 1) {
                if (this.hasOwnProperty(i)) {
                    value = this[i];
                    if (fn.call(thisp, value, i, this)) {
                        result.push(value);
                    }
                }
            }
            return result;
        };
    }
    
    if (!Array.prototype.hasOwnProperty("indexOf")) {
        Array.prototype.indexOf = function (searchElement, fromIndex) {
            var i = fromIndex || 0;
            var length = this.length;
            
            while (i < length) {
                if (this.hasOwnProperty(i) && this[i] === searchElement) {
                    return i;
                }
                i += 1;
            }
            return -1;
        };
    }
    
    if (!Array.prototype.hasOwnProperty("lastIndexOf")) {
        Array.prototype.lastIndexOf = function (searchElement, fromIndex) {
            var i = fromIndex;
            if (typeof i !== "number") {
                i = length - 1;
            }
            
            while (i >= 0) {
                if (this.hasOwnProperty(i) && this[i] === searchElement) {
                    return i;
                }
                i -= 1;
            }
            return -1;
        };
    }
    
    if (!Array.prototype.hasOwnProperty("map")) {
        Array.prototype.map = function (fn, thisp) {
            var i;
            var length = this.length;
            var result = [];
            
            for (i = 0; i < length; i += 1) {
                if (this.hasOwnProperty(i)) {
                    result[i] = fn.call(thisp, this[i], i, this);
                }
            }
            
            return result;
        };
    }
    
    if (!Array.prototype.hasOwnProperty("reduceRight")) {
        Array.prototype.reduceRight = function (fn, initialValue) {
            var i = this.length - 1;
            
            while (i >= 0) {
                if (this.hasOwnProperty(i)) {
                    initialValue = fn.call(undefined, initialValue, this[i], i, this);
                }
                i -= 1
            }
            
            return initialValue;
        };
    }
    
    if (!Array.prototype.hasOwnProperty("reduce")) {
        Array.prototype.reduce = function (fn, initialValue) {
            var i;
            var length = this.length;
            
            for (i = 0; i < length; i += 1) {
                if (this.hasOwnProperty(i)) {
                    initialValue = fn.call(undefined, initialValue, this[i], i, this);
                }
            }
            
            return initialValue;
        };
    }
    
    if (!Array.prototype.hasOwnProperty("indexOf")) {
        Array.prototype.indexOf = function (searchElement, fromIndex) {
            var i = fromIndex || 0;
            var length = this.length;
            
            while (i < length) {
                if (this.hasOwnProperty(i) && this[i] === searchElement) {
                    return i;
                }
                i += 1;
            }
            return -1;
        };
    }
    
    if (!Array.prototype.except) {
        Array.prototype.except = function (array) {
            array = Array.isArray(array) ? array : [];
            return this.filter(function (n) {
                return array.indexOf(n) === -1;
            });
        };
    }
    
    if (!Array.prototype.hasOwnProperty("forEach")) {
        Array.prototype.forEach = function (fn, thisp) {
            var i;
            var length = this.length;
            
            for (i = 0; i < length; i += 1) {
                if (this.hasOwnProperty(i)) {
                    fn.call(thisp, this[i], i, this);
                }
            }
        };
    }
    
    
    var assertNotGlobal = function (instance) {
        if (global === instance) {
            throw new Error("Constructor executed in the scope of the global object.");
        }
    };
    
    var hasInterface = function (obj, methodNames) {
        return methodNames.every(function (name) {
            return typeof obj[name] === "function";
        });
    };
    
    var namespace = function (namespace, context) {
        if (typeof namespace !== "string") {
            throw new Error("BASE.namespace: this function only accepts strings.");
        }
        var obj = namespace;
        var a = obj.split(".");
        var length = a.length;
        var tmpObj = context || global;
        var built = false;
        
        for (var x = 0; x < length; x++) {
            if (typeof tmpObj[a[x]] === "undefined") {
                tmpObj = tmpObj[a[x]] = {};
                built = true;
            } else {
                tmpObj = tmpObj[a[x]];
            }
        }
        
        return built;
    };
    
    var isNullOrUndefined = function (value) {
        // Using the double equals allow us to check for null and undefined.
        // Look at spec.
        return value == null;
    };
    
    var isObject = function (namespace, context) {
        var obj = getObject(namespace, context);
        if (typeof obj === "undefined" || obj === null || (typeof obj === "number" && isNaN(obj))) {
            return false;
        } else {
            return true;
        }
    };
    
    var getObject = function (namespace, context) {
        context = typeof context === "undefined" ? global : context;
        
        if (namespace === "") {
            return context;
        }
        
        if (typeof namespace === "string") {
            var a = namespace.split(".");
            var length = a.length;
            var obj;
            
            obj = context[a[0]];
            
            if (typeof obj === "undefined") {
                return undefined;
            }
            
            for (var x = 1; x < length; x++) {
                if (typeof obj[a[x]] === "undefined") {
                    return undefined;
                } else {
                    obj = obj[a[x]];
                }
            }
            
            return obj;
        } else {
            return undefined;
        }
    };
    
    var clone = function (object, deep) {
        var clonedObject;
        
        if (Array.isArray(object)) {
            clonedObject = [];
            object.forEach(function (item) {
                if (typeof item === "object" && item !== null && deep) {
                    clonedObject.push(clone(item, deep));
                } else {
                    clonedObject.push(item);
                }
            });
        } else {
            clonedObject = {};
            for (var x in object) {
                if (typeof object[x] === "object" && object[x] !== null && deep) {
                    clonedObject[x] = clone(object[x], deep);
                } else {
                    clonedObject[x] = object[x];
                }
            }
        }
        
        return clonedObject;
    };
    
    var extend = function (SubClass, SuperClass) {
        
        if (typeof SubClass !== "function") {
            throw new TypeError("SubClass needs to be a function.");
        }
        
        if (typeof SuperClass !== "function") {
            throw new TypeError("SuperClass needs to be a function.");
        }
        
        // Attach functions, properties of the super to the sub.
        Object.keys(SuperClass).forEach(function (propertyName) {
            SubClass[propertyName] = SuperClass[propertyName];
        });
        
        var MiddleClass = function () {
            this.constructor = SubClass;
        };
        
        MiddleClass.prototype = SuperClass.prototype;
        
        SubClass.prototype = new MiddleClass();
        SubClass.prototype.SuperConstructor = SuperClass;
        SubClass.prototype.Constructor = SubClass;
    };
    
    var concatPaths = function () {
        var args = Array.prototype.slice.call(arguments, 0);
        
        return args.reduce(function (value, nextUrl, index) {
            
            while (nextUrl.length > 0 && nextUrl.lastIndexOf("/") === nextUrl.length - 1) {
                nextUrl = nextUrl.substring(0, nextUrl.length - 1);
            }
            
            if (index > 0) {
                while (nextUrl.indexOf("/") === 0) {
                    nextUrl = nextUrl.substring(1, nextUrl.length);
                }
            }
            
            if (index > 0) {
                return value + "/" + nextUrl
            } else {
                return nextUrl;
            }

        }, "");
    };
    
    var returnTrue = function () {
        return true;
    };
    
    var returnItem = function (item) {
        return item;
    };
    
    var Observer = function (unbind, filter, map) {
        var self = this;
        
        self._onEach = emptyFn;
        self._onError = emptyFn;
        self._observers = [];
        
        self._unbind = unbind || emptyFn;
        
        self._filter = filter || returnTrue;
        
        self._map = map || returnItem;
        
        if (typeof self._filter !== "function") {
            throw new TypeError("Expected a function.");
        }
        
        if (typeof self._map !== "function") {
            throw new TypeError("Expected a function.");
        }
        
        var dispose = function () {
            self._unbind();
            self._state = disposedState;
        };
        
        var defaultState = {
            stop: function () {
                self._state = stoppedState;
            },
            start: emptyFn,
            notify: function (e) {
                
                if (self._filter(e)) {
                    
                    var value = self._map(e);
                    
                    self._onEach(value);
                    
                    self._observers.slice(0).forEach(function (observer) {
                        observer.notify(value);
                    });
                }

            },
            dispose: dispose
        };
        
        var disposedState = {
            stop: emptyFn,
            start: emptyFn,
            notify: emptyFn,
            dispose: emptyFn
        };
        
        var stoppedState = {
            stop: emptyFn,
            start: function () {
                self._state = defaultState;
            },
            notify: emptyFn,
            dispose: emptyFn
        };
        
        self._state = defaultState;

    };
    
    Observer.prototype.notify = function (e) {
        this._state.notify(e);
    };
    
    Observer.prototype.copy = function () {
        return this.filter(function () { return true; });
    };
    
    Observer.prototype.stop = function () {
        this._state.stop();
    };
    
    Observer.prototype.start = function () {
        this._state.start();
    };
    
    Observer.prototype.dispose = function () {
        this._state.dispose();
    };
    
    Observer.prototype.filter = function (filter) {
        var self = this;
        
        if (typeof filter !== "function") {
            throw new Error("Filter needs to be a function.");
        }
        
        var observer = new Observer(function () {
            var index = self._observers.indexOf(observer);
            if (index >= 0) {
                self._observers.splice(index, 1);
            }

        }, filter);
        
        self._observers.push(observer);
        
        return observer;
    };
    
    Observer.prototype.map = function (map) {
        var self = this;
        
        var observer = new Observer(function () {
            var index = self._observers.indexOf(observer);
            if (index >= 0) {
                self._observers.splice(index, 1);
            }

        }, undefined, map);
        self._observers.push(observer);
        
        
        return observer;
    };
    
    Observer.prototype.onEach = function (callback) {
        var self = this;
        if (typeof callback !== "function") {
            throw new Error("Expected a function.");
        }
        
        self._onEach = callback;
        return self;
    };
    
    Observer.prototype.onError = function (callback) {
        var self = this;
        self._onError = callback;
        return self;
    };
    
    var Observable = function () {
        var self = this;
        
        BASE.assertNotGlobal(self);
        
        // If it already implements this get out.
        if (BASE.hasInterface(self, ["observe", "observeType", "notify"])) {
            return;
        }
        
        var observers = [];
        
        self.getObservers = function () {
            return observers;
        };
        
        self.observe = function () {
            var observer = new Observer(function () {
                var index = observers.indexOf(observer);
                if (index >= 0) {
                    observers.splice(index, 1);
                }
            });
            observers.push(observer);
            return observer;
        };
        
        self.observeType = function (type, callback) {
            
            var observer = new Observer(function () {
                var index = observers.indexOf(observer);
                if (index >= 0) {
                    observers.splice(index, 1);
                }
            });
            
            var modifiedObserver = observer.filter(function (event) {
                if (typeof event.type !== "undefined" && event.type === type) {
                    return true;
                }
                return false;
            }).onEach(callback);
            
            observers.push(observer);
            return modifiedObserver;
        };
        
        self.notify = function (e) {
            observers.slice(0).forEach(function (observer) {
                observer.notify(e);
            });
        };
    };
    
    var CheapObservable = function () {
        var self = this;
        
        BASE.assertNotGlobal();
        
        self._observers = {};
    };
    
    CheapObservable.prototype.observeType = function (type, callback) {
        var self = this;
        if (typeof self._observers[type] === "undefined") {
            self._observers[type] = [];
        }
        self._observers[type].push(callback);
    };
    
    CheapObservable.prototype.notify = function (e) {
        var self = this;
        var type = e.type;
        if (typeof self._observers[type] !== "undefined") {
            self._observers[type].forEach(function (callback) {
                callback(e);
            });
        }
    };
    
    CheapObservable.prototype.clear = function () {
        var self = this;
        Object.keys(self._observers).forEach(function (key) {
            self._observers[key] = [];
        });
    };
    
    
    var Future = (function () {
        /*
        * Because Futures are used with such frequency we needed to optimize them. One of the ways
        * that we did that was by making all the futures share the same state objects, and pass the future
        * as the first parameter to every function so the state objects knows what future to act on.
        * This was a tremendous memory gain, there was 15 times less memory in use with the new model
        * on an empty future.
        */
        var emptyFn = function (future) {
            return future;
        };
        
        var notifyFutureIsComplete = function (future) {
            future._callbacks["finally"].forEach(function (callback) {
                callback();
            });
            
            Object.keys(future._callbacks).forEach(function (type) {
                future._callbacks[type] = [];
            });
        };
        
        var invokeCallback = function (future, callback) {
            if (typeof callback === "function") {
                callback();
            }
            
            return future;
        };
        
        var _initialState = {
            "try": function (future) {
                future._state = future._retrievingState;
                
                var setValue = function (value) {
                    if (future._state === future._retrievingState) {
                        future.value = value;
                        future.isDone = true;
                        future.isComplete = true;
                        
                        future._state = future._doneState;
                        
                        future._callbacks.then.forEach(function (callback) {
                            callback(value);
                        });
                    }
                    
                    notifyFutureIsComplete(future);
                };
                
                var cancel = function (reason) {
                    return future.cancel(reason);
                };
                
                var setError = function (error) {
                    if (future._state === future._retrievingState) {
                        future.error = error;
                        future.isDone = true;
                        future.isComplete = true;
                        future._state = future._errorState;
                        
                        future._callbacks["ifError"].forEach(function (callback) {
                            callback(error);
                        });
                    }
                    
                    notifyFutureIsComplete(future);
                };
                
                future._getValue(setValue, setError, cancel, function (callback) {
                    return future.ifCanceled(callback);
                });
                
                return future;
            },
            then: function (future, callback) {
                if (typeof callback === "function") {
                    future._callbacks.then.push(callback);
                }
                return future;
            },
            "catch": function (future, callback) {
                var wrappedFuture = new Future(function (setValue, setError, cancel, ifCanceled) {
                    
                    future.ifError(function (error) {
                        var nextFuture = callback(error);
                        
                        if (nextFuture instanceof Future) {
                            nextFuture.then(setValue);
                            nextFuture.ifError(setError);
                            nextFuture.ifCanceled(cancel);
                            
                            ifCanceled(function (reason) {
                                nextFuture.cancel(reason);
                            });
                        } else {
                            setValue(nextFuture);
                        }
                    });
                    
                    future.ifCanceled(cancel);
                    future.then(setValue);

                });
                
                wrappedFuture.ifCanceled(function () {
                    future.cancel();
                });
                
                return wrappedFuture;
            },
            catchCanceled: function (future, callback) {
                var wrappedFuture = new Future(function (setValue, setError, cancel, ifCanceled) {
                    
                    future.ifCanceled(function (reason) {
                        var nextFuture = callback(reason);
                        
                        if (nextFuture instanceof Future) {
                            nextFuture.then(setValue);
                            nextFuture.ifError(setError);
                            nextFuture.ifCanceled(cancel);
                            
                            ifCanceled(function (reason) {
                                nextFuture.cancel(reason);
                            });
                        } else {
                            setValue(nextFuture);
                        }
                    });
                    
                    future.then(setValue);
                    future.ifError(setError);

                });
                
                wrappedFuture.ifCanceled(function () {
                    future.cancel();
                });
                
                return wrappedFuture;

            },
            ifCanceled: function (future, callback) {
                future._callbacks.ifCanceled.push(callback);
                return future;
            },
            ifError: function (future, callback) {
                if (typeof callback === "function") {
                    future._callbacks.ifError.push(callback);
                }
                return future;
            },
            chain: function (future, callback) {
                
                var wrappedFuture = new Future(function (setValue, setError, cancel, ifCanceled) {
                    future.then(function (value) {
                        var nextFuture = callback(value);
                        
                        if (nextFuture instanceof Future) {
                            nextFuture.then(setValue);
                            nextFuture.ifError(setError);
                            nextFuture.ifCanceled(cancel);
                            
                            ifCanceled(function (reason) {
                                nextFuture.cancel(reason);
                            });
                        } else {
                            setValue(nextFuture);
                        }
                    });
                    
                    future.ifCanceled(cancel);
                    future.ifError(setError);
                });
                
                wrappedFuture.ifCanceled(function (reason) {
                    future.cancel(reason);
                });
                
                return wrappedFuture;
            },
            cancel: function (future, cancelationMessage) {
                future.isDone = true;
                future.isComplete = true;
                future.isCanceled = true;
                future._state = future._canceledState;
                future.cancelationMessage = cancelationMessage;
                future._callbacks.ifCanceled.forEach(function (callback) {
                    callback(cancelationMessage);
                });
                notifyFutureIsComplete(future);
                return future;
            },
            "finally": function (future, callback) {
                if (typeof callback === "function") {
                    future._callbacks["finally"].push(callback);
                }
                return future;
            }
        };
        
        var _retrievingState = {
            "try": emptyFn,
            then: _initialState.then,
            "catch": _initialState["catch"],
            catchCanceled: _initialState.catchCanceled,
            ifCanceled: _initialState.ifCanceled,
            chain: _initialState.chain,
            ifError: _initialState.ifError,
            cancel: _initialState.cancel,
            "finally": _initialState["finally"]
        };
        
        var _doneState = {
            "try": emptyFn,
            then: function (future, callback) {
                callback(future.value);
                return future;
            },
            "catch": _initialState["catch"],
            ifError: emptyFn,
            catchCanceled: emptyFn,
            ifCanceled: emptyFn,
            chain: _initialState.chain,
            cancel: emptyFn,
            "finally": invokeCallback
        };
        
        var _errorState = {
            "try": emptyFn,
            then: emptyFn,
            "catch": _initialState["catch"],
            ifError: function (future, callback) {
                callback(future.error);
                return future;
            },
            catchCanceled: emptyFn,
            ifCanceled: emptyFn,
            chain: _initialState.chain,
            cancel: emptyFn,
            "finally": invokeCallback
        };
        
        var _canceledState = {
            "try": emptyFn,
            then: emptyFn,
            "catch": _initialState["catch"],
            catchCanceled: _initialState.catchCanceled,
            ifCanceled: function (future, callback) {
                callback(future.cancelationMessage);
                return future;
            },
            ifError: emptyFn,
            chain: _initialState.chain,
            cancel: emptyFn,
            "finally": invokeCallback
        };
        
        var TIME_OUT_TEXT = "Timed out.";
        
        var Future = function (getValue) {
            this._callbacks = {
                "finally": [],
                chain: [],
                ifCanceled: [],
                then: [],
                ifError: []
            };
            this._state = null;
            this._initialState = _initialState;
            this._retrievingState = _retrievingState;
            this._doneState = _doneState;
            this._errorState = _errorState;
            this._canceledState = _canceledState;
            this.value = null;
            this.error = null;
            this.isDone = false;
            this.cancelationMessage = null;
            var self = this;
            self._getValue = getValue;
            self._state = self._initialState;
            
            if (typeof self._getValue !== "function") {
                self._getValue = emptyFn;
            }
        };
        
        Future.prototype["try"] = function () {
            return this._state["try"](this);
        };
        
        Future.prototype.then = function (callback) {
            if (typeof callback !== "function") {
                callback = function () { };
                //console.log("Deprecated, use try instead when wanting to start execution.");
            }
            this["try"]();
            return this._state.then(this, callback);
        };
        
        Future.prototype["catch"] = function (callback) {
            if (typeof callback !== "function") {
                throw new Error("The callback must be a function");
            }
            return this._state["catch"](this, callback);
        };
        
        Future.prototype.catchCanceled = function (callback) {
            if (typeof callback !== "function") {
                throw new Error("The callback must be a function");
            }
            return this._state.catchCanceled(this, callback);
        };
        
        Future.prototype.ifCanceled = function (callback) {
            if (typeof callback !== "function") {
                throw new Error("The callback must be a function");
            }
            return this._state.ifCanceled(this, callback);
        };
        
        Future.prototype.chain = function (callback) {
            if (typeof callback !== "function") {
                throw new Error("The callback must be a function");
            }
            return this._state.chain(this, callback);
        };
        
        Future.prototype.ifError = function (callback) {
            if (typeof callback !== "function") {
                throw new Error("The callback must be a function");
            }
            return this._state.ifError(this, callback);
        };
        
        Future.prototype["finally"] = function (callback) {
            if (typeof callback !== "function") {
                throw new Error("The callback must be a function");
            }
            return this._state["finally"](this, callback);
        };
        
        Future.prototype.cancel = function (reason) {
            if (typeof reason === "undefined") { reason = "Unknown"; }
            return this._state.cancel(this, reason);
        };
        
        Future.prototype.setTimeout = function (milliseconds) {
            var self = this;
            setTimeout(function () {
                self.cancel(TIME_OUT_TEXT);
            }, milliseconds);
            return this;
        };
        
        Future.prototype.ifTimedOut = function (callback) {
            if (typeof callback !== "function") {
                throw new Error("The callback must be a function");
            }
            this.ifCanceled(function (reason) {
                if (reason === TIME_OUT_TEXT) {
                    callback();
                }
            });
            return this;
        };
        
        Future.prototype.onComplete = Future.prototype["finally"];
        
        Future.fromResult = function (value) {
            return new Future(function (setValue) {
                setValue(value);
            })["try"]();
        };
        
        Future.fromCanceled = function (reason) {
            var future = new Future(function () { });
            future.cancel(reason);
            return future;
        };
        
        Future.fromError = function (error) {
            return new Future(function (setValue, setError) {
                setError(error);
            })["try"]();
        };
        
        Future.all = function (futures) {
            var length = futures.length;
            var results = new Array(length);
            
            futures = futures.map(function (value) {
                if (value instanceof Future) {
                    return value;
                } else {
                    return Future.fromResult(value);
                }
            });
            
            var future = new Future(function (setValue, setError, cancel, ifCanceled) {
                var doneCount = 0;
                
                if (futures.length === 0) {
                    setValue([]);
                } else {
                    futures.forEach(function (future, index) {
                        future.then(function (value) {
                            results[index] = value;
                            doneCount++;
                            if (doneCount === length) {
                                setValue(results);
                            }
                        }).ifError(function (e) {
                            
                            setError(e);
                        }).ifCanceled(cancel);
                    });
                }
            });
            
            return future;
        };
        
        return Future;

    }());
    
    var Fulfillment = function () {
        var self = this;
        Future.call(self, function (setValue, setError) {
            self.setValue = setValue;
            self.setError = setError;
        });
        
        self.try();
    };
    
    extend(Fulfillment, Future);
    
    var emptyFuture = Future.fromResult();
    var Loader = (function () {
        
        var Loader = function () {
            var self = this;
            
            assertNotGlobal(self);
            
            var files = {};
            var paths = {};
            var root = "";
            var loading = {};
            
            self.loadObject = function (namespace) {
                var obj = getObject(namespace);
                var onIncomplete = function () {
                    delete loading[namespace];
                };
                
                if (obj) {
                    return emptyFuture;
                }
                
                if (!loading[namespace]) {
                    var path = self.getPath(namespace);
                    loading[namespace] = self.loadScript(path, namespace);
                }
                
                return loading[namespace].try().ifError(onIncomplete).ifCanceled(onIncomplete);
            };
            
            self.loadScript = function (path) {
                throw new Error("This is an abstract class.");
            };
            
            self.setNamespace = function (namespace, path) {
                while (path.lastIndexOf("/") === path.length - 1) {
                    path = path.substring(0, path.length - 1);
                }
                
                paths[namespace] = path;
            };
            
            self.setObject = function (namespace, path) {
                files[namespace] = path;
            };
            
            self.getRootPath = function () {
                return root ? root + "/" : "";
            };
            
            self.getPath = function (namespace) {
                var path;
                var namespaces = namespace.split(".");
                var currentNamespace;
                var deepestNamespace;
                var deepestPath;
                var remainingNamespace;
                
                // Check if there has been a file set to this object.
                if (files.hasOwnProperty(namespace)) {
                    
                    path = files[namespace];

                } else if (paths.hasOwnProperty(namespace)) {
                    
                    path = paths[namespace] + ".js";

                } else {
                    currentNamespace = "";
                    for (var x = 0; x < namespaces.length ; x++) {
                        currentNamespace = (currentNamespace ? currentNamespace + "." : "") + namespaces[x];
                        if (paths.hasOwnProperty(currentNamespace)) {
                            deepestNamespace = currentNamespace;
                            deepestPath = paths[currentNamespace];
                        }
                    }
                    
                    if (deepestNamespace === namespace) {
                        path = deepestPath + ".js";
                    } else {
                        if (typeof deepestPath === "undefined") {
                            path = concatPaths(self.getRootPath(), namespace.replace(/\./g, "/") + ".js");
                        } else {
                            remainingNamespace = namespace.replace(deepestNamespace, "");
                            path = concatPaths(deepestPath, remainingNamespace.replace(/\./g, "/") + ".js");
                        }
                    }

                }
                
                return path;

            };
            
            self.setRoot = function (value) {
                root = concatPaths(value);
            };
            self.getRoot = function () {
                return root;
            };

        };
        
        return Loader;

    }());
    
    var NodeLoader = (function (Super) {
        
        var NodeLoader = function () {
            var self = this;
            
            assertNotGlobal(self);
            
            Super.call(self);
            
            self.loadScript = function (path, namespace) {
                try {
                    var module = require(path);
                    return Future.fromResult(module);
                } catch (e) {
                    throw new Error("Error while loading '" + path + "', trying to load namespace '" + namespace + "', with Error: " + e.toString());

                }
            };
        };
        
        extend(NodeLoader, Super);
        
        return NodeLoader;

    }(Loader));
    
    var HtmlLoader = (function (Super) {
        
        var HtmlLoader = function () {
            var self = this;
            
            assertNotGlobal(self);
            
            Super.call(self);
            
            self.loadScript = function (path) {
                
                //Take this out as soon as possible.
                //Its just solving users caching problems.
                var now = new Date();
                path += "?v=" + now.getFullYear() + "/" + (now.getMonth() + 1) + "/" + now.getDate();
                
                return new Future(function (setValue, setError) {
                    
                    // All of this is pretty weird because of browser caching etc.
                    var script = document.createElement("script");
                    script.async = true;
                    script.src = path;
                    
                    // Attach handlers for all browsers
                    script.onload = script.onreadystatechange = function () {
                        
                        if (!script.readyState || /loaded|complete/.test(script.readyState)) {
                            
                            // Handle memory leak in IE
                            script.onload = script.onreadystatechange = null;
                            script.onerror = null;
                            
                            // Remove the script
                            if (script.parentNode) {
                                script.parentNode.removeChild(script);
                            }
                            
                            // Dereference the script
                            script = null;
                            
                            // Callback if not abort
                            setValue();
                        }
                    };
                    
                    script.onerror = function () {
                        setError(Error("Failed to load: \"" + path + "\"."));
                    };
                    
                    var head = document.getElementsByTagName("head")[0];
                    
                    if (head.children.length > 0) {
                        head.insertBefore(script, head.firstChild);
                    } else {
                        head.appendChild(script);
                    }

                });
            };
        };
        
        extend(HtmlLoader, Super);
        
        return HtmlLoader;

    }(Loader));
    
    namespace("BASE");
    
    // This is for knowing the order in which scripts were executed.
    var dependenciesLoadedHash = {};
    var dependenciesLoaded = [];
    
    var Sweeper = function () {
        var self = this;
        
        var dependenciesForCallbacks = [];
        self.sweep = function () {
            var dependencies;
            var readyDependency = null;
            var readyDependencyIndex = -1;
            // This is trickery, so be careful. Modifying an array while iterating.
            for (var x = 0; x < dependenciesForCallbacks.length; x++) {
                var dependencies = dependenciesForCallbacks[x];
                
                if (dependencies.isReady()) {
                    // Found a ready dependency, stop the loop and save the index.
                    readyDependencyIndex = x;
                    break;
                }
            }
            
            if (readyDependencyIndex >= 0) {
                readyDependency = dependenciesForCallbacks[readyDependencyIndex];
                dependenciesForCallbacks.splice(readyDependencyIndex, 1);
                readyDependency.execute();
                self.sweep();
            }
        };
        self.addDependencies = function (dependencies) {
            dependenciesForCallbacks.push(dependencies);
        };
        self.getStatus = function () {
            var results = [];
            
            dependenciesForCallbacks.forEach(function (dependency) {
                results.push(dependency.getStatus());
            });
            
            return results;
        };
    };
    
    var Dependencies = function (namespaces, fulfillment) {
        var self = this;
        
        self.isReady = function () {
            return namespaces.every(function (namespace) {
                var result = isObject(namespace);
                // This is for knowing the order in which scripts were executed.
                if (result && !dependenciesLoadedHash[namespace]) {
                    dependenciesLoadedHash[namespace] = true;
                    dependenciesLoaded.push(namespace);
                }
                return result;
            });
        };
        
        self.getStatus = function () {
            return namespaces.reduce(function (result, namespace) {
                if (isObject(namespace)) {
                    result.loaded.push(namespace);
                } else {
                    result.pending.push(namespace);
                }
                return result;
            }, {
                loaded: [],
                pending: []
            });
        };
        
        self.execute = function () {
            fulfillment.setValue();
        };
    };
    
    var sweeper = new Sweeper();
    
    BASE.require = function (namespaces, callback) {
        if (!Array.isArray(namespaces)) {
            throw new Error("Expected namespaces to be an array.");
        }
        
        var loader = BASE.require.loader;
        var fulfillment = new Fulfillment();
        fulfillment.then(callback);
        
        var dependencies = new Dependencies(namespaces, fulfillment);
        sweeper.addDependencies(dependencies);
        
        var scriptFutures = [];
        namespaces.forEach(function (namespace) {
            scriptFutures.push(loader.loadObject(namespace));
        });
        
        Future.all(scriptFutures).then(function () {
            sweeper.sweep();
        });
        
        return fulfillment;

    };
    
    BASE.require.sweeper = sweeper;
    
    BASE.require.dependencyList = dependenciesLoaded;
    
    if (global["window"]) {
        BASE.require.loader = new HtmlLoader();
    } else {
        BASE.require.loader = new NodeLoader();
    }
    
    namespace("BASE.async");
    namespace("BASE.util");
    namespace("BASE.behaviors");
    
    BASE.async.Future = Future;
    BASE.async.Fulfillment = Fulfillment;
    BASE.util.Observable = Observable;
    BASE.util.LiteObservable = CheapObservable;
    BASE.util.Observer = Observer;
    
    BASE.extend = extend;
    BASE.hasInterface = hasInterface;
    BASE.Loader = Loader;
    BASE.namespace = namespace;
    BASE.isObject = isObject;
    BASE.getObject = getObject;
    BASE.clone = clone;
    BASE.assertNotGlobal = assertNotGlobal;
    BASE.concatPaths = concatPaths;
    BASE.isNullOrUndefined = isNullOrUndefined;

}());