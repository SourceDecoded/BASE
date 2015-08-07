var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.odata4.ToServiceDto",
    "BASE.data.testing.Edm",
    "BASE.data.testing.Person",
    "BASE.data.testing.PhoneNumber"
], function () {
    
    var ToServiceDto = BASE.odata4.ToServiceDto;
    var PhoneNumber = BASE.data.testing.PhoneNumber;
    var Person = BASE.data.testing.Person;
    var Edm = BASE.data.testing.Edm;
    
    exports["BASE.odata4.ToServiceDto"] = function () {
        
        var edm = new Edm();
        var ToServiceDto = new ToServiceDto(edm);
        var model = edm.getModelByType(Person);
        
        var personDto = {
            firstName: "Jared",
            lastName: "Barnes"
        };
        
        var person = ToServiceDto.resolve(model, personDto);
        
        assert.equal(person.constructor, Person);
        assert.equal(person.firstName, "Jared");
        assert.equal(person.lastName, "Barnes");

    };

});