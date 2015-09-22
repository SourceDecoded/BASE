BASE.require([], function () {
    BASE.namespace("BASE.testing");

    var escapeChars = function (str) {
        if (typeof str !== "string") {
            return str;
        } else {
            return str.replace(/\|/g, "||")
                    .replace(/'/g, "|'")
                    .replace(/\n/g, "|n")
                    .replace(/\r/g, "|r")
                    .replace(/\u0085/, "|x")
                    .replace(/\u2028/, "|l")
                    .replace(/\u2029/, "|p")
                    .replace(/\[/g, "|[")
                    .replace(/\]/g, "|]");
        }
    };

    var TeamCityOutput = function (type) {
        this.toString = function (attr) {
            var attributes = Object.keys(attr).reduce(function (str, key) {
                return str += " " + key + "='" + escapeChars(attr[key]) + "'";
            }, "");
            return "##teamcity[" + type + attributes + "]";
        };
    };

    BASE.testing.TeamCityOutput = function (testRunner) {
        testRunner.observeType("start", function (event) {
            var name = event.name;
            console.log(new TeamCityOutput("testStarted").toString({ name: name}));
        });

        testRunner.observeType("end", function (event) {
            var duration = event.duration;
            var name = event.name;
            console.log(new TeamCityOutput("testFinished").toString({ name: name, duration: duration }));
        });

        testRunner.observeType("result", function (event) {
            var result = event.result;

            if (result.passed) {
                console.log(new TeamCityOutput("testStdOut").toString({ name: name, out: result.message }));

            } else {
                console.log(chalk.red(result.message));
            }

            if (result.failures.length === 0) {
                result.successes.forEach(function (success) {
                   result.message + "\n";
                });

            } else {
                result.failures.forEach(function (failure) {
                    message += failure.message + "\n";
                });

                console.log(new TeamCityOutput("testFailed").toString({ name: name, out: message }));
            }
        });

    };
});