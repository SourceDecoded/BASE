var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.odata4.FromServiceDto",
    "BASE.data.testing.Edm",
    "BASE.data.testing.Person",
    "BASE.data.testing.PhoneNumber"
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
    
    exports["Testing"] = function () {
        PhoneNumberType = function () { };
        PhoneNumberType.None = new Number(0);
        PhoneNumberType.Home = new Number(1);
        PhoneNumberType.Work = new Number(2);
        PhoneNumberType.Mobile = new Number(4);
        PhoneNumberType.Mobile2 = new Number(8);
        
        PhoneNumberType.None.name = "None";
        PhoneNumberType.Home.name = "Home";
        PhoneNumberType.Work.name = "Work";
        PhoneNumberType.Mobile.name = "Mobile";
        PhoneNumberType.Mobile2.name = "Mobile2";

        Number.prototype.toEnumString = function (Type) {
            value = this.valueOf();
            return Object.keys(Type).filter(function (key) {
                if (typeof Type[key] !== "number" && !(Type[key] instanceof Number)) {
                    return false;
                }
                if (Type[key] == 0 && value == 0) {
                    return true;
                }
                return (Type[key] & value) !== 0;
            }).map(function (key) {
                return Type[key].name;
            }).join(", ");
        };
        
        assert.equal(PhoneNumberType.None.toEnumString(PhoneNumberType), "None");
        assert.equal(PhoneNumberType.Home.toEnumString(PhoneNumberType), "Home");
        assert.equal((PhoneNumberType.Work).toEnumString(PhoneNumberType), "Work");
        assert.equal((PhoneNumberType.Home | PhoneNumberType.Work).toEnumString(PhoneNumberType), "Home, Work");
        assert.equal((PhoneNumberType.Mobile).toEnumString(PhoneNumberType), "Mobile");
        assert.equal((PhoneNumberType.Home | PhoneNumberType.Mobile).toEnumString(PhoneNumberType), "Home, Mobile");
        assert.equal((PhoneNumberType.Work | PhoneNumberType.Mobile).toEnumString(PhoneNumberType), "Work, Mobile");
        assert.equal((PhoneNumberType.Home | PhoneNumberType.Work | PhoneNumberType.Mobile).toEnumString(PhoneNumberType), "Home, Work, Mobile");
        assert.equal((PhoneNumberType.Mobile2).toEnumString(PhoneNumberType), "Mobile2");
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
        assert.equal(person.phoneNumbers[0].type.constructor, Enum);
        assert.equal(person.phoneNumbers[0].type.value, 0);
        assert.equal(person.phoneNumbers[0].type.name, "Home");

    };

        


});