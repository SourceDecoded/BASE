BASE.require([], function () {
    
    var fileRegEx = /\.[^\.]*?$/i;
    
    BASE.namespace("BASE.web");
    
    var PathResolver = function (path, options) {
        var self = this;
        options = options || {};
        
        if (typeof path !== "string") {
            throw new Error();
        }
        
        self._folderDelimiter = options.folderDelimiter || "/";
        self._path = path;
    };
    
    PathResolver.prototype._removeFileFromPath = function () {
        var path = this._path;
        var pathParts = path.split(this._folderDelimiter);
        var lastDirectory = pathParts[pathParts.length - 1];
        
        var value = lastDirectory.match(fileRegEx);
        
        if (value) {
            pathParts.pop();
        }
        
        return pathParts.join(this._folderDelimiter);
    };
    
    PathResolver.prototype._addLastSlashIfNeeded = function (path) {
        if (path.lastIndexOf(this._folderDelimiter) !== path.length - 1) {
            path += this._folderDelimiter;
        }
        
        return path;
    };
    
    PathResolver.prototype._removeFirstSlashIfNeeded = function (path) {
        if (path.indexOf(this._folderDelimiter) === 0) {
            path = path.substring(1);
        }
        
        return path;
    };
    
    PathResolver.prototype._resolveLocalRelativePath = function (toPath) {
        if (toPath.indexOf("." + this._folderDelimiter) === 0) {
            toPath = toPath.substring(2);
        }
        
        return toPath;
    };
    
    PathResolver.prototype._resolveParentRelativePath = function (toPath) {
        var pathParts = this._path.split(this._folderDelimiter);
        var toPathParts = toPath.split(this._folderDelimiter);
        
        while (toPathParts[0] === "..") {
            pathParts.pop();
            toPathParts.shift();
        }
        
        var root = this._addLastSlashIfNeeded(pathParts.join(this._folderDelimiter));
        root = root === "" ? this._folderDelimiter : root;
        
        toPath = this._removeFirstSlashIfNeeded(toPathParts.join(this._folderDelimiter));
        this._path = root + toPath;
        
        return this._path;
    };
    
    PathResolver.prototype.resolve = function (toPath) {
        if (toPath.substring(0, 1) !== ".") {
            return this._path = toPath;
        }
        
        this._path = this._removeFileFromPath();
        
        toPath = this._resolveLocalRelativePath(toPath);
        return this._resolveParentRelativePath(toPath);
        
    };
    
    PathResolver.prototype.toString = function () {
        return this._path;
    };
    
    PathResolver.prototype.getPath = function () {
        return this._path;
    };
    
    PathResolver.prototype.setPath = function (value) {
        if (typeof value === "string") {
            this._path = value;
        }
    };
    
    BASE.web.PathResolver = PathResolver;

});