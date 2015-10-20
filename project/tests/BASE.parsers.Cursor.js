var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.parsers.Cursor"
], function () {
    
    var Cursor = BASE.parsers.Cursor;
    
    var isMatch = function (message) {
        return function (error) {
            return message === error.message;
        };
    };
    
    exports["BASE.parsers.Cursor: throws a source exception."] = function () {
        assert.throws(function () {
            new Cursor();
        }, isMatch("Invalid Argument Exception: source needs to be a string."));
    };
    
    exports["BASE.parsers.Cursor: throws 'Out of Range Exception' on getValue()"] = function () {
        var cursor = new Cursor("Source");
        assert.throws(function () {
            cursor.getValue();
        }, isMatch("Out of Range Exception"));
    };
    
    exports["BASE.parsers.Cursor: getValue()"] = function () {
        var cursor = new Cursor("Source");
        cursor.next();
        var S = cursor.getValue();
        assert.equal(S, "S");
    };
    
    exports["BASE.parsers.Cursor: mark()"] = function () {
        var cursor = new Cursor("Source");
        cursor.next();
        cursor.mark();
        var firstValue = cursor.getValue();
        cursor.next();
        var nextValue = cursor.getValue();
        cursor.revert();
        
        assert.equal(firstValue, "S");
        assert.equal(nextValue, "o");
        assert.equal(firstValue, cursor.getValue());
    };


    exports["BASE.parsers.Cursor: first()"] = function () {
        var cursor = new Cursor("Source");
        cursor.first();
        var value = cursor.getValue();
        
        assert.equal(value, "S");
    };

    exports["BASE.parsers.Cursor: last()"] = function () {
        var cursor = new Cursor("Source");
        cursor.last();
        var value = cursor.getValue();
        
        assert.equal(value, "e");
    };

    exports["BASE.parsers.Cursor: setIndex()"] = function () {
        var cursor = new Cursor("Source");
        cursor.setIndex(0);
        var value = cursor.getValue();
        
        assert.equal(value, "S");
    };

    exports["BASE.parsers.Cursor: hasNext()"] = function () {
        var cursor = new Cursor("Source");
        cursor.last();
        assert.equal(cursor.hasNext(), false);
    };
});