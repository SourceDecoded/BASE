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
        
        var characterExpressions = value.split("").map(function (character) {
            return new CharacterExpression(character);
        });
        
        this.expression = new ComplexAndExpression(name, characterExpressions);
    };
    
    BASE.extend(ConstantExpression, Expression);
    
    ConstantExpression.prototype.match = function (cursor) {
        var result = expression.match(cursor);

        if (result instanceof ErrorResult) {
            return new ErrorResult(cursor.currentIndex, cursor.currentIndex + 1, {
                name: "constantError",
                value: "Expected '" + this.value + "'"
            });

        }
    };
    
    BASE.parsers.ConstantExpression = ConstantExpression;

});