BASE.require([
    "BASE.parsers.Expression",
    "BASE.parsers.MatchResult"
], function () {
    
    BASE.namespace("BASE.parsers");
    
    var MatchResult = BASE.parsers.MatchResult;
    var Expression = BASE.parsers.Expression;
    
    var RegExExpression = function (name, regex, failedMessage) {
        this.name = name;
        this.regex = regex;
        this.value = null;
        this.failedMessage = failedMessage;
    };
    
    BASE.extend(Expression, RegExExpression);
    
    RegExExpression.prototype.match = function (cursor) {
        var character = cursor.getValue();
        var startAt = cursor.currentIndex;
        var endAt = cursor.startAt + 1;
        
        if (this.regEx.test(character)) {
            
            cursor.next();
            
            return new MatchResult(true, startAt, endAt, {
                name: this.name,
                value: this.regEx.exec(character)
            });

        }
        
        cursor.revert();
        return new MatchResult(false, startAt, startAt, {
            name: "error",
            value: this.failedMessage
        });
    };
    
    BASE.parsers.RegExExpression = RegExExpression;

});