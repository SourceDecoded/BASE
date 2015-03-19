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
                    var parser = new ODataVisitor({ model: model });
                    var dtos = [];

                    var where = "";
                    var take = "";
                    var skip = "";
                    var orderBy = "";
                    var defaultTake = 1000000;
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
                    var url = baseUrl + "?" + odataString;// + "&$inlinecount=allpages";

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