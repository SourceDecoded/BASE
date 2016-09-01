var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.sql.EntityBuilder",
    "BASE.data.testing.Edm",
    "BASE.data.testing.Person"
], function () {

    var EntityBuilder = BASE.sql.EntityBuilder;
    var Edm = BASE.data.testing.Edm;
    var Person = BASE.data.testing.Person;

    var edm = new Edm();

    var isMatch = function (message) {
        return function (error) {
            return message === error.message;
        };
    };

    exports["BASE.sql.EntityBuilder: Convert one entity."] = function () {
        var edm = new Edm();
        var builder = new EntityBuilder(Person, edm);

        var results = [
            {
                "people___id": 1,
                "people___firstName": "Jared",
                "people___lastName": "Barnes"
            }
        ];

        var entities = builder.convert(results);
        var entity = entities[0];

        assert.equal(entity.id, 1);
        assert.equal(entity.firstName, "Jared");
        assert.equal(entity.lastName, "Barnes");
    };

    exports["BASE.sql.EntityBuilder: Convert one entity with one to one."] = function () {
        var edm = new Edm();
        var builder = new EntityBuilder(Person, edm);

        var results = [
            {
                "people___id": 1,
                "people___firstName": "Jared",
                "people___lastName": "Barnes",
                "hrAccounts___id": 1,
                "hrAccounts___personId": 1,
                "hrAccounts___accountId": 1000
            }
        ];

        var entities = builder.convert(results);
        var entity = entities[0];

        assert.equal(entity.id, 1);
        assert.equal(entity.firstName, "Jared");
        assert.equal(entity.lastName, "Barnes");
        assert.equal(entity.hrAccount.id, 1);
        assert.equal(entity.hrAccount.personId, 1);
        assert.equal(entity.hrAccount.accountId, 1000);

    };

    exports["BASE.sql.EntityBuilder: Convert one entity with one to one followed by a one to many."] = function () {
        var edm = new Edm();
        var builder = new EntityBuilder(Person, edm);

        var results = [
            {
                "people___id": 1,
                "people___firstName": "Jared",
                "people___lastName": "Barnes",
                "hrAccounts___id": 1,
                "hrAccounts___personId": 1,
                "hrAccounts___accountId": 1000,
                "roles___id": 1,
                "roles___hrAccountId": 1,
                "roles___name": "admin"
            },
            {
                "people___id": 1,
                "people___firstName": "Jared",
                "people___lastName": "Barnes",
                "hrAccounts___id": 1,
                "hrAccounts___personId": 1,
                "hrAccounts___accountId": 1000,
                "roles___id": 2,
                "roles___hrAccountId": 1,
                "roles___name": "guest"
            },
            {
                "people___id": 1,
                "people___firstName": "Jared",
                "people___lastName": "Barnes",
                "hrAccounts___id": 1,
                "hrAccounts___personId": 1,
                "hrAccounts___accountId": 1000,
                "roles___id": 3,
                "roles___hrAccountId": 1,
                "roles___name": "manager"
            }
        ];

        var entities = builder.convert(results);
        var entity = entities[0];

        assert.equal(entity.id, 1);
        assert.equal(entity.firstName, "Jared");
        assert.equal(entity.lastName, "Barnes");
        assert.equal(entity.hrAccount.id, 1);
        assert.equal(entity.hrAccount.personId, 1);
        assert.equal(entity.hrAccount.accountId, 1000);
        assert.equal(entity.hrAccount.roles.length, 3);
        assert.equal(entity.hrAccount.roles[0].name, "admin");
        assert.equal(entity.hrAccount.roles[1].name, "guest");
        assert.equal(entity.hrAccount.roles[2].name, "manager");

    };

    exports["BASE.sql.EntityBuilder: Convert one entity with one to many."] = function () {
        var edm = new Edm();
        var builder = new EntityBuilder(Person, edm);

        var results = [
            {
                "people___id": 1,
                "people___firstName": "Jared",
                "people___lastName": "Barnes",
                "phoneNumbers___id": 1,
                "phoneNumbers___personId": 1,
                "phoneNumbers___lineNumber": "5908500",
                "phoneNumbers___areacode": "435"
            },
            {
                "people___id": 1,
                "people___firstName": "Jared",
                "people___lastName": "Barnes",
                "phoneNumbers___id": 2,
                "phoneNumbers___personId": 1,
                "phoneNumbers___lineNumber": "5901384",
                "phoneNumbers___areacode": "435"
            }
        ];

        var entities = builder.convert(results);
        var entity = entities[0];

        assert.equal(entity.id, 1);
        assert.equal(entity.firstName, "Jared");
        assert.equal(entity.lastName, "Barnes");
        assert.equal(entity.phoneNumbers[0].id, 1);
        assert.equal(entity.phoneNumbers[0].person, entity);
        assert.equal(entity.phoneNumbers[0].areacode, "435");
        assert.equal(entity.phoneNumbers[0].lineNumber, "5908500");
        assert.equal(entity.phoneNumbers[1].id, 2);
        assert.equal(entity.phoneNumbers[1].person, entity);
        assert.equal(entity.phoneNumbers[1].areacode, "435");
        assert.equal(entity.phoneNumbers[1].lineNumber, "5901384");

    };

    exports["BASE.sql.EntityBuilder: Convert one entity with many to many."] = function () {
        var edm = new Edm();
        var builder = new EntityBuilder(Person, edm);

        var results = [
            {
                "people___id": 1,
                "people___firstName": "Jared",
                "people___lastName": "Barnes",
                "hidden_table_0___id": 1,
                "hidden_table_0___personId": 1,
                "hidden_table_0___permissionId": 1,
                "permissions___id": 1,
                "permissions___name": "Permission 1"
            },
            {
                "people___id": 1,
                "people___firstName": "Jared",
                "people___lastName": "Barnes",
                "hidden_table_0___id": 2,
                "hidden_table_0___personId": 1,
                "hidden_table_0___permissionId": 2,
                "permissions___id": 2,
                "permissions___name": "Permission 2"
            }
        ];

        var entities = builder.convert(results);
        var entity = entities[0];

        assert.equal(entity.id, 1);
        assert.equal(entity.firstName, "Jared");
        assert.equal(entity.lastName, "Barnes");
        assert.equal(entity.permissions.length, 2);
        assert.equal(entity.permissions[0].name, "Permission 1");
        assert.equal(entity.permissions[0].id, 1);
        assert.equal(entity.permissions[1].name, "Permission 2");
        assert.equal(entity.permissions[1].id, 2);

    };
});