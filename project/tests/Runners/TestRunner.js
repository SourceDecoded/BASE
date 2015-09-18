BASE.require([
    "node.Directory",
    "node.File",
    "BASE.util.LiteObservable",
    "BASE.web.PathResolver"
], function () {
    var File = node.File;
    var Directory = node.Directory;
    var LiteObservable = BASE.util.LiteObservable;
    var PathResolver = BASE.web.PathResolver;
    var path = require("path");
    
    var TestResult = function (passed, message) {
        this.passed = passed;
        this.message = message;
    };
    
    var runTest = function (fileName) {
        var parts = fileName.split(".");
        if (parts[parts.length - 1] !== "js") {
            return false;
        }
        
        return true;
    };
    
    TestRunner = function () {
        var self = this;
        
        LiteObservable.call(this);
        
        this.run = function () {
            
            var pathResolver = new PathResolver(__dirname, { folderDelimiter: path.sep });
            var testsPath = pathResolver.resolve(".." + path.sep);
            
            var directory = new Directory(testsPath);
            directory.getFiles().then(function (files) {
                
                var runFileNames = files.filter(runTest);
                var tests = runFileNames.map(function (fileName) {
                    var fullPath = testsPath + fileName;
                    
                    try {
                        return require(fullPath);
                    } catch (e) {
                        self.notify({
                            type: "result",
                            result: new TestResult(false, "Failed to load because: " + e.message + " in file " + fileName + ". /n/n/n" + error.stack)
                        });
                        return {};
                    }
                });
                
                var allResults = tests.reduce(function (accumulator, test) {
                    var results = Object.keys(test).map(function (testName) {
                        
                        try {
                            test[testName]();
                            return new TestResult(true, testName + " Passed.");
                        } catch (error) {
                            return new TestResult(false, testName + " Failed: " + error.message);
                        }

                    });
                    
                    return accumulator.concat(results);

                }, []);
                
                allResults.forEach(function (result) {
                    self.notify({
                        type: "result",
                        result: result
                    });
                });
            });
        };

    };
    
    BASE.extend(TestRunner, LiteObservable);
});