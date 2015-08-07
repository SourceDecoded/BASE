BASE.require([
    "BASE.data.Edm",
    "BASE.odata4.ODataAnnotation"
], function () {
    var ODataAnnotation = BASE.odata4.ODataAnnotation;
    
    BASE.namespace("BASE.data.testing");
    
    var PhoneNumberType = function () { };
    PhoneNumberType.annotations = [new ODataAnnotation("Namespace.PhoneNumberType")];
    
    PhoneNumberType.None = new Enum(0);
    PhoneNumberType.None.name = "None";

    PhoneNumberType.Home = new Enum(1);
    PhoneNumberType.Home.name = "Home";
    
    PhoneNumberType.Work = new Enum(2);
    PhoneNumberType.Work.name = "Work";
    
    BASE.data.testing.PhoneNumberType = PhoneNumberType;
});