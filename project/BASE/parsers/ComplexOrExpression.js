BASE.require([
    "BASE.parsers.Expression",
    "BASE.parsers.MatchResult"
], function () {
    
    BASE.namespace("BASE.parsers");
    
    var isExpression = function (expression) {
        return expression instanceof Expression;
    };
    
    var Expression = BASE.parsers.Expression;
    var MatchResult = BASE.parsers.MatchResult;
    
    var ComplexOrExpression = function (name) {
        this.name = name;
        this.childrenExpressions = Array.prototype.slice.call(arguments, 1);
        
        if (!this.childrenExpressions.every(isExpression)) {
            throw new Error("Invalid arguments: Expected all arguments after first to be instances of BASE.parsers.Expression.");
        }
    };
    
    BASE.extend(Expression, ComplexOrExpression);
    
    ComplexOrExpression.prototype.match = function (cursor) {
        var endAt;
        var matchResult;
        var startAt = cursor.currentIndex;
        
        if (!cursor.hasNext()) {
            return new MatchResult(false, startAt, startAt + 1, {
                name: "endOfFile",
                value: null
            });
        }
        
        cursor.next();
        
        var hasMatch = this.childrenExpressions.some(function (expression) {
            
            var result = expression.isMatch(cursor);
            
            if (!result.isMatch) {
                return false;
            }
            
            matchResult = result;
            return true;

        });
        
        if (hasMatch) {
            
            endAt = startAt + 1;
            return new MatchResult(true, startAt, endAt, {
                name: this,
                children: [matchResult.value]
            });

        } else {
            
            cursor.revert();
            return new MatchResult(false, startAt, startAt, {
                name: "error",
                value: this.name + " node couldn't find a match."
            });

        }
        
    };
    
    BASE.parsers.ComplexOrExpression = ComplexOrExpression;

});