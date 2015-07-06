var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.web.PathResolver"
], function () {
    
    var PathResolver = BASE.web.PathResolver;
    
    exports["BASE.web.PathResolver: Linux path test."] = function () {
        
        var directory = "/home/users";
        
        var directoryResolve = new PathResolver(directory);
        var directoryResolve2 = new PathResolver(directory);
        var directoryResolve3 = new PathResolver(directory);
        var directoryResolve4 = new PathResolver(directory);
        var directoryResolve5 = new PathResolver("/home/users/file.jpeg");
        
        var newDirectory = directoryResolve.resolve("./hello there");
        assert.equal(newDirectory, "/home/users/hello there");
        
        var newDirectory2 = directoryResolve2.resolve("../hello there");
        assert.equal(newDirectory2, "/home/hello there");
        
        var newDirectory3 = directoryResolve3.resolve("../../hello there");
        assert.equal(newDirectory3, "/hello there");
        
        var newDirectory4 = directoryResolve4.resolve("/hello there");
        assert.equal(newDirectory4, "/hello there");

        var newDirectory5 = directoryResolve5.resolve("./hello there");
        assert.equal(newDirectory5, "/home/users/hello there");

    };
    
    exports["BASE.web.PathResolver: Url path test."] = function () {
        
        var directory = "https://google.com/home/users";
        
        var directoryResolve = new PathResolver(directory);
        var directoryResolve2 = new PathResolver(directory);
        var directoryResolve3 = new PathResolver(directory);
        var directoryResolve4 = new PathResolver(directory);
        var directoryResolve5 = new PathResolver(directory +"/file.jpeg");
        
        var newDirectory = directoryResolve.resolve("./hello there");
        assert.equal(newDirectory, "https://google.com/home/users/hello there");
        
        var newDirectory2 = directoryResolve2.resolve("./../hello there");
        assert.equal(newDirectory2, "https://google.com/home/hello there");
        
        var newDirectory3 = directoryResolve3.resolve("../../hello there");
        assert.equal(newDirectory3, "https://google.com/hello there");
        
        var newDirectory4 = directoryResolve4.resolve("/hello there");
        assert.equal(newDirectory4, "/hello there");
        
        var newDirectory5 = directoryResolve5.resolve("./hello there");
        assert.equal(newDirectory5, "https://google.com/home/users/hello there");

    };
    
    
    exports["BASE.web.PathResolver: Windows path test."] = function () {
        
        var directory = "C:\\Home\\Users";
        
        var windowsConfig = {
            folderDelimiter: "\\"
        };
        
        var directoryResolve = new PathResolver(directory, windowsConfig);
        var directoryResolve2 = new PathResolver(directory, windowsConfig);
        var directoryResolve3 = new PathResolver(directory, windowsConfig);
        var directoryResolve4 = new PathResolver(directory, windowsConfig);
        var directoryResolve5 = new PathResolver(directory, windowsConfig);
        var directoryResolve6 = new PathResolver(directory, windowsConfig);
        
        var newDirectory = directoryResolve.resolve(".\\hello there");
        assert.equal(newDirectory, "C:\\Home\\Users\\hello there");
        
        var newDirectory2 = directoryResolve2.resolve("..\\hello there");
        assert.equal(newDirectory2, "C:\\Home\\hello there");
        
        var newDirectory3 = directoryResolve3.resolve("..\\..\\hello there");
        assert.equal(newDirectory3, "C:\\hello there");
        
        var newDirectory4 = directoryResolve4.resolve("..\\..\\..\\hello there");
        assert.equal(newDirectory4, "\\hello there");
        
        var newDirectory5 = directoryResolve5.resolve("\\hello there");
        assert.equal(newDirectory5, "\\hello there");

        var newDirectory6 = directoryResolve6.resolve("D:\\hello there");
        assert.equal(newDirectory6, "D:\\hello there");

    };
});