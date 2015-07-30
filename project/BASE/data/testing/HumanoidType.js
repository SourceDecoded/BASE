BASE.require([
    "BASE.data.Edm",
    "BASE.odata4.ODataAnnotation"
], function () {
    var ODataAnnotation = BASE.odata4.ODataAnnotation;
    
    BASE.namespace("BASE.data.testing");
    
    var HumanoidType = function () { };
    HumanoidType.annotations = [new ODataAnnotation("Namespace.HumanoidType")];
    
    HumanoidType.None = new Enum(0);
    HumanoidType.None.name = "None";

    HumanoidType.Human = new Enum(1);
    HumanoidType.Human.name = "Human";
    
    HumanoidType.Vulcan = new Enum(2);
    HumanoidType.Vulcan.name = "Vulcan";
    
    BASE.data.testing.HumanoidType = HumanoidType;
});