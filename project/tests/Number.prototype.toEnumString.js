var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "Number.prototype.toEnumString"
], function () {
    
    exports["Number.prototype.toEnumString"] = function () {
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
        
        
        assert.equal(PhoneNumberType.None.toEnumString(PhoneNumberType), "None");
        assert.equal(PhoneNumberType.Home.toEnumString(PhoneNumberType), "Home");
        assert.equal((PhoneNumberType.Work).toEnumString(PhoneNumberType), "Work");
        assert.equal((PhoneNumberType.Home | PhoneNumberType.Work).toEnumString(PhoneNumberType), "Home, Work");
        assert.equal((PhoneNumberType.Mobile).toEnumString(PhoneNumberType), "Mobile");
        assert.equal((PhoneNumberType.Home | PhoneNumberType.Mobile).toEnumString(PhoneNumberType), "Home, Mobile");
        assert.equal((PhoneNumberType.Work | PhoneNumberType.Mobile).toEnumString(PhoneNumberType), "Work, Mobile");
        assert.equal((PhoneNumberType.Home | PhoneNumberType.Work | PhoneNumberType.Mobile).toEnumString(PhoneNumberType), "Home, Work, Mobile");
        assert.equal((PhoneNumberType.Mobile2).toEnumString(PhoneNumberType), "Mobile2");
        assert.equal((PhoneNumberType.None | PhoneNumberType.Mobile2).toEnumString(PhoneNumberType), "Mobile2");
    
    };
    
    var startTime = Date.now();
    exports["Number.prototype.toEnumString"]();
    console.log(Date.now() - startTime);
});


