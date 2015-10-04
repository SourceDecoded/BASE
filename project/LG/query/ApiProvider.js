BASE.require([
    "BASE.async.Future",
    "BASE.web.ajax",
    "BASE.query.Provider",
    "BASE.query.ExpressionBuilder",
    "BASE.query.ODataVisitor",
    "BASE.query.Queryable",
    "BASE.data.PrimitiveHandler",
    "BASE.data.primitiveHandlers.ODataPrimitiveHandler",
    "LG.data.dataStores.createErrorFromXhr",
    "BASE.web.queryString",
    "BASE.query.Expression"
], function () {
    BASE.namespace("LG.query");
    
    var ajax = BASE.web.ajax;
    var Expression = BASE.query.Expression;
    var ODataVisitor = BASE.query.ODataVisitor;
    var Future = BASE.async.Future;
    var queryString = BASE.web.queryString;
    var createErrorFromXhr = LG.data.dataStores.createErrorFromXhr;

    var ODataPrimitiveHandler = BASE.data.primitiveHandlers.ODataPrimitiveHandler;
    
    LG.query.ApiProvider = (function (Super) {
        var ApiProvider = function (config) {
            var self = this;
            BASE.assertNotGlobal(self);
            
            Super.call(self);
            
            config = config || {};
            var baseUrl = config.baseUrl;
            var appId = config.appId;
            var token = config.token;
            var model = config.model || { properties: {} };
            var properties = model.properties;
            var primitiveHandler = new ODataPrimitiveHandler();
            
            if (baseUrl.lastIndexOf("/") === baseUrl.length - 1) {
                baseUrl = baseUrl.substr(0, baseUrl.length - 1);
            }
            
            if (typeof baseUrl === "undefined" ||
             typeof appId === "undefined" ||
             typeof token === "undefined") {
                throw new Error("Null argument error.");
            }
            
            var settings = {
                headers: {
                    "X-LGAppId": appId,
                    "X-LGToken": token,
                    "X-DisableDiscoverability": "true"
                }
            };
            
            var discoverablititySettings = {
                headers: {
                    "X-LGAppId": appId,
                    "X-LGToken": token
                }
            };
            
            var primaryKeys = Object.keys(properties).reduce(function (primaryKeys, property) {
                if (properties[property].primaryKey) {
                    primaryKeys.push(property);
                }
                return primaryKeys;
            }, []);
            
            var primaryKey = primaryKeys[0];
            var hasPrimaryKeyExpression = Expression.equalTo(Expression.property(primaryKey));
            
            var buildUrl = function (expression) {
                var url = "";
                var where = "";
                var take = "";
                var skip = "";
                var orderBy = "";
                var defaultTake = 1000000;
                var atIndex = 0;
                
                // This is kinda silly but we need to convert a query that is looking for an entity into a uri, 
                // instead of a queryable.
                
                var matches = [];
                
                if (expression.where !== null) {
                    matches = expression.where.getMatchingNodes(hasPrimaryKeyExpression);
                }
                
                if (matches.length === 1) {
                    var id = matches[0].children[1].value;
                    url = baseUrl + "/" + id;
                } else {
                    var parser = new ODataVisitor({ model: model });
                    
                    if (expression.where) {
                        where = parser.parse(expression.where);
                    }
                    
                    if (expression.skip) {
                        skip = parser.parse(expression.skip);
                    }
                    
                    if (expression.take) {
                        take = parser.parse(expression.take);
                    }
                    
                    if (expression.orderBy) {
                        orderBy = parser.parse(expression.orderBy);
                    }
                    
                    var odataString = where + skip + take + orderBy;
                    var parameterQueryString = queryString.toString(expression.parameters, false);
                    parameterQueryString = parameterQueryString ? "&" + parameterQueryString : "";
                    url = baseUrl + "?" + odataString + parameterQueryString;
                }
                
                return url;
            };
            
            var toJavascriptDtos = function (dtos) {
                dtos = Array.isArray(dtos) ? dtos : (Array.isArray(dtos.Data) ? dtos.Data : [dtos.Data]);
                var convertedDtos = [];
                dtos.forEach(function (dto) {
                    
                    var fixedDto = primitiveHandler.resolve(model, dto);
                    convertedDtos.push(fixedDto);
                });
                return convertedDtos;
            };
            
            var convertDtos = function (ajaxResponse) {
                var dtos = ajaxResponse.data;
                return toJavascriptDtos(dtos);
            };
            
            var convertDiscoverabilityDtos = function (ajaxResponse) {
                var dtos = ajaxResponse.data.Data;
                return toJavascriptDtos(dtos);
            };
            
            self.count = function (queryable) {
                return new Future(function (setValue, setError) {
                    var expression = queryable.getExpression();
                    // Overriding take so no results are return, because we only want a count.
                    expression.take = Expression.take(0);
                    
                    var url = buildUrl(expression) + "&$inlinecount=allpages";
                    
                    ajax.GET(url, discoverablititySettings).then(function (ajaxResponse) {
                        setValue(ajaxResponse.data.Count);
                    }).ifError(function (e) {
                        setError(e);
                    });
                });
            };
            
            self.toArrayWithCount = function (queryable) {
                return new Future(function (setValue, setError) {
                    var expression = queryable.getExpression();
                    
                    var url = buildUrl(expression) + "&$inlinecount=allpages";
                    
                    ajax.GET(url, discoverablititySettings).then(function (ajaxResponse) {
                        setValue({
                            count: ajaxResponse.data.Count,
                            array: convertDtos(ajaxResponse)
                        });
                    }).ifError(function (e) {
                        setError(e);
                    });
                });
            };
            
            //This should always return a Future of an array of objects.
            self.execute = function (queryable) {
                var expression = queryable.getExpression();
                var parameters = expression.parameters || {};
                var getSettings = settings;
                var convert = convertDtos;
                
                if (parameters.discoverability) {
                    getSettings = discoverablititySettings;
                    convert = convertDiscoverabilityDtos;
                }
                
                var url = buildUrl(expression);
                var request = ajax.GET(url, getSettings);
                
                var future = new BASE.async.Future(function (setValue, setError) {
                    request.then(function (ajaxResponse) {
                        setValue(convert(ajaxResponse));
                    }).ifError(function (error) {
                        setError(createErrorFromXhr(error));
                    });
                });
                
                future.ifCanceled(function () {
                    request.cancel();
                });
                
                return future;
            };
            
            self.getAppId = function () {
                return appId;
            };
            
            self.getToken = function () {
                return token;
            };
            
            self.toArray = self.execute;

        };
        
        BASE.extend(ApiProvider, Super);
        
        return ApiProvider;
    }(BASE.query.Provider));

});