var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "String.prototype.toEnum"
], function () {
    
    exports["String.prototype.toEnum"] = function() {
        PhoneNumberType = function() {};
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

        assert.equal("Home".toEnum(PhoneNumberType), (PhoneNumberType.Home));
        assert.equal("Home, Work".toEnum(PhoneNumberType), (PhoneNumberType.Home | PhoneNumberType.Work));
        assert.equal("Mobile2, Work, Home".toEnum(PhoneNumberType), (PhoneNumberType.Mobile2 | PhoneNumberType.Work | PhoneNumberType.Home));
    };
    
});
