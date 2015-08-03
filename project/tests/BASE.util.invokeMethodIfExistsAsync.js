var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
	"BASE.util.invokeMethodIfExistsAsync",
	"BASE.async.Future"
], function () {
	var Future = BASE.async.Future;
	
	var obj = {
		methodReturnsFuture: function () {
			return Future.fromResult("test");
		},
		methodReturnsValue: function () {
			return "Some Value"
		},
		methodWithArguments: function (one, two, three) {
			return Future.fromResult(Array.prototype.slice.call(arguments, 0));
		}
	};
	
	var invokeMethodIfExistsAsync = BASE.util.invokeMethodIfExistsAsync;
	
	exports["BASE.util.invokeMethodIfExistsAsync: Success with Future returned."] = function () {
		var result = invokeMethodIfExistsAsync(obj, "methodReturnsFuture", []).then(function (value) {
			assert.equal(value, "test");
		});
		assert.equal(result instanceof Future, true);
	};
	
	exports["BASE.util.invokeMethodIfExistsAsync: Success with Future from non future returned method."] = function () {
		var result = invokeMethodIfExistsAsync(obj, "methodReturnsValue", []).then(function (value) {
			assert.equal(value, "Some Value");
		});
		assert.equal(result instanceof Future, true);
	};
	
	exports["BASE.util.invokeMethodIfExistsAsync: Arguments are passed correctly."] = function () {
		var one = "one";
		var two = "two";
		var three = "three";
		
		var result = invokeMethodIfExistsAsync(obj, "methodWithArguments", [one, two, three]).then(function (value) {
			assert.equal(value[0], one);
			assert.equal(value[1], two);
			assert.equal(value[2], three);
		});
		assert.equal(result instanceof Future, true);
	};
});