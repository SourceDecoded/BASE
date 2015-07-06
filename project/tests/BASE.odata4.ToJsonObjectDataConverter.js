var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.odata4.ToJsonObjectDataConverter",
    "BASE.web.MockAjaxProvider",
    "BASE.data.responses.ValidationErrorResponse",
    "BASE.data.responses.ConnectionErrorResponse",
    "BASE.data.responses.ForbiddenErrorResponse",
    "BASE.data.responses.UnauthorizedErrorResponse",
    "BASE.data.responses.EntityNotFoundErrorResponse"
], function () {
    
    var ToJsonObjectDataConverter = BASE.odata4.ToJsonObjectDataConverter;
    var MockAjaxProvider = BASE.web.MockAjaxProvider;
    var ValidationErrorResponse = BASE.data.responses.ValidationErrorResponse;
    var UnauthorizedErrorResponse = BASE.data.responses.UnauthorizedErrorResponse;
    var ForbiddenErrorResponse = BASE.data.responses.ForbiddenErrorResponse;
    var EntityNotFoundErrorResponse = BASE.data.responses.EntityNotFoundErrorResponse;
    var ConnectionErrorResponse = BASE.data.responses.ConnectionErrorResponse;
    
    var isMatch = function (message) {
        return function (error) {
            return message === error.message;
        };
    };
    
    exports["BASE.odata4.ToJsonObjectDataConverter: null arg - xhr"] = function () {
        assert.throws(function () {
            new ToJsonObjectDataConverter().handleResponseAsync();
        }, isMatch("Null Argument Exception: xhr is undefined or null"));
    };
    
    exports["BASE.odata4.ToJsonObjectDataConverter: invalid JSON."] = function () {
        
        var invalidJsonXhr = MockAjaxProvider.createOKXhrResponse("");
        
        new ToJsonObjectDataConverter().handleResponseAsync(invalidJsonXhr).ifError(function (error) {
            assert.equal("XHR response contains invalid json.", error.message);
        }).try();
    };
    
    exports["BASE.odata4.ToJsonObjectDataConverter: value node missing"] = function () {
        
        var invalidJsonXhr = MockAjaxProvider.createOKXhrResponse("{}");
        
        new ToJsonObjectDataConverter().handleResponseAsync(invalidJsonXhr).ifError(function (error) {
            assert.equal("XHR response does not contain expected value node.", error.message);
        }).try();
    };
    
    exports["BASE.odata4.ToJsonObjectDataConverter: parsed json"] = function () {
        
        var invalidJsonXhr = MockAjaxProvider.createOKXhrResponse(JSON.stringify({
            "@odata.context": "https://api2.leavitt.com/$metadata#SalesAppUserPersonRoles" ,
            "value": [
                {
                    "PersonId": 13244,
                    "StartDate": "2011-01-01T00:00:00Z",
                    "EndDate": null,
                    "Id": 698946,
                    "CreatedDate": "2015-03-23T15:35:38.1843313-06:00",
                    "LastModifiedDate": "2015-03-23T15:35:38.1843313-06:00"
                },
                {
                    "PersonId": 9614,
                    "StartDate": "2005-04-01T00:00:00Z",
                    "EndDate": null,
                    "Id": 698947,
                    "CreatedDate": "2015-03-23T15:35:38.1843313-06:00",
                    "LastModifiedDate": "2015-03-23T15:35:38.1843313-06:00"
                }
            ]
        }));
        
        new ToJsonObjectDataConverter().handleResponseAsync(invalidJsonXhr).chain(function (jsonObject) {
            assert.equal(2, jsonObject.value.length);

        }).ifError(function (error) {
            assert.fail(error);
        }).try();
    };
    
    exports["BASE.odata4.ToJsonObjectDataConverter: handleErrorResponseAsync - 0"] = function () {
        var xhr = MockAjaxProvider.createErrorXhrResponse();
        
        new ToJsonObjectDataConverter().handleErrorResponseAsync(xhr).chain(function () {
            assert.fail();
        }).ifError(function (error) {
            assert.equal(ConnectionErrorResponse, error.constructor);
        }).try();
    };
    
    exports["BASE.odata4.ToJsonObjectDataConverter: handleErrorResponseAsync - 400"] = function () {
        var xhr = MockAjaxProvider.createCustomErrorXhrResponse(400, "What ev");
        
        new ToJsonObjectDataConverter().handleErrorResponseAsync(xhr).chain(function () {
            assert.fail();
        }).ifError(function (error) {
            assert.equal(ValidationErrorResponse, error.constructor);
        }).try();
    };
    
    exports["BASE.odata4.ToJsonObjectDataConverter: handleErrorResponseAsync - 401"] = function () {
        var xhr = MockAjaxProvider.createCustomErrorXhrResponse(401, "What ev");
        
        new ToJsonObjectDataConverter().handleErrorResponseAsync(xhr).chain(function () {
            assert.fail();
        }).ifError(function (error) {
            assert.equal(UnauthorizedErrorResponse, error.constructor);
        }).try();
    };
    
    exports["BASE.odata4.ToJsonObjectDataConverter: handleErrorResponseAsync - 403"] = function () {
        var xhr = MockAjaxProvider.createCustomErrorXhrResponse(403, "What ev");
        
        new ToJsonObjectDataConverter().handleErrorResponseAsync(xhr).chain(function () {
            assert.fail();
        }).ifError(function (error) {
            assert.equal(ForbiddenErrorResponse, error.constructor);
        }).try();
    };
    
    exports["BASE.odata4.ToJsonObjectDataConverter: handleErrorResponseAsync - 404"] = function () {
        var xhr = MockAjaxProvider.createCustomErrorXhrResponse(404, "What ev");
        
        new ToJsonObjectDataConverter().handleErrorResponseAsync(xhr).chain(function () {
            assert.fail();
        }).ifError(function (error) {
            assert.equal(EntityNotFoundErrorResponse, error.constructor);
        }).try();
    };
    
    exports["BASE.odata4.ToJsonObjectDataConverter: handleRequestAsync"] = function () {
        var options = {
            data: {
                firstName: "Jared",
                lastName: "Barnes"
            }
        };
        
        new ToJsonObjectDataConverter().handleRequestAsync(options).chain(function () {
            var obj = JSON.parse(options.data);
            
            assert.equal(obj.FirstName, "Jared");
            assert.equal(obj.LastName, "Barnes");

        }).ifError(function (error) {
            assert.fail();
        }).try();
    };

});