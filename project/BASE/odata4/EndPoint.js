BASE.require([
    "BASE.query.Queryable",
    "BASE.web.PathResolver",
    "BASE.odata4.ODataProvider",
    "BASE.odata.convertToOdataValue"
], function () {
    var Future = BASE.async.Future;
    var Queryable = BASE.query.Queryable;
    var convertToOdataValue = BASE.odata.convertToOdataValue;
    
    BASE.namespace("BASE.odata4");
    
    BASE.odata4.EndPoint = function (config) {
        config = config || {};
        var url = config.url;
        var queryProvider = config.queryProvider;
        var ajaxProvider = config.ajaxProvider;
        var self = this;
        
        if (typeof url === "undefined" || url === null) {
            throw new Error("EndPoint: Null Argument Exception - url needs to be a string.");
        }
        
        if (typeof queryProvider === "undefined" || queryProvider === null) {
            throw new Error("EndPoint: Null Argument Exception - queryProvider cannot be undefined.");
        }
        
        if (typeof ajaxProvider === "undefined" || ajaxProvider === null) {
            throw new Error("EndPoint: Null Argument Exception - ajaxProvider cannot be undefined.");
        }
        
        if (url.lastIndexOf("/") === url.length - 1) {
            url = url.substr(0, url.length - 1);
        }
        
        self.add = function (entity) {

        };
        
        self.update = function (entity, updates) {

        };
        
        self.remove = function (entity) {

        };
        
        self.getQueryProvider = function () {
            return queryProvider;
        };
        
        self.asQueryable = function () {
            var queryable = new Queryable();
            queryable.provider = self.getQueryProvider();
            return queryable;
        };
        
        self.invokeInstanceFunction = function (key, methodName, parameters) {
            parameters = parameters || {};
            
            var parameterString = Object.keys(parameters).map(function (key) {
                return key + "=" + convertToOdataValue(parameters[key]);
            }).join(", ");
            
            var methodSignature = parameterString.length > 0 ? methodName + "(" + parameterString + ")" : methodName;
            
            var fullUrl = url + "(" + convertToOdataValue(key) + ")/" + methodSignature;

            return ajaxProvider.request(fullUrl);

        };
        
        self.invokeClassFunction = function (methodName, parameters) {
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