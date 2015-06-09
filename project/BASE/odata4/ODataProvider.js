BASE.require([
    "BASE.async.Future",
    "BASE.query.Provider",
    "BASE.odata4.ODataVisitor",
    "BASE.odata4.ODataIncludeVisitor",
    "BASE.data.primitiveHandlers.ODataPrimitiveHandler",
    "LG.data.dataStores.createErrorFromXhr",
    "BASE.web.queryString",
    "BASE.query.Expression"
], function () {
    BASE.namespace("LG.query");
    
    var Expression = BASE.query.Expression;
    var ODataVisitor = BASE.odata4.ODataVisitor;
    var ODataIncludeVisitor = BASE.odata4.ODataIncludeVisitor;
    var Future = BASE.async.Future;
    var queryString = BASE.web.queryString;
    var createErrorFromXhr = LG.data.dataStores.createErrorFromXhr;
    var ODataPrimitiveHandler = BASE.data.primitiveHandlers.ODataPrimitiveHandler;
    
    BASE.odata4.ODataProvider = (function (Super) {
        var ODataProvider = function (config) {
            config = config || {};
            Super.call(this);
            
            var self = this;
            var url = config.url;
            var appName = config.appName;
            var ajaxProvider = config.ajaxProvider;
            var token = config.token;
            var model = config.model;
            var primitiveHandler = new ODataPrimitiveHandler();
            
            if (typeof url === "undefined" || url === null) {
                throw new Error("ODataProvider: Null argument error, url cannot be undefined.");
            }
            
            if (typeof ajaxProvider === "undefined" || ajaxProvider === null) {
                throw new Error("ODataProvider: Null argument error, ajaxProvider cannot be undefined.");
            }
            
            if (typeof model === "undefined" || model === null || typeof model.type === "undefined" || model.type === null) {
                throw new Error("ODataProvider: Null argument error, a model and a model type must be defined.");
            }
            
            if (url.lastIndexOf("/") === url.length - 1) {
                url = url.substr(0, url.length - 1);
            }
            
            var buildUrl = function (expression) {
                var config = { model: model };
                var odataVisitor = new ODataVisitor(config);
                var includeVisitor = new ODataIncludeVisitor(config);
                var where = odataVisitor.parse(expression.where) || "";
                var take = odataVisitor.parse(expression.take) || "";
                var skip = odataVisitor.parse(expression.skip) || "";
                var orderBy = odataVisitor.parse(expression.orderBy) || "";
                var include = includeVisitor.parse(expression.include);
                var parameterQueryString = queryString.toString(expression.parameters, false);
                var parts = Array.prototype.slice.call(arguments, 1);
                parts.unshift(where , skip , take , orderBy, include, parameterQueryString);
                
                var odataString = parts.filter(function (part) {
                    return part !== "";
                }).join("&");
                
                return url + (odataString ? "?" + odataString : "");
            };
            
            var convertDtos = function (dtos) {
                var convertedDtos = [];
                
                dtos.forEach(function (dto) {
                    var fixedDto = primitiveHandler.resolve(model, dto);
                    convertedDtos.push(fixedDto);
                });
                
                return convertedDtos;
            };
            
            var requestHandler = function (url) {
                return ajaxProvider.request(url, {
                    method: "GET"
                }).catch(function (error) {
                    return Future.fromError(createErrorFromXhr(error));
                }).chain(function (json) {
                    var response;
                    
                    try {
                        response = JSON.parse(json);
                    } catch (e) {
                        return Future.fromError(new Error("Ajax request for '" + url + "' returned invalid json."));
                    }
                    
                    if (!Array.isArray(response.value)) {
                        return Future.fromError(new Error("Ajax request for '" + url + "' value property missing."));
                    }
                    
                    return response;
                });
            };
            
            self.count = function (queryable) {
                var expression = queryable.getExpression();
                
                // Overriding take so no results are return, because we only want a count.
                expression.take = Expression.take(0);
                
                var url = buildUrl(expression, "$count=true");
                
                return ajaxProvider.request(url, {
                    method: "GET"
                }).chain(function (json) {
                    try {
                        var response = JSON.parse(json);
                        return response["@odata.count"];
                    } catch (e) {
                        return Future.fromError(e);
                    }
                }).catch(function (e) {
                    return Future.fromError(e);
                });
            };
            
            self.toArrayWithCount = function (queryable) {
                var expression = queryable.getExpression();
                var url = buildUrl(expression, "$count=true");
                
                return requestHandler(url).chain(function (response) {
                    return {
                        count: response["@odata.count"],
                        array: convertDtos(response.value)
                    }
                });
                
            };
            
            //This should always return a Future of an array of objects.
            self.execute = function (queryable) {
                var expression = queryable.getExpression();
                var url = buildUrl(expression);
                
                return requestHandler(url).chain(function (response) {
                    return convertDtos(response.value);
                });
            };
            
            self.toArray = self.execute;
            
            self.getAppName = function () {
                return appName;
            };
            
            self.getToken = function () {
                return token;
            };

        };
        
        BASE.extend(ODataProvider, Super);
        
        return ODataProvider;
    }(BASE.query.Provider));

});