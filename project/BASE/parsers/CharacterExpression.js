BASE.require([
    "BASE.parsers.Expression",
    "BASE.parsers.MatchResult",
    "BASE.parsers.ErrorResult"
], function () {
    
    BASE.namespace("BASE.parsers");
    
    var MatchResult = BASE.parsers.MatchResult;
    var ErrorResult = BASE.parsers.ErrorResult;
    var Expression = BASE.parsers.Expression;
    
    var CharacterExpression = function (character) {
        this.name = character;
        this.character = character;
    };
    
    BASE.extend(CharacterExpression, Expression);
    
    CharacterExpression.prototype.match = function (cursor) {
        if (cursor.getValue() === this.character) {
            return new MatchResult(cursor.currentIndex, cursor.currentIndex + 1, {
                name: "character",
                value: this.character
            });
        }
        return new ErrorResult(cursor.currentIndex, cursor.currentIndex + 1, {
            name: "characterError",
            value: "Expected '" + this.character + "'"
        });
    };
    
    BASE.parsers.CharacterExpression = CharacterExpression;

});