BASE.require([
    "BASE.parsers.Expression",
    "BASE.parsers.MatchResult",
    "BASE.parsers.ErrorResult"
], function () {
    
    BASE.namespace("BASE.parsers");
    
    var isExpression = function (expression) {
        return typeof expression.match === "function";
    };
    
    var Expression = BASE.parsers.Expression;
    var MatchResult = BASE.parsers.MatchResult;
    var ErrorResult = BASE.parsers.ErrorResult;
    
    var ComplexAndExpression = function (name, childrenExpressions) {
        this.name = name;
        this.childrenExpressions = childrenExpressions;
        
        if (!this.childrenExpressions.every(isExpression)) {
            throw new Error("Invalid arguments: Expected all arguments after first to be instances of BASE.parsers.Expression.");
        }
    };
    
    BASE.extend(Expression, ComplexAndExpression);
    
    ComplexAndExpression.prototype.match = function (cursor) {
        var x;
        var expression;
        var results = [];
        var result;
        cursor.mark();
        
        if (!cursor.hasNext()) {
            return new ErrorResult(cursor.currentIndex, cursor.currentIndex + 1, {
                name: "endOfFile",
                value: null
            });
        }
        
        for (x = 0; x < this.childrenExpressions.length; x++) {
            expression = this.childrenExpressions[x];
            result = expression.match(cursor);
            
            if (cursor.hasNext()) {
                cursor.next();
            } else if (this.childrenExpressions.length - 1 !== x) {
                return new ErrorResult(cursor.currentIndex, cursor.currentIndex + 1, {
                    name: "endOfFile",
                    value: null
                });
            }
            
            if (result instanceof ErrorResult) {
                cursor.revert();
                return result;
            } else {
                results.push(results);
            }
        }
        
        return new MatchResult(cursor.currentIndex, cursor.source.length, {
            name: this.name,
            children: results
        });
        
    };
    
    BASE.parsers.ComplexAndExpression = ComplexAndExpression;

});