BASE.require([
    "BASE.sql.Visitor",
    "BASE.sqlite.dataConverter"
], function () {
    
    BASE.namespace("BASE.sqlite");
    
    BASE.sqlite.Visitor = function (Type, edm) {
        BASE.sql.Visitor.call(this, Type, edm, BASE.sqlite.dataConverter);
    };
    
    BASE.extend(BASE.sqlite.Visitor, BASE.sql.Visitor);

});