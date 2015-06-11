var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.query.Queryable",
    "BASE.query.ODataVisitor"
], function () {
    
    var ODataVisitor = BASE.query.ODataVisitor;
    var Queryable = BASE.query.Queryable;
    
    exports["BASE.query.ODataVisitor: Orderby"] = function () {
        var queryable = new Queryable();
        
        queryable = queryable.orderBy(function (expr) {
            return expr.property("firstName");
        });
        
        var expression = queryable.getExpression();
        
        var visitor = new ODataVisitor();
        var odataString = visitor.parse(expression.orderBy);
        
        assert.equal(odataString, "&$orderby=FirstName asc");

    };
    
    exports["BASE.query.ODataVisitor: OrderbyDesc"] = function () {
        var queryable = new Queryable();
        
        queryable = queryable.orderByDesc(function (expr) {
            return expr.property("firstName");
        });
        
        var expression = queryable.getExpression();
        
        var visitor = new ODataVisitor();
        var odataString = visitor.parse(expression.orderBy);
        
        assert.equal(odataString, "&$orderby=FirstName desc");

    };
    
    exports["BASE.query.ODataVisitor: Multiple OrderbyDesc"] = function () {
        var queryable = new Queryable();
        
        queryable = queryable.orderByDesc(function (expr) {
            return expr.property("firstName");
        }).orderBy(function (expr) {
            return expr.property("lastName");
        });
        
        var expression = queryable.getExpression();
        
        var visitor = new ODataVisitor();
        var odataString = visitor.parse(expression.orderBy);
        
        assert.equal(odataString, "&$orderby=FirstName desc, LastName asc");

    };
    
    exports["BASE.query.ODataVisitor: Filter isEqualTo"] = function () {
        var queryable = new Queryable();
        
        queryable = queryable.where(function (expr) {
            return expr.property("firstName").isEqualTo("John");
        });
        
        var expression = queryable.getExpression();
        
        var visitor = new ODataVisitor();
        var odataString = visitor.parse(expression.where);
        
        assert.equal(odataString, "&$filter=((FirstName eq 'John'))");

    };
    
    exports["BASE.query.ODataVisitor: Filter isNotEqualTo"] = function () {
        var queryable = new Queryable();
        
        queryable = queryable.where(function (expr) {
            return expr.property("firstName").isNotEqualTo("John");
        });
        
        var expression = queryable.getExpression();
        
        var visitor = new ODataVisitor();
        var odataString = visitor.parse(expression.where);
        
        assert.equal(odataString, "&$filter=((FirstName ne 'John'))");

    };
    
    exports["BASE.query.ODataVisitor: Filter isGreaterThan"] = function () {
        var queryable = new Queryable();
        
        queryable = queryable.where(function (expr) {
            return expr.property("id").isGreaterThan(10);
        });
        
        var expression = queryable.getExpression();
        
        var visitor = new ODataVisitor();
        var odataString = visitor.parse(expression.where);
        
        assert.equal(odataString, "&$filter=((Id gt 10))");

    };
    
    exports["BASE.query.ODataVisitor: Filter isGreaterThanOrEqualTo"] = function () {
        var queryable = new Queryable();
        
        queryable = queryable.where(function (expr) {
            return expr.property("id").isGreaterThanOrEqualTo(10);
        });
        
        var expression = queryable.getExpression();
        
        var visitor = new ODataVisitor();
        var odataString = visitor.parse(expression.where);
        
        assert.equal(odataString, "&$filter=((Id ge 10))");

    };
    
    exports["BASE.query.ODataVisitor: Filter isLessThan"] = function () {
        var queryable = new Queryable();
        
        queryable = queryable.where(function (expr) {
            return expr.property("id").isLessThan(10);
        });
        
        var expression = queryable.getExpression();
        
        var visitor = new ODataVisitor();
        var odataString = visitor.parse(expression.where);
        
        assert.equal(odataString, "&$filter=((Id lt 10))");

    };
    
    exports["BASE.query.ODataVisitor: Filter isLessThanOrEqualTo"] = function () {
        var queryable = new Queryable();
        
        queryable = queryable.where(function (expr) {
            return expr.property("id").isLessThanOrEqualTo(10);
        });
        
        var expression = queryable.getExpression();
        
        var visitor = new ODataVisitor();
        var odataString = visitor.parse(expression.where);
        
        assert.equal(odataString, "&$filter=((Id le 10))");

    };
    
    exports["BASE.query.ODataVisitor: Filter contains"] = function () {
        var queryable = new Queryable();
        
        queryable = queryable.where(function (expr) {
            return expr.property("firstName").contains("oh");
        });
        
        var expression = queryable.getExpression();
        
        var visitor = new ODataVisitor();
        var odataString = visitor.parse(expression.where);
        
        assert.equal(odataString, "&$filter=(substringof('oh',FirstName))");

    };
    
    exports["BASE.query.ODataVisitor: Filter startsWith"] = function () {
        var queryable = new Queryable();
        
        queryable = queryable.where(function (expr) {
            return expr.property("firstName").startsWith("oh");
        });
        
        var expression = queryable.getExpression();
        
        var visitor = new ODataVisitor();
        var odataString = visitor.parse(expression.where);
        
        assert.equal(odataString, "&$filter=(startswith(FirstName,'oh'))");

    };
    
    exports["BASE.query.ODataVisitor: Filter endsWith"] = function () {
        var queryable = new Queryable();
        
        queryable = queryable.where(function (expr) {
            return expr.property("firstName").endsWith("oh");
        });
        
        var expression = queryable.getExpression();
        
        var visitor = new ODataVisitor();
        var odataString = visitor.parse(expression.where);
        
        assert.equal(odataString, "&$filter=(endswith(FirstName,'oh'))");

    };

    
});
