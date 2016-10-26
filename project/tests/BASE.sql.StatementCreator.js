var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.sql.StatementCreator",
    "BASE.data.testing.Edm"
], function () {

    var StatementCreator = BASE.sql.StatementCreator;
    var Edm = BASE.data.testing.Edm;
    var Person = BASE.data.testing.Person;

    var edm = new Edm();

    var isMatch = function (message) {
        return function (error) {
            return message === error.message;
        };
    };

    exports["BASE.sql.StatementCreator: Create table."] = function () {
        var edm = new Edm();
        var personModel = edm.getModelByType(Person);
        var statementCreator = new StatementCreator(edm);
        var createStatement = statementCreator.createTableClause(personModel);

        assert.equal(createStatement, "CREATE TABLE people(\n\tid INTEGER PRIMARY KEY AUTOINCREMENT, \n\tfirstName TEXT, \n\tlastName TEXT, \n\tage INTEGER, \n\tdateOfBirth NUMERIC, \n\thumanoidType NUMERIC\n)");

    };

});