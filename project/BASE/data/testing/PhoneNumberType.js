BASE.require([
    "BASE.data.Edm"
], function () {
    
    BASE.namespace("BASE.data.testing");
    
    var PhoneNumberType = function () { };
    
    PhoneNumberType.Home = new Enum(PhoneNumberType, "Home", 0);
    PhoneNumberType.Work = new Enum(PhoneNumberType, "Work", 1);
    
    BASE.data.testing.PhoneNumberType = PhoneNumberType;

});