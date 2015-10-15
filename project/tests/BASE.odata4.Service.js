var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.query.ArrayProvider",
    "BASE.query.Queryable",
    "BASE.odata4.EndPoint",
    "BASE.odata4.Service",
    "BASE.web.MockAjaxProvider",
    "BASE.odata4.OData4DataConverter",
    "BASE.data.testing.Person",
    "BASE.data.testing.model.person",
    "BASE.data.testing.Edm",
    "BASE.data.responses.AddedResponse",
    "BASE.data.responses.ErrorResponse",
    "BASE.data.responses.UpdatedResponse",
    "BASE.data.responses.RemovedResponse",
    "BASE.odata4.EndPoint"
], function () {
    
    var Service = BASE.odata4.Service;
    var Person = BASE.data.testing.Person;
    var Edm = BASE.data.testing.Edm;
    var EndPoint = BASE.odata4.EndPoint;
    var edm = new Edm();
    var AddedResponse = BASE.data.responses.AddedResponse;
    var UpdatedResponse = BASE.data.responses.UpdatedResponse;
    var RemovedResponse = BASE.data.responses.RemovedResponse;
    var ErrorResponse = BASE.data.responses.ErrorResponse;
    var Future = BASE.async.Future;
    var ArrayProvider = BASE.query.ArrayProvider;
    var Queryable = BASE.query.Queryable;
    
    var ErrorMockEndPoint = function () {
        var self = this;
        self.add = function (entity) {
            var response = new ErrorResponse();
            return Future.fromError(response);
        };
        
        self.update = function (entity, updates) {
            var response = new ErrorResponse();
            return Future.fromError(response);
        };
        
        self.remove = function (entity) {
            var response = new ErrorResponse();
            return Future.fromError(response);
        };
        
        self.getQueryProvider = function () {
           
        };
        
        self.asQueryable = function () {
            
        };
        
        self.invokeInstanceFunction = function (key, methodName, parameters) {
            return Future.fromError(new Error("Error"));
        };
        
        self.invokeClassFunction = function (methodName, parameters) {
            return Future.fromError(new Error("Error"));
        };
        
        self.getUrl = function () {
            return "https://api2.leavitt.com/People";
        };
        
        self.getAjaxProvider = function () {
        };

    };
    
    BASE.extend(ErrorMockEndPoint, EndPoint);
    
    
    var MockEndPoint = function () {
        var self = this;
        self.add = function (entity) {
            var person = new Person();
            
            Object.keys(entity).forEach(function (key) {
                if (typeof entity[key] !== "object") {
                    person[key] = entity[key];
                }
            });
            
            person.id = 1;
            
            var response = new AddedResponse("Successfully Added.", person);
            return Future.fromResult(response);
        };
        
        self.update = function (entity, updates) {
            var response = new UpdatedResponse("Successfully Updated.");
            return Future.fromResult(response);
        };
        
        self.remove = function (entity) {
            var response = new RemovedResponse("Successfully Removed.");
            return Future.fromResult(response);
        };
        
        self.getQueryProvider = function () {
            var person = new Person();
            person.id = 1;
            person.firstName = "John";
            person.lastName = "Doe";
            
            var array = [person];
            return new ArrayProvider(array);
        };
        
        self.asQueryable = function () {
            var queryable = new Queryable(Person);
            queryable.provider = self.getQueryProvider();
            return queryable;
        };
        
        self.invokeInstanceFunction = function (key, methodName, parameters) {
            return Future.fromResult("John Doe");
        };
        
        self.invokeClassFunction = function (methodName, parameters) {
            return Future.fromResult("John Doe");
        };
        
        self.getUrl = function () {
            return "https://api2.leavitt.com/People";
        };
        
        self.getAjaxProvider = function () {
        };

    };
    
    BASE.extend(MockEndPoint, EndPoint);
    
    var person = new Person();
    person.id = 1;
    person.firstName = "Jared";
    person.lastName = "Barnes";
    person.badProperty = "BAD;";
    
    var personModel = BASE.data.testing.model.person;
    
    var isMatch = function (message) {
        return function (error) {
            return message === error.message;
        };
    };
    
    var createAndArrangeService = function () {
        var personEndPoint = new MockEndPoint();
        var edm = new Edm();
        var service = new Service(edm);
        
        service.addEndPoint(Person, personEndPoint);
        
        return service;
    };
    
    var createAndArrangeServiceWithErrorEndPoint = function () {
        var personEndPoint = new ErrorMockEndPoint();
        var edm = new Edm();
        var service = new Service(edm);
        
        service.addEndPoint(Person, personEndPoint);
        
        return service;
    };
    
    exports["BASE.odata4.Service: null argument test url"] = function () {
        assert.throws(function () {
            new Service();
            
        }, isMatch("Null Argument Exception: edm has to be defined."));
    };
    
    exports["BASE.odata4.Service: Add entity."] = function () {
        var service = createAndArrangeService();
        var person = new Person();
        person.firstName = "John";
        person.lastName = "Doe";
        
        service.add(Person, person).then(function (response) {
            var entity = response.entity;
            
            assert.equal(person.firstName, entity.firstName);
            assert.equal(person.lastName, entity.lastName);
            assert.equal(entity.id, 1);
        });
    };
    
    exports["BASE.odata4.Service: Add entity with error."] = function () {
        var service = createAndArrangeServiceWithErrorEndPoint();
        var person = new Person();
        person.firstName = "John";
        person.lastName = "Doe";
        
        service.add(Person, person).then(function (response) {
            assert.fail();
        }).ifError(function (e) {
            assert.ok(true);
        });
    };
    
    exports["BASE.odata4.Service: Update entity."] = function () {
        var service = createAndArrangeService();
        var person = new Person();
        person.firstName = "John";
        person.lastName = "Doe";
        
        service.update(Person, person, {
            firstName: "Jane"
        }).then(function (response) {
            assert.ok(true);
        });
    };
    
    exports["BASE.odata4.Service: Update entity with error."] = function () {
        var service = createAndArrangeServiceWithErrorEndPoint();
        var person = new Person();
        person.firstName = "John";
        person.lastName = "Doe";
        
        service.update(Person, person, {
            firstName: "Jane"
        }).then(function (response) {
            assert.fail();
        }).ifError(function (e) {
            assert.ok(true);
        });
    };
    
    exports["BASE.odata4.Service: Remove entity."] = function () {
        var service = createAndArrangeService();
        var person = new Person();
        person.firstName = "John";
        person.lastName = "Doe";
        
        service.remove(Person, person).then(function (response) {
            assert.ok(true);
        });
    };
    
    exports["BASE.odata4.Service: Remove entity with error."] = function () {
        var service = createAndArrangeServiceWithErrorEndPoint();
        var person = new Person();
        person.firstName = "John";
        person.lastName = "Doe";
        
        service.remove(Person, person).then(function (response) {
            assert.fail();
        }).ifError(function (e) {
            assert.ok(true);
        });
    };
    
    exports["BASE.odata4.Service: AsQueryable"] = function () {
        var service = createAndArrangeService();
        
        service.asQueryable(Person).toArray(function (a) {
            assert.equal(a.length, 1);
            assert.equal(a[0].firstName, "John");
            assert.equal(a[0].lastName, "Doe");
            assert.equal(a[0].id, 1);
        });

    };
    
    exports["BASE.odata4.Service: AsQueryable with error"] = function () {
        var service = new Service(new Edm());
        
        assert.throws(function () {
            service.asQueryable(Person).toArray(function (a) {
                assert.equal(a.length, 1);
                assert.equal(a[0].firstName, "John");
                assert.equal(a[0].lastName, "Doe");
                assert.equal(a[0].id, 1);
            });
        }, isMatch("Coundn't find endPoint for type: " + Person));

    };
    
    exports["BASE.odata4.Service: invokeInstanceMethod"] = function () {
        var service = createAndArrangeService();
        
        service.invokeInstanceMethod(Person, person, "GetCousinNamed", {
            "FirstName": "John"
        }).then(function (value) {
            assert.equal(value, "John Doe");
        });

    };

    exports["BASE.odata4.Service: invokeClassMethod"] = function () {
        var service = createAndArrangeService();
        
        service.invokeInstanceMethod(Person, "GetFathersFullName", {
            "FirstName": "John"
        }).then(function (value) {
            assert.equal(value, "John Doe");
        });

    };

});