﻿BASE.require([
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
            url = url.lastIndexOf("/") === url.length - 1? url.substr(0, url.length - 1): url;
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