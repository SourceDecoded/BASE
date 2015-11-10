BASE.require([
    "BASE.odata.convertToOdataValue"
], function () {
    
    BASE.namespace("BASE.odata4");
    
    var convertToOdataValue = BASE.odata.convertToOdataValue;
    
    BASE.odata4.FunctionInvocation = function (ajaxProvider) {
        var self = this;
        
        if (ajaxProvider == null) {
            throw new Error("Null Argument Exception: ajax needs to be defined.");
        }
        
        self.invokeAsync = function (url, methodName, parameters, options) {
            var fullUrl = self.buildUrl(url, methodName, parameters, options);
            return ajaxProvider.request(fullUrl, options);
        };
        
        self.buildUrl = function (url, methodName, parameters, options) {
            url = url.lastIndexOf("/") === url.length - 1? url.substr(0, url.length - 1): url;
            parameters = parameters || {};
            options = options || {};
            options.data = parameters;
            var parameterString = Object.keys(parameters).map(function (key) {
                return key + "=" + convertToOdataValue(parameters[key]);
            }).join(", ");
            
            var methodSignature = parameterString.length > 0 ? methodName + "(" + parameterString + ")" : methodName;
            
            return url + "/" + methodSignature;
        };

    };

});