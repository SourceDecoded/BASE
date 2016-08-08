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
});