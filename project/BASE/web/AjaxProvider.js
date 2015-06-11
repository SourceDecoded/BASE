BASE.require([
    "BASE.web.HttpRequest"
], function () {
    var HttpRequest = BASE.web.HttpRequest;
    
    BASE.namespace("BASE.web");
    
    BASE.web.AjaxProvider = function (defaultOptions) {
        defaultOptions = defaultOptions || {};
        var self = this;
        var dataConverter = defaultOptions.dataConverter;
        
        if (typeof dataConverter === "undefined" || dataConverter === null) {
            throw new Error("AjaxProvider: Null argument exception - dataConverter.");
        }
        
        self.request = function (url, options) {
            
            Object.keys(defaultOptions).forEach(function (key) {
                if (typeof options[key] === "undefined") {
                    options[key] = defaultOptions[key];
                }
            });
            
            options.url = url;
            
            dataConverter.handleRequestAsync(options).chain(function () {
                var request = new HttpRequest(url, options);
                return request.sendAsync();
            }).chain(function (xhr) {
                return dataConverter.handleResponseAsync(xhr);
            }).catch(function (error) {
                return dataConverter.handleErrorResponseAsync(error);
            });

        };

    };

});