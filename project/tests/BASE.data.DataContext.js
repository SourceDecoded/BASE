var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.data.testing.Edm",
    "BASE.data.services.InMemoryService",
    "BASE.data.DataContext",
    "BASE.data.testing.Person",
    "BASE.data.testing.Permission"
], function () {
    
    var Edm = BASE.data.testing.Edm;
    var Service = BASE.data.services.InMemoryService;
    var DataContext = BASE.data.DataContext;
    var Future = BASE.async.Future;
    var Person = BASE.data.testing.Person;
    var Permission = BASE.data.testing.Permission;
    
    var isMatch = function (message) {
        return function (error) {
            return message === error.message;
        };
    };
    
    var fillWithData = function (service) {
        var dataContext = new DataContext(service);
        
        var person = dataContext.people.createInstance();
        person.firstName = "Jared";
        person.lastName = "Barnes";
        
        var address = dataContext.addresses.createInstance();
        address.street1 = "3846 West 625 North";
        address.city = "Cedar City";
        address.state = "Utah";
        address.country = "USA";
        address.zip = "84721";
        
        var address1 = dataContext.addresses.createInstance();
        address1.street1 = "?";
        address1.city = "Cedar City";
        address1.state = "Utah";
        address1.country = "USA";
        address1.zip = "84720";
        
        var phoneNumber = dataContext.phoneNumbers.createInstance();
        phoneNumber.areacode = "435";
        phoneNumber.lineNumber = "5908500";
        
        var phoneNumber1 = dataContext.phoneNumbers.createInstance();
        phoneNumber1.areacode = "435";
        phoneNumber1.lineNumber = "5921384";
        
        var hrAccount = dataContext.hrAccounts.createInstance();
        hrAccount.accountId = "12345";
        
        person.hrAccount = hrAccount;
        person.phoneNumbers.push(phoneNumber);
        person.phoneNumbers.push(phoneNumber1);
        
        person.addresses.push(address);
        person.addresses.push(address1);
        
        var person2 = dataContext.people.createInstance();
        person2.firstName = "LeAnn";
        person2.lastName = "Barnes";
        person2.dateOfBirth = new Date(1983, 11, 10);
        
        address = dataContext.addresses.createInstance();
        address.street1 = "3846 West 625 North";
        address.city = "Cedar City";
        address.state = "Utah";
        address.country = "USA";
        address.zip = "84721";
        
        address1 = dataContext.addresses.createInstance();
        address1.street1 = "?";
        address1.city = "Cedar City";
        address1.state = "Utah";
        address1.country = "USA";
        address1.zip = "84720";
        
        phoneNumber = dataContext.phoneNumbers.createInstance();
        phoneNumber.areacode = "435";
        phoneNumber.lineNumber = "5908500";
        
        phoneNumber1 = dataContext.phoneNumbers.createInstance();
        phoneNumber1.areacode = "435";
        phoneNumber1.lineNumber = "5921384";
        
        hrAccount = dataContext.hrAccounts.createInstance();
        hrAccount.accountId = "12346";
        
        person2.hrAccount = hrAccount;
        person2.phoneNumbers.push(phoneNumber);
        person2.phoneNumbers.push(phoneNumber1);
        
        person2.addresses.push(address);
        person2.addresses.push(address1);
        
        var permission = dataContext.permissions.createInstance();
        permission.people.add(person, person2);
        
        return dataContext.saveChangesAsync();
    };
    
    exports["BASE.data.DataContext: Get count and make sure nothing is loaded."] = function () {
        var service = new Service(new Edm());
        var dataContext = new DataContext(service);
        
        fillWithData(service).then(function () {
            
            dataContext.asQueryable(BASE.data.testing.Person).count().then(function (count) {
                assert.equal(count, 2);
                
                dataContext.asQueryableLocal(BASE.data.testing.Person).count().then(function (count) {
                    assert.equal(count, 0);
                });
            });
        });

    };
    
    exports["BASE.data.DataContext: Query from set."] = function () {
        var service = new Service(new Edm());
        var dataContext = new DataContext(service);
        
        fillWithData(service).then(function () {
            dataContext.people.where(function (e) {
                return e.property("firstName").isEqualTo("Jared");
            }).toArray().then(function (results) {
                assert.equal(results.length, 1);
                assert.equal(results[0].firstName, "Jared");
            });
        });

    };
    
    exports["BASE.data.DataContext: Add an entity, with a one to one relationship."] = function () {
        var service = new Service(new Edm());
        var dataContext = new DataContext(service);
        
        var person = dataContext.people.createInstance();
        person.firstName = "John";
        person.lastName = "Doe";
        
        var hrAccount = dataContext.hrAccounts.createInstance();
        
        hrAccount.person = person;
        hrAccount.accountId = 1;
        
        assert.equal(dataContext.getPendingEntities().added.length, 2);
        
        dataContext.saveChangesAsync().then(function (response) {
            var p = person;
            assert.equal(dataContext.getPendingEntities().added.length, 0);
            
            service.asQueryable(BASE.data.testing.Person).toArray(function (results) {
                assert.equal(results[0].firstName, "John");
            });
            
            service.asQueryable(BASE.data.testing.HrAccount).toArray(function (results) {
                assert.equal(results[0].accountId, 1);
            });

        }).ifError(function () {
            assert.fail("Data Context failed to save.");
        });
    };
    
    exports["BASE.data.DateContext: Update a primitive property on an entity."] = function () {
        var service = new Service(new Edm());
        var dataContext = new DataContext(service);
        var person = new Person();
        
        person.id = 1;
        person = dataContext.loadEntity(person);
        
        person.firstName = "John";
        
        dataContext.saveChangesAsync().then(function () {
            service.asQueryable(Person).firstOrDefault(function (exp) {
                return exp.property("firstName").isEqualTo("John");
            }).then(function (person) {
                assert.notEqual(person, null);
            });
        });
    };
    
    exports["BASE.data.DataContext: Update an entity."] = function () {
        var service = new Service(new Edm());
        fillWithData(service).then(function () {
            var dataContext = new DataContext(service);
            
            dataContext.people.where(function (e) {
                return e.property("firstName").isEqualTo("LeAnn");
            }).firstOrDefault().then(function (person) {
                person.firstName = "Jaelyn";
                person.dateOfBirth = new Date(1983, 11, 10);
                
                var hrAccount = dataContext.hrAccounts.createInstance();
                hrAccount.accountId = "555555";
                
                person.hrAccount = hrAccount;
                
                var phoneNumber = dataContext.phoneNumbers.createInstance();
                phoneNumber.areacode = "435";
                phoneNumber.lineNumber = "5555555";
                
                phoneNumber.person = person;
                
                var permission = dataContext.permissions.createInstance();
                permission.name = "Admin";
                
                person.permissions.push(permission);
                
                dataContext.saveChangesAsync().then(function (response) {
                    dataContext.people.where(function (e) {
                        return e.property("firstName").isEqualTo("LeAnn");
                    }).count().then(function (count) {
                        assert.equal(count, 0);
                    });
                    
                    person.phoneNumbers.asQueryable().toArray().then(function (phoneNumbers) {
                        assert.equal(phoneNumbers.length, 3);
                        
                        var has55555555 = phoneNumbers.some(function (phoneNumber) {
                            return phoneNumber.lineNumber === "5555555";
                        });
                        
                        assert.equal(has55555555, true);

                    });
                    
                    service.asQueryable(BASE.data.testing.Permission).where(function (e) {
                        return e.property("name").isEqualTo("Admin");
                    }).count().then(function (count) {
                        assert.equal(count, 1);
                    });

                }).ifError(function (response) {
                    
                });

            });

        });

    };
    
    exports["BASE.data.DataContext: Remove existing many to many."] = function () {
        var service = new Service(new Edm());
        fillWithData(service).then(function () {
            var dataContext = new DataContext(service);
            
            dataContext.people.toArray().then(function (people) {
                Future.all(people.map(function (person) {
                    return person.permissions.asQueryable().toArray();
                })).chain(function (permissions) {
                    
                    people.forEach(function (person) {
                        person.permissions.pop();
                    });
                    
                    return dataContext.saveChangesAsync();

                }).then(function () { 
                });
            });
        });
    };
    
    exports["BASE.data.DataContext: Remove an entity."] = function () {
        var service = new Service(new Edm());
        fillWithData(service).then(function () {
            var dataContext = new DataContext(service);
            
            dataContext.people.toArray().then(function (people) {
                people.forEach(function (person) {
                    dataContext.people.remove(person);
                });
                
                dataContext.saveChangesAsync().then(function () {
                    service.asQueryable(BASE.data.testing.Person).count().then(function (count) {
                        assert.equal(count, 0);
                    });
                });
            });
        });
    };
    
    exports["BASE.data.DataContext: Add many to many on source."] = function () {
        var service = new Service(new Edm());
        var dataContext = new DataContext(service);
        
        var person = dataContext.people.createInstance();
        person.firstName = "Jared";
        person.lastName = "Barnes";
        
        var permission = dataContext.permissions.createInstance();
        
        permission.name = "Admin";
        person.permissions.add(permission);
        
        dataContext.saveChangesAsync().then(function () {
            assert.equal(typeof person.id !== "undefined", true);
            assert.equal(typeof permission.id !== "undefined", true);
        });
    };
    
    exports["BASE.data.DataContext: dispose and using multiple dataContexts."] = function () {
        var service = new Service(new Edm());
        
        var dataContext1 = new DataContext(service);
        
        var person = new Person();
        person.id = 0;
        person.firstName = "Jared";
        person.lastName = "Barnes";
        
        var permission = new Permission();
        permission.id = 0;
        permission.name = "Admin";
        person.permissions.push(permission);
        
        dataContext1.dispose();
        
        var dataContext2 = new DataContext(service);
        dataContext2.people.add(person);
        
        dataContext2.dispose();
        var dataContext3 = new DataContext(service);
        
        person.id = 0;
        dataContext3.people.attach(person);
        dataContext3.dispose();
        
        var dataContext4 = new DataContext(service);
        person.firstName = "LeAnn";
        dataContext4.people.attach(person);
        
        assert.equal(dataContext4.getPendingEntities().added.length, 0);
        assert.equal(dataContext4.getPendingEntities().updated.length, 0);
        assert.equal(dataContext4.getPendingEntities().removed.length, 0);
        
        assert.equal(typeof person.id !== "undefined", true);
        assert.equal(typeof permission.id !== "undefined", true);
    };
    
    exports["BASE.data.DataContext: try to insert the same entity twice."] = function () {
        var service = new Service(new Edm());
        var dataContext = new DataContext(service);
        var person = dataContext.people.createInstance();
        person.firstName = "Jared";
        person.lastName = "Barnes";
        
        dataContext.saveChangesAsync().then(function () {
            var anotherPerson = new Person();
            anotherPerson.id = 0;
            
            assert.throws(function () {
                dataContext.people.attach(anotherPerson);
            }, isMatch("Entity was already attached to dataContext as a different entity."));
        });
    };
    
    exports["BASE.data.DataContext: attach entity."] = function () {
        var service = new Service(new Edm());
        var dataContext = new DataContext(service);
        var person = new Person();
        person.id = 0;
        person.firstName = "Jared";
        person.lastName = "Barnes";
        
        dataContext.people.attach(person);
        
        dataContext.saveChangesAsync().then(function () {
            var anotherPerson = new Person();
            anotherPerson.id = 0;
            
            assert.throws(function () {
                dataContext.people.attach(anotherPerson);
            }, isMatch("Entity was already attached to dataContext as a different entity."));
        });
    };
    
    exports["BASE.data.DataContext: attach entity and make sure that the change tracker is set."] = function () {
        var service = new Service(new Edm());
        var dataContext = new DataContext(service);
        var person = new Person();
        person.id = 0;
        person.firstName = "Jared";
        person.lastName = "Barnes";
        
        dataContext.people.attach(person);
        person.firstName = "Rhett";
        
        assert.equal(dataContext.getPendingEntities().updated.length, 1);
    };
    
    exports["BASE.data.DataContext: purgeChangeTracker."] = function () {
        var service = new Service(new Edm());
        var dataContext = new DataContext(service);
        var person = new Person();
        person.id = 0;
        person.firstName = "John";
        person.lastName = "Smith";
        
        var person2 = new Person();
        person2.firstName = "Jane";
        person2.lastName = "Smith";
        
        var person3 = new Person();
        person3.id = 3;
        person3.firstName = "Jill";
        person3.lastName = "Smith";
        
        dataContext.people.attach(person);
        dataContext.people.add(person2);
        dataContext.people.attach(person3);
        
        person.firstName = "Jake";
        
        dataContext.people.remove(person3);
        
        assert.equal(dataContext.getPendingEntities().updated.length, 1);
        assert.equal(dataContext.getPendingEntities().added.length, 1);
        assert.equal(dataContext.getPendingEntities().removed.length, 1);
        
        dataContext.purgeChangeTracker();
        
        assert.equal(dataContext.getPendingEntities().updated.length, 0);
        assert.equal(dataContext.getPendingEntities().added.length, 0);
        assert.equal(dataContext.getPendingEntities().removed.length, 0);
        
        
        dataContext.asQueryableLocal(Person).toArray().then(function (people) {
            assert.equal(people.length, 2);
        });
    };
});
