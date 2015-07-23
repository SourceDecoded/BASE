var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.odata4.FromServiceDto",
    "BASE.data.testing.Edm",
    "BASE.data.testing.Person",
    "BASE.data.testing.PhoneNumber",
    "Number.prototype.toEnumString"
], function () {
    
    var FromServiceDto = BASE.odata4.FromServiceDto;
    var PhoneNumber = BASE.data.testing.PhoneNumber;
    var Person = BASE.data.testing.Person;
    var Edm = BASE.data.testing.Edm;
    
    exports["BASE.odata4.FromService: resolve simple dto."] = function () {
        
        var edm = new Edm();
        var fromServiceDto = new FromServiceDto(edm);
        var model = edm.getModelByType(Person);
        
        var personDto = {
            firstName: "Jared",
            lastName: "Barnes"
        };
        
        var person = fromServiceDto.resolve(model, personDto);
        
        assert.equal(person.constructor, Person);
        assert.equal(person.firstName, "Jared");
        assert.equal(person.lastName, "Barnes");

    };
    
    exports["BASE.odata4.FromService: resolve nested dto."] = function () {
        
        var edm = new Edm();
        var fromServiceDto = new FromServiceDto(edm);
        var model = edm.getModelByType(Person);
        
        var personDto = {
            firstName: "Jared",
            lastName: "Barnes",
            phoneNumbers: [{
                    areacode: "435",
                    lineNumber: "5558500",
                    type: "Home"
                }]
        };
        
        var person = fromServiceDto.resolve(model, personDto);
        
        assert.equal(person.constructor, Person);
        assert.equal(person.firstName, "Jared");
        assert.equal(person.lastName, "Barnes");
        assert.equal(person.phoneNumbers[0].constructor, PhoneNumber);
        assert.equal(person.phoneNumbers[0].areacode, "435");
        assert.equal(person.phoneNumbers[0].lineNumber, "5558500");
        assert.equal(person.phoneNumbers[0].type, 1);
        assert.equal(person.phoneNumbers[0].type.toEnumString(BASE.data.testing.PhoneNumberType), "Home");

    };

        


});