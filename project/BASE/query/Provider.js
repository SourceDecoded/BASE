BASE.require([
    "BASE.async.Future",
    "BASE.async.Task",
    "BASE.query.ArrayVisitor",
    "BASE.query.ExpressionBuilder",
    "BASE.query.Expression",
    "BASE.query.Queryable"
], function () {
    BASE.namespace("BASE.query");
    
    var Future = BASE.async.Future;
    var Task = BASE.async.Task;
    var ExpressionBuilder = BASE.query.ExpressionBuilder;
    var ArrayVisitor = BASE.query.ArrayVisitor;
    var Expression = BASE.query.Expression;
    var Queryable = BASE.query.Queryable;
    
    BASE.query.Provider = (function (Super) {
        var Provider = function () {
            var self = this;
            
            Super.call(self);
            
            var executeFilter = function (queryable, func) {
                return self.toArray(queryable).chain(function (array) {
                    var visitor = new ArrayVisitor(array);
                    var results;
                    
                    if (typeof func === "function") {
                        var whereExpression = Expression.where(func.call(self, new ExpressionBuilder(self.Type)));
                        var filter = visitor.parse(whereExpression);
                        results = array.filter(filter);
                    } else {
                        results = array;
                    }
                    
                    return results;
                });
            };
            
            self.count = function (queryable) {
                var oldExpression = queryable.getExpression();
                var expression = {};
                
                expression.where = oldExpression.where;
                
                var newQueryable = new Queryable(queryable.Type, expression);
                
                return self.toArray(newQueryable).chain(function (array) {
                    return array.length;
                });
            };
            
            self.any = function (queryable, func) {
                if (typeof func === "function") {
                    queryable = queryable.where(func);
                }
                
                return queryable.take(1).toArray().chain(function (results) {
                    if (results.length > 0) {
                        return true;
                    } else {
                        return false;
                    }
                });

            };
            
            self.all = function (queryable, func) {
                if (typeof func === "undefined") {
                    return Future.fromResult(true);
                }
                
                if (typeof func !== "function") {
                    throw new Error("The reduce expression needs to be a function.");
                }
                
                return queryable.count().chain(function (length) {
                    return queryable.where(func).toArray().chain(function (results) {
                        return results.length = length;
                    });
                });
            };
            
            self.firstOrDefault = function (queryable, func) {
                if (typeof func === "function") {
                    queryable = queryable.where(func);
                }
                
                return queryable.take(1).toArray().chain(function (results) {
                    return results[0] || null;
                });
            };
            
            self.first = function (queryable, func) {
                if (typeof func === "function") {
                    queryable = queryable.where(func);
                }
                
                return queryable.take(1).toArray().chain(function (results) {
                    var result = results[0];
                    
                    if (typeof result === "undefined") {
                        return result;
                    } else {
                        return Future.fromError(new Error("There wasn't a match."));
                    }

                });
            };
            
            self.contains = function (queryable, func) {
                if (typeof func === "function") {
                    queryable = queryable.where(func);
                }
                
                return queryable.take(1).toArray().chain(function (results) {
                    return results > 0;
                });
            };
            
            self.select = function (queryable, forEachFunc) {
                return self.toArray(queryable).chain(function (array) {
                    return array.map(forEachFunc);
                });
            };
            
            self.intersects = function (queryable, compareToQueryable) {
                return new Future(function (setValue, setError) {
                    var task = new Task();
                    task.add(self.toArray(queryable));
                    task.add(compareToQueryable.toArray());
                    task.start().whenAll(function (futures) {
                        var hasError = futures.some(function (future) {
                            return future.error !== null;
                        });
                        
                        if (hasError) {
                            setError("An error occured while retrieving one or both arrays.");
                            return;
                        }
                        
                        var intersects = [];
                        var array1 = futures[0].value;
                        var array2 = futures[1].value;
                        
                        array1.forEach(function (item) {
                            if (array2.indexOf(item) > -1) {
                                intersects.push(item);
                            }
                        });
                        
                        setValue(intersects);
                    });
                });
            };
            
            self.toArrayWithCount = function (queryable) {
                var count;
                
                return self.count(queryable).chain(function (c) {
                    count = c;
                }).chain(function () {
                    return self.toArray(queryable);
                }).chain(function (array) {
                    return {
                        count: count,
                        array: array
                    };
                });
            };
            
            self.toArray = function (queryable) {
                throw new Error("Provider hasn't implemented toArray and execute.");
            };
            
            //This should always return a Future of an array of objects.
            self.execute = self.toArray;
        };
        
        BASE.extend(Provider, Super);
        
        return Provider;
    }(Object));

});