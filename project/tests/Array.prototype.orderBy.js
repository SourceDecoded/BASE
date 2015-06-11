var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "Array.prototype.orderBy"
], function () {
    exports["Array.prototype.orderBy: Test strings."] = function () {
        var array = ["John", "Jared", "jared", "john"];
        
        array.orderBy(function (name) {
            return name;
        });

        assert.equal(array[0], "Jared");
        assert.equal(array[1], "jared");
        assert.equal(array[2], "John");
        assert.equal(array[3], "john");
    };
    
    exports["Array.prototype.orderBy: Test numbers."] = function () {
        var array = [-8, 3, 5, 12];
        array.orderBy(function (number) {
            return number;
        });
        
        assert.equal(array[0], -8);
        assert.equal(array[1], 3);
        assert.equal(array[2], 5);
        assert.equal(array[3], 12);
    };
    
    exports["Array.prototype.orderBy: Test dates."] = function () {
        var january = new Date("01/01/2015");
        var february = new Date("02/01/2015");
        var march = new Date("03/01/2015");
        var april = new Date("04/01/2015");

        var array = [march, february, april, january];
        array.orderBy(function (number) {
            return number;
        });
        
        assert.equal(array[0], january);
        assert.equal(array[1], february);
        assert.equal(array[2], march);
        assert.equal(array[3], april);
    };

});