var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.odata4.toPascalCasedProperties"
], function () {
    
    exports["BASE.odata4.toPascalCasedProperties: Successfully changes property."] = function () {
        var object = {
            propertyOne: "one",
            propertyTwo: "two"
        };
        
        var objectWithCamelCasedProperties = BASE.odata4.toPascalCasedProperties(object);
        
        assert.equal(objectWithCamelCasedProperties.PropertyOne, "one");
        assert.equal(objectWithCamelCasedProperties.PropertyTwo, "two");
    };
    
    exports["BASE.odata4.toPascalCasedProperties: Successfully changes the appropriate property."] = function () {
        var object = {
            propertyOne: "one",
            PropertyTwo: "two"
        };
        
        var objectWithCamelCasedProperties = BASE.odata4.toPascalCasedProperties(object);
        
        assert.equal(objectWithCamelCasedProperties.PropertyOne, "one");
        assert.equal(objectWithCamelCasedProperties.PropertyTwo, "two");
    };
    
    exports["BASE.odata4.toPascalCasedProperties: Successfully does not change the properties."] = function () {
        var object = {
            "1": 1,
            "2": 2
        };
        
        var objectWithCamelCasedProperties = BASE.odata4.toPascalCasedProperties(object);
        
        assert.equal(objectWithCamelCasedProperties["1"], 1);
        assert.equal(objectWithCamelCasedProperties["2"], 2);
    };
    
    exports["BASE.odata4.toPascalCasedProperties: Successfully changes the nested properties."] = function () {
        var object = {
            "1": 1,
            "2": {
                "propertyOne": "one"
            }
        };
        
        var objectWithCamelCasedProperties = BASE.odata4.toPascalCasedProperties(object);
        
        assert.equal(objectWithCamelCasedProperties["1"], 1);
        assert.equal(objectWithCamelCasedProperties["2"].PropertyOne, "one");
    };
    
    exports["BASE.odata4.toPascalCasedProperties: Returns null if supplied with null."] = function () {
        var result = BASE.odata4.toPascalCasedProperties(null);
        assert.equal(result, null);
    };
    
    exports["BASE.odata4.toPascalCasedProperties:Returns undefined if supplied with undefined"] = function () {
        var result = BASE.odata4.toPascalCasedProperties(undefined);
        assert.equal(result, undefined);
    };

});