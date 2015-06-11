BASE.require([
    "BASE.query.Provider",
    "BASE.web.ajax",
    "LG.core.dataModel.sales.Client",
    "BASE.data.utils",
    "BASE.web.isCORSEnabled"
], function () {
    var Provider = BASE.query.Provider;
    var ajax = BASE.web.ajax;
    var Future = BASE.async.Future;
    var Client = LG.core.dataModel.sales.Client;
    var convert = BASE.data.utils.convertDtoToJavascriptEntity;

    BASE.namespace("LG.core.dataModel.sales");

    LG.core.dataModel.sales.ClientQueryProvider = function () {
        var self = this;
        Provider.apply(self, []);

        var walkExpressionTree = function (expression, action) {
            if (Array.isArray(expression.children)) {
                expression.children.forEach(function (childExpression) {
                    walkExpressionTree(childExpression, action);
                });
            }
            action(expression);
        };

        var findProperty = function (expression, property) {
            var propertyName = null;
            var propertyValue = null;

            walkExpressionTree(expression, function (expression) {
                if (propertyName && propertyValue === null) {
                    propertyValue = expression.value;
                }

                if (!propertyName && expression.nodeName === "property" && expression.value === property) {
                    propertyName = property;
                }
            });

            return propertyValue;
        };

        var getTag = function (expression) {
            if (expression) {
                return findProperty(expression, "tag");
            } else {
                return null;
            }
        };

        var getStatus = function (expression) {
            if (expression) {
                return findProperty(expression, "status");
            } else {
                return null;
            }
        };

        var getExpiring = function (expression) {
            if (expression) {
                return findProperty(expression, "expiring");
            } else {
                return null;
            }
        };

        var getArchived = function (expression) {
            if (expression) {
                return findProperty(expression, "archived");
            } else {
                return null;
            }
        };

        var getLongitude = function (expression) {
            if (expression) {
                return findProperty(expression, "myLongitude");
            } else {
                return null;
            }
        }

        var getLatitude = function (expression) {
            if (expression) {
                return findProperty(expression, "myLatitude");
            } else {
                return null;
            }
        }

        var getDistance = function (expression) {
            if (expression) {
                return findProperty(expression, "distance");
            } else {
                return null;
            }
        }

        var getOrderBy = function (expression) {
            var odataOrderByString = null;

            if (expression !== null && expression.children.length > 0) {
                odataOrderByString = expression.children.map(function (childExpression) {
                    var sortByType = childExpression.nodeName === "ascending" ? "asc" : "desc";
                    return childExpression.children[0].value + " " + sortByType;
                }).join(", ");

                odataOrderByString = "&$orderby=" + odataOrderByString;
            }

            return odataOrderByString;
        };

        var createUrl = function (expression) {

            //isArchived=false&opportunityStatusType&withTag&policyDaysToExpiration
            var where = expression.where;
            var take = expression.take ? expression.take.children[0].value : null;
            var skip = expression.skip ? expression.skip.children[0].value : null;
            var orderby = getOrderBy(expression.orderBy) || "";

            var search = {
                withTag: getTag(where),
                opportunityStatusType: getStatus(where),
                policyDaysToExpiration: getExpiring(where),
                isArchived: getArchived(where) || false,
                myLongitude: getLongitude(where),
                myLatitude: getLatitude(where),
                distance: getDistance(where),
                $skip: skip || null
            };

            if (typeof take === "number") {
                search.$top = take;
            }

            var queryString = Object.keys(search)
                .filter(function (element, index, array) {
                    return typeof search[element] !== "undefined" && search[element] !== null;
                })
                .map(function (key) {
                    return key + "=" + search[key];
                })
                .join("&");

            var root = "/webapi"
            if (BASE.web.isCORSEnabled()) {
                root = "https://api.leavitt.com";
            }
            var url = root + "/Sales/ExtendedClients?" + queryString + orderby;

            return url;
        };

        self.count = function (queryable) {
            return new Future(function (setValue, setError) {
                var expression = queryable.getExpression();
                var url = createUrl(expression);

                url += "&$inlinecount=allpages&$top=0"

                ajax.GET(url, {
                    headers: {
                        "X-LGToken": localStorage.token,
                        "X-LGAppId": 56
                    }
                }).then(function (response) {
                    var count = response.data.Count;
                    setValue(count);
                });
            });
        };

        self.execute = self.toArray = function (queryable) {
            return new Future(function (setValue, setError) {
                var expression = queryable.getExpression();
                var url = createUrl(expression);

                ajax.GET(url, {
                    headers: {
                        "X-LGToken": localStorage.token,
                        "X-LGAppId": 56,
                        "X-DisableDiscoverability": "true"
                    }
                }).then(function (response) {
                    var data = response.data;
                    if (Array.isArray(data)) {

                        setValue(data.map(function (dto) {
                            var result = convert(Client, dto);
                            result["createdDate"] = result["createdDate"] !== null ? new Date(result["createdDate"]) : null;
                            result["expirationDate"] = result["expirationDate"] !== null ? new Date(result["expirationDate"]) : null;
                            result["lastModifiedDate"] = result["lastModifiedDate"] !== null ? new Date(result["lastModifiedDate"]) : null;
                            result["startDate"] = result["startDate"] !== null ? new Date(result["startDate"]) : null;
                            return result;
                        }));
                    } else {
                        setValue([]);
                    }
                });
            });
        };
    };
});