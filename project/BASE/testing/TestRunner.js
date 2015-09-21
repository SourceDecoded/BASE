BASE.require([
    "node.Directory",
    "BASE.util.LiteObservable",
    "BASE.web.PathResolver"
], function () {
    BASE.namespace("BASE.testing");
    
    var Directory = node.Directory;
    var LiteObservable = BASE.util.LiteObservable;
    var PathResolver = BASE.web.PathResolver;
    var path = require("path");
    
    var TestResult = function (passed, name, message, duration) {
        this.passed = passed;
        this.message = message;
        this.name = name;
        this.duration = typeof duration === "number" ? duration: 0;
    };
    
    var runTest = function (fileName) {
        var parts = fileName.split(".");
        if (parts[parts.length - 1] !== "js") {
            return false;
        }
        
        return true;
    };
    
    var TestRunner = function (testDirectory) {
        var self = this;
        
        if (testDirectory == null) {
            throw new Error("Null Argument Exception: testDirectory needs to be supplied.");
        }
        
        LiteObservable.call(this);
        
        this.run = function () {
            
            self.notify({
                type: "start"
            });
            
            var pathResolver = new PathResolver(testDirectory, { folderDelimiter: path.sep });
            
            var directory = new Directory(testDirectory);
            directory.getFiles().then(function (files) {
                
                var runFileNames = files.filter(runTest);
                var tests = runFileNames.map(function (fileName) {
                    var fullPath = pathResolver.resolve("." + path.sep + fileName);
                    pathResolver.setPath(testDirectory);
                    
                    try {
                        return require(fullPath);
                    } catch (error) {
                        self.notify({
                            type: "result",
                            result: new TestResult(false, fullPath, "Failed to load because: " + error.message + " in file " + fileName + ". /n/n/n" + error.stack)
                        });
                        return {};
                    }
                });
                
                var allResults = tests.reduce(function (accumulator, test) {
                    var results = Object.keys(test).map(function (testName) {
                        
                        var startTime = Date.now();
                        
                        try {
                            test[testName]();
                            return new TestResult(true, testName, "Passed.", Date.now() - startTime);
                        } catch (error) {
                            return new TestResult(false, testName, "Failed: " + error.message + ". /n/n/n" + error.stack, Date.now() - startTime);
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
                
                self.notify({
                    type: "end"
                });
            });
        };

    };
    
    BASE.extend(TestRunner, LiteObservable);
    
    BASE.testing.TestRunner = TestRunner;
});