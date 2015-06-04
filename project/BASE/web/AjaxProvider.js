BASE.require([
    'BASE.web.HttpRequest'
], function () {
    var HttpRequest = BASE.web.HttpRequest;
    
    BASE.namespace('BASE.web');
    
    BASE.web.AjaxProvider = function (defaultConfig) {
        defaultConfig = defaultConfig || {};
        var self = this;
        
        self.request = function (url, config) {
            
            Object.keys(defaultConfig).forEach(function (key) {
                if (typeof config[key] === 'undefined') {
                    config[key] = defaultConfig[key];
                }
            });
            
            config.url = url;
            
            var request = new HttpRequest(url, config);
            return request.sendAsync();

        };

    };

});