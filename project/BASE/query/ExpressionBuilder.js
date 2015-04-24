BASE.require(["BASE.query.Expression"], function () {
    var Expression = BASE.query.Expression;

    BASE.namespace("BASE.query");

    var OperationExpressionBuilder = function (Type, propertyName, getLeftExpression) {
        var self = this;

        getLeftExpression = getLeftExpression || function (expression) {
            return expression;
        };

        self.any = function (fn) {
            var expressionBuilder = new ExpressionBuilder();
            var expression = fn(expressionBuilder);
            return Expression.any(Expression.propertyAccess(getLeftExpression(), propertyName), expression);
        };

        self.all = function (fn) {
            var expressionBuilder = new ExpressionBuilder();
            var expression = fn(expressionBuilder);
            return Expression.all(Expression.propertyAccess(getLeftExpression(), propertyName), expression);
        };

        self.isEqualTo = function (value) {
            var constant = Expression.getExpressionType(value);
            return Expression.equalTo(Expression.propertyAccess(getLeftExpression(), propertyName), constant);
        };

        self.isNotEqualTo = function (value) {
            var constant = Expression.getExpressionType(value);
            return Expression.notEqualTo(Expression.propertyAccess(getLeftExpression(), propertyName), constant);
        };

        self.contains = function (value) {
            return Expression.substringOf(Expression.propertyAccess(getLeftExpression(), propertyName), Expression.array(array));
        }

        self.isIn = function (array) {
            if (Array.isArray(array)) {
                return Expression.isIn(Expression.propertyAccess(getLeftExpression(), propertyName), Expression.array(array));
            } else {
                throw new Error('isIn is expecting to be passed an array!');
            }

        };

        self.isSubstringOf = function (value) {
            console.warn("isSubstringOf is deprecated, please us contains.");
            return Expression.substringOf(Expression.propertyAccess(getLeftExpression(), propertyName), Expression.string(value));
        };

        self.isGreaterThan = function (value) {
            var constant = Expression.getExpressionType(value);
            return Expression.greaterThan(Expression.propertyAccess(getLeftExpression(), propertyName), constant);
        };

        self.isGreaterThanOrEqualTo = function (value) {
            var constant = Expression.getExpressionType(value);
            return Expression.greaterThanOrEqualTo(Expression.propertyAccess(getLeftExpression(), propertyName), constant);
        };

        self.isLessThanOrEqualTo = function (value) {
            var constant = Expression.getExpressionType(value);
            return Expression.lessThanOrEqualTo(Expression.propertyAccess(getLeftExpression(), propertyName), constant);
        };

        self.isLessThan = function (value) {
            var constant = Expression.getExpressionType(value);
            return Expression.lessThan(Expression.propertyAccess(getLeftExpression(), propertyName), constant);
        };

        self.endsWith = function (value) {
            return Expression.endsWith(Expression.propertyAccess(getLeftExpression(), propertyName), Expression.string(value));
        };

        self.startsWith = function (value) {
            return Expression.startsWith(Expression.propertyAccess(getLeftExpression(), propertyName), Expression.string(value));
        };

        self.property = function (value) {
            return new OperationExpressionBuilder(Type, value, function () {
                return Expression.propertyAccess(getLeftExpression(), propertyName);
            });
        };

        self.getExpression = function () {
            return Expression.propertyAccess(getLeftExpression(), propertyName);
        };

        self.getPropertyName = function () {
            return propertyName;
        };

    };

    var ExpressionBuilder = function (Type) {
        var self = this;
        Type = Type || Object;
        BASE.assertNotGlobal(self);

        self.property = function (property) {
            return new OperationExpressionBuilder(Type, property, function () {
                return Expression.type(Type);
            });
        };

        self.and = function () {
            return Expression.and.apply(Expression, arguments);
        };

        self.or = function () {
            return Expression.or.apply(Expression, arguments);
        };

        self.any = function (fn) {
            var expressionBuilder = new ExpressionBuilder();
            var expression = fn(expressionBuilder);
            return setExpression(Expression.any("", expression));
        };

        self.all = function () {
            var expressionBuilder = new ExpressionBuilder();
            var expression = fn(expressionBuilder);
            return setExpression(Expression.all("", expression));
        };

        self.value = function () {
            return new OperationExpressionBuilder("");
        }

    };

    BASE.query.ExpressionBuilder = ExpressionBuilder;
});
