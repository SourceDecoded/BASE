var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.query.Queryable",
    "BASE.parse.Visitor",
    "BASE.data.testing.Edm",
    "BASE.data.testing.model.person"
], function () {
    
    var Visitor = BASE.parse.Visitor;
    var Queryable = BASE.query.Queryable;
    var Edm = BASE.data.testing.Edm;
    var personModel = BASE.data.testing.model.person;
    
    var config = {
        model: personModel,
        edm: new Edm()
    };
    
    exports["BASE.parse.Visitor: Orderby"] = function () {
      

    };
    
    exports["BASE.parse.Visitor: OrderbyDesc"] = function () {
      

    };
    
    exports["BASE.parse.Visitor: Multiple OrderbyDesc"] = function () {
       

    };
    
    exports["BASE.parse.Visitor: Filter isEqualTo"] = function () {
        var correctValue = 'where={"age":1000}';
        
        var queryable = new Queryable().where(function (expBuilder) {
            return expBuilder.property("age").isEqualTo(1000);
        });
        
        var visitor = new Visitor(config);
        var result = visitor.parse(queryable.getExpression().where);
        
        assert.equal(result, correctValue);
    };
    
    exports["BASE.parse.Visitor: Filter isNotEqualTo"] = function () {
        var correctValue = 'where={"age":{"$ne":1000}}';
        
        var queryable = new Queryable().where(function (expBuilder) {
            return expBuilder.property("age").isNotEqualTo(1000);
        });
        
        var visitor = new Visitor(config);
        var result = visitor.parse(queryable.getExpression().where);
        
        assert.equal(result, correctValue);
    };
    
    exports["BASE.parse.Visitor: or"] = function () {
        var correctValue = 'where={"$or":[{"age":{"$ne":1000}},{"firstName":{"$ne":"Jared"}}]}';
        
        var queryable = new Queryable().where(function (expBuilder) {
            return expBuilder.or(
                expBuilder.property("age").isNotEqualTo(1000),
                expBuilder.property("firstName").isNotEqualTo("Jared")
            );
        });
        
        var visitor = new Visitor(config);
        var result = visitor.parse(queryable.getExpression().where);
        
        assert.equal(result, correctValue);
    };
    
    exports["BASE.parse.Visitor: Filter isGreaterThan"] = function () {
        var correctValue = 'where={"age":{"$gt":1000}}';
        
        var queryable = new Queryable().where(function (expBuilder) {
            return expBuilder.property("age").isGreaterThan(1000);
        });
        
        var visitor = new Visitor(config);
        var result = visitor.parse(queryable.getExpression().where);
        
        assert.equal(result, correctValue);
    };
    
    exports["BASE.parse.Visitor: Filter isGreaterThanOrEqualTo"] = function () {
        var correctValue = 'where={"age":{"$gte":1000}}';
        
        var queryable = new Queryable().where(function (expBuilder) {
            return expBuilder.property("age").isGreaterThanOrEqualTo(1000);
        });
        
        var visitor = new Visitor(config);
        var result = visitor.parse(queryable.getExpression().where);
        
        assert.equal(result, correctValue);
    };
    
    exports["BASE.parse.Visitor: Filter isLessThan"] = function () {
        var correctValue = 'where={"age":{"$lt":1000}}';
        
        var queryable = new Queryable().where(function (expBuilder) {
            return expBuilder.property("age").isLessThan(1000);
        });
        
        var visitor = new Visitor(config);
        var result = visitor.parse(queryable.getExpression().where);
        
        assert.equal(result, correctValue);
    };
    
    exports["BASE.parse.Visitor: Filter isLessThanOrEqualTo"] = function () {
        var correctValue = 'where={"age":{"$lte":1000}}';
        
        var queryable = new Queryable().where(function (expBuilder) {
            return expBuilder.property("age").isLessThanOrEqualTo(1000);
        });
        
        var visitor = new Visitor(config);
        var result = visitor.parse(queryable.getExpression().where);
        
        assert.equal(result, correctValue);
    };
    
    exports["BASE.parse.Visitor: Filter contains"] = function () {
        var correctValue = 'where={"firstName":{"$regex":"[J][a][r][e][d]"}}';
        
        var queryable = new Queryable().where(function (expBuilder) {
            return expBuilder.property("firstName").contains("Jared");
        });
        
        var visitor = new Visitor(config);
        var result = visitor.parse(queryable.getExpression().where);
        
        assert.equal(result, correctValue);
    };
    
    exports["BASE.parse.Visitor: Filter startsWith"] = function () {
        var correctValue = 'where={"firstName":{"$regex":"^Jared"}}';
        
        var queryable = new Queryable().where(function (expBuilder) {
            return expBuilder.property("firstName").startsWith("Jared");
        });
        
        var visitor = new Visitor(config);
        var result = visitor.parse(queryable.getExpression().where);
        
        assert.equal(result, correctValue);
    };
    
    exports["BASE.parse.Visitor: Filter endsWith"] = function () {
        var correctValue = 'where={"firstName":{"$regex":"Jared$"}}';
        
        var queryable = new Queryable().where(function (expBuilder) {
            return expBuilder.property("firstName").endsWith("Jared");
        });
        
        var visitor = new Visitor(config);
        var result = visitor.parse(queryable.getExpression().where);
        
        assert.equal(result, correctValue);
    };

    
});
