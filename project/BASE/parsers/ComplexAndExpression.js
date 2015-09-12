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
    
    var ComplexAndExpression = function (name) {
        this.name = name;
        this.childrenExpressions = Array.prototype.slice.call(arguments, 1);
        
        if (!this.childrenExpressions.every(isExpression)) {
            throw new Error("Invalid arguments: Expected all arguments after first to be instances of BASE.parsers.Expression.");
        }
    };
    
    BASE.extend(Expression, ComplexAndExpression);
    
    ComplexAndExpression.prototype.match = function (cursor) {
        var endAt;
        var failedMatchResult;
        var startAt = cursor.currentIndex;
        var childrenExpressionResults = [];
        
        if (!cursor.hasNext()) {
            return new MatchResult(false, startAt, startAt + 1, {
                name: "endOfFile",
                value: null
            });
        }
        
        cursor.next();
        
        this.childrenExpressions.every(function (expression) {
            
            var matchResult = expression.isMatch(cursor);
            
            if (!matchResult.isMatch) {
                failedMatchResult = matchResult;
                return false;
            }
            
            childrenExpressionResults.push(matchResult.value);
            return true;

        });
        
        if (!failedMatchResult) {

            endAt = startAt + 1;
            return new MatchResult(true, startAt, endAt, {
                name: this,
                children: childrenExpressionResults
            });

        } else {
            
            cursor.revert();
            return failedMatchResult;

        }
        
    };
    
    BASE.parsers.ComplexAndExpression = ComplexAndExpression;

});