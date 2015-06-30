(function () {
    var Future = BASE.async.Future;
    
    BASE.namespace("BASE.web");
    
    var returnValue = function (value) { return Future.fromResult(value); };
    var returnError = function (value) { return Future.fromError(value); };
    
    var makeFutureXhrResponseByStatusCode = function (xhr) {
        if (xhr.status < 300 && xhr.status >= 200) {
            return Future.fromResult(xhr);
        } else {
            return Future.fromError(xhr);
        }
    };
    
    BASE.web.MockAjaxProvider = function (defaultConfig) {
        defaultConfig = defaultConfig || {};
        defaultConfig.method = defaultConfig.method || "GET";
        var globalHandler = defaultConfig.handler;
        
        var dataConverter = defaultConfig.dataConverter || {
            handleResponseAsync: returnValue,
            handleRequestAsync: returnValue,
            handleErrorResponseAsync: returnError
        };
        
        var self = this;
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
            var handler = globalHandler;
            var xhr;
            
            Object.keys(defaultConfig).forEach(function (key) {
                if (typeof config[key] === "undefined") {
                    config[key] = defaultConfig[key];
                }
            });
            
            config.url = url;
            
            return dataConverter.handleRequestAsync(config).chain(function () {
                handler = handler || stringPathHandlers[url];
                
                if (typeof handler === "function") {
                    return makeFutureXhrResponseByStatusCode(handler(config));
                }
                
                for (x = 0 ; x < regExPathHandlers.length; x++) {
                    var match = regExPathHandlers[x].regEx.test(url);
                    if (match) {
                        return makeFutureXhrResponseByStatusCode(regExPathHandlers[x].handler(config));
                    }
                }
                
                if (methodHandlers[config.method.toUpperCase() || "GET"]) {
                    xhr = methodHandlers[config.method.toUpperCase()](config);
                    
                    return Future.fromError(xhr);
                }
                
                xhr = BASE.web.MockAjaxProvider.createErrorXhrResponse(config);
                
                return Future.fromError(xhr);

            }).chain(function (xhr) {
                return dataConverter.handleResponseAsync(xhr);
            }).catch(function (error) {
                return dataConverter.handleErrorResponseAsync(error);
            });
        };

    };
    
    BASE.web.MockAjaxProvider.createOKXhrResponse = function (responseText) {
        return {
            response: responseText,
            responseText: responseText,
            responseType: "text",
            status: 200,
            statusText: "200 OK"
        };
    };
    
    BASE.web.MockAjaxProvider.createErrorXhrResponse = function () {
        return {
            response: "",
            responseText: "",
            responseType: "text",
            status: 0,
            statusText: "0 Network Error"
        };
    };
    
    BASE.web.MockAjaxProvider.createCustomErrorXhrResponse = function (status, responseText) {
        return {
            response: responseText,
            responseText: responseText,
            responseType: "text",
            status: status,
            statusText: status + " Error"
        };
    };
    
    var methodHandlers = {
        "GET": BASE.web.MockAjaxProvider.createErrorXhrResponse,
        "POST": BASE.web.MockAjaxProvider.createErrorXhrResponse,
        "PUT": BASE.web.MockAjaxProvider.createErrorXhrResponse,
        "PATCH": BASE.web.MockAjaxProvider.createErrorXhrResponse,
        "DELETE": BASE.web.MockAjaxProvider.createErrorXhrResponse
    };
}());