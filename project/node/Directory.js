BASE.require([
    "node.futurize",
    "node.File"
], function () {
    BASE.namespace("node");
    
    var fileSystem = require("fs");
    var Future = BASE.async.Future;
    var File = node.File;
    
    var futurize = node.futurize;
    
    var toArray = function (arrayLike) {
        return Array.prototype.slice.call(arrayLike, 0);
    };
    
    var makeDirectory = function (path) {
        return futurize(fileSystem.mkdir, toArray(arguments)).chain(function () {
            return undefined;
        });
    };
    
    var readDirectory = function (path) {
        return futurize(fileSystem.readdir, [path]).chain(function (args) {
            return args[0];
        });
    };
    
    var makeFullDirectory = function (path) {
        var directories = path.split("/");
        
        return directories.reduce(function (future, _, index) {
            var path = directories.slice(0, index + 1).join("/");
            
            return future.chain(function () {
                return getStat(path);
            }).catch(function () {
                return makeDirectory(path).chain(function () {
                    return getStat(path);
                });
            }).chain(function (stat) {
                if (stat.isDirectory()) {
                    return;
                } else {
                    return makeDirectory(path);
                }
            });

        }, Future.fromResult(null));

    };
    
    var removeDirectory = function (path) {
        return futurize(fileSystem.rmdir, [path]);
    };
    
    var removeFullDirectory = function (path) {
        return getStat(path).chain(function (stat) {
            if (stat.isDirectory()) {
                return readDirectory(path).chain(function (files) {
                    var futures = [];
                    
                    files.forEach(function (filePath) {
                        futures.push(removeFullDirectory([path, filePath].join("/")));
                    });
                    
                    return Future.all(futures).chain(function () {
                        return removeDirectory(path);
                    });
                });
            } else {
                var file = new File(path);
                return file.remove();
            }

        });
    };
    
    var getStat = function (path) {
        return futurize(fileSystem.lstat, toArray(arguments)).chain(function (args) {
            return args[0];
        });
    };
    
    node.Directory = function (path) {
        var self = this;
        
        self.create = function () {
            return makeFullDirectory(path).try();
        };
        
        self.remove = function () {
            return removeFullDirectory(path).try();
        };
        
        self.exists = function () {
            return getStat(path).chain(function (stat) {
                return stat.isDirectory();
            });
        };
        
        self.getFiles = function () {
            return readDirectory(path);
        };
    };
});