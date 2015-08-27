var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "Number.prototype.toEnumFlagString"
], function () {
    
    PhoneNumberType = function () { };
    PhoneNumberType.Object = {};
    PhoneNumberType.String = "String";
    PhoneNumberType.Number = 1;
    PhoneNumberType.Null = null;
    PhoneNumberType.Undefined = undefined;
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
    
    exports["Number.prototype.toEnumFlagString: converts one enum to its corresponding string value."] = function () {
        assert.equal(PhoneNumberType.None.toEnumFlagString(PhoneNumberType), "None");
        assert.equal(PhoneNumberType.Home.toEnumFlagString(PhoneNumberType), "Home");
        assert.equal((PhoneNumberType.Work).toEnumFlagString(PhoneNumberType), "Work");
        assert.equal((PhoneNumberType.Mobile).toEnumFlagString(PhoneNumberType), "Mobile");
        assert.equal((PhoneNumberType.Mobile2).toEnumFlagString(PhoneNumberType), "Mobile2");
    };
    
    exports["Number.prototype.toEnumFlagString: ignores 'None' if it is included in the list of Enums."] = function () {
        assert.equal((PhoneNumberType.None | PhoneNumberType.Mobile2).toEnumFlagString(PhoneNumberType), "Mobile2");
    };
    
    exports["Number.prototype.toEnumFlagString: converts multiple enums to its corresponding string value."] = function () {
        assert.equal((PhoneNumberType.Home | PhoneNumberType.Mobile).toEnumFlagString(PhoneNumberType), "Home, Mobile");
        assert.equal((PhoneNumberType.Work | PhoneNumberType.Mobile).toEnumFlagString(PhoneNumberType), "Work, Mobile");
        assert.equal((PhoneNumberType.Home | PhoneNumberType.Work | PhoneNumberType.Mobile).toEnumFlagString(PhoneNumberType), "Home, Work, Mobile");
        assert.equal((PhoneNumberType.Home | PhoneNumberType.Work).toEnumFlagString(PhoneNumberType), "Home, Work");
    };

});

