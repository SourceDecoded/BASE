var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.parsers.ComplexAndExpression",
    "BASE.parsers.CharacterExpression",
    "BASE.parsers.Cursor"
], function () {
    
    var ComplexAndExpression = BASE.parsers.ComplexAndExpression;
    var CharacterExpression = BASE.parsers.CharacterExpression;
    var Cursor = BASE.parsers.Cursor;
    
    var isMatch = function (message) {
        return function (error) {
            return message === error.message;
        };
    };
    
    exports["BASE.parsers.ComplexAndExpression: throws on match with out name and value"] = function () {
        assert.throws(function () {
            new ComplexAndExpression("Something", [1]);
        }, isMatch("Invalid arguments: Expected all arguments after first to be instances of BASE.parsers.Expression."));
    };
    
    exports["BASE.parsers.ComplexAndExpression: match"] = function () {
        
        var cursor = new Cursor("Source");
        var char1 = new CharacterExpression("S");
        var char2 = new CharacterExpression("o");
        
        var constantExpression = new ComplexAndExpression("Something", [char1, char2]);
        cursor.first();
        
        var result = constantExpression.match(cursor);
        
        assert.equal(result.expression.name, "Something");
        assert.equal(result.expression.children.length, 2);

    };
    
    exports["BASE.parsers.ComplexAndExpression: match with longer source."] = function () {
        var cursor = new Cursor("Source Source");
        var char1 = new CharacterExpression("S");
        var char2 = new CharacterExpression("o");
        
        var constantExpression = new ComplexAndExpression("Something", [char1, char2]);
        cursor.first();
        
        var result = constantExpression.match(cursor);
        
        assert.equal(result.expression.name, "Something");
        assert.equal(result.expression.children.length, 2);
    };
    
});