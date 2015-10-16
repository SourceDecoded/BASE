BASE.require([
    "BASE.parsers.Cursor"
], function () {
    
    BASE.namespace("BASE.parsers");
    
    var Cursor = BASE.parsers.Cursor;
    
    var Scanner = function (topExpression) {
        this.topExpression = topExpression;
    };
    
    Scanner.prototype.scan = function (source) {
        var cursor = new Cursor(source);
        cursor.next();
        return this.topExpression.match(cursor);
    };
    
    BASE.parsers.Scanner = Scanner;
});