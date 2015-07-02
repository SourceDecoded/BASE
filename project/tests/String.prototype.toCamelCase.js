var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "String.prototype.toCamelCase"
], function () {
    
    exports["String.prototype.toCamelCase: Successfully changes string."] = function () {
        var string = "PascalCased";
        var camelCased = string.toCamelCase();
        
        assert.equal(camelCased, "pascalCased");
    };
    
    exports["String.prototype.toCamelCase: Successfully not change string."] = function () {
        var string = "LGPascalCased";
        var camelCased = string.toCamelCase();
        
        assert.equal(camelCased, "LGPascalCased");
    };

    exports["String.prototype.toCamelCase: Successfully changed string given a delimiter of '-'."] = function () {
        var string = "string-to-convert";
        var camelCased = string.toCamelCase("-");
        
        assert.equal(camelCased, "stringToConvert");
    };
    
    exports["String.prototype.toCamelCase: Successfully changed string given a delimiter of ' '."] = function () {
        var string = "Im a sentence to camel case";
        var camelCased = string.toCamelCase(" ");
        
        assert.equal(camelCased, "imASentenceToCamelCase");
    };

    exports["String.prototype.toCamelCase: Successfully did not change string given a delimiter of null."] = function () {
        var string = "string-to-convert";
        var camelCased = string.toCamelCase(null);
        
        assert.equal(camelCased, "string-to-convert");
    };

    exports["String.prototype.toCamelCase: Successfully did not change string given a delimiter of ''."] = function () {
        var string = "string-to-convert";
        var camelCased = string.toCamelCase("");
        
        assert.equal(camelCased, "string-to-convert");
    };

    exports["String.prototype.toCamelCase: Successfully change LG string given a delimiter of '-'."] = function () {
        var string = "LG-string-to-convert";
        var camelCased = string.toCamelCase("-");
        
        assert.equal(camelCased, "LGStringToConvert");
    };

});