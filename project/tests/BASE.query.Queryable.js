var assert = require('assert');

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "Array.prototype.asQueryable"
], function () {
    
    exports["BASE.query.Queryable: Orderby primitives."] = function () {
        var array = [-8, 3, 5, 12];
        var queryable = array.asQueryable();
        
        queryable.orderBy(function (expr) {
            return expr.value();
        }).toArray().then(function (result) {
            assert.equal(result[0], -8);
            assert.equal(result[1], 3);
            assert.equal(result[2], 5);
            assert.equal(result[3], 12);
        });
        
        queryable.orderByDesc(function (expr) {
            return expr.value();
        }).toArray().then(function (result) {
            assert.equal(result[0], 12);
            assert.equal(result[1], 5);
            assert.equal(result[2], 3);
            assert.equal(result[3], -8);
        });
    };
    
    exports["BASE.query.Queryable: Orderby complex."] = function () {
        var array = [{ age: -8 }, { age: 3 }, { age: 5 }, { age: 12 }];
        var queryable = array.asQueryable();
        
        queryable.orderBy(function (expr) {
            return expr.property("age");
        }).toArray().then(function (result) {
            assert.equal(result[0].age, -8);
            assert.equal(result[1].age, 3);
            assert.equal(result[2].age, 5);
            assert.equal(result[3].age, 12);
        });
        
        queryable.orderByDesc(function (expr) {
            return expr.property("age");
        }).toArray().then(function (result) {
            assert.equal(result[0].age, 12);
            assert.equal(result[1].age, 5);
            assert.equal(result[2].age, 3);
            assert.equal(result[3].age, -8);
        });
    };
    
    exports["BASE.query.Queryable: Comparison operators primitives."] = function () {
        var array = [8, 3, 5];
        var queryable = array.asQueryable();
        
        queryable.where(function (expr) {
            return expr.value().isEqualTo(5);
        }).toArray().then(function (result) {
            assert.equal(result[0], 5);
        });
        
        queryable.where(function (expr) {
            return expr.value().isNotEqualTo(5);
        }).toArray().then(function (result) {
            assert.equal(result.indexOf(5), -1);
        });
        
        queryable.where(function (expr) {
            return expr.value().isGreaterThan(5);
        }).toArray().then(function (result) {
            assert.equal(result[0], 8);
        });
        
        queryable.where(function (expr) {
            return expr.value().isLessThan(5);
        }).toArray().then(function (result) {
            assert.equal(result[0], 3);
        });
        
        queryable.where(function (expr) {
            return expr.value().isGreaterThanOrEqualTo(5);
        }).toArray().then(function (result) {
            assert.notEqual(result.indexOf(5), -1);
            assert.notEqual(result.indexOf(8), -1);
        });
        
        queryable.where(function (expr) {
            return expr.value().isLessThanOrEqualTo(5);
        }).toArray().then(function (result) {
            assert.notEqual(result.indexOf(5), -1);
            assert.notEqual(result.indexOf(3), -1);
        });

    };
    
    exports["BASE.query.Queryable: Query Methods against primitives."] = function () {
        var array = ["LeAnn", "Jared", "Kendi", "Aydri"];
        var queryable = array.asQueryable();
        
        queryable.where(function (expr) {
            return expr.value().contains("are");
        }).toArray().then(function (result) {
            assert.equal(result[0], "Jared");
        });
        
        queryable.where(function (expr) {
            return expr.value().startsWith("Ay");
        }).toArray().then(function (result) {
            assert.equal(result[0], "Aydri");
        });
        
        queryable.where(function (expr) {
            return expr.value().endsWith("ndi");
        }).toArray().then(function (result) {
            assert.equal(result[0], "Kendi");
        });
        
        queryable.where(function (expr) {
            return expr.value().isIn(["LeAnn"]);
        }).toArray().then(function (result) {
            assert.equal(result[0], "LeAnn");
        });

    };
    
    exports["BASE.query.Queryable: Query Methods against complex."] = function () {
        var array = [{ firstName: "Jared", lastName: "Barnes" }, { firstName: "Kendi", lastName: "Barnes" }, { firstName: "Blake", lastName: "Plumb" }];
        var queryable = array.asQueryable();
        
        queryable.where(function (expr) {
            return expr.property("firstName").contains("are");
        }).toArray().then(function (result) {
            assert.equal(result[0].firstName, "Jared");
        });
        
        queryable.where(function (expr) {
            return expr.property("firstName").startsWith("Ke");
        }).toArray().then(function (result) {
            assert.equal(result[0].firstName, "Kendi");
        });
        
        queryable.where(function (expr) {
            return expr.property("lastName").endsWith("mb");
        }).toArray().then(function (result) {
            assert.equal(result[0].firstName, "Blake");
        });
        
        queryable.where(function (expr) {
            return expr.property("firstName").isIn(["Jared"]);
        }).toArray().then(function (result) {
            assert.equal(result[0].firstName, "Jared");
        });

    };
    
    
    exports["BASE.query.Queryable:Multiple orderbys against complex."] = function () {
        var array = [{ firstName: "Jared", lastName: "Barnes" }, { firstName: "Jared", lastName: "Banks" } , { firstName: "Kendi", lastName: "Barnes" }, { firstName: "Blake", lastName: "Plumb" }];
        var queryable = array.asQueryable();
        
        queryable.orderBy(function (expr) {
            return expr.property("firstName");
        }).orderByDesc(function (expr) {
            return expr.property("lastName");
        }).toArray().then(function (result) {
            assert.equal(result[0].firstName, "Blake");
            assert.equal(result[1].firstName, "Jared");
            assert.equal(result[1].lastName, "Barnes");
            assert.equal(result[2].firstName, "Jared");
            assert.equal(result[3].firstName, "Kendi");
        });

    };

});
