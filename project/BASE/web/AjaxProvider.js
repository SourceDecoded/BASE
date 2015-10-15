BASE.require([
    "BASE.web.HttpRequest",
    "BASE.web.RawAjaxDataConverter"
], function () {
    var HttpRequest = BASE.web.HttpRequest;
    var rawDataConverter = new BASE.web.RawAjaxDataConverter();
    
    BASE.namespace("BASE.web");
    
    BASE.web.AjaxProvider = function (defaultOptions) {
        defaultOptions = defaultOptions || {};
        var self = this;
        var dataConverter = defaultOptions.dataConverter || rawDataConverter;
        
        self.request = function (url, options) {
            options = options || {};
            
            Object.keys(defaultOptions).forEach(function (key) {
                if (typeof options[key] === "undefined") {
                    options[key] = defaultOptions[key];
                }
            });
            
            options.url = url;
            
            return dataConverter.handleRequestAsync(options).chain(function () {
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