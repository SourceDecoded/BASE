BASE.require([
    "BASE.parsers.ComplexAndExpression",
    "BASE.parsers.ValueExpression",
    "BASE.parsers.RegExExpression"
], function () {
    
    var ComplexAndExpression = BASE.parsers.ComplexAndExpression;
    var ValueExpression = BASE.parsers.ValueExpression;
    var RegExExpression = BASE.parsers.RegExExpression;
    
    var varKeyword = new ValueExpression("varKeyword", "var");
    var equalKeyword = new ValueExpression("assignment", "=");
    var variableName = new RegExExpression();

});