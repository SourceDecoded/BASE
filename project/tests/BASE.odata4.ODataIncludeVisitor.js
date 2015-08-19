var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.odata4.ODataIncludeVisitor",
    "BASE.web.MockAjaxProvider",
    "BASE.query.Queryable",
    "BASE.data.testing.model.person",
    "BASE.data.testing.model.address",
    "BASE.data.testing.Edm"
], function () {
    
    var ODataIncludeVisitor = BASE.odata4.ODataIncludeVisitor;
    var MockAjaxProvider = BASE.web.MockAjaxProvider;
    var Queryable = BASE.query.Queryable;
    var personModel = BASE.data.testing.model.person;
    var addressModel = BASE.data.testing.model.address;
    var edm = new BASE.data.testing.Edm();
    
    var config = {
        model: personModel,
        edm: edm
    };
    
    exports["BASE.odata4.ODataIncludeVisitor: Expand empty."] = function () {
        var query = new Queryable();
        
        var includeExpression = query.getExpression().include;
        var visitor = new ODataIncludeVisitor(config);
        var odataString = visitor.parse(includeExpression);
        
        assert.equal(odataString, "");
    };
    
    exports["BASE.odata4.ODataIncludeVisitor: Expand."] = function () {
        var query = new Queryable();
        query = query.include(function (person) {
            return person.property("addresses");
        });
        
        var includeExpression = query.getExpression().include;
        var visitor = new ODataIncludeVisitor(config);
        var odataString = visitor.parse(includeExpression);
        
        assert.equal(odataString, "$expand=Addresses");
    };
    
    exports["BASE.odata4.ODataIncludeVisitor: Expand with Filter."] = function () {
        var query = new Queryable();
        
        query = query.include(function (person) {
            return person.property("addresses").where(function (address) {
                return address.property("city").isEqualTo("Cedar");
            });
        });
        
        var includeExpression = query.getExpression().include;
        var visitor = new ODataIncludeVisitor({
            edm: edm,
            model: personModel
        });
        
        var odataString = visitor.parse(includeExpression);
        
        assert.equal(odataString, "$expand=Addresses($filter=City eq 'Cedar')");
    };
    
    exports["BASE.odata4.ODataIncludeVisitor: Inner Expand with Filter."] = function () {
        var query = new Queryable();
        query = query.include(function (person) {
            return person.property("hrAccount").where(function (person) {
                return person.property("accountId").isEqualTo(1);
            });
        }).include(function (person) {
            return person.property("hrAccount").property("roles").where(function (address) {
                return address.property("name").isEqualTo("Janitor");
            });
        });
        
        var includeExpression = query.getExpression().include;
        var visitor = new ODataIncludeVisitor({
            edm: edm,
            model: personModel
        });
        var odataString = visitor.parse(includeExpression);
        
        assert.equal(odataString, "$expand=HrAccount($filter=AccountId eq 1;$expand=Roles($filter=Name eq 'Janitor'))");
    };
    
    exports["BASE.odata4.ODataIncludeVisitor: Multiple Inner Expands with Filters and without Filters two deep."] = function () {
        var query = new Queryable();
        query = query.include(function (person) {
            return person.property("hrAccount").where(function (hrAccount) {
                return hrAccount.property("accountId").isEqualTo(0);
            });
        }).include(function (person) {
            return person.property("hrAccount").property("roles").where(function (role) {
                return role.property("name").isEqualTo("role");
            });
        }).include(function (person) {
            return person.property("phoneNumbers").where(function (phoneNumber) {
                return phoneNumber.property("areacode").isEqualTo(435);
            });
        }).include(function (roles) {
            return roles.property("addresses");
        });
        
        var includeExpression = query.getExpression().include;
        var visitor = new ODataIncludeVisitor({
            edm: edm,
            model: personModel
        });
        var odataString = visitor.parse(includeExpression);
        
        assert.equal(odataString, "$expand=HrAccount($filter=AccountId eq 0;$expand=Roles($filter=Name eq 'role')),PhoneNumbers($filter=Areacode eq 435),Addresses");
    };

    exports["BASE.odata4.ODataIncludeVisitor: Include the namespace multiple times."] = function () {
        var query = new Queryable();
        query = query.include(function (person) {
            return person.property("hrAccount");
        }).include(function (person) {
            return person.property("hrAccount").property("roles").where(function (role) {
                return role.property("name").isEqualTo("role");
            });
        });
        
        var includeExpression = query.getExpression().include;
        var visitor = new ODataIncludeVisitor({
            edm: edm,
            model: personModel
        });
        var odataString = visitor.parse(includeExpression);
        
        assert.equal(odataString, "$expand=HrAccount($expand=Roles($filter=Name eq 'role'))");
    };

});
