var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.odata4.ToServiceDto",
    "BASE.data.testing.Edm",
    "BASE.data.testing.Person",
    "BASE.data.testing.PhoneNumber",
    "BASE.data.testing.HumanoidType"
], function () {
    
    var ToServiceDto = BASE.odata4.ToServiceDto;
    var PhoneNumber = BASE.data.testing.PhoneNumber;
    var Person = BASE.data.testing.Person;
    var Edm = BASE.data.testing.Edm;
    var HumanoidType = BASE.data.testing.HumanoidType;
    
    exports["BASE.odata4.ToServiceDto: resolve"] = function () {
        
        var edm = new Edm();
        var toServiceDto = new ToServiceDto(edm);
        var model = edm.getModelByType(Person);
        
        var person = new Person();
        person.firstName = "Jared";
        person.lastName = "Barnes";
        person.dateOfBirth = new Date("06/11/1982");
        person.humanoidType = HumanoidType.Human;
        
        var dto = toServiceDto.resolve(person);
        
        assert.equal(dto.constructor, Object);
        assert.equal(dto.firstName, "Jared");
        assert.equal(dto.lastName, "Barnes");
        assert.equal(dto.humanoidType, "Human");
        assert.equal(dto.dateOfBirth.constructor, Date);

    };
    
    exports["BASE.odata4.ToServiceDto: resolveUpdate"] = function () {
        
        var edm = new Edm();
        var toServiceDto = new ToServiceDto(edm);
        var model = edm.getModelByType(Person);
        
        var person = new Person();
        person.firstName = "Jared";
        person.lastName = "Barnes";
        person.dateOfBirth = new Date("06/11/1982");
        person.humanoidType = HumanoidType.Human;
        
        var dto = toServiceDto.resolveUpdate(person, {
            humanoidType: HumanoidType.Vulcan
        });
        
        assert.equal(dto.constructor, Object);
        assert.equal(dto.humanoidType, "Vulcan");

    };

});