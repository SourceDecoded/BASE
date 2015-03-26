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
    "BASE.data.primitiveHandlers.ODataPrimitiveHandler"
], function () {
    BASE.namespace("LG.query");

    var ajax = BASE.web.ajax;
    var ExpressionBuilder = BASE.query.ExpressionBuilder;
    var ODataVisitor = BASE.query.ODataVisitor;
    var Future = BASE.async.Future;
    var Task = BASE.async.Task;
    var isPrimitive = BASE.data.utils.isPrimitive;
    var convertToLocalDto = BASE.data.utils.convertDtoToJavascriptEntity;

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

            var primaryKeys = Object.keys(model).reduce(function (primaryKeys, property) {
                if (model[property].primaryKey) {
                    primaryKeys.push(property);
                }
            }, []);

            var findNodes = function (expression, type, foundNodes) {
                foundNodes = foundNodes || [];

                if (Array.isArray(expression.children)) {

                    expression.children.forEach(function (childExpression) {
                        findNodes(childExpression, type, foundNodes);
                    });

                }

                if (expression.nodeType === type) {
                    foundNodes.push(expression);
                }

            };

            // We use this so we can build a uri instead of a query.
            var getEntityQuery = function (expression) {
                var isEqualToNodes = findNodes(expression, "equalTo");

                if (isEqualToNodes.length === 1) {
                    var expression = isEqualToNodes[0];
                    var isPrimaryKey = primaryKeys.some(function (primaryKey) {
                        return expression.children[0].value === primaryKey;
                    });

                    if (isPrimaryKey) {
                        return expression.children[1].value;
                    }
                } else {
                    return null;
                }
            };

            self.count = function (queryable) {
                var expression = queryable.getExpression();
                return new Future(function (setValue, setError) {
                    var parser = new ODataVisitor({ model: model });
                    var dtos = [];

                    var where = "";
                    var take = "";
                    var skip = "";
                    var orderBy = "";
                    var defaultTake = 100;
                    var atIndex = 0;

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

                    var odataString = where + take + orderBy;
                    var url = baseUrl + "?" + odataString + "&$inlinecount=allpages";

                    var settings = {
                        headers: {
                            "X-LGAppId": appId,
                            "X-LGToken": token
                        }
                    };

                    ajax.GET(url + skip, settings).then(function (ajaxResponse) {
                        setValue(ajaxResponse.data.Count);
                    }).ifError(function (e) {
                        setError(e);
                    });
                });
            };

            //This should always return a Future of an array of objects.
            self.execute = function (queryable) {
                var expression = queryable.getExpression();

                return new BASE.async.Future(function (setValue, setError) {
                    var url = "";
                    var where = "";
                    var take = "";
                    var skip = "";
                    var orderBy = "";
                    var defaultTake = 1000000;
                    var atIndex = 0;

                    // This is kinda silly but we need to convert a query that is looking for an entity into a uri, 
                    // instead of a queryable.
                    var id = getEntityQuery(expression);
                    if (id === null) {
                        var parser = new ODataVisitor({ model: model });
                        var dtos = [];



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

                        var odataString = where + take + orderBy;
                        url = baseUrl + "?" + odataString;// + "&$inlinecount=allpages";
                    } else {
                        url = baseUrl + "/"+id;
                    }



                    ajax.GET(url + skip, settings).then(function (ajaxResponse) {
                        dtos = ajaxResponse.data;

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