BASE.require([
    "Object",
    "BASE.query.Expression",
    "BASE.query.ExpressionBuilder"
], function () {
    BASE.namespace("BASE.query");

    var Expression = BASE.query.Expression;
    var ExpressionBuilder = BASE.query.ExpressionBuilder;

    BASE.query.Queryable = (function (Super) {
        var Queryable = function (Type, expression) {
            var self = this;
            var expression = expression || {};
            var parameters = expression.parameters || {};
            var assertHasProvider = function() {
                if (typeof self.provider === "undefined") {
                    throw new Error("No provider found.");
                }
            };

            BASE.assertNotGlobal(self);

            Super.call(self);

            self.Type = Type || Object;

            self.provider = null;

            self.whereExpression = expression.where || null;

            self.getExpression = function () {
                return {
                    where: self.whereExpression,
                    take: self.takeExpression,
                    skip: self.skipExpression,
                    orderBy: self.orderByExpression.length === 0 ? null : Expression.orderBy.apply(Expression, self.orderByExpression),
                    parameters: parameters
                };
            };

            self.or = function (fn) {
                if (fn instanceof Expression) {
                    rightExpression = Expression.and.apply(Expression, arguments);
                } else {
                    fn = fn || function () { };
                    rightExpression = fn.call(ExpressionBuilder, new ExpressionBuilder(Type));
                }

                var expression = copyExpressionObject(self.getExpression());

                if (expression.where) {
                    var expressions = expression.where.children;
                    expressions.push(rightExpression);

                    expression.where = Expression.where(Expression.or.apply(Expression, expressions));
                } else {
                    expression.where = Expression.where(rightExpression);
                }

                var copy = createCopy(expression);
                return copy;
            };

            self.where = function (fn) {
                if (fn instanceof Expression) {
                    rightExpression = Expression.and.apply(Expression, arguments);
                } else {
                    fn = fn || function () { };
                    rightExpression = fn.call(ExpressionBuilder, new ExpressionBuilder(Type));

                    if (typeof rightExpression === "undefined") {
                        throw new Error("Invalid expression: return the expression.");
                    }
                }

                var expression = copyExpressionObject(self.getExpression());

                if (expression.where) {
                    var expressions = expression.where.children;
                    expressions.push(rightExpression);

                    expression.where = Expression.where(Expression.and.apply(Expression, expressions));
                } else {
                    expression.where = Expression.where(rightExpression);
                }

                var copy = createCopy(expression);
                return copy;
            };

            self.and = self.where;

            self.takeExpression = expression.take || null;
            self.take = function (value) {
                var expression = copyExpressionObject(self.getExpression());
                expression.take = Expression.take(value);
                var copy = createCopy(expression);

                return copy;
            };

            self.skipExpression = expression.skip || null;
            self.skip = function (value) {
                var expression = copyExpressionObject(self.getExpression());
                expression.skip = Expression.skip(Expression.constant(value));

                var copy = createCopy(expression);

                return copy;
            };

            self.orderByExpression = expression.orderBy ? expression.orderBy.children : [];
            self.orderByDesc = function (fn) {
                var expression = copyExpressionObject(self.getExpression());

                var orderBy = { children: [] };
                self.orderByExpression.forEach(function (expression) {
                    orderBy.children.push(expression.copy());
                });

                var exp = fn.call(self, new ExpressionBuilder(Type));

                orderBy.children.push(Expression.descending(Expression.property(exp.getPropertyName())));

                expression.orderBy = orderBy;

                var copy = createCopy(expression);

                return copy;
            };

            self.orderBy = function (fn) {
                var expression = copyExpressionObject(self.getExpression());

                var orderBy = { children: [] };
                self.orderByExpression.forEach(function (expression) {
                    orderBy.children.push(expression.copy());
                });

                var exp = fn.call(self, new ExpressionBuilder(Type));

                orderBy.children.push(Expression.ascending(Expression.property(exp.getPropertyName())));

                expression.orderBy = orderBy;

                var copy = createCopy(expression);

                return copy;

            };

            self.setParameters = function (params) {
                if (!params) {
                    return;
                }

                Object.keys(params).forEach(function (key) {
                    parameters[key] = params[key];
                });
                return self;
            };

            self.withParameters = function (params) {
                parameters = {};
                Object.keys(params).forEach(function (key) {
                    parameters[key] = params[key];
                });
                return self;
            };

            self.toGuid = function (value) {
                return Expression.guid(Expression.constant(value));
            };

            self.toArray = function (callback) {
                assertHasProvider();

                var future = self.provider.execute(self);
                if (typeof callback === "function") {
                    future.then(callback);
                }

                return future;
            };

            self.toArrayAsync = function () {
                assertHasProvider();
                return self.provider.execute(self);
            };

            self.forEach = function (onEach) {
                self.toArray(function (results) {
                    results.forEach(onEach);
                });
            };

            self.count = function () {
                return self.provider.count(self);
            };

            self.toArrayWithCount = function () {
                return self.provider.toArrayWithCount(self);
            };

            self.all = function (func) {
                return self.provider.all(self, func);
            };

            self.any = function (func) {
                return self.provider.any(self, func);
            };

            self.firstOrDefault = function (func) {
                return self.provider.firstOrDefault(self, func);
            };

            self.lastOrDefault = function (func) {
                return self.provider.lastOrDefault(self, func);
            };

            self.first = function (func) {
                return self.provider.first(self, func);
            };

            self.last = function (func) {
                return self.provider.last(self, func);
            };

            self.select = function (func) {
                return self.provider.select(self, func);
            };

            self.contains = function (func) {
                return self.provider.contains(self, func);
            };

            self.include = function (func) {
                return self.provider.include(self, func);
            };

            self.ifNone = function (callback) {
                self.count().then(function (count) {
                    if (count === 0) {
                        callback();
                    }
                });

                return self;
            };

            self.ifAny = function (callback) {
                self.toArray(function (a) {
                    if (a.length > 0) {
                        callback(a);
                    }
                });

                return self;
            };

            self.intersects = function (compareToQueryable) {
                if (compareToQueryable instanceof Array) {
                    compareToQueryable = compareToQueryable.asQueryable();
                }
                return self.provider.intersects(self, compareToQueryable);
            };

            self.ofType = function (Type) {
                var queryable = new Queryable(Type);
                queryable.provider = self.provider;
                return queryable;
            };

            var createCopy = function (expression) {
                var queryable = new Queryable(Type, expression);
                queryable.provider = self.provider;
                return queryable;
            };

            var copyExpressionObject = function (expressionObject) {
                var expression = {};
                Object.keys(expressionObject).forEach(function (key) {
                    var value = expressionObject[key];

                    if (key === "parameters") {
                        expression[key] = BASE.clone(value);
                    } else {
                        if (value) {
                            expression[key] = value.copy();
                        } else {
                            expression[key] = null;
                        }
                    }
                });

                return expression;
            };

            self.copy = function () {
                var queryable = createCopy(copyExpressionObject(self.getExpression()));
                return queryable.withParameters(parameters);
            };

            self.merge = function (queryable) {
                var clone = self.copy();

                var rightExpression = queryable.getExpression();

                if (rightExpression) {

                    var expression = clone.getExpression();

                    // Override the current value with the queryable or default back to the original value.
                    clone.skipExpression = rightExpression.skip || expression.skip;
                    clone.takeExpression = rightExpression.take || expression.take
                    clone.orderByExpression = [];

                    if (rightExpression.orderBy) {
                        clone.orderByExpression = rightExpression.orderBy.children;
                    }

                    if (clone.whereExpression) {
                        if (rightExpression.where !== null) {
                            var expressions = expression.where.children;
                            expressions.push.apply(expressions, rightExpression.where.children);
                            clone.whereExpression = Expression.where(Expression.and.apply(Expression, expressions));
                        }
                    } else {
                        if (rightExpression.where !== null) {
                            clone.whereExpression = rightExpression.where;
                        }
                    }
                }

                return clone;
            };


            return self;
        };

        BASE.extend(Queryable, Super);

        return Queryable;
    }(Object));
});