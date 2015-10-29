BASE.require([
    "BASE.util.Guid",
    "BASE.async.Fulfillment"
], function () {
    
    BASE.namespace("node");
    
    var createGuid = BASE.util.Guid.create;
    var childProcess = require("child_process");
    var Future = BASE.async.Future;
    var Fulfillment = BASE.async.Fulfillment;
    var emptyFn = function () { };
    
    node.ParentActor = function (childProcessFile) {
        var self = this;
        var forkedProcess = null;
        var observersByType = {};
        
        var handleMessage = function (event) {
            messageHandlers[event.type](event);
        };
        
        if (typeof childProcessFile !== "string") {
            throw new Error("Null Argument Exception: childProcessFile needs to be specified.");
        }
        
        var getObserversByType = function (type) {
            if (!Array.isArray(observersByType[type])) {
                observersByType[type] = [];
            }
            return observersByType[type];
        };
        
        forkedProcess = childProcess.fork(childProcessFile);
        forkedProcess.on("message", handleMessage);
        
        var pendingInvocations = {};
        
        var handleError = function (returnInformation) {
            var invocationId = returnInformation.invocationId;
            if (invocationId == null) {
                return;
            }
            
            var invocationFullfillment = pendingInvocations[invocationId]
            if (invocationFullfillment == null) {
                return;
            }
            
            invocationFullfillment.setError(returnInformation.error);
            delete pendingInvocations[invocationId];
        }
        
        var messageHandlers = {
            "log": function (message) {
                console.log(message);
            },
            "returnError": handleError,
            "invocationError": handleError,
            "return": function (returnInformation) {
                var invocationId = returnInformation.invocationId;
                var returnValue = returnInformation.returnValue;
                
                if (invocationId == null) {
                    return;
                }
                
                var invocationFullfillment = pendingInvocations[invocationId]
                if (invocationFullfillment == null) {
                    return;
                }
                invocationFullfillment.setValue(returnInformation.returnValue);
                delete pendingInvocations[invocationId];
            },
            "notify": function (notifyInformation) {
                var event = notifyInformation.event;
                var type = event.type;
                var observers = getObserversByType(type);
                
                observers.forEach(function (observer) {
                    observer.notify(event);
                });
            }
        };
        
        self.invokeMethodAsync = function (methodName, args) {
            if (forkedProcess == null) {
                return Future.fromError("No child process started.");
            }
            
            var invocationId = createGuid();
            forkedProcess.send({
                type: "invocation",
                methodName: methodName,
                invocationId: invocationId,
                args: args
            });
            return pendingInvocations[invocationId] = new Fulfillment();
        };
        
        self.dispose = function () {
            forkedProcess.kill();
        };
        
        self.observe = function (type, callback) {
            if (typeof type !== "string") {
                throw new Error("Illegal Argument Exception. type needs to be a string.");
            }
            
            if (typeof callback !== "function") {
                throw new Error("Illegal Argument Exception. callback needs to be a function.");
            }
            
            var observer = {
                stoppedNotify: emptyFn,
                startedNotify: function () {
                    callback.apply(null, arguments);
                },
                dispose: function () {
                    var index = observers.indexOf(observer);

                    if (index > -1) {
                        observers.splice(index, 1);
                    }
                    this.notify = this.stoppedNotify;
                },
                stop: function () {
                    this.notify = this.stoppedNotify;
                },
                start: function () {
                    this.notify = this.startedNotify;
                },
                notify: emptyFn
            };
            
            observer.start();
            
            var observers = getObserversByType(type);
            observers.push(observer);
            
            return observer;
        };

    };
});