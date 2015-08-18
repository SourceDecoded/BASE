BASE.require([
    "BASE.async.Future",
    "BASE.query.Provider",
    "BASE.odata4.ODataVisitor",
    "BASE.odata4.ODataIncludeVisitor",
    "LG.data.dataStores.createErrorFromXhr",
    "BASE.web.queryString",
    "BASE.query.Expression",
    "BASE.odata4.FromServiceDto"
], function () {
    BASE.namespace("BASE.odata4");
    
    var Expression = BASE.query.Expression;
    var ODataVisitor = BASE.odata4.ODataVisitor;
    var ODataIncludeVisitor = BASE.odata4.ODataIncludeVisitor;
    var Future = BASE.async.Future;
    var queryString = BASE.web.queryString;
    var FromServiceDto = BASE.odata4.FromServiceDto;
    
    BASE.odata4.ODataProvider = (function (Super) {
        var ODataProvider = function (config) {
            config = config || {};
            Super.call(this);
            
            var self = this;
            var url = config.url;
            var edm = config.edm;
            var model = config.model;
            var ajaxProvider = config.ajaxProvider;
            
            if (typeof url === "undefined" || url === null) {
                throw new Error("ODataProvider: Null argumentexception - url");
            }
            
            if (typeof ajaxProvider === "undefined" || ajaxProvider === null) {
                throw new Error("ODataProvider: Null argument exception - ajaxProvider");
            }
            
            if (typeof model === "undefined" || model === null) {
                throw new Error("ODataProvider: Null argument exception - model");
            }
            
            if (typeof edm === "undefined" || edm === null) {
                throw new Error("ODataProvider: Null argument exception - edm");
            }
            
            if (url.lastIndexOf("/") === url.length - 1) {
                url = url.substr(0, url.length - 1);
            }
            
            var fromServiceDto = new FromServiceDto(edm);
            
            var buildUrl = function (expression) {
                var odataVisitor = new ODataVisitor(config);
                var includeVisitor = new ODataIncludeVisitor(config);
                var where = odataVisitor.parse(expression.where) || "";
                var take = odataVisitor.parse(expression.take) || "";
                var skip = odataVisitor.parse(expression.skip) || "";
                var orderBy = odataVisitor.parse(expression.orderBy) || "";
                var include = includeVisitor.parse(expression.include);
                var parameterQueryString = queryString.toString(expression.parameters, false);
                var parts = Array.prototype.slice.call(arguments, 1);
                parts.unshift(where, skip, take, orderBy, include, parameterQueryString);
                
                var odataString = parts.filter(function (part) {
                    return part !== "";
                }).join("&");
                
                return url + (odataString ? "?" + odataString : "");
            };
            
            var requestHandler = function (url) {
                return ajaxProvider.request(url, {
                    method: "GET"
                });
            };
            
            var convertDtos = function (dtos) {
                return dtos.map(function (dto) {
                    return fromServiceDto.resolve(model, dto);
                });
            };
            
            self.count = function (queryable) {
                var expression = queryable.getExpression();
                
                // Overriding take so no results are return, because we only want a count.
                expression.take = Expression.take(0);
                
                var url = buildUrl(expression, "$count=true");
                
                return requestHandler(url).chain(function (response) {
                    return response["@odata.count"];
                }).catch(function (e) {
                    return Future.fromError(e);
                });
            };
            
            self.toArrayWithCount = function (queryable) {
                var expression = queryable.getExpression();
                var url = buildUrl(expression, "$count=true");
                
                return requestHandler(url).chain(function (response) {
                    
                    if (!Array.isArray(response.value)) {
                        return Future.fromError(new Error("XHR response does not contain expected value node."));
                    }
                    
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
                    
                    if (!Array.isArray(response.value)) {
                        return Future.fromError(new Error("XHR response does not contain expected value node."));
                    }
                    
                    return convertDtos(response.value);
                });
            };
            
            self.toArray = self.execute;

        };
        
        BASE.extend(ODataProvider, Super);
        
        return ODataProvider;
    }(BASE.query.Provider));

});