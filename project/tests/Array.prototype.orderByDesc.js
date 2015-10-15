var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "Array.prototype.orderByDesc"
], function () {
    exports["Array.prototype.orderByDesc: Test strings."] = function () {
        var array = ["John", "Jared", "jared", "john"];
        
        array.orderByDesc(function (name) {
            return name;
        });

        assert.equal(array[0], "John");
        assert.equal(array[1], "john");
        assert.equal(array[2], "Jared");
        assert.equal(array[3], "jared");
    };
    
    exports["Array.prototype.orderByDesc: Test numbers."] = function () {
        var array = [-8, 3, 5, 12];
        array.orderByDesc(function (number) {
            return number;
        });
        
        assert.equal(array[0], 12);
        assert.equal(array[1], 5);
        assert.equal(array[2], 3);
        assert.equal(array[3], -8);
    };
    
    exports["Array.prototype.orderByDesc: Test dates."] = function () {
        var january = new Date("01/01/2015");
        var february = new Date("02/01/2015");
        var march = new Date("03/01/2015");
        var april = new Date("04/01/2015");

        var array = [march, february, april, january];
        array.orderByDesc(function (number) {
            return number;
        });
        
        assert.equal(array[0], april);
        assert.equal(array[1], march);
        assert.equal(array[2], february);
        assert.equal(array[3], january);
    };

});