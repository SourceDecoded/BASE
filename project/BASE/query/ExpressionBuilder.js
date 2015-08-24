BASE.require(["BASE.query.Expression"], function () {
    var Expression = BASE.query.Expression;
    
    BASE.namespace("BASE.query");
    
    var OperationExpressionBuilder = function (getLeftExpression) {
        var self = this;
        
        getLeftExpression = getLeftExpression || function (expression) {
            return expression;
        };
        
        self.any = function (fn) {
            var expressionBuilder = new ExpressionBuilder();
            var expression = fn(expressionBuilder);
            return Expression.any(getLeftExpression(), expression);
        };
        
        self.where = function (fn) {
            var propertyAccessExpression = getLeftExpression();
            
            getLeftExpression = function () {
                var expressionBuilder = new ExpressionBuilder(Object);
                var expression = fn(expressionBuilder);
                
                return Expression.queryable(propertyAccessExpression, Expression.expression(Expression.where(expression)));
            };
            
            return self;
        };
        
        self.all = function (fn) {
            var expressionBuilder = new ExpressionBuilder();
            var expression = fn(expressionBuilder);
            return Expression.all(getLeftExpression(), expression);
        };
        
        self.isEqualTo = function (value) {
            var constant = Expression.getExpressionType(value);
            return Expression.equalTo(getLeftExpression(), constant);
        };
        
        self.isNotEqualTo = function (value) {
            var constant = Expression.getExpressionType(value);
            return Expression.notEqualTo(getLeftExpression(), constant);
        };
        
        self.contains = function (value) {
            var constant = Expression.getExpressionType(value);
            return Expression.substringOf(getLeftExpression(), constant);
        }
        
        self.isIn = function (array) {
            if (Array.isArray(array)) {
                return Expression.isIn(getLeftExpression(), Expression.array(array));
            } else {
                throw new Error("isIn is expecting to be passed an array!");
            }
        };

        self.isNotIn = function(array) {
            if (Array.isArray(array)) {
                return Expression.isNotIn(getLeftExpression(), Expression.array(array));
            } else {
                throw new Error("isNotIn is expecting to be passed an array!");
            }
        };
        
        self.isSubstringOf = function (value) {
            console.warn("isSubstringOf is deprecated, please us contains.");
            return Expression.substringOf(getLeftExpression(), Expression.string(value));
        };
        
        self.isGreaterThan = function (value) {
            var constant = Expression.getExpressionType(value);
            return Expression.greaterThan(getLeftExpression(), constant);
        };
        
        self.isGreaterThanOrEqualTo = function (value) {
            var constant = Expression.getExpressionType(value);
            return Expression.greaterThanOrEqualTo(getLeftExpression(), constant);
        };
        
        self.isLessThanOrEqualTo = function (value) {
            var constant = Expression.getExpressionType(value);
            return Expression.lessThanOrEqualTo(getLeftExpression(), constant);
        };
        
        self.isLessThan = function (value) {
            var constant = Expression.getExpressionType(value);
            return Expression.lessThan(getLeftExpression(), constant);
        };
        
        self.endsWith = function (value) {
            return Expression.endsWith(getLeftExpression(), Expression.string(value));
        };
        
        self.startsWith = function (value) {
            return Expression.startsWith(getLeftExpression(), Expression.string(value));
        };
        
        self.property = function (value) {
            return new OperationExpressionBuilder(function () {
                return Expression.propertyAccess(getLeftExpression(), value);
            });
        };
        
        self.getExpression = function () {
            return getLeftExpression();
        };

    };
    
    var ExpressionBuilder = function (Type) {
        var self = this;
        Type = Type || Object;
        BASE.assertNotGlobal(self);
        
        self.property = function (property) {
            return new OperationExpressionBuilder(function () {
                return Expression.propertyAccess(Expression.type(Type), property);
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
            return new OperationExpressionBuilder(function () {
                return Expression.type(Type);
            });
        }

    };
    
    BASE.query.ExpressionBuilder = ExpressionBuilder;
    BASE.query.OperationExpressionBuilder = OperationExpressionBuilder;
});
