(function () {
    var Future = BASE.async.Future;
    
    BASE.namespace("BASE.web");
    
    BASE.web.MockAjaxProvider = function (defaultConfig) {
        defaultConfig = defaultConfig || {};
        defaultConfig.method = defaultConfig.method || "GET";
        
        var self = this;
        
        var networkError = function () {
            return {
                response: "This is an Error",
                responseText: "This is an Error",
                responseType: "text",
                status: 0,
                statusText: "0 Network Error"
            };
        }
        
        var methodHandlers = {
            "GET": networkError,
            "POST": networkError,
            "PUT": networkError,
            "PATCH": networkError,
            "DELETE": networkError
        };
        
        var stringPathHandlers = {};
        var regExPathHandlers = [];
        
        self.addResponseHandlerByMethod = function (methodName, handler) {
            if (typeof methodName !== "string") {
                throw new Error("The methodName needs to be a string.");
            }
            
            if (typeof handler !== "function") {
                throw new Error("The handler needs to be a function.");
            }
            
            methodHandlers[methodName] = handler;
        };
        
        self.addResponseHandlerByPath = function (pathRegExOrPathString, handler) {
            if (typeof pathRegExOrPathString !== "string" && !(pathRegExOrPathString instanceof RegExp)) {
                throw new Error("The methodName needs to be a string.");
            }
            
            if (typeof handler !== "function") {
                throw new Error("The handler needs to be a function.");
            }
            
            if (pathRegExOrPathString instanceof RegExp) {
                regExPathHandlers.push({
                    regEx: pathRegExOrPathString,
                    handler: handler
                });
            } else {
                stringPathHandlers[pathRegExOrPathString] = handler;
            }
        };
        
        self.request = function (url, config) {
            config = config || {};
            var handler;
            var x;
            
            Object.keys(defaultConfig).forEach(function (key) {
                if (typeof config[key] === "undefined") {
                    config[key] = defaultConfig[key];
                }
            });
            
            config.url = url;
            
            handler = stringPathHandlers[url];
            
            if (typeof handler === "function") {
                return Future.fromResult(handler(config));
            }
            
            for (x = 0 ; x < regExPathHandlers.length; x++) {
                var match = regExPathHandlers[x].regEx.test(url);
                if (match) {
                    return Future.fromResult(regExPathHandlers[x].handler(config));
                }
            }
            
            if (methodHandlers[config.method.toUpperCase() || "GET"]) {
                return Future.fromResult(methodHandlers[config.method.toUpperCase()](config));
            }
            
            return Future.fromResult(networkError(config));
        };

    };
}());