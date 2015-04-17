BASE.require([
    "BASE.async.Future",
    "BASE.query.ArrayVisitor",
    "BASE.query.ExpressionBuilder",
    "BASE.query.Expression"
], function () {
    BASE.namespace("BASE.query");

    var Future = BASE.async.Future;
    var Task = BASE.async.Task;
    var ExpressionBuilder = BASE.query.ExpressionBuilder;
    var ArrayVisitor = BASE.query.ArrayVisitor;
    var Expression = BASE.query.Expression;

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
                return self.toArray(queryable).chain(function (array) {
                    return array.length;
                });
            };

            self.any = function (queryable, func) {
                queryable = queryable.take(1);
                return executeFilter(queryable, func).chain(function (results) {
                    if (results.length > 0) {
                        return true;
                    } else {
                        return false;
                    }
                });
            };

            self.all = function (queryable, func) {
                return executeFilter(queryable, func).chain(function (results) {
                    return results.length === array.length;
                });
            };

            self.firstOrDefault = function (queryable, func) {
                queryable = queryable.take(1);
                return executeFilter(queryable, func).chain(function (results) {
                    return results[0] || null;
                });
            };

            self.first = function (queryable, func) {
                queryable = queryable.take(1);
                return executeFilter(queryable, func).chain(function (results) {
                    var result = results[0];

                    if (result) {
                        return result;
                    } else {
                        return Future.fromError(new Error("Couldn't find a match."));
                    }
                });
            };

            self.contains = function (queryable, func) {
                return executeFilter(queryable, func).chain(function (results) {
                    return results > 0;
                });
            };

            self.select = function (queryable, forEachFunc) {
                return self.toArray(queryable).chain(function (array) {
                    var objects = [];

                    array.forEach(function (item) {
                        objects.push(forEachFunc(item));
                    });

                    return objects;
                });
            };

            self.include = function (queryable, func) {
                queryable.toArray().chain(function (results) {
                    // This is probably not a great idea to be here, but we need it now.
                    var builder = new ExpressionBuilder(queryable.Type);
                    var propertyExpression = func.call(queryable, builder);
                });
            };

            self.intersects = function (queryable, compareToQueryable) {
                return new Future(function (setValue, setError) {
                    var task = new BASE.async.Task();
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
                return self.toArray(queryable).chain(function (array) {
                    return {
                        count: array.length,
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