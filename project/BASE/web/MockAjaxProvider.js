(function () {
    var Future = BASE.async.Future;
    
    BASE.namespace("BASE.web");
    
    BASE.web.MockAjaxProvider = function (defaultConfig) {
        defaultConfig = defaultConfig || {};
        defaultConfig.method = defaultConfig.method || "GET";
        var globalHandler = defaultConfig.handler;
        
        var self = this;
        
        var networkError = function () {
            return {
                response: "",
                responseText: "",
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
            var x;
            
            Object.keys(defaultConfig).forEach(function (key) {
                if (typeof config[key] === "undefined") {
                    config[key] = defaultConfig[key];
                }
            });
            
            config.url = url;
            
            var handler = globalHandler;
            var xhr;
            var error;

            handler = handler || stringPathHandlers[url];
            
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
                xhr = methodHandlers[config.method.toUpperCase()](config);
                error = new Error("Request Error");
                error.xhr = xhr;

                return Future.fromError(error);
            }

            xhr = networkError(config);
            error = new Error("Request Error");
            error.xhr = xhr;

            return Future.fromError(error);
        };

    };
}());