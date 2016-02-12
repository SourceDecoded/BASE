require("./project/BASE.js");
var nodePath = require("path");
var os = require("os");
BASE.require.loader.setRoot("./");

BASE.require([
    "node.File",
    "node.Directory"
], function () {
    var File = node.File;
    var Directory = node.Directory;
    var tmpPath = nodePath.resolve(os.tmpdir(), "base_toolkit");
    
    var currentDirectory = new Directory("./");
    currentDirectory.copyToAsync(tmpPath).chain(function () {
        return currentDirectory.removeAsync();
    }).chain(function () {
        var scriptsDirectorySource = new Directory(nodePath.resolve(tmpPath, "project"));
        return scriptsDirectorySource.copyToAsync("./scripts");
    })["catch"](function (error) {
        console.log(error.message);
    }).then(function () {
        console.log("Success");
    });
    
});