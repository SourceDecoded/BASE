var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.odata4.toCamelCasedProperties"
], function () {

    exports["BASE.odata4.toCamelCasedProperties: Successfully changes property."] = function () {
        var object = {
            PropertyOne: "one",
            PropertyTwo: "two"
        };
        
        var objectWithCamelCasedProperties = BASE.odata4.toCamelCasedProperties(object);
        
        assert.equal(objectWithCamelCasedProperties.propertyOne, "one");
        assert.equal(objectWithCamelCasedProperties.propertyTwo, "two");
    };
    
    exports["BASE.odata4.toCamelCasedProperties: Successfully changes the appropriate property."] = function () {
        var object = {
            PropertyOne: "one",
            propertyTwo: "two"
        };
        
        var objectWithCamelCasedProperties = BASE.odata4.toCamelCasedProperties(object);
        
        assert.equal(objectWithCamelCasedProperties.propertyOne, "one");
        assert.equal(objectWithCamelCasedProperties.propertyTwo, "two");
    };
    
    exports["BASE.odata4.toCamelCasedProperties: Successfully does not change the properties."] = function () {
        var object = {
            "1": 1,
            "2": 2
        };
        
        var objectWithCamelCasedProperties = BASE.odata4.toCamelCasedProperties(object);
        
        assert.equal(objectWithCamelCasedProperties["1"], 1);
        assert.equal(objectWithCamelCasedProperties["2"], 2);
    };
    
    exports["BASE.odata4.toCamelCasedProperties: Successfully changes the nested properties."] = function () {
        var object = {
            "1": 1,
            "2": {
                "PropertyOne": "one"
            }
        };
        
        var objectWithCamelCasedProperties = BASE.odata4.toCamelCasedProperties(object);
        
        assert.equal(objectWithCamelCasedProperties["1"], 1);
        assert.equal(objectWithCamelCasedProperties["2"].propertyOne, "one");
    };
    
    exports["BASE.odata4.toCamelCasedProperties: Returns null if supplied with null."] = function () {
        var result = BASE.odata4.toCamelCasedProperties(null);
        assert.equal(result, null);
    };

    exports["BASE.odata4.toCamelCasedProperties:Returns undefined if supplied with undefined"] = function () {
        var result = BASE.odata4.toCamelCasedProperties(undefined);
        assert.equal(result, undefined);
    };

});