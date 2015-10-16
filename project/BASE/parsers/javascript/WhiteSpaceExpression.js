BASE.require([
    "BASE.parsers.RegExExpression"
], function () {
    
    var RegExExpression = BASE.parsers.RegExExpression;
    
    BASE.namespace("BASE.parsers.javascript");
    
    BASE.parsers.javascript.whiteSpaceExpression = new RegExExpression("\s");

});