BASE.require([
    "BASE.util.Guid",
    "BASE.async.Fulfillment"
], function () {
    
    BASE.namespace("node");
    
    var Future = BASE.async.Future;
    
    node.ChildActor = function () {
        var self = this;
        var registeredMethods = {};
        
        var handleMessage = function (event) {
            messageHandlers[event.type](event);
        };
        
        var messageHandlers = {
            "invocation": function (methodInformation) {
                var methodName = methodInformation.methodName;
                var invocationId = methodInformation.invocationId;
                var args = methodInformation.args;
                
                if (methodName == null || invocationId == null || args == null) {
                    process.send({
                        type: "invocationError",
                        invocationId: invocationId,
                        error: "Invalid arguments"
                    });
                }
                
                // Some other actor instance could be listening for this.
                if (registeredMethods[methodName] == null) {
                    return;
                }
                
                var returnedValue;
                
                try {
                    returnedValue = registeredMethods[methodName].apply(null, args);
                } catch (error) {
                    returnedValue = Future.fromError(error);
                }
                
                if (!(returnedValue instanceof Future)) {
                    returnedValue = Future.fromResult(returnedValue);
                }
                
                returnedValue.then(function (value) {
                    process.send({
                        type: "return",
                        invocationId: invocationId,
                        returnValue: value
                    });
                }).ifError(function (error) {
                    process.send({
                        type: "returnError",
                        invocationId: invocationId,
                        error: error.message
                    });
                });

            }
        };
        
        self.registerMethod = function (key, method) {
            registeredMethods[key] = method;
        };
        
        self.registerMethods = function (methods) {
            Object.keys(methods).forEach(function (key) {
                self.registerMethod(key, methods[key]);
            });
        };
        
        self.notify = function (event) {
            var notifyInformation = {
                type: "notify",
                event: event
            };

            process.send(notifyInformation);
        };
        
        process.on("message", handleMessage);

    };
});