var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.web.MockAjaxProvider"
], function () {
    
    MockAjaxProvider = BASE.web.MockAjaxProvider;
    
    var createAjaxProvider = function () {
        
        var ajaxProvider = new MockAjaxProvider({
            headers: {
                "X-LGToken": "sometoken",
                "X-AppId": "someId"
            }
        });
        
        return ajaxProvider;
    };
    
    exports["BASE.web.MockAjaxProvider: addResponseHandlerByMethod."] = function () {
        var ajaxProvider = createAjaxProvider();
        
        ajaxProvider.addResponseHandlerByMethod("PUT", function (request) {
            assert.equal(request.headers["X-LGToken"], "sometoken");
            
            return {
                response: "This is a put.",
                responseText: "This is a put.",
                responseType: "text",
                status: 200,
                statusText: "200 OK"
            };
        });
        
        ajaxProvider.request("https://api.leavitt.com/", {
            method: "PUT"
        }).then(function (response) {
            assert.equal(response.responseText, "This is a put.");
        });

    };
    
    exports["BASE.web.MockAjaxProvider: addResponseHandlerByPath, with string."] = function () {
        var ajaxProvider = createAjaxProvider();
        
        ajaxProvider.addResponseHandlerByPath("https://api.leavitt.com/", function (request) {
            
            assert.equal(request.headers["X-LGToken"], "sometoken");
            
            return {
                response: "This is an api",
                responseText: "This is an api",
                responseType: "text",
                status: 200,
                statusText: "200 OK"
            };
        });
        
        ajaxProvider.request("https://api.leavitt.com/", {
            method: "GET"
        }).then(function (response) {
            assert.equal(response.responseText, "This is an api");
        });

    };
    
    exports["BASE.web.MockAjaxProvider: addResponseHandlerByPath, with regEx."] = function () {
        var ajaxProvider = createAjaxProvider();
        
        ajaxProvider.addResponseHandlerByPath(/https/i, function (request) {
            
            assert.equal(request.headers["X-LGToken"], "sometoken");
            
            return {
                response: "This is an api",
                responseText: "This is an api",
                responseType: "text",
                status: 200,
                statusText: "200 OK"
            };
        });
        
        ajaxProvider.request("https://api.leavitt.com/", {
            method: "GET"
        }).then(function (response) {
            assert.equal(response.responseText, "This is an api");
        });

    };

});