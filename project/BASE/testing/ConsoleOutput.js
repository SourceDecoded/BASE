BASE.require([], function () {
    BASE.namespace("BASE.testing");
    
    var START_RED = "\033[31m";
    var START_GREEN = "\033[32m";
    var END_COLOR = "\033[00m";
    
    var chalk = {
        red: function (message) {
            return START_RED + message + END_COLOR;
        },
        green: function (message) {
            return START_GREEN + message + END_COLOR;
        }
    };
    
    BASE.testing.ConsoleOutput = function (testRunner) {
        testRunner.observeType("result", function (event) {
            var result = event.result;
            if (result.passed) {
                console.log(chalk.green(result.name + " " + result.message));
            } else {
                console.log(chalk.red(result.name + " " + result.message));
            }
        });

    };
});