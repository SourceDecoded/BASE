BASE.require([
    "BASE.parsers.ComplexAndExpression",
    "BASE.parsers.ValueExpression",
    "BASE.parsers.RegExExpression",
    "BASE.parsers.javascript.whiteSpaceExpression"
], function () {
    
    var ComplexAndExpression = BASE.parsers.ComplexAndExpression;
    var ValueExpression = BASE.parsers.ValueExpression;
    var RegExExpression = BASE.parsers.RegExExpression;
    
    var varKeyword = new ValueExpression("var", "var");
    var equalKeyword = new ValueExpression("assignment", "=");
    var variableName = new RegExExpression("", "");

});