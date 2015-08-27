var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.odata4.ODataVisitor",
    "BASE.web.MockAjaxProvider",
    "BASE.query.Queryable",
    "BASE.query.Expression",
    "BASE.data.testing.model.person",
    "BASE.data.testing.Edm"
], function () {
    
    var ODataVisitor = BASE.odata4.ODataVisitor;
    var Queryable = BASE.query.Queryable;
    var Expression = BASE.query.Expression;
    var personModel = BASE.data.testing.model.person;
    var edm = new BASE.data.testing.Edm();
    
    var config = {
        model: personModel,
        edm: edm
    };
    
    var visitor = new ODataVisitor(config);
    
    var buildPropertyAccess = function (property) {
        return visitor.propertyAccess(Expression.function(Object), property);
    };
    
    var isMatch = function (message) {
        return function (error) {
            return message === error.message;
        };
    };
    
    exports["BASE.odata4.ODataVisitor: Without a model."] = function () {
        assert.throws(function () {
            new ODataVisitor();
            
        }, isMatch("Null Argument Exception: model cannot be undefined in configurations."));
    };
    
    exports["BASE.odata4.ODataVisitor: Without a edm."] = function () {
        assert.throws(function () {
            new ODataVisitor({ model: personModel });
            
        }, isMatch("Null Argument Exception: edm cannot be undefined in configurations."));
    };
    
    exports["BASE.odata4.ODataVisitor: Single And Test."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.and("a");
        
        assert.equal(odataString, "a");
    };
    
    exports["BASE.odata4.ODataVisitor: Double And Test."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.and("a", "b");
        
        assert.equal(odataString, "(a and b)");
    };
    
    exports["BASE.odata4.ODataVisitor: Single Or Test."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.or("a");
        
        assert.equal(odataString, "a");
    };
    
    exports["BASE.odata4.ODataVisitor: Double Or Test."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.or("a", "b");
        
        assert.equal(odataString, "(a or b)");
    };
    
    exports["BASE.odata4.ODataVisitor: And and Or Test."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.and(visitor.or("a", "b"), "c");
        
        assert.equal(odataString, "((a or b) and c)");
    };
    
    exports["BASE.odata4.ODataVisitor: PropertyAccess without left property access."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.propertyAccess(Expression.function(Object), "lastName");
        
        assert.equal(odataString.namespace, "LastName");
        assert.equal(odataString.property, "lastName");
    };
    
    exports["BASE.odata4.ODataVisitor: PropertyAccess with left property access."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.propertyAccess(buildPropertyAccess("hrAccount"), "accountId");
        
        assert.equal(odataString.namespace, "HrAccount/AccountId");
        assert.equal(odataString.property, "accountId");
    };
    
    exports["BASE.odata4.ODataVisitor: Property."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.property(Expression.property("lastName"));
        
        assert.equal(odataString, "lastName");
    };
    
    exports["BASE.odata4.ODataVisitor: Equal to."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.equalTo(buildPropertyAccess("lastName"), "barn");
        
        assert.equal(odataString, "LastName eq 'barn'");
    };
    
    exports["BASE.odata4.ODataVisitor: Not Equal to."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.notEqualTo(buildPropertyAccess("lastName"), "barn");
        
        assert.equal(odataString, "LastName ne 'barn'");
    };
    
    exports["BASE.odata4.ODataVisitor: Greater Than."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.greaterThan(buildPropertyAccess("age"), 0);
        
        assert.equal(odataString, "Age gt 0");
    };
    
    exports["BASE.odata4.ODataVisitor: Greater Than Or Equal."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.greaterThanOrEqualTo(buildPropertyAccess("age"), 0);
        
        assert.equal(odataString, "Age ge 0");
    };
    
    exports["BASE.odata4.ODataVisitor: Less Than."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.lessThan(buildPropertyAccess("age"), 0);
        
        assert.equal(odataString, "Age lt 0");
    };
    
    exports["BASE.odata4.ODataVisitor: Less Than Or Equal."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.lessThanOrEqualTo(buildPropertyAccess("age"), 0);
        
        assert.equal(odataString, "Age le 0");
    };
    
    exports["BASE.odata4.ODataVisitor: Has."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.has(buildPropertyAccess("humanoidType"), "Namespace.HumanoidType'Human'");
        
        assert.equal(odataString, "HumanoidType has Namespace.HumanoidType'Human'");
    };
    
    exports["BASE.odata4.ODataVisitor: Not."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.not("contains(LastName,'barn')");
        
        assert.equal(odataString, "not contains(LastName,'barn')");
    };
    
    exports["BASE.odata4.ODataVisitor: StartsWith."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.startsWith(buildPropertyAccess("lastName"), "barn");
        
        assert.equal(odataString, "startswith(LastName,'barn')");
    };
    
    exports["BASE.odata4.ODataVisitor: EndsWith."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.endsWith(buildPropertyAccess("lastName"), "barn");
        
        assert.equal(odataString, "endswith(LastName,'barn')");
    };
    
    exports["BASE.odata4.ODataVisitor: IndexOf."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.indexOf(buildPropertyAccess("lastName"), "Jared");
        
        assert.equal(odataString, "indexof(LastName,'Jared')");
    };
    
    exports["BASE.odata4.ODataVisitor: IndexOf throw if not string."] = function () {
        var visitor = new ODataVisitor(config);
        assert.throws(function () {
            visitor.indexof("LastName", true);
        });
    };
    
    exports["BASE.odata4.ODataVisitor: concat."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.concat(buildPropertyAccess("lastName"), "Jared");
        
        assert.equal(odataString, "concat(LastName,'Jared')");
    };
    
    exports["BASE.odata4.ODataVisitor: IndexOf throw if not string."] = function () {
        var visitor = new ODataVisitor(config);
        assert.throws(function () {
            visitor.indexof("LastName", true);
        });
    };
    
    exports["BASE.odata4.ODataVisitor: Substring."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.substring(buildPropertyAccess("lastName"), 0, 4);
        
        assert.equal(odataString, "substring(LastName,0,4)");
    };
    
    exports["BASE.odata4.ODataVisitor: Contains."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.substringOf(buildPropertyAccess("lastName"), "barn");
        
        assert.equal(odataString, "contains(LastName,'barn')");
    };
    
    exports["BASE.odata4.ODataVisitor: Contains throw if not a string."] = function () {
        var visitor = new ODataVisitor(config);
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
        var visitor = new ODataVisitor(config);
        var odataString = visitor.toLower(buildPropertyAccess("lastName"));
        
        assert.equal(odataString, "tolower(LastName)");
    };
    
    exports["BASE.odata4.ODataVisitor: ToUpper."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.toUpper(buildPropertyAccess("lastName"));
        
        assert.equal(odataString, "toupper(LastName)");
    };
    
    exports["BASE.odata4.ODataVisitor: any."] = function () {
        var visitor = new ODataVisitor({
            model: config.model, 
            edm: config.edm, 
            scope: "entity"
        });
        
        var queryable = new Queryable();
        queryable = queryable.where(function (e) { return e.property("areacode").isEqualTo(435); });
        
        var odataString = visitor.any(buildPropertyAccess("phoneNumbers"), queryable.getExpression().where.children[0]);
        
        assert.equal(odataString, "PhoneNumbers/any(entity: entity/Areacode eq 435)");
    };
    
    exports["BASE.odata4.ODataVisitor: all."] = function () {
        var visitor = new ODataVisitor({
            model: config.model,
            edm: config.edm,
            scope: "entity"
        });
        
        var queryable = new Queryable();
        queryable = queryable.where(function (e) { return e.property("street").endsWith("North"); });
        
        var odataString = visitor.all(buildPropertyAccess("addresses"), queryable.getExpression().where.children[0]);
        
        assert.equal(odataString, "Addresses/all(entity: endswith(entity/Street,'North'))");
    };
    
    exports["BASE.odata4.ODataVisitor: trim."] = function () {
        var visitor = new ODataVisitor(config);
        var odataString = visitor.trim(buildPropertyAccess("lastName"));
        
        assert.equal(odataString, "trim(LastName)");
    };
    
    exports["BASE.odata4.ODataVisitor: Nested IsEqualTo."] = function () {
        var query = new Queryable();
        query = query.where(function (person) {
            return person.property("hrAccount").property("accountId").isEqualTo(1);
        });
        
        var whereExpression = query.getExpression().where;
        var visitor = new ODataVisitor(config);
        var odataString = visitor.parse(whereExpression);
        
        assert.equal(odataString, "$filter=HrAccount/AccountId eq 1");
    };
    
    exports["BASE.odata4.ODataVisitor: Top."] = function () {
        var query = new Queryable();
        query = query.take(10);
        
        var takeExpression = query.getExpression().take;
        var visitor = new ODataVisitor(config);
        var odataString = visitor.parse(takeExpression);
        
        assert.equal(odataString, "$top=10");
    };
    
});