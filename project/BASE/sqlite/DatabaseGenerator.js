BASE.require([
    "BASE.data.Edm"
], function () {
    BASE.namespace("BASE.sqlite");

    BASE.sqlite.Generator = function (databaseName, edm) {
        this.databaseName = databaseName;
        this.edm = edm;
    };

    BASE.sqlite.Generator.prototype.generate = function () {

    };

});