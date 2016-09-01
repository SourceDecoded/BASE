var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.sql.Visitor",
    "BASE.data.testing.Edm",
    "BASE.query.Queryable",
    "BASE.sqlite.dataConverter"
], function () {
    
    var Visitor = BASE.sql.Visitor;
    var Edm = BASE.data.testing.Edm;
    var Queryable = BASE.query.Queryable;
    var Person = BASE.data.testing.Person;
    var dataConverter = BASE.sqlite.dataConverter;
    
    var edm = new Edm();
    
    var isMatch = function (message) {
        return function (error) {
            return message === error.message;
        };
    };
    
    exports["BASE.sql.Visitor: without needed dependencies."] = function () {
        
        assert.throws(function () {
            new Visitor();
        }, isMatch("Type, edm, and dataConverter are all required."));

    };
    
    exports["BASE.sql.Visitor: without edm"] = function () {
        
        assert.throws(function () {
            new Visitor(Person);
        }, isMatch("Type, edm, and dataConverter are all required."));

    };
    
    exports["BASE.sql.Visitor: without edm"] = function () {
        
        assert.throws(function () {
            new Visitor(Person, edm);
        }, isMatch("Type, edm, and dataConverter are all required."));

    };
    
    exports["BASE.sql.Visitor: Direct property isEqualTo"] = function () {
        
        var visitor = new Visitor(Person, edm, dataConverter);
        var queryable = new Queryable(Person).where(function (expBuilder) {
            return expBuilder.property("firstName").isEqualTo("John");
        });
        
        var query = queryable.query;
        
        var result = visitor.parse(query.where);
        
        assert.equal(result, "WHERE (\"people\".\"firstName\" = 'John')");
    };
    
    exports["BASE.sql.Visitor: Nested property isEqualTo"] = function () {
        
        var visitor = new Visitor(Person, edm, dataConverter);
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
        var expectedResult = 'SELECT "people"."id" AS "people___id", "people"."firstName" AS "people___firstName", "people"."lastName" AS "people___lastName", "people"."age" AS "people___age", "people"."placeOfBirth" AS "people___placeOfBirth", "people"."dateOfBirth" AS "people___dateOfBirth", "people"."humanoidType" AS "people___humanoidType", "hrAccounts"."id" AS "hrAccounts___id", "hrAccounts"."accountId" AS "hrAccounts___accountId", "hrAccounts"."personId" AS "hrAccounts___personId", "roles"."id" AS "roles___id", "roles"."hrAccountId" AS "roles___hrAccountId", "roles"."name" AS "roles___name" FROM "people" LEFT JOIN "hrAccounts" ON "people"."id" = "hrAccounts"."personId" LEFT JOIN "roles" ON "hrAccounts"."id" = "roles"."hrAccountId" WHERE ("hrAccounts"."accountId" = 1) ORDER BY "hrAccounts"."accountId" ASC, "roles"."name" ASC';
        
        assert.equal(result, expectedResult);
    };
    
    exports["BASE.sql.Visitor: Nested property ManyToMany"] = function () {
        
        var visitor = new Visitor(Person, edm, dataConverter);
        var queryable = new Queryable(Person).include(function (expBuilder) {
            return expBuilder.property("permissions").where(function (expBuilder) {
                return expBuilder.property("name").isEqualTo("Something");
            });
        });
        
        var query = queryable.query;
        
        var result = visitor.parseQuery(query);
        var expectedResult = 'SELECT "people"."id" AS "people___id", "people"."firstName" AS "people___firstName", "people"."lastName" AS "people___lastName", "people"."age" AS "people___age", "people"."placeOfBirth" AS "people___placeOfBirth", "people"."dateOfBirth" AS "people___dateOfBirth", "people"."humanoidType" AS "people___humanoidType", "permissions"."id" AS "permissions___id", "permissions"."name" AS "permissions___name", "hidden_table_0"."personId" AS "hidden_table_0___personId", "hidden_table_0"."permissionId" AS "hidden_table_0___permissionId" FROM "people" LEFT JOIN "hidden_table_0" ON "people"."id" = "hidden_table_0"."personId" LEFT JOIN "permissions" ON "hidden_table_0"."permissionId" = "permissions"."id" WHERE ("permissions"."name" = \'Something\') ';
        
        assert.equal(result, expectedResult);
    };
    
    exports["BASE.sql.Visitor: Nested property ManyToManyAsTarget"] = function () {
        
        var visitor = new Visitor(BASE.data.testing.Permission, edm, dataConverter);
        var queryable = new Queryable(BASE.data.testing.Permission).where(function (expBuilder) {
            return expBuilder.property("people").any(function (expBuilder) {
                return expBuilder.property("firstName").isEqualTo("Jared");
            });
        }).include(function (expBuilder) {
            return expBuilder.property("people");
        });
        
        var query = queryable.query;
        
        var result = visitor.parseQuery(query);
        var expectedResult = 'SELECT "permissions"."id" AS "permissions___id", "permissions"."name" AS "permissions___name", "people"."id" AS "people___id", "people"."firstName" AS "people___firstName", "people"."lastName" AS "people___lastName", "people"."age" AS "people___age", "people"."placeOfBirth" AS "people___placeOfBirth", "people"."dateOfBirth" AS "people___dateOfBirth", "people"."humanoidType" AS "people___humanoidType", "hidden_table_0"."personId" AS "hidden_table_0___personId", "hidden_table_0"."permissionId" AS "hidden_table_0___permissionId "FROM "permissions" LEFT JOIN "hidden_table_0" ON "permissions"."id" = "hidden_table_0"."permissionId" LEFT JOIN "people" ON "hidden_table_0"."personId" = "people"."id" WHERE ("people"."firstName" = \'Jared\') ';
    };



});