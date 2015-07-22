var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "node.Directory"
], function () {
    
    var testDirectory = new node.Directory(__dirname);
    testDirectory.getFiles().then(function (filePaths) {
        var moduleFutures = filePaths.map(function (filePath) {
            return BASE.require.loader.loadScript(filePath);
        });

        BASE.async.Future.all(moduleFutures).then(function (modules) {
            modules.forEach(function(module) {
                var tests = Object.keys(module).map(function (key) {
                    return {
                        name: key,
                        run: module[key]
                    };
                });
                
                var results = tests.map(function (test) {
                    try {
                        test.run();
                        return test.name + ": Success";
                    } catch (e) {
                        return test.name + ": Failed";
                    }
                });
                console.log(results);
            });  
          
        });
        
    });

});