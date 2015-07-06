var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.jira.JiraProvider",
    "BASE.jira.JiraDataConverter",
    "BASE.web.MockAjaxProvider",
    "BASE.query.Queryable",
    "BASE.data.Edm"
], function () {
    
    var JiraProvider = BASE.jira.JiraProvider;
    var Edm = BASE.data.Edm;
    var MockAjaxProvider = BASE.web.MockAjaxProvider;
    var Queryable = BASE.query.Queryable;
    var JiraDataConverter = BASE.jira.JiraDataConverter;
    var dataConverter = new JiraDataConverter();
    
    var isMatch = function (message) {
        return function (error) {
            return message === error.message;
        };
    };
    
    exports["BASE.jira.JiraProvider: Without url."] = function () {
        assert.throws(function () {
            var provider = new JiraProvider();
        }, isMatch("JiraProvider: Null argumentexception - url"));
    };
    
    exports["BASE.jira.JiraProvider: Without ajaxProvider."] = function () {
        assert.throws(function () {
            var provider = new JiraProvider({
                url: ""
            });
            
        }, isMatch("JiraProvider: Null argument exception - ajaxProvider"));
    };
    
    exports["BASE.jira.JiraProvider: Without model."] = function () {
        assert.throws(function () {
            var mockAjaxProvider = new MockAjaxProvider();
            
            var provider = new JiraProvider({
                ajaxProvider: mockAjaxProvider,
                url: ""
            });
        }, isMatch("JiraProvider: Null argument exception - model"));
    };
    
    exports["BASE.jira.JiraProvider: Without edm."] = function () {
        assert.throws(function () {
            var mockAjaxProvider = new MockAjaxProvider();
            
            var provider = new JiraProvider({
                ajaxProvider: mockAjaxProvider,
                url: "",
                model: { type: Object, properties: {} }
            });
        }, isMatch("JiraProvider: Null argument exception - edm"));
    };
    
    //exports["BASE.jira.JiraProvider: Count."] = function () {
    //    var mockAjaxProvider = new MockAjaxProvider({
    //        handler: function (options) {
    //            assert.equal("https://api2.leavitt.com/People?$top=0&$count=true", options.url);
                
    //            var response = {
    //                "@odata.context": "https://leavittsoftware.atlassian.net/rest/api/2/search" ,
    //                "@odata.count": 439,
    //                "value": []
    //            };
                
    //            return MockAjaxProvider.createOKXhrResponse(JSON.stringify(response));

    //        },
    //        dataConverter: dataConverter
    //    });
        
    //    var provider = new JiraProvider({
    //        url: "https://api2.leavitt.com/People/",
    //        ajaxProvider: mockAjaxProvider,
    //        model: { type: Object, properties: {} },
    //        edm: new Edm()
    //    });
        
    //    provider.count(new Queryable()).then(function (count) {
    //        assert.equal(439, count);
    //    });
    //};
    
    //exports["BASE.jira.JiraProvider: ToArray."] = function () {
        
    //    var mockAjaxProvider = new MockAjaxProvider({
    //        handler: function (options) {
    //            assert.equal("https://api.leavitt.com/SalesAppUserPersonRoles", options.url);
                
    //            var response = {
    //                "@odata.context": "https://api2.leavitt.com/$metadata#SalesAppUserPersonRoles" ,
    //                "value": [
    //                    {
    //                        "PersonId": 13244,
    //                        "StartDate": "2011-01-01T00:00:00Z",
    //                        "EndDate": null,
    //                        "Id": 698946,
    //                        "CreatedDate": "2015-03-23T15:35:38.1843313-06:00",
    //                        "LastModifiedDate": "2015-03-23T15:35:38.1843313-06:00"
    //                    },
    //                    {
    //                        "PersonId": 9614,
    //                        "StartDate": "2005-04-01T00:00:00Z",
    //                        "EndDate": null,
    //                        "Id": 698947,
    //                        "CreatedDate": "2015-03-23T15:35:38.1843313-06:00",
    //                        "LastModifiedDate": "2015-03-23T15:35:38.1843313-06:00"
    //                    }
    //                ]
    //            };
                
    //            return MockAjaxProvider.createOKXhrResponse(JSON.stringify(response));
    //        },
    //        dataConverter: dataConverter
    //    });
        
    //    var provider = new JiraProvider({
    //        url: "https://api.leavitt.com/SalesAppUserPersonRoles/",
    //        ajaxProvider: mockAjaxProvider,
    //        model: {
    //            type: Object,
    //            properties: {}
    //        },
    //        edm: new Edm()
    //    });
        
    //    provider.toArray(new Queryable()).then(function (array) {
    //        assert.equal(2, array.length);
    //    }).ifError(function () {
    //        assert.fail();
    //    });
    //};
    
    //exports["BASE.jira.JiraProvider: ToArray without value property."] = function () {
        
    //    var mockAjaxProvider = new MockAjaxProvider({
    //        handler: function (options) {
    //            var response = {
    //                "maxResults": 50,
    //                "total": 439
    //            };
                
    //            return MockAjaxProvider.createOKXhrResponse(JSON.stringify(response));
                
    //        },
    //        dataConverter: dataConverter
    //    });
        
    //    var provider = new JiraProvider({
    //        url: "https://api.leavitt.com/SalesAppUserPersonRoles/",
    //        ajaxProvider: mockAjaxProvider,
    //        model: {
    //            type: Object,
    //            properties: {}
    //        },
    //        edm: new Edm()
    //    });
        
    //    provider.toArray(new Queryable()).then(function (result) {
    //        assert.fail();
    //    }).ifError(function (error) {
    //        assert.equal(error.message, "XHR response does not contain expected value node.");
    //    });
    //};
    
    
    //exports["BASE.jira.JiraProvider: ToArrayWithCount."] = function () {
        
    //    var mockAjaxProvider = new MockAjaxProvider({
    //        handler: function (options) {
    //            assert.equal("https://api.leavitt.com/SalesAppUserPersonRoles?$count=true", options.url);
                
    //            var response = {
    //                "@odata.context": "https://api2.leavitt.com/$metadata#SalesAppUserPersonRoles" ,
    //                "@odata.count": 439,
    //                "value": [
    //                    {
    //                        "PersonId": 13244,
    //                        "StartDate": "2011-01-01T00:00:00Z",
    //                        "EndDate": null,
    //                        "Id": 698946,
    //                        "CreatedDate": "2015-03-23T15:35:38.1843313-06:00",
    //                        "LastModifiedDate": "2015-03-23T15:35:38.1843313-06:00"
    //                    },
    //                    {
    //                        "PersonId": 9614,
    //                        "StartDate": "2005-04-01T00:00:00Z",
    //                        "EndDate": null,
    //                        "Id": 698947,
    //                        "CreatedDate": "2015-03-23T15:35:38.1843313-06:00",
    //                        "LastModifiedDate": "2015-03-23T15:35:38.1843313-06:00"
    //                    }
    //                ]
    //            };
                
    //            return MockAjaxProvider.createOKXhrResponse(JSON.stringify(response));
                
    //        },
    //        dataConverter: dataConverter
    //    });
        
    //    var provider = new JiraProvider({
    //        url: "https://api.leavitt.com/SalesAppUserPersonRoles/",
    //        ajaxProvider: mockAjaxProvider,
    //        model: {
    //            type: Object,
    //            properties: {}
    //        },
    //        edm: new Edm()
    //    });
        
    //    provider.toArrayWithCount(new Queryable()).then(function (result) {
    //        var array = result.array;
    //        var count = result.count;
    //        assert.equal(2, array.length);
    //        assert.equal(439, count);
    //    }).ifError(function () {
    //        assert.fail();
    //    });
    //};
    
    //exports["BASE.jira.JiraProvider: ToArrayWithCount without value property."] = function () {
        
    //    var mockAjaxProvider = new MockAjaxProvider({
    //        handler: function (options) {
    //            var response = {
    //                "@odata.context": "https://api2.leavitt.com/$metadata#SalesAppUserPersonRoles" ,
    //                "@odata.count": 439
    //            };
                
    //            return MockAjaxProvider.createOKXhrResponse(JSON.stringify(response));
                
    //        },
    //        dataConverter: dataConverter
    //    });
        
    //    var provider = new JiraProvider({
    //        url: "https://api.leavitt.com/SalesAppUserPersonRoles/",
    //        ajaxProvider: mockAjaxProvider,
    //        model: {
    //            type: Object,
    //            properties: {}
    //        },
    //        edm: new Edm()
    //    });
        
    //    provider.toArrayWithCount(new Queryable()).then(function (result) {
    //        assert.fail();
    //    }).ifError(function (error) {
    //        assert.equal(error.message, "XHR response does not contain expected value node.");
    //    });
    //};
    
});