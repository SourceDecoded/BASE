var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.odata4.ODataProvider",
    "BASE.web.MockAjaxProvider",
    "BASE.query.Queryable",
    "BASE.odata4.ToJsonObjectDataConverter",
    "BASE.data.Edm"
], function () {
    
    var ODataProvider = BASE.odata4.ODataProvider;
    var Edm = BASE.data.Edm;
    var MockAjaxProvider = BASE.web.MockAjaxProvider;
    var Queryable = BASE.query.Queryable;
    var ToJsonObjectDataConverter = BASE.odata4.ToJsonObjectDataConverter;
    var dataConverter = new ToJsonObjectDataConverter();
    
    var isMatch = function (message) {
        return function (error) {
            return message === error.message;
        };
    };
    
    exports["BASE.odata4.ODataProvider: Without url."] = function () {
        assert.throws(function () {
            var provider = new ODataProvider();
        }, isMatch("ODataProvider: Null argumentexception - url"));
    };
    
    exports["BASE.odata4.ODataProvider: Without ajaxProvider."] = function () {
        assert.throws(function () {
            var provider = new ODataProvider({
                url: ""
            });
            
        }, isMatch("ODataProvider: Null argument exception - ajaxProvider"));
    };
    
    exports["BASE.odata4.ODataProvider: Without model."] = function () {
        assert.throws(function () {
            var mockAjaxProvider = new MockAjaxProvider();
            
            var provider = new ODataProvider({
                ajaxProvider: mockAjaxProvider,
                url: ""
            });
        }, isMatch("ODataProvider: Null argument exception - model"));
    };
    
    exports["BASE.odata4.ODataProvider: Without edm."] = function () {
        assert.throws(function () {
            var mockAjaxProvider = new MockAjaxProvider();
            
            var provider = new ODataProvider({
                ajaxProvider: mockAjaxProvider,
                url: "",
                model: { type: Object, properties: {} }
            });
        }, isMatch("ODataProvider: Null argument exception - edm"));
    };
    
    exports["BASE.odata4.ODataProvider: Count."] = function () {
        var mockAjaxProvider = new MockAjaxProvider({
            handler: function (options) {
                assert.equal("https://api2.leavitt.com/People?$top=0&$count=true", options.url);
                
                var response = {
                    "@odata.context": "https://api2.leavitt.com/$metadata#SalesAppUserPersonRoles" ,
                    "@odata.count": 439,
                    "value": []
                };
                
                return MockAjaxProvider.createOKXhrResponse(JSON.stringify(response));

            },
            dataConverter: dataConverter
        });
        
        var provider = new ODataProvider({
            url: "https://api2.leavitt.com/People/",
            ajaxProvider: mockAjaxProvider,
            model: { type: Object, properties: {} },
            edm: new Edm()
        });
        
        provider.count(new Queryable()).then(function (count) {
            assert.equal(439, count);
        });
    };
    
    exports["BASE.odata4.ODataProvider: ToArray."] = function () {
        
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
                
                return MockAjaxProvider.createOKXhrResponse(JSON.stringify(response));
            },
            dataConverter: dataConverter
        });
        
        var provider = new ODataProvider({
            url: "https://api.leavitt.com/SalesAppUserPersonRoles/",
            ajaxProvider: mockAjaxProvider,
            model: {
                type: Object,
                properties: {}
            },
            edm: new Edm()
        });
        
        provider.toArray(new Queryable()).then(function (array) {
            assert.equal(2, array.length);
        }).ifError(function () {
            assert.fail();
        });
    };
    
    exports["BASE.odata4.ODataProvider: ToArray without value property."] = function () {
        
        var mockAjaxProvider = new MockAjaxProvider({
            handler: function (options) {
                var response = {
                    "@odata.context": "https://api2.leavitt.com/$metadata#SalesAppUserPersonRoles" ,
                    "@odata.count": 439
                };
                
                return MockAjaxProvider.createOKXhrResponse(JSON.stringify(response));
                
            },
            dataConverter: dataConverter
        });
        
        var provider = new ODataProvider({
            url: "https://api.leavitt.com/SalesAppUserPersonRoles/",
            ajaxProvider: mockAjaxProvider,
            model: {
                type: Object,
                properties: {}
            },
            edm: new Edm()
        });
        
        provider.toArray(new Queryable()).then(function (result) {
            assert.fail();
        }).ifError(function (error) {
            assert.equal(error.message, "XHR response does not contain expected value node.");
        });
    };
    

    exports["BASE.odata4.ODataProvider: ToArrayWithCount."] = function () {
        
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
                
                return MockAjaxProvider.createOKXhrResponse(JSON.stringify(response));
                
            },
            dataConverter: dataConverter
        });
        
        var provider = new ODataProvider({
            url: "https://api.leavitt.com/SalesAppUserPersonRoles/",
            ajaxProvider: mockAjaxProvider,
            model: {
                type: Object,
                properties: {}
            },
            edm: new Edm()
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
    
    exports["BASE.odata4.ODataProvider: ToArrayWithCount without value property."] = function () {
        
        var mockAjaxProvider = new MockAjaxProvider({
            handler: function (options) {
                var response = {
                    "@odata.context": "https://api2.leavitt.com/$metadata#SalesAppUserPersonRoles" ,
                    "@odata.count": 439
                };
                
                return MockAjaxProvider.createOKXhrResponse(JSON.stringify(response));
                
            },
            dataConverter: dataConverter
        });
        
        var provider = new ODataProvider({
            url: "https://api.leavitt.com/SalesAppUserPersonRoles/",
            ajaxProvider: mockAjaxProvider,
            model: {
                type: Object,
                properties: {}
            },
            edm: new Edm()
        });
        
        provider.toArrayWithCount(new Queryable()).then(function (result) {
            assert.fail();
        }).ifError(function (error) {
            assert.equal(error.message, "XHR response does not contain expected value node.");
        });
    };
    
});