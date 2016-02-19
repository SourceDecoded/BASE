var nodePath = require("path");

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
            })["catch"](function () {
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
    
    var Directory = node.Directory = function (path) {
        var self = this;
        
        self.createAsync = function () {
            return makeFullDirectory(path)["try"]();
        };
        
        self.removeAsync = function () {
            return removeFullDirectory(path)["try"]();
        };
        
        self.existsAsync = function () {
            return getStat(path).chain(function (stat) {
                return stat.isDirectory();
            });
        };
        
        self.getFilesAsync = function () {
            return readDirectory(path);
        };
        
        self.copyToAsync = function (newPath) {
            var newDirectory = new Directory(newPath);

            return self.existsAsync().chain(function (exists) {
                if (!exists) {
                    return Future.fromError(new Error("Directory doesn't exist."));
                }

                return newDirectory.createAsync().chain(function () {
                    return self.getFilesAsync();
                }).chain(function (fileNames) {
                    var futures = fileNames.map(function (fileName) {
                        var sourcePath = nodePath.resolve(path, fileName);
                        var destinationPath = nodePath.resolve(newPath, fileName);
                        var sourceFile = new File(sourcePath);
                        
                        return sourceFile.existsAsync().chain(function (isFile) {
                            if (isFile) {
                                return new Future(function (setValue, setError, cancel, ifCanceled) {
                                    var targetFile = new File(destinationPath);
                                    var readStream = sourceFile.getReadStream();
                                    var writeStream = targetFile.getWriteStream();
                                    var onError = function (error) { setError(error); };
                                    
                                    readStream.on("end", function () {
                                        setValue();
                                    });
                                    
                                    readStream.on("close", function () {
                                        setError(new Error("Source file streamed closed."));
                                    });
                                    
                                    ifCanceled(function () {
                                        readable.unpipe();
                                        writable.end();
                                    });
                                    
                                    readStream.on("error", onError);
                                    writeStream.on("error", onError);
                                    
                                    readStream.pipe(writeStream);
                                
                                });
                            }
                            
                            var directory = new Directory(sourcePath);
                            return directory.copyToAsync(destinationPath);
                        });
                    });
                    
                    return Future.all(futures);
                });

            });
        };
    };
});