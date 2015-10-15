var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "node.postgreSql.DataStore",
    "node.postgreSql.Database",
    "BASE.data.testing.Edm"
], function () {
    
    var Database = node.postgreSql.Database;
    var DataStore = node.postgreSql.DataStore;
    var Edm = BASE.data.testing.Edm;
    
    exports["node.postgreSql.DataStore: add"] = function () {
        
        var edm = new Edm();

        //var database = new Database({
        //    username: "admin",
        //    password: "adminadmin",
        //    name: "SpotOffer",
        //    edm: edm
        //});

        //var dataStore = new DataStore();

    };

});