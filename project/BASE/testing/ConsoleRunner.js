require("../../BASE.js");

BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.testing.TestRunner",
    "BASE.testing.ConsoleOutput"
], function () {
    var testDirectory = process.argv[2];
    
    if (testDirectory == null) {
        throw new Error("No test directory passed as an argument.");
    }
    
    var TestRunner = BASE.testing.TestRunner;
    var ConsoleOutput = BASE.testing.ConsoleOutput;
    
    var testRunner = new TestRunner(testDirectory);
    var consoleOutput = new ConsoleOutput(testRunner);
    testRunner.run();
});
