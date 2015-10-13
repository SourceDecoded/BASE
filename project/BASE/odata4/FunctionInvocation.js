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
        
        self.invokeAsync = function (url, methodName, parameters) {
            url = url.indexOf("/") === 0 ? url.substr(1): url;
            parameters = parameters || {};
            
            var parameterString = Object.keys(parameters).map(function (key) {
                return key + "=" + convertToOdataValue(parameters[key]);
            }).join(", ");
            
            var methodSignature = parameterString.length > 0 ? methodName + "(" + parameterString + ")" : methodName;
            
            var fullUrl = url + "/" + methodSignature;
            
            return ajaxProvider.request(fullUrl);
        };
      
    };

});