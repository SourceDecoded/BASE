require("../../BASE.js");
var chalk = require("chalk");

BASE.require.loader.setRoot("./");
BASE.require.loader.setObject("TestRunner", __dirname + "/TestRunner.js");

BASE.require(["TestRunner"], function () {

    var testRunner = new TestRunner();
    testRunner.observeType("result", function (event) {
        var result = event.result;
        if (result.passed) {
            console.log(chalk.green(result.message));
        } else {
            console.log(chalk.red(result.message));
        }
    });

    testRunner.run();

});
