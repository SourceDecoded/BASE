BASE.require([
    "node.futurize"
], function () {
    var fileSystem = require("fs");
    
    BASE.namespace("node");
    
    var Observer = BASE.util.Observer;
    var futurize = node.futurize;
    
    var toArray = function (arrayLike) {
        return Array.prototype.slice.call(arrayLike, 0);
    };
    
    var getStat = function (path) {
        return futurize(fileSystem.lstat, toArray(arguments)).chain(function (args) {
            return args[0];
        });
    };
    
    var writeFile = function (fileName, content) {
        return futurize(fileSystem.writeFile, toArray(arguments)).chain(function () {
            return undefined;
        });
    };
    
    var readFile = function (path, encoding) {
        return futurize(fileSystem.readFile, toArray(arguments)).chain(function (args) {
            return args[0];
        });
    };
    
    var renameFile = function (oldPath, newPath) {
        return futurize(fileSystem.rename, toArray(arguments)).chain(function () {
            return undefined;
        });
    };
    
    var removeFile = function (path) {
        return futurize(fileSystem.unlink, [path]).chain(function () {
            return undefined;
        });
    };
    
    var appendFile = function (path, content) {
        return futurize(fileSystem.appendFile, toArray(arguments)).chain(function () {
            return undefined;
        });
    };
    
    node.File = function (path) {
        var self = this;
        
        self.read = function (encoding) {
            return readFile(path, encoding).try();
        };
        
        self.write = function (content) {
            return writeFile(path, content).try();
        };
        
        self.appendFile = function (content) {
            return appendFile(path, content);
        };
        
        self.getStream = function () {
            return fileSystem.createReadStream(path);
        };
        
        self.exists = function () {
            return getStat(path).chain(function (stat) {
                return stat.isFile();
            });
        };
        
        self.rename = function (newPath) {
            var oldPath = path;
            return renameFile(oldPath, newPath).chain(function () {
                path = newPath;
            }).try();
        };
        
        self.watch = function () {
            var currentPath = path;
            
            var watchListener = function (prev, curr) {
                observer.notify({
                    previousStat: prev,
                    currentStat: curr
                });
            };
            
            var observer = new Observer(function () {
                fileSystem.unwatchFile(currentPath, watchListener);
            });
            
            fileSystem.watchFile(currentPath, watchListener);
            
            return observer;
        };
        
        self.remove = function () {
            return removeFile(path).try();
        };
    };

});