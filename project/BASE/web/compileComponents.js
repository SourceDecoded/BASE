require("../../BASE.js");

BASE.require.loader.setRoot("./");

BASE.require([
    "node.Directory",
    "node.File",
    "BASE.async.Future",
    "BASE.async.Task"
], function () {
    BASE.namespace("BASE.web");
    var path = require("path");
    var File = node.File;
    var Future = BASE.async.Future;
    var Task = BASE.async.Task;

    var appDirectory = "./salesApp";
    var libDirectory = "./lib";

    var appComponentsJson = appDirectory + "/components/components.json";
    var libComponentsJson = libDirectory + "/components/components.json";

    console.log(path.resolve(appComponentsJson));

    // TODO: allow the app folder to be configurable.
    //process.argv.forEach(function (val, index, array) {

    //});

    var ComponentCache = function (componentsJsonFileArray) {
        var self = this;

        var componentCache = {};

        var addFile = function (path) {
            var file = new File(path);
            return file.read("utf8").then(function (html) {
                componentCache[path] = html;
            });
        };

        var buildCacheFromFile = function (componentsJsonFile) {
            return new Future(function (setValue, setError) {

                new File(componentsJsonFile).read("utf8").then(function (componentsJson) {
                    // There is a problem with the BOM with utf8
                    componentsJson = componentsJson.replace(/^\uFEFF/, "");

                    var componentsAliases = JSON.parse(componentsJson);
                    var components = JSON.parse(componentsJson);
                    var aliases = components.aliases;

                    var task = new Task();

                    Object.keys(aliases).forEach(function (name) {
                        var path;

                        if (typeof aliases[name] === "string") {
                            path = components.root + aliases[name];
                            task.add(addFile(path));
                        } else {

                            if (typeof aliases[name].default === "string") {
                                path = components.root + aliases[name].default;
                                task.add(addFile(path));
                            }

                            if (Array.isArray(aliases[name].exceptions)) {
                                aliases[name].exceptions.forEach(function (exception) {
                                    var path = exception.path;
                                    task.add(addFile(path));
                                })
                            }

                        }

                    });

                    task.start().whenAll(setValue);
                });

            });

        };

        var buildCache = function () {
            var task = new Task();

            componentsJsonFileArray.forEach(function (file) {
                task.add(buildCacheFromFile(file))
            });

            return task.toFuture();
        };

        var buildFuture = buildCache();

        self.toFile = function (path) {
            return new Future(function (setValue, setError) {
                buildFuture.then(function () {
                    var file = new File(path);
                    file.write(JSON.stringify(componentCache)).then(setValue).ifError(setError);
                });
            });
        };
    };

    var componentCache = new ComponentCache([appComponentsJson, libComponentsJson]);
    componentCache.toFile("./components-min.json").then(function () {
        console.log("success");
    });


});