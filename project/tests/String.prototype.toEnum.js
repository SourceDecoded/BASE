var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "String.prototype.toEnum"
], function () {
    
    var isMatch = function (message) {
        return function (error) {
            return message === error.message;
        };
    };

    PhoneNumberType = function () { };
    PhoneNumberType.Object = {};
    PhoneNumberType.String = "String";
    PhoneNumberType.Number = 1;
    PhoneNumberType.Null = null;
    PhoneNumberType.Undefined = undefined;
    PhoneNumberType.None = new Number(0);
    PhoneNumberType.Home = new Number(1);
    PhoneNumberType.Work = new Number(2);
    PhoneNumberType.Mobile = new Number(3);
    PhoneNumberType.Mobile2 = new Number(4);
    
    PhoneNumberType.None.name = "None";
    PhoneNumberType.Home.name = "Home";
    PhoneNumberType.Work.name = "Work";
    PhoneNumberType.Mobile.name = "Mobile";
    PhoneNumberType.Mobile2.name = "Mobile2";

    exports["String.prototype.toEnum: convert a one-enum string to an Enum value"] = function() {
        assert.equal("Home".toEnum(PhoneNumberType), (PhoneNumberType.Home));
        assert.equal("None".toEnum(PhoneNumberType), (PhoneNumberType.None));
    };

    exports["String.prototype.toEnum: convert a string of a list of enums to the corresponding Enum value"] = function() {
        assert.throws(function () {
            assert.equal("Home, Work".toEnum(PhoneNumberType), PhoneNumberType.None);
        }, isMatch("Coundn't resolve string to an Enum value."));
    };

    exports["String.prototype.toEnum: convert an empty string to the corresponding Enum value"] = function() {
        assert.throws(function () {
            assert.equal("".toEnum(PhoneNumberType), 0);
        }, isMatch("Coundn't resolve string to an Enum value."));
    };

});
