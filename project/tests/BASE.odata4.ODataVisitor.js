var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.odata4.ODataVisitor",
    "BASE.web.MockAjaxProvider",
    "BASE.query.Queryable",
    "BASE.query.Expression"
], function () {
    
    var ODataVisitor = BASE.odata4.ODataVisitor;
    var Queryable = BASE.query.Queryable;
    var Expression = BASE.query.Expression;
    
    exports["BASE.odata4.ODataVisitor: Single And Test."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.and("a");
        
        assert.equal(odataString, "a");
    };
    
    exports["BASE.odata4.ODataVisitor: Double And Test."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.and("a", "b");
        
        assert.equal(odataString, "(a and b)");
    };
    
    exports["BASE.odata4.ODataVisitor: Single Or Test."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.or("a");
        
        assert.equal(odataString, "a");
    };
    
    exports["BASE.odata4.ODataVisitor: Double Or Test."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.or("a", "b");
        
        assert.equal(odataString, "(a or b)");
    };
    
    exports["BASE.odata4.ODataVisitor: And and Or Test."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.and(visitor.or("a", "b"), "c");
        
        assert.equal(odataString, "((a or b) and c)");
    };
    
    exports["BASE.odata4.ODataVisitor: PropertyAccess without left property access."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.propertyAccess(Expression.function(Object), "LastName");
        
        assert.equal(odataString, "LastName");
    };
    
    exports["BASE.odata4.ODataVisitor: PropertyAccess with left property access."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.propertyAccess("Person", "LastName");
        
        assert.equal(odataString, "Person/LastName");
    };
    
    exports["BASE.odata4.ODataVisitor: Property."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.property(Expression.property("lastName"));
        
        assert.equal(odataString, "LastName");
    };
    
    exports["BASE.odata4.ODataVisitor: Equal to."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.equalTo("LastName", "barn");
        
        assert.equal(odataString, "LastName eq 'barn'");
    };
    
    exports["BASE.odata4.ODataVisitor: Not Equal to."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.notEqualTo("LastName", "barn");
        
        assert.equal(odataString, "LastName ne 'barn'");
    };
    
    exports["BASE.odata4.ODataVisitor: Greater Than."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.greaterThan("Age", 0);
        
        assert.equal(odataString, "Age gt 0");
    };
    
    exports["BASE.odata4.ODataVisitor: Greater Than Or Equal."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.greaterThanOrEqualTo("Age", 0);
        
        assert.equal(odataString, "Age ge 0");
    };
    
    exports["BASE.odata4.ODataVisitor: Less Than."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.lessThan("Age", 0);
        
        assert.equal(odataString, "Age lt 0");
    };
    
    exports["BASE.odata4.ODataVisitor: Less Than Or Equal."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.lessThanOrEqualTo("Age", 0);
        
        assert.equal(odataString, "Age le 0");
    };
    
    exports["BASE.odata4.ODataVisitor: Has."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.has("Color", "Sales.Color'Yellow'");
        
        assert.equal(odataString, "Color has Sales.Color'Yellow'");
    };
    
    exports["BASE.odata4.ODataVisitor: Not."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.not("contains(LastName,'barn')");
        
        assert.equal(odataString, "not contains(LastName,'barn')");
    };
    
    exports["BASE.odata4.ODataVisitor: StartsWith."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.startsWith("LastName", "barn");
        
        assert.equal(odataString, "startswith(LastName,'barn')");
    };
    
    exports["BASE.odata4.ODataVisitor: EndsWith."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.endsWith("LastName", "barn");
        
        assert.equal(odataString, "endswith(LastName,'barn')");
    };
    
    exports["BASE.odata4.ODataVisitor: IndexOf."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.indexOf("LastName", "Jared");
        
        assert.equal(odataString, "indexof(LastName,'Jared')");
    };
    
    exports["BASE.odata4.ODataVisitor: IndexOf throw if not string."] = function () {
        var visitor = new ODataVisitor();
        assert.throws(function () {
            visitor.indexof("LastName", true);
        });
    };
    
    exports["BASE.odata4.ODataVisitor: concat."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.concat("LastName", "Jared");
        
        assert.equal(odataString, "concat(LastName,'Jared')");
    };
    
    exports["BASE.odata4.ODataVisitor: IndexOf throw if not string."] = function () {
        var visitor = new ODataVisitor();
        assert.throws(function () {
            visitor.indexof("LastName", true);
        });
    };
    
    exports["BASE.odata4.ODataVisitor: Substring."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.substring("LastName", 0, 4);
        
        assert.equal(odataString, "substring(LastName,0,4)");
    };
    
    exports["BASE.odata4.ODataVisitor: Contains."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.substringOf("LastName", "barn");
        
        assert.equal(odataString, "contains(LastName,'barn')");
    };
    
    exports["BASE.odata4.ODataVisitor: Contains throw if not a string."] = function () {
        var visitor = new ODataVisitor();
        assert.throws(function () {
            visitor.contains("LastName", true);
        });
    };
    
    exports["BASE.odata4.ODataVisitor: ToUpper."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.toUpper("LastName");
        
        assert.equal(odataString, "toupper(LastName)");
    };
    
    exports["BASE.odata4.ODataVisitor: ToLower."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.toLower("LastName");
        
        assert.equal(odataString, "tolower(LastName)");
    };
    
    exports["BASE.odata4.ODataVisitor: ToUpper."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.toUpper("LastName");
        
        assert.equal(odataString, "toupper(LastName)");
    };
    
    exports["BASE.odata4.ODataVisitor: trim."] = function () {
        var visitor = new ODataVisitor();
        var odataString = visitor.trim("LastName");
        
        assert.equal(odataString, "trim(LastName)");
    };
    
    exports["BASE.odata4.ODataVisitor: Nested Contains."] = function () {
        var query = new Queryable();
        query = query.where(function (role) {
            return role.property("person").property("lastName").contains("barn");
        });
        
        var whereExpression = query.getExpression().where;
        var visitor = new ODataVisitor();
        var odataString = visitor.parse(whereExpression);
        
        assert.equal(odataString, "$filter=contains(Person/LastName,'barn')");
    };
    
    exports["BASE.odata4.ODataVisitor: Top."] = function () {
        var query = new Queryable();
        query = query.take(10);
        
        var takeExpression = query.getExpression().take;
        var visitor = new ODataVisitor();
        var odataString = visitor.parse(takeExpression);
        
        assert.equal(odataString, "$top=10");
    };
    
});