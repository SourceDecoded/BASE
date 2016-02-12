var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require(["node.Directory"], function () {
    var Directory = node.Directory;
    
    exports['node.Directory: Add directory.'] = function () {
        var directory = new Directory("C:/__test");
        var future = directory.copyToAsync("C:/__copyTest")["try"]().ifError(function () {
        });
    };
});

