var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "String.prototype.toPascalCase"
], function () {
    
    exports["String.prototype.toPascalCase: Successfully changes string."] = function () {
        var string = "camelCased";
        var pascalCased = string.toPascalCase();
        
        assert.equal(pascalCased, "CamelCased");
    };

    exports["String.prototype.toPascalCase: Successfully changed string given a delimiter of '-'."] = function () {
        var string = "string-to-convert";
        var pascalCased = string.toPascalCase("-");
        
        assert.equal(pascalCased, "StringToConvert");
    };
    
    exports["String.prototype.toPascalCase: Successfully changed string given a delimiter of ' '."] = function () {
        var string = "Im a sentence to pascal case";
        var pascalCased = string.toPascalCase(" ");
        
        assert.equal(pascalCased, "ImASentenceToPascalCase");
    };

    exports["String.prototype.toPascalCase: Successfully did not change string given a delimiter of null."] = function () {
        var string = "string-to-convert";
        var pascalCased = string.toPascalCase(null);
        
        assert.equal(pascalCased, "String-to-convert");
    };

    exports["String.prototype.toPascalCase: Successfully did not change string given a delimiter of ''."] = function () {
        var string = "string-to-convert";
        var pascalCased = string.toPascalCase("");
        
        assert.equal(pascalCased, "String-to-convert");
    };

});