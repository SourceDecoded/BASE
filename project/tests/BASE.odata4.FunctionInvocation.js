var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.web.MockAjaxProvider",
    "BASE.odata4.OData4DataConverter",
    "BASE.odata4.FunctionInvocation"
], function () {
    
    var MockAjaxProvider = BASE.web.MockAjaxProvider;
    var OData4DataConverter = BASE.odata4.OData4DataConverter;
    var dataConverter = new OData4DataConverter();
    var FunctionInvocation = BASE.odata4.FunctionInvocation;
    
    var isMatch = function (message) {
        return function (error) {
            return message === error.message;
        };
    };
    
    exports["BASE.odata4.FunctionInvocation: null ajaxProvider"] = function () {
        assert.throws(function () {
            new FunctionInvocation();
        }, isMatch("Null Argument Exception: ajax needs to be defined."));
    };
    
    
    exports["BASE.odata4.FunctionInvocation: invokeAsync without arguments."] = function () {
        var ajaxProvider = new MockAjaxProvider({
            dataConverter: dataConverter
        });
        
        ajaxProvider.addResponseHandlerByPath("https://api.leavitt.com/GetLocations", function () {
            var response = ["Cedar City", "St George"];
            var json = JSON.stringify(response);
            
            return {
                response: json,
                responseText: json,
                responseType: "text",
                status: 200,
                statusText: "200 OK"
            };
        });
        
        var functionInvocation = new FunctionInvocation(ajaxProvider);
        
        functionInvocation.invokeAsync("https://api.leavitt.com/", "GetLocations").then(function (locations) {
            assert.equal(locations[0], "Cedar City");
            assert.equal(locations[1], "St George");
        }).ifError(function (error) {
            assert.fail("Unexpected error with invokeAsync \"GetLocations\".");
        });
    };
    
    exports["BASE.odata4.FunctionInvocation: invokeAsync with arguments."] = function () {
        var ajaxProvider = new MockAjaxProvider({
            dataConverter: dataConverter
        });
        
        ajaxProvider.addResponseHandlerByPath("https://api.leavitt.com/GetLocationsByState(State='Utah')", function () {
            var response = ["Cedar City", "St George"];
            var json = JSON.stringify(response);
            
            return {
                response: json,
                responseText: json,
                responseType: "text",
                status: 200,
                statusText: "200 OK"
            };
        });
        
        var functionInvocation = new FunctionInvocation(ajaxProvider);
        
        functionInvocation.invokeAsync("https://api.leavitt.com/", "GetLocationsByState", {
            State: "Utah"
        }).then(function (locations) {
            assert.equal(locations[0], "Cedar City");
            assert.equal(locations[1], "St George");
        }).ifError(function (error) {
            assert.fail("Unexpected error with invokeAsync \"GetLocations\".");
        });
    };

    exports["BASE.odata4.FunctionInvocation: buildUrl with arguments."] = function () {
        var ajaxProvider = new MockAjaxProvider({
            dataConverter: dataConverter
        });
        
        ajaxProvider.addResponseHandlerByPath("https://api.leavitt.com/GetLocationsByState(State='Utah')", function () {
            var response = ["Cedar City", "St George"];
            var json = JSON.stringify(response);
            
            return {
                response: json,
                responseText: json,
                responseType: "text",
                status: 200,
                statusText: "200 OK"
            };
        });
        
        var functionInvocation = new FunctionInvocation(ajaxProvider);

        var result = functionInvocation.buildUrl("https://api.leavitt.com/", "GetLocationsByState", {
            State: "Utah"
        });

        assert.equal(result, "https://api.leavitt.com/GetLocationsByState(State='Utah')");
    };
   
});