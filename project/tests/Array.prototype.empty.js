var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "Array.prototype.empty"
], function() {
	exports["Array.prototype.empty: Test empty array."] = function () {
		var array = ["John", "Jared", "jared", "john"];

		array.empty();

        assert.equal(array.length, 0);
	    assert.equal(array[0], null);
	};
});