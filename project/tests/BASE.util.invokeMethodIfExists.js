var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.util.invokeMethodIfExists",
    "BASE.async.Future"
], function () {
    var Future = BASE.async.Future;
    
    var obj = {
        methodReturnsValue: function () {
            return "Some Value"
        },
        methodWithArguments: function (one, two, three) {
            return Array.prototype.slice.call(arguments, 0);
        },
        methodReturnsFuture: function () {
            return Future.fromResult("Value");
        }
    };
    
    var invokeMethodIfExists = BASE.util.invokeMethodIfExists;
    
    exports["BASE.util.invokeMethodIfExists: Success with Future returned."] = function () {
        var result = invokeMethodIfExists(obj, "methodReturnsValue", [])
        assert.equal(result, "Some Value");
    };
    
    exports["BASE.util.invokeMethodIfExists: Success with Future."] = function () {
        var result = invokeMethodIfExists(obj, "methodReturnsFuture", []).then(function (value) {
            assert.equal(value, "Value");
        });
        assert.equal(result instanceof Future, true);
    };
    
    exports["BASE.util.invokeMethodIfExists: Arguments are passed correctly."] = function () {
        var one = "one";
        var two = "two";
        var three = "three";
        
        var result = invokeMethodIfExists(obj, "methodWithArguments", [one, two, three]);
        assert.equal(result[0], one);
        assert.equal(result[1], two);
        assert.equal(result[2], three);
    };
});