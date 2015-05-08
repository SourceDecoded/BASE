BASE.require([
    "BASE.query.ArrayVisitor"
], function () {
    BASE.namespace("BASE.query");
    
    BASE.query.IndexedDbVisitor = function () {
        var self = this;
        BASE.query.ArrayVisitor.call(self);
    };
    
    BASE.extend(BASE.query.IndexedDbVisitor, BASE.query.ArrayVisitor);

});