var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "String.prototype.toEnumFlag"
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
    
    exports["String.prototype.toEnumFlag: convert a one-enum string to an Enum value"] = function () {
        assert.equal("Home".toEnumFlag(PhoneNumberType), (PhoneNumberType.Home));
        assert.equal("None".toEnumFlag(PhoneNumberType), (PhoneNumberType.None));
    };
    
    exports["String.prototype.toEnumFlag: convert a string of a list of enums to the corresponding Enum value"] = function () {
        assert.equal("Home, Work".toEnumFlag(PhoneNumberType), (PhoneNumberType.Home | PhoneNumberType.Work));
        assert.equal("Mobile2, Work, Home".toEnumFlag(PhoneNumberType), (PhoneNumberType.Mobile2 | PhoneNumberType.Work | PhoneNumberType.Home));
        assert.equal("None, Work, Mobile".toEnumFlag(PhoneNumberType), (PhoneNumberType.Work | PhoneNumberType.Mobile));
    };
    
    exports["String.prototype.toEnumFlag: convert an empty string to the corresponding Enum value"] = function () {
        assert.equal("".toEnumFlag(PhoneNumberType), 0);
    };

});