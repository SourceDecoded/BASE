BASE.require([
    "BASE.async.Future",
    "BASE.query.Provider",
    "BASE.jira.JiraVisitor",
    "BASE.web.queryString",
    "BASE.query.Expression"
], function () {
    var Expression = BASE.query.Expression;
    var JiraVisitor = BASE.jira.JiraVisitor;
    var Future = BASE.async.Future;
    var queryString = BASE.web.queryString;
    
    BASE.namespace("BASE.jira");
    BASE.jira.JiraProvider = (function (Super) {
        var JiraProvider = function (config) {
            config = config || {};
            Super.call(this);
            
            var self = this;
            var url = config.url;
            var edm = config.edm;
            var model = config.model;
            var ajaxProvider = config.ajaxProvider;
            
            if (typeof url === "undefined" || url === null) {
                throw new Error("JiraProvider: Null argumentexception - url");
            }
            
            if (typeof ajaxProvider === "undefined" || ajaxProvider === null) {
                throw new Error("JiraProvider: Null argument exception - ajaxProvider");
            }
            
            if (typeof model === "undefined" || model === null) {
                throw new Error("JiraProvider: Null argument exception - model");
            }
            
            if (typeof edm === "undefined" || edm === null) {
                throw new Error("JiraProvider: Null argument exception - edm");
            }
            
            if (url.lastIndexOf("/") === url.length - 1) {
                url = url.substr(0, url.length - 1);
            }
            
            var buildUrl = function (expression) {
                var visitor = new JiraVisitor(config);
                var where = visitor.parse(expression.where) || "";
                var take = visitor.parse(expression.take) || "";
                var skip = visitor.parse(expression.skip) || "";
                var orderBy = visitor.parse(expression.orderBy) || "";
                var parameterQueryString = queryString.toString(expression.parameters, false);
                var parts = Array.prototype.slice.call(arguments, 1);
                
                parts.unshift(where + " " + orderBy, skip, take, parameterQueryString);
                
                var jql = parts.filter(function (part) {
                    return part !== "";
                }).join("&");
                
                return url + (jql ? "?" + jql : "");
            };
            
            var requestHandler = function (url) {
                return ajaxProvider.request(url, {
                    method: "GET"
                });
            };
            
            self.count = function (queryable) {
                var expression = queryable.getExpression();
                
                // Overriding take so no results are return, because we only want a count.
                expression.take = Expression.take(0);
                
                var url = buildUrl(expression, "maxResults=0");
                
                return requestHandler(url).chain(function (response) {
                    return response.total;
                }).catch(function (e) {
                    return Future.fromError(e);
                });
            };
            
            self.toArrayWithCount = function (queryable) {
                var expression = queryable.getExpression();
                var url = buildUrl(expression);
                
                return requestHandler(url).chain(function (response) {
                    
                    if (!Array.isArray(response.value)) {
                        return Future.fromError(new Error("XHR response does not contain expected value node."));
                    }
                    
                    return {
                        count: response.total,
                        array: response.value
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
                    
                    return response.value;
                });
            };
            
            self.toArray = self.execute;
            
        };
        
        BASE.extend(JiraProvider, Super);
        
        return JiraProvider;
    }(BASE.query.Provider));

});