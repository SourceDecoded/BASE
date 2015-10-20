var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.parsers.Expression",
    "BASE.parsers.CharacterExpression",
    "BASE.parsers.Cursor"
], function () {
    
    var Expression = BASE.parsers.Expression;
    var CharacterExpression = BASE.parsers.CharacterExpression;
    var Cursor = BASE.parsers.Cursor;
    
    var isMatch = function (message) {
        return function (error) {
            return message === error.message;
        };
    };
    
    exports["BASE.parsers.CharacterExpression: match"] = function () {
        
        var cursor = new Cursor("Source");
        
        var characterExpression = new CharacterExpression("S");
        cursor.first();
        
        var result = characterExpression.match(cursor);
        
        assert.equal(result.expression.name, "character");
        assert.equal(result.expression.value, "S");
        assert.equal(result.startAt, 0);
        assert.equal(result.endAt, 1);
    };
    
    exports["BASE.parsers.CharacterExpression: instanceof Expression"] = function () {
        var characterExpression = new CharacterExpression("S");
        assert.equal(characterExpression instanceof Expression, true);
    };

});