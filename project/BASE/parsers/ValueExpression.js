BASE.require([
    "BASE.parsers.Expression",
    "BASE.parsers.MatchResult"
], function () {
    
    BASE.namespace("BASE.parsers");
    
    var MatchResult = BASE.parsers.MatchResult;
    var Expression = BASE.parsers.Expression;
    
    var ValueExpression = function (name, value) {
        this.name = name;
        this.value = value;
    };
    
    BASE.extend(Expression, ValueExpression);
    
    ValueExpression.prototype.match = function (cursor) {
        var startAt;
        var characters = this.value.split("");
       
        var isMatch = characters.every(function (value) {
            if (!cursor.hasNext()) {
                return false;
            }
            
            var character = cursor.next();
            if (character === value) {
                return true;
            }
            
            return false;
        });
        
        return new MatchResult(true, startAt, endAt, {
            name: this.name,
            value: this.value
        });
       
    };
    
    BASE.parsers.ValueExpression = ValueExpression;

});