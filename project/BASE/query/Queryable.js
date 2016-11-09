BASE.require([
    "Object",
    "BASE.query.Expression",
    "BASE.query.ExpressionBuilder"
], function () {
    BASE.namespace("BASE.query");

    var Expression = BASE.query.Expression;
    var ValueExpression = BASE.query.ValueExpression;
    var OperationExpression = BASE.query.OperationExpression;
    var ExpressionBuilder = BASE.query.ExpressionBuilder;

    var assertHasProvider = function (queryable) {
        if (typeof queryable.provider === "undefined") {
            throw new Error("No provider found.");
        }
    };

    var copyQuery = function (query) {
        var copy = {};

        copy.where = query.where.copy();
        copy.orderBy = query.orderBy.copy();
        copy.include = query.include.copy();
        copy.parameters = BASE.clone(query.parameters);
        copy.take = query.take;
        copy.skip = query.skip;

        return copy;
    };

    var Queryable = function (Type, query) {
        query = query || {};
        this.Type = Type || Object;
        this.provider = null;
        this.query = {};
        this.query.parameters = (query && query.parameters) || {};

        if (query.where != null && query.where.nodeName === "where") {
            this.query.where = query.where;
        } else {
            this.query.where = Expression.where();
        }

        if (query.skip != null && query.skip.nodeName === "skip") {
            this.query.skip = query.skip;
        } else {
            this.query.skip = Expression.skip(0);
        }

        if (query.take != null && query.take.nodeName === "take") {
            this.query.take = query.take;
        } else {
            this.query.take = Expression.take(Infinity);
        }

        if (query.include != null && query.include.nodeName === "include") {
            this.query.include = query.include;
        } else {
            this.query.include = Expression.include();
        }

        if (query.orderBy != null && query.orderBy.nodeName === "orderBy") {
            this.query.orderBy = query.orderBy;
        } else {
            this.query.orderBy = Expression.orderBy();
        }
    };

    Queryable.prototype.getExpression = function () {
        return this.query;
    };

    Queryable.prototype.getQuery = function () {
        return this.query;
    };

    Queryable.prototype.or = function (lambda) {
        var rightExpression;
        var query = copyQuery(this.getQuery());

        if (typeof lambda === "function") {
            lambda = lambda || function () { };
            rightExpression = lambda.call(ExpressionBuilder, new ExpressionBuilder(this.Type));
        } else if (lambda instanceof Expression) {
            rightExpression = lambda;
        } else {
            return;
        }

        if (query.where.children.length === 0) {
            query.where.children.push(rightExpression);
        } else {
            var leftExpression = query.where.children.pop();
            query.where.children.push(Expression.or(leftExpression, rightExpression));
        }

        return this.copy(query);
    };

    Queryable.prototype.where = function (lambda) {
        var rightExpression;
        var query = copyQuery(this.getQuery());

        if (typeof lambda === "function") {
            lambda = lambda || function () { };
            rightExpression = lambda.call(ExpressionBuilder, new ExpressionBuilder(this.Type));
        } else if (lambda instanceof Expression) {
            rightExpression = lambda;
        } else {
            return;
        }

        if (query.where.children.length === 0) {
            query.where.children.push(rightExpression);
        } else {
            var leftExpression = query.where.children.pop();
            query.where.children.push(Expression.and(leftExpression, rightExpression));
        }

        return this.copy(query);
    };

    Queryable.prototype.and = Queryable.prototype.where;

    Queryable.prototype.take = function (value) {
        if (typeof value !== "number") {
            throw new Error("Illegal Argument Exception: value needs to be a number.");
        }

        var query = copyQuery(this.getQuery());
        query.take = Expression.take(value);

        return this.copy(query);
    };

    Queryable.prototype.skip = function (value) {
        if (typeof value !== "number") {
            throw new Error("Illegal Argument Exception: value needs to be a number.");
        }

        var query = copyQuery(this.getQuery());
        query.skip = Expression.skip(value);

        return this.copy(query);
    };

    Queryable.prototype.orderByDesc = function (lambda) {
        var query = copyQuery(this.getQuery());
        var propertyExpression = lambda.call(
            ExpressionBuilder, new ExpressionBuilder(this.Type)
        ).getExpression();

        var descendingExpression = Expression.descending(propertyExpression);

        if (!query.orderBy.contains(propertyExpression)) {
            query.orderBy.children.push(descendingExpression);
            return this.copy(query);
        } else {
            return this;
        }
    };

    Queryable.prototype.orderBy = function (lambda) {
        var query = copyQuery(this.getQuery());
        var propertyExpression = lambda.call(
            ExpressionBuilder, new ExpressionBuilder(this.Type)
        ).getExpression();

        var ascendingExpression = Expression.ascending(propertyExpression);

        if (!query.orderBy.contains(propertyExpression)) {
            query.orderBy.children.push(ascendingExpression);
            return this.copy(query);
        } else {
            return this;
        }
    };

    Queryable.prototype.setParameters = function (params) {
        if (!params) {
            return;
        }
        var parameters = this.query.parameters;

        Object.keys(params).forEach(function (key) {
            parameters[key] = params[key];
        });
        return this;
    };

    Queryable.prototype.withParameters = function (params) {
        if (!params) {
            return;
        }

        var parameters = this.query.parameters = {};
        Object.keys(params).forEach(function (key) {
            parameters[key] = params[key];
        });
        return this;
    };

    Queryable.prototype.include = function (lambda) {
        var query = copyQuery(this.getQuery());

        var operationExpressionBuilder = lambda.call(ExpressionBuilder, new ExpressionBuilder(this.Type));

        if (typeof operationExpressionBuilder.getExpression !== "function") {
            throw new Error("Expected a property to include.");
        }

        var queryableExpression = operationExpressionBuilder.getExpression();

        if (queryableExpression.nodeName !== "queryable") {
            queryableExpression = Expression.queryable(queryableExpression, Expression.expression(Expression.where()));
        }

        query.include.children.push(queryableExpression);
        return this.copy(query);

    };

    Queryable.prototype.merge = function (queryable) {
        var clone = this.copy();
        var cloneQuery = clone.getQuery();
        var query = queryable.getQuery();
        var rightExpression = query.where.children[0];

        if (rightExpression != null) {
            // No need to copy if there is nothing to copy.
            if (cloneQuery.where.children.length === 0) {
                cloneQuery.where.children.push(rightExpression.copy());
            } else if (cloneQuery.where.children.length === 1 && cloneQuery.where.children[0].nodeName === "and") {
                cloneQuery.where.children[0].children.push(rightExpression.copy());
            } else {
                var leftExpression = cloneQuery.where.children.pop();
                cloneQuery.where.children.push(Expression.and(leftExpression, rightExpression.copy()));
            }
        }

        query.include.children.forEach(function (expression) {
            cloneQuery.include.children.push(expression.copy());
        });

        query.orderBy.children.forEach(function (expression) {
            if (!cloneQuery.orderBy.contains(expression)) {
                cloneQuery.orderBy.children.push(expression.copy());
            }
        });

        return this.copy(cloneQuery);
    };

    Queryable.prototype.toArray = function (callback) {
        assertHasProvider(this);

        var future = this.provider.execute(this);
        if (typeof callback === "function") {
            future.then(callback);
        }

        return future;
    };

    Queryable.prototype.toArrayAsync = function () {
        assertHasProvider(this);
        return this.provider.execute(this);
    };

    Queryable.prototype.toGuid = function (value) {
        return Expression.guid(Expression.constant(value));
    };

    Queryable.prototype.forEach = function (onEach) {
        this.toArray().then(function (results) {
            results.forEach(onEach);
        });
    };

    Queryable.prototype.count = function () {
        assertHasProvider(this);
        return this.provider.count(this);
    };

    Queryable.prototype.toArrayWithCount = function () {
        assertHasProvider(this);
        return this.provider.toArrayWithCount(this);
    };

    Queryable.prototype.all = function (lambda) {
        assertHasProvider(this);
        return this.provider.all(this, lambda);
    };

    Queryable.prototype.any = function (lambda) {
        assertHasProvider(this);
        return this.provider.any(this, lambda);
    };

    Queryable.prototype.firstOrDefault = function (lambda) {
        assertHasProvider(this);
        return this.provider.firstOrDefault(this, lambda);
    };

    Queryable.prototype.lastOrDefault = function (lambda) {
        console.log("Deprecated. Use orderBy and firstOrDefault");
        assertHasProvider(this);
        return this.provider.lastOrDefault(this, lambda);
    };

    Queryable.prototype.first = function (lambda) {
        assertHasProvider(this);
        return this.provider.first(this, lambda);
    };

    Queryable.prototype.last = function (lambda) {
        assertHasProvider(this);
        return this.provider.last(this, lambda);
    };

    Queryable.prototype.select = function (lambda) {
        assertHasProvider(this);
        return this.provider.select(this, lambda);
    };

    Queryable.prototype.contains = function (lambda) {
        assertHasProvider(this);
        return this.provider.contains(this, lambda);
    };

    Queryable.prototype.ifNone = function (callback) {
        this.count().then(function (count) {
            if (count === 0) {
                callback();
            }
        });

        return this;
    };

    Queryable.prototype.ifAny = function (callback) {
        this.toArray(function (a) {
            if (a.length > 0) {
                callback(a);
            }
        });

        return this;
    };

    Queryable.prototype.intersects = function (compareToQueryable) {
        assertHasProvider(this);
        if (compareToQueryable instanceof Array) {
            compareToQueryable = compareToQueryable.asQueryable();
        }
        return this.provider.intersects(this, compareToQueryable);
    };

    Queryable.prototype.ofType = function (Type) {
        var queryable = new Queryable(Type);
        queryable.provider = this.provider;
        return queryable;
    };

    Queryable.prototype.copy = function (query) {
        var queryable = new Queryable(this.Type, query || copyQuery(this.query));
        queryable.provider = this.provider;
        return queryable;
    };

    BASE.query.Queryable = Queryable;

});