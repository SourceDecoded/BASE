var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.odata4.EndPoint",
    "BASE.web.MockAjaxProvider",
    "BASE.odata4.ToJsonObjectDataConverter",
    "BASE.query.Provider"
], function () {
    
    var EndPoint = BASE.odata4.EndPoint;
    var MockAjaxProvider = BASE.web.MockAjaxProvider;
    var Provider = BASE.query.Provider;
    var ToJsonObjectDataConverter = BASE.odata4.ToJsonObjectDataConverter;
    var dataConverter = new ToJsonObjectDataConverter();
    
    var isMatch = function (message) {
        return function (error) {
            return message === error.message;
        };
    };
    
    
    exports["BASE.odata4.EndPoint: null argument test url"] = function () {
        assert.throws(function () {
            new EndPoint();
            
        }, isMatch("EndPoint: Null Argument Exception - url needs to be a string."));
    };
    
    exports["BASE.odata4.EndPoint: null argument test queryProvider"] = function () {
        assert.throws(function () {
            new EndPoint({
                url: ""
            });

        }, isMatch("EndPoint: Null Argument Exception - queryProvider cannot be undefined."));
    };
    
    exports["BASE.odata4.EndPoint: null argument test ajaxProvider"] = function () {
        assert.throws(function () {
            new EndPoint({
                url: "",
                queryProvider: new Provider()
            });
            
        }, isMatch("EndPoint: Null Argument Exception - ajaxProvider cannot be undefined."));
    };
    
    
    
    exports["BASE.odata4.EndPoint: invokeInstanceFunction without arguments."] = function () {
        var ajaxProvider = new MockAjaxProvider({
            dataConverter: dataConverter
        });
        var config = {
            ajaxProvider: ajaxProvider,
            url: "https://api.leavitt.com/People",
            queryProvider: new Provider()
        };
        
        ajaxProvider.addResponseHandlerByPath("https://api.leavitt.com/People(1)/FullName", function () {
            
            var response = "Jared Barnes";
            
            var json = JSON.stringify(response);
            
            return {
                response: json,
                responseText: json,
                responseType: "text",
                status: 200,
                statusText: "200 OK"
            };
        });
        
        var endPoint = new EndPoint(config);
        
        // (key, methodName, argumentsObject);
        var future = endPoint.invokeInstanceFunction(1, "FullName");
        
        future.then(function (result) {
            assert.equal(result, "Jared Barnes");
        }).ifError(function (error) {
            assert.fail("Unexpected error with invokeInstanceMethod \"Fullname\".");
        });
    };
    
    exports["BASE.odata4.EndPoint: invokeInstanceFunction with arguments."] = function () {
        var ajaxProvider = new MockAjaxProvider({
            dataConverter: dataConverter
        });
        var config = {
            ajaxProvider: ajaxProvider,
            url: "https://api.leavitt.com/People",
            queryProvider: new Provider()
        };
        
        ajaxProvider.addResponseHandlerByPath("https://api.leavitt.com/People(1)/isEqualTo(FirstName='Jared')", function () {
            
            var response = true;
            var json = JSON.stringify(response);
            
            return {
                response: json,
                responseText: json,
                responseType: "text",
                status: 200,
                statusText: "200 OK"
            };
        });
        
        var endPoint = new EndPoint(config);
        
        // (key, methodName, argumentsObject);
        var future = endPoint.invokeInstanceFunction(1, "isEqualTo", { FirstName: "Jared" });
        
        future.then(function (result) {
            assert.equal(result, true);
        }).ifError(function (error) {
            assert.fail("Unexpected error with invokeInstanceMethod \"isEqualTo\".");
        });
    };
    
    exports['BASE.odata4.EndPoint: invokeClassFunction.'] = function () {
        var ajaxProvider = new MockAjaxProvider({
            dataConverter: dataConverter
        });
        var config = {
            ajaxProvider: ajaxProvider,
            url: 'https://api.leavitt.com/People',
            queryProvider: new Provider()
        };
        
        ajaxProvider.addResponseHandlerByPath('https://api.leavitt.com/People/Search(Name=\'Jared\')', function () {
            
            var response = [{
                    FirstName: 'Jared',
                    LastName: 'Barnes'
                }, {
                    FirstName: 'Jared',
                    LastName: 'Rucker'
                }];
            
            var json = JSON.stringify(response);
            
            return {
                response: json,
                responseText: json,
                responseType: 'text',
                status: 200,
                statusText: '200 OK'
            };
        });
        
        var endPoint = new EndPoint(config);
        
        var future = endPoint.invokeClassFunction('Search', { Name: 'Jared' });
        
        future.then(function (results) {
            assert.equal(results.length, 2);
            assert.equal(results[0].firstName, 'Jared');
            assert.equal(results[0].lastName, 'Barnes');
        }).ifError(function () {
            assert.fail('Unexpected error with invokeClassMethod "Search".');
        });
    };

});