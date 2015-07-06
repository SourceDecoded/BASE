var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "String.prototype.contains"
], function () {
    
    exports["String.prototype.contains: Is in string."] = function () {
        var name = "John Doe";
        assert.equal(name.contains("ohn Doe"), true);
    };

    exports["String.prototype.contains: Isn't in string."] = function () {
        var name = "John Doe";
        assert.equal(name.contains("ohn Boe"), false);
    };

});