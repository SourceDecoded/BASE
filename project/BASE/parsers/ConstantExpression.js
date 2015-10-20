BASE.require([
    "BASE.parsers.Expression",
    "BASE.parsers.MatchResult",
    "BASE.parsers.ErrorResult",
    "BASE.parsers.CharacterExpression",
    "BASE.parsers.ComplexAndExpression"
], function () {
    
    BASE.namespace("BASE.parsers");
    
    var MatchResult = BASE.parsers.MatchResult;
    var ErrorResult = BASE.parsers.ErrorResult;
    var Expression = BASE.parsers.Expression;
    var CharacterExpression = BASE.parsers.CharacterExpression;
    var ComplexAndExpression = BASE.parsers.ComplexAndExpression;
    
    var ConstantExpression = function (name, value) {
        this.name = name;
        this.value = value;
        
        if (name == null || value == null) {
            throw new Error("Null Argument Exception: name and value needed.");
        }
        
        var characterExpressions = value.split("").map(function (character) {
            var expression = new CharacterExpression(character);
            return expression;
        });
        
        this.expression = new ComplexAndExpression(name, characterExpressions);
    };
    
    BASE.extend(ConstantExpression, Expression);
    
    ConstantExpression.prototype.match = function (cursor) {
        var result = this.expression.match(cursor);
        
        if (result instanceof ErrorResult) {
            return new ErrorResult(result.startAt, result.endAt, {
                name: "error",
                value: "Expected '" + this.value + "'."
            });
        }
        
        return new MatchResult(result.startAt, result.endAt, {
            name: "constant",
            value: this.value
        });
    };
    
    BASE.parsers.ConstantExpression = ConstantExpression;

});