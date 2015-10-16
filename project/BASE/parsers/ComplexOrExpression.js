BASE.require([
    "BASE.parsers.Expression",
    "BASE.parsers.MatchResult",
    "BASE.parsers.ErrorResult"
], function () {
    
    BASE.namespace("BASE.parsers");
    
    var isExpression = function (expression) {
        return expression instanceof Expression;
    };
    
    var Expression = BASE.parsers.Expression;
    var MatchResult = BASE.parsers.MatchResult;
    var ErrorResult = BASE.parsers.ErrorResult;
    
    var ComplexOrExpression = function (name, childrenExpressions) {
        this.name = name;
        this.childrenExpressions = childrenExpressions;
        
        if (!this.childrenExpressions.every(isExpression)) {
            throw new Error("Invalid arguments: Expected all arguments after first to be instances of BASE.parsers.Expression.");
        }
    };
    
    BASE.extend(Expression, ComplexOrExpression);
    
    ComplexOrExpression.prototype.match = function (cursor) {
        var x;
        var expression;
        cursor.mark();
        
        if (!cursor.hasNext()) {
            return new ErrorResult(false, startAt, startAt + 1, {
                name: "endOfFile",
                value: null
            });
        }
        
        for (x = 0; x < this.childrenExpressions.length; x++) {
            expression = this.childrenExpressions[x];
            var result = expression.match(cursor);
            cursor.next();
            
            if (result instanceof MatchResult) {
                return result;
            } else {
                cursor.revert();
            }
        }
        
        return new ErrorResult(cursor.currentIndex, cursor.source.length, {
            message: "Couldn't find match."
        });
        
    };
    
    BASE.parsers.ComplexOrExpression = ComplexOrExpression;

});