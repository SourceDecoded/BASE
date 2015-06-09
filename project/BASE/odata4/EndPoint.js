BASE.require([
    'BASE.query.Queryable',
    'BASE.web.AjaxProvider',
    'BASE.web.PathResolver',
    'BASE.odata4.ODataProvider',
    'BASE.odata.convertToOdataValue'
], function () {
    var Future = BASE.async.Future;
    var AjaxProvider = BASE.web.AjaxProvider;
    var ODataProvider = BASE.odata4.ODataProvider;
    var Queryable = BASE.query.Queryable;
    var convertToOdataValue = BASE.odata.convertToOdataValue;
    
    BASE.namespace('BASE.odata4');
    
    BASE.odata4.EndPoint = function (config) {
        config = config || {};
        var ajaxProvider = config.ajaxProvider || new AjaxProvider();
        var self = this;
        var url = config.url;
        var appName = config.appName;
        var token = config.token;
        var Type = config.Type;
        
        if (url.lastIndexOf('/') === url.length - 1) {
            url = url.substr(0, url.length - 1);
        }
        
        self.add = function (entity) {
            
        };
        
        self.update = function (entity, updates) {
           
        };
        
        self.remove = function (entity) {
           
        };
        
        self.getQueryProvider = function () {
            return new ODataProvider({
                appName: appName,
                token: token,
                baseUrl: url
            });
        };
        
        self.asQueryable = function () {
            var queryable = new Queryable(Type);
            queryable.provider = self.getQueryProvider();
            return queryable;
        };
        
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