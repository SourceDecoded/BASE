var assert = require('assert');

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.data.testing.Edm",
    "BASE.data.services.InMemoryService",
    "BASE.data.DataContext"
], function () {
    
    var Edm = BASE.data.testing.Edm;
    var Service = BASE.data.services.InMemoryService;
    var DataContext = BASE.data.DataContext;
    
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
        
        return dataContext.saveChangesAsync();
    };
    
    exports["BASE.data.DataContext: Get count and make sure nothing is loaded."] = function () {
        var service = new Service(new Edm());
        var dataContext = new DataContext(service);
        
        fillWithData(service);
        
        dataContext.asQueryable(BASE.data.testing.Person).count().then(function (count) {
            assert.equal(count , 2);
            
            dataContext.asQueryableLocal(BASE.data.testing.Person).count().then(function (count) { 
                assert.equal(count , 0);
            });
        });
    };

});
