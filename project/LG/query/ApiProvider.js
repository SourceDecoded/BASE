BASE.require([
    "BASE.async.Future",
    "BASE.async.Task",
    "BASE.web.ajax",
    "BASE.query.Provider",
    "BASE.query.ExpressionBuilder",
    "BASE.query.ODataVisitor",
    "BASE.query.Queryable",
    "BASE.data.utils",
    "BASE.data.PrimitiveHandler",
    "BASE.data.primitiveHandlers.ODataPrimitiveHandler",
    "BASE.web.queryString",
    "BASE.query.Expression"
], function () {
    BASE.namespace("LG.query");

    var ajax = BASE.web.ajax;
    var ExpressionBuilder = BASE.query.ExpressionBuilder;
    var Expression = BASE.query.Expression;
    var ODataVisitor = BASE.query.ODataVisitor;
    var Future = BASE.async.Future;
    var Task = BASE.async.Task;
    var isPrimitive = BASE.data.utils.isPrimitive;
    var convertToLocalDto = BASE.data.utils.convertDtoToJavascriptEntity;
    var queryString = BASE.web.queryString;

    var PrimitiveHandler = BASE.data.PrimitiveHandler;

    var ODataPrimitiveHandler = BASE.data.primitiveHandlers.ODataPrimitiveHandler

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

            var countSettings = {
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
                        atIndex = expression.skip.children[0].value;
                    }

                    if (expression.take) {
                        take = parser.parse(expression.take);
                        defaultTake = expression.take.children[0].value
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

            self.count = function (queryable) {
                return new Future(function (setValue, setError) {
                    var expression = queryable.getExpression();
                    // Overriding take so no results are return, because we only want a count.
                    expression.take = Expression.take(0);

                    var url = buildUrl(expression) + "&$inlinecount=allpages";

                    ajax.GET(url, countSettings).then(function (ajaxResponse) {
                        setValue(ajaxResponse.data.Count);
                    }).ifError(function (e) {
                        setError(e);
                    });
                });
            };

            //This should always return a Future of an array of objects.
            self.execute = function (queryable, parameters) {
                return new BASE.async.Future(function (setValue, setError) {

                    var url = buildUrl(queryable.getExpression());
                    var dtos = [];

                    ajax.GET(url, settings).then(function (ajaxResponse) {
                        dtos = ajaxResponse.data;
                        dtos = Array.isArray(dtos) ? dtos : [dtos.Data] ;

                        var convertedDtos = [];
                        dtos.forEach(function (dto) {

                            var fixedDto = primitiveHandler.resolve(model, dto);
                            convertedDtos.push(fixedDto);

                        });

                        setValue(convertedDtos);

                    }).ifError(function (error) {
                        setError(error);
                    });
                });
            };

            self.toArray = self.execute;

        };

        BASE.extend(ApiProvider, Super);

        return ApiProvider;
    }(BASE.query.Provider));

});