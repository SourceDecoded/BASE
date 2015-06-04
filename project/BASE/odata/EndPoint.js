BASE.require([
    'BASE.web.AjaxProvider',
    'BASE.web.PathResolver',
    'BASE.odata.convertToOdataValue'
], function () {
    var Future = BASE.async.Future;
    var AjaxProvider = BASE.web.AjaxProvider;
    var PathResolver = BASE.web.PathResolver;
    var convertToOdataValue = BASE.odata.convertToOdataValue;
    
    BASE.namespace('BASE.odata');
    
    BASE.odata.EndPoint = function (config) {
        config = config || {};
        var ajaxProvider = config.ajaxProvider || new AjaxProvider();
        var self = this;
        var url = config.url;
        var resultMutationsHandlers = [];
        if (url.lastIndexOf('/') === url.length - 1) {
            url = url.substr(0, url.length - 1);
        }
        
        self.invokeInstanceFunction = function (key, methodName, parameters) {
            parameters = parameters || {};
            
            var parameterString = Object.keys(parameters).map(function (key) {
                return key + '=' + convertToOdataValue(parameters[key]);
            }).join(', ');
            
            var methodSignature = parameterString.length > 0 ? methodName + '(' + parameterString + ')' : methodName;
            
            var fullUrl = url + '(' + convertToOdataValue(key) + ')/' + methodSignature;
            
            return ajaxProvider.request(fullUrl).chain(function (response) {
                try {
                    return JSON.parse(response.responseText);
                } catch (e) {
                    var error = new Error("JSON Parse Error");
                    return Future.fromError(error);
                }
            }).catch(function (error) { 
            
            });

        };
    };

});