var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.odata4.ODataProvider",
    "BASE.web.MockAjaxProvider",
    "BASE.query.Queryable",
    "BASE.odata4.OData4DataConverter",
    "BASE.data.testing.Edm",
    "BASE.data.testing.model.person",
    "BASE.data.testing.HumanoidType"
], function () {
    
    var ODataProvider = BASE.odata4.ODataProvider;
    var Edm = BASE.data.testing.Edm;
    var MockAjaxProvider = BASE.web.MockAjaxProvider;
    var Queryable = BASE.query.Queryable;
    var OData4DataConverter = BASE.odata4.OData4DataConverter;
    var dataConverter = new OData4DataConverter();
    var personModel = BASE.data.testing.model.person;
    var HumanoidType = BASE.data.testing.HumanoidType;
    
    var isMatch = function (message) {
        return function (error) {
            return message === error.message;
        };
    };
    var peopleUrl = "https://api2.leavitt.com/People";
    var ajaxResponse = {
        "@odata.context": "https://api2.leavitt.com/$metadata#People",
        "@odata.count": 19244,
        "value": [
            {
                "Id": 9337,
                "FirstName": "Roslyn",
                "LastName": "Lord",
                "DateOfBirth": "1965-05-17T00:00:00-06:00",
                "HumanoidType": "Human",
                "PhoneNumbers": [
                    {
                        "PersonId": 9337,
                        "Areacode": "435",
                        "LineNumber": "2575320",
                        "Id": 73027
                    },
                    {
                        "PersonId": 9337,
                        "Areacode": "866",
                        "LineNumber": "8875325",
                        "Id": 73028
                    }
                ]
            },
            {
                "Id": 9338,
                "FirstName": "Maria",
                "LastName": "Mares",
                "DateOfBirth": "1968-07-25T00:00:00-06:00",
                "HumanoidType": "Human",
                "PhoneNumbers": [
                    {
                        "PersonId": 9338,
                        "Areacode": "505",
                        "LineNumber": "3303479",
                        "Id": 71285
                    }
                ]
            }
        ]
    };
    
    var ajaxResponseCount = {
        "@odata.context": "https://api2.leavitt.com/$metadata#People",
        "@odata.count": 19244
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
                model: personModel
            });
        }, isMatch("ODataProvider: Null argument exception - edm"));
    };
    
    exports["BASE.odata4.ODataProvider: Count."] = function () {
        var mockAjaxProvider = new MockAjaxProvider({
            handler: function (options) {
                assert.equal("https://api2.leavitt.com/People?$top=0&$count=true", options.url);
                return MockAjaxProvider.createOKXhrResponse(JSON.stringify(ajaxResponse));

            },
            dataConverter: dataConverter
        });
        
        var provider = new ODataProvider({
            url: peopleUrl,
            ajaxProvider: mockAjaxProvider,
            model: personModel,
            edm: new Edm()
        });
        
        provider.count(new Queryable()).then(function (count) {
            assert.equal(19244, count);
        });
    };
    
    exports["BASE.odata4.ODataProvider: ToArray."] = function () {
        
        var mockAjaxProvider = new MockAjaxProvider({
            handler: function (options) {
                assert.equal(peopleUrl, options.url);
                return MockAjaxProvider.createOKXhrResponse(JSON.stringify(ajaxResponse));
            },
            dataConverter: dataConverter
        });
        
        var provider = new ODataProvider({
            url: peopleUrl,
            ajaxProvider: mockAjaxProvider,
            model: personModel,
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
                    "@odata.context": "https://api2.leavitt.com/$metadata#People",
                    "@odata.count": 19244
                };
                
                return MockAjaxProvider.createOKXhrResponse(JSON.stringify(response));
                
            },
            dataConverter: dataConverter
        });
        
        var provider = new ODataProvider({
            url: peopleUrl,
            ajaxProvider: mockAjaxProvider,
            model: personModel,
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
                assert.equal("https://api2.leavitt.com/People?$count=true", options.url);
                
                return MockAjaxProvider.createOKXhrResponse(JSON.stringify(ajaxResponse));
                
            },
            dataConverter: dataConverter
        });
        
        var provider = new ODataProvider({
            url: peopleUrl,
            ajaxProvider: mockAjaxProvider,
            model: personModel,
            edm: new Edm()
        });
        
        provider.toArrayWithCount(new Queryable()).then(function (result) {
            var array = result.array;
            var count = result.count;
            assert.equal(2, array.length);
            assert.equal(19244, count);
        }).ifError(function () {
            assert.fail();
        });
    };
    
    exports["BASE.odata4.ODataProvider: ToArrayWithCount without value property."] = function () {
        
        var mockAjaxProvider = new MockAjaxProvider({
            handler: function (options) {
                return MockAjaxProvider.createOKXhrResponse(JSON.stringify(ajaxResponseCount));
            },
            dataConverter: dataConverter
        });
        
        var provider = new ODataProvider({
            url: peopleUrl,
            ajaxProvider: mockAjaxProvider,
            model: personModel,
            edm: new Edm()
        });
        
        provider.toArrayWithCount(new Queryable()).then(function (result) {
            assert.fail();
        }).ifError(function (error) {
            assert.equal(error.message, "XHR response does not contain expected value node.");
        });
    };
    
    
    exports["BASE.odata4.ODataProvider: Integration test for the object return type."] = function () {
        var mockAjaxProvider = new MockAjaxProvider({
            handler: function (options) {
                return MockAjaxProvider.createOKXhrResponse(JSON.stringify(ajaxResponse));
            },
            dataConverter: dataConverter
        });
        
        var provider = new ODataProvider({
            url: peopleUrl,
            ajaxProvider: mockAjaxProvider,
            model: personModel,
            edm: new Edm()
        });
        
        provider.toArray(new Queryable()).then(function (array) {
            assert.equal(2, array.length);
            assert.equal(array[0].dateOfBirth.constructor, Date);
            assert.equal(array[0].phoneNumbers[0].constructor, BASE.data.testing.PhoneNumber);
            assert.equal(array[0].phoneNumbers[0].areacode, "435");
            assert.equal(array[0].humanoidType.constructor, Enum);
            assert.equal(array[0].humanoidType, 1);
        }).ifError(function () {
            assert.fail();
        });
    };
    
});