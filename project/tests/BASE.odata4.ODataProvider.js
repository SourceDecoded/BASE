var assert = require('assert');

require('../BASE.js');
BASE.require.loader.setRoot('./');

BASE.require([
    'BASE.odata4.ODataProvider',
    'BASE.web.MockAjaxProvider',
    'BASE.query.Queryable'
], function () {
    
    var ODataProvider = BASE.odata4.ODataProvider;
    var MockAjaxProvider = BASE.web.MockAjaxProvider;
    var Queryable = BASE.query.Queryable;
    
    var isMatch = function (message) {
        return function (error) {
            return message === error.message;
        };
    };
    
    exports['BASE.odata4.ODataProvider: Without url.'] = function () {
        assert.throws(function () {
            var provider = new ODataProvider();
        }, isMatch("ODataProvider: Null argument error, url cannot be undefined."));
    };
    
    exports['BASE.odata4.ODataProvider: Without ajaxProvider.'] = function () {
        assert.throws(function () {
            var provider = new ODataProvider({
                url: ""
            });
            
        }, isMatch("ODataProvider: Null argument error, ajaxProvider cannot be undefined."));
    };
    
    exports['BASE.odata4.ODataProvider: Without model.'] = function () {
        assert.throws(function () {
            var mockAjaxProvider = new MockAjaxProvider();
            
            var provider = new ODataProvider({
                ajaxProvider: mockAjaxProvider,
                url: ""
            });
        }, isMatch("ODataProvider: Null argument error, a model and a model type must be defined."));
    };
    
    exports['BASE.odata4.ODataProvider: Count.'] = function () {
        var mockAjaxProvider = new MockAjaxProvider({
            handler: function (options) {
                assert.equal("https://api2.leavitt.com/People?$top=0&$count=true", options.url);
                
                var response = {
                    "@odata.context": "https://api2.leavitt.com/$metadata#SalesAppUserPersonRoles" ,
                    "@odata.count": 439,
                    "value": []
                };
                
                return JSON.stringify(response);
            }
        });
        
        var provider = new ODataProvider({
            url: "https://api2.leavitt.com/People/",
            ajaxProvider: mockAjaxProvider,
            model: { type: Object, properties: {} }
        });
        
        provider.count(new Queryable()).then(function (count) {
            assert.equal(439, count);
        });
    };
    
    exports['BASE.odata4.ODataProvider: ToArray.'] = function () {
        
        var mockAjaxProvider = new MockAjaxProvider({
            handler: function (options) {
                assert.equal("https://api.leavitt.com/SalesAppUserPersonRoles", options.url);
                
                var response = {
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
                };
                
                return JSON.stringify(response);
            }
        });
        
        var provider = new ODataProvider({
            url: "https://api.leavitt.com/SalesAppUserPersonRoles/",
            ajaxProvider: mockAjaxProvider,
            model: {
                type: Object,
                properties: {}
            }
        });
        
        provider.toArray(new Queryable()).then(function (array) {
            assert.equal(2, array.length);
        }).ifError(function () {
            assert.fail();
        });
    };
    
    exports['BASE.odata4.ODataProvider: ToArray with invalid JSON.'] = function () {
        var mockAjaxProvider = new MockAjaxProvider({
            handler: function () {
                var response = "";
                return response;
            }
        });
        
        var provider = new ODataProvider({
            url: "https://api.leavitt.com/SalesAppUserPersonRoles/",
            ajaxProvider: mockAjaxProvider,
            model: {
                type: Object,
                properties: {}
            }
        });
        
        provider.toArray(new Queryable()).ifError(function (error) {
            assert.equal("Ajax request for 'https://api.leavitt.com/SalesAppUserPersonRoles' returned invalid json.", error.message);
        }).try();
    };
    
    exports['BASE.odata4.ODataProvider: ToArray with no value property.'] = function () {
        var mockAjaxProvider = new MockAjaxProvider({
            handler: function () {
                return JSON.stringify({ nvalue: [] });
            }
        });
        
        var provider = new ODataProvider({
            url: "https://api.leavitt.com/SalesAppUserPersonRoles/",
            ajaxProvider: mockAjaxProvider,
            model: {
                type: Object,
                properties: {}
            }
        });
        
        provider.toArray(new Queryable()).ifError(function (error) {
            assert.equal("Ajax request for 'https://api.leavitt.com/SalesAppUserPersonRoles' value property missing.", error.message);
        }).try();
    };
    
    exports['BASE.odata4.ODataProvider: Ajax Error.'] = function () {
        var mockAjaxProvider = new MockAjaxProvider();
        
        var provider = new ODataProvider({
            url: "https://api.leavitt.com/SalesAppUserPersonRoles/",
            ajaxProvider: mockAjaxProvider,
            model: {
                type: Object,
                properties: {}
            }
        });
        
        provider.toArray(new Queryable()).ifError(function (error) {
            assert.equal(BASE.data.responses.ConnectionErrorResponse, error.constructor);
        }).try();
    };
    
    exports['BASE.odata4.ODataProvider: ToArrayWithCount.'] = function () {
        
        var mockAjaxProvider = new MockAjaxProvider({
            handler: function (options) {
                assert.equal("https://api.leavitt.com/SalesAppUserPersonRoles?$count=true", options.url);
                
                var response = {
                    "@odata.context": "https://api2.leavitt.com/$metadata#SalesAppUserPersonRoles" ,
                    "@odata.count": 439,
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
                };
                
                return JSON.stringify(response);
            }
        });
        
        var provider = new ODataProvider({
            url: "https://api.leavitt.com/SalesAppUserPersonRoles/",
            ajaxProvider: mockAjaxProvider,
            model: {
                type: Object,
                properties: {}
            }
        });
        
        provider.toArrayWithCount(new Queryable()).then(function (result) {
            var array = result.array;
            var count = result.count;
            assert.equal(2, array.length);
            assert.equal(439, count);
        }).ifError(function () {
            assert.fail();
        });
    };
    
    exports['BASE.odata4.ODataProvider: ToArrayWithCount with invalid JSON.'] = function () {
        var mockAjaxProvider = new MockAjaxProvider({
            handler: function () {
                var response = "";
                return response;
            }
        });
        
        var provider = new ODataProvider({
            url: "https://api.leavitt.com/SalesAppUserPersonRoles/",
            ajaxProvider: mockAjaxProvider,
            model: {
                type: Object,
                properties: {}
            }
        });
        
        provider.toArrayWithCount(new Queryable()).ifError(function (error) {
            assert.equal("Ajax request for 'https://api.leavitt.com/SalesAppUserPersonRoles?$count=true' returned invalid json.", error.message);
        }).try();
    };
    
    exports['BASE.odata4.ODataProvider: ToArrayWithCount with no value property.'] = function () {
        var mockAjaxProvider = new MockAjaxProvider({
            handler: function () {
                return JSON.stringify({ nvalue: [] });
            }
        });
        
        var provider = new ODataProvider({
            url: "https://api.leavitt.com/SalesAppUserPersonRoles/",
            ajaxProvider: mockAjaxProvider,
            model: {
                type: Object,
                properties: {}
            }
        });
        
        provider.toArrayWithCount(new Queryable()).ifError(function (error) {
            assert.equal("Ajax request for 'https://api.leavitt.com/SalesAppUserPersonRoles?$count=true' value property missing.", error.message);
        }).try();
    };
    
    exports['BASE.odata4.ODataProvider: ToArrayWithCount Ajax Error.'] = function () {
        var mockAjaxProvider = new MockAjaxProvider();
        
        var provider = new ODataProvider({
            url: "https://api.leavitt.com/SalesAppUserPersonRoles/",
            ajaxProvider: mockAjaxProvider,
            model: {
                type: Object,
                properties: {}
            }
        });
        
        provider.toArrayWithCount(new Queryable()).ifError(function (error) {
            assert.equal(BASE.data.responses.ConnectionErrorResponse, error.constructor);
        }).try();
    };
    
});