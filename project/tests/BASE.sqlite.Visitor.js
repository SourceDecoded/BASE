var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.sqlite.Visitor",
    "BASE.data.testing.Edm",
    "BASE.query.Queryable"
], function () {
    
    var Visitor = BASE.sqlite.Visitor;
    var Edm = BASE.data.testing.Edm;
    var Queryable = BASE.query.Queryable;
    var Person = BASE.data.testing.Person;
    
    var edm = new Edm();
    
    var isMatch = function (message) {
        return function (error) {
            return message === error.message;
        };
    };
    
    exports["BASE.sqlite.Visitor: without needed dependencies."] = function () {
        
        assert.throws(function () {
            new Visitor();
        }, isMatch("Type and edm are both required."));

    };
    
    exports["BASE.sqlite.Visitor: without edm"] = function () {
        
        assert.throws(function () {
            new Visitor(Person);
        }, isMatch("Type and edm are both required."));

    };
    
    exports["BASE.sqlite.Visitor: Direct property isEqualTo"] = function () {
        
        var visitor = new Visitor(Person, edm);
        var queryable = new Queryable(Person).where(function (expBuilder) {
            return expBuilder.property("firstName").isEqualTo("John");
        });
        
        var query = queryable.query;
        
        var result = visitor.parse(query.where);
        
        assert.equal(result, "WHERE (\"people\".\"firstName\" = 'John')");
    };
    
    exports["BASE.sqlite.Visitor: Nested property isEqualTo"] = function () {
        
        var visitor = new Visitor(Person, edm);
        var queryable = new Queryable(Person).where(function (expBuilder) {
            return expBuilder.property("hrAccount").property("accountId").isEqualTo(1);
        }).include(function (expBuilder) {
            return expBuilder.property("hrAccount").property("roles");
        }).orderBy(function (expBuilder) {
            return expBuilder.property("hrAccount").property("accountId");
        }).orderBy(function (expBuilder) {
            return expBuilder.property("hrAccount").property("roles").property("name");
        });
        
        var query = queryable.query;
        
        var result = visitor.parseQuery(query);
    };
    
    exports["BASE.sqlite.Visitor: Nested property ManyToMany"] = function () {
        
        var visitor = new Visitor(Person, edm);
        var queryable = new Queryable(Person).include(function (expBuilder) {
            return expBuilder.property("permissions");
        });
        
        var query = queryable.query;
        
        var result = visitor.parseQuery(query);
    };
    
    exports["BASE.sqlite.Visitor: Nested property ManyToManyAsTarget"] = function () {
        
        var visitor = new Visitor(BASE.data.testing.Permission, edm);
        var queryable = new Queryable(BASE.data.testing.Permission).where(function (expBuilder) {
            return expBuilder.property("people").any(function (expBuilder) {
                return expBuilder.property("firstName").isEqualTo("Jared");
            });
        }).include(function (expBuilder) {
            return expBuilder.property("people");
        });
        
        var query = queryable.query;
        
        var result = visitor.parseQuery(query);
    };



});