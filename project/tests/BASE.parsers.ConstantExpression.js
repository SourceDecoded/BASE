var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.parsers.ConstantExpression",
    "BASE.parsers.Expression",
    "BASE.parsers.Cursor"
], function () {
    
    var ConstantExpression = BASE.parsers.ConstantExpression;
    var Expression = BASE.parsers.Expression;
    var Cursor = BASE.parsers.Cursor;
    
    var isMatch = function (message) {
        return function (error) {
            return message === error.message;
        };
    };
    
    exports["BASE.parsers.ConstantExpression: throws on match with out name and value"] = function () {
        
        var cursor = new Cursor("Source");
        assert.throws(function () {
            new ConstantExpression();
        }, isMatch("Null Argument Exception: name and value needed."));

    };
    
    exports["BASE.parsers.ConstantExpression: match"] = function () {
        
        var cursor = new Cursor("Source");
        
        var constantExpression = new ConstantExpression("Source", "Source");
        cursor.first();
        
        var result = constantExpression.match(cursor);
        
        assert.equal(result.expression.name, "constant");
        assert.equal(result.expression.value, "Source");

    };
    
    exports["BASE.parsers.ConstantExpression: match with longer source."] = function () {
        
        var cursor = new Cursor("Source Source");
        
        var constantExpression = new ConstantExpression("Source", "Source");
        cursor.first();
        
        var result = constantExpression.match(cursor);
        
        assert.equal(result.expression.name, "constant");
        assert.equal(result.expression.value, "Source");

    };
    

});