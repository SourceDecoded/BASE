var assert = require('assert');

require('../BASE.js');
BASE.require.loader.setRoot('./');

BASE.require([
    'BASE.odata4.ODataIncludeVisitor',
    'BASE.web.MockAjaxProvider',
    'BASE.query.Queryable'
], function () {
    
    var ODataIncludeVisitor = BASE.odata4.ODataIncludeVisitor;
    var MockAjaxProvider = BASE.web.MockAjaxProvider
    var Queryable = BASE.query.Queryable;
    
    exports['BASE.odata4.ODataIncludeVisitor: Expand empty.'] = function () {
        var query = new Queryable();
        
        var includeExpression = query.getExpression().include;
        var visitor = new ODataIncludeVisitor();
        var odataString = visitor.parse(includeExpression);
        
        assert.equal(odataString, "");
    };
    
    exports['BASE.odata4.ODataIncludeVisitor: Expand.'] = function () {
        var query = new Queryable();
        query = query.include(function (roles) {
            return roles.property("person");
        });
        
        var includeExpression = query.getExpression().include;
        var visitor = new ODataIncludeVisitor();
        var odataString = visitor.parse(includeExpression);
        
        assert.equal(odataString, "$expand=Person");
    };
    
    exports['BASE.odata4.ODataIncludeVisitor: Expand with Filter.'] = function () {
        var query = new Queryable();
        
        query = query.include(function (roles) {
            return roles.property("people").where(function (person) {
                return person.property("firstName").isEqualTo("Jared");
            });
        });
        
        var includeExpression = query.getExpression().include;
        var visitor = new ODataIncludeVisitor();
        var odataString = visitor.parse(includeExpression);
        
        assert.equal(odataString, "$expand=People($filter=FirstName eq 'Jared')");
    };
    
    exports['BASE.odata4.ODataIncludeVisitor: Inner Expand with Filter.'] = function () {
        var query = new Queryable();
        query = query.include(function (roles) {
            return roles.property("people").where(function (person) {
                return person.property("firstName").isEqualTo("Jared");
            });
        }).include(function (roles) {
            return roles.property("people").property("addresses").where(function (address) {
                return address.property("areacode").isEqualTo("435");
            });
        });
        
        var includeExpression = query.getExpression().include;
        var visitor = new ODataIncludeVisitor();
        var odataString = visitor.parse(includeExpression);
        
        assert.equal(odataString, "$expand=People($filter=FirstName eq 'Jared';$expand=Addresses($filter=Areacode eq '435'))");
    };
    
    exports['BASE.odata4.ODataIncludeVisitor: Multiple Inner Expands with Filters.'] = function () {
        var query = new Queryable();
        query = query.include(function (roles) {
            return roles.property("people").where(function (person) {
                return person.property("firstName").isEqualTo("Jared");
            });
        }).include(function (roles) {
            return roles.property("people").property("addresses").where(function (address) {
                return address.property("areacode").isEqualTo("435");
            });
        }).include(function (roles) {
            return roles.property("permissions").where(function (address) {
                return address.property("name").isEqualTo("Admin");
            });
        });
        
        var includeExpression = query.getExpression().include;
        var visitor = new ODataIncludeVisitor();
        var odataString = visitor.parse(includeExpression);
        
        assert.equal(odataString, "$expand=People($filter=FirstName eq 'Jared';$expand=Addresses($filter=Areacode eq '435')),Permissions($filter=Name eq 'Admin')");
    };
    
    exports['BASE.odata4.ODataIncludeVisitor: Multiple Inner Expands with Filters and without Filters.'] = function () {
        var query = new Queryable();
        query = query.include(function (roles) {
            return roles.property("people").where(function (person) {
                return person.property("firstName").isEqualTo("Jared");
            });
        }).include(function (roles) {
            return roles.property("people").property("addresses").where(function (address) {
                return address.property("areacode").isEqualTo("435");
            });
        }).include(function (roles) {
            return roles.property("permissions").where(function (address) {
                return address.property("name").isEqualTo("Admin");
            });
        }).include(function (roles) {
            return roles.property("addresses");
        }).include(function (roles) {
            return roles.property("people").property("emailAddresses");
        });
        
        var includeExpression = query.getExpression().include;
        var visitor = new ODataIncludeVisitor();
        var odataString = visitor.parse(includeExpression);
        
        assert.equal(odataString, "$expand=People($filter=FirstName eq 'Jared';$expand=Addresses($filter=Areacode eq '435'),EmailAddresses),Permissions($filter=Name eq 'Admin'),Addresses");
    };
    
    exports['BASE.odata4.ODataIncludeVisitor: Multiple Inner Expands with Filters and without Filters three deep.'] = function () {
        var query = new Queryable();
        query = query.include(function (roles) {
            return roles.property("people").where(function (person) {
                return person.property("firstName").isEqualTo("Jared");
            });
        }).include(function (roles) {
            return roles.property("people").property("addresses").where(function (address) {
                return address.property("areacode").isEqualTo("435");
            });
        }).include(function (roles) {
            return roles.property("permissions").where(function (address) {
                return address.property("name").isEqualTo("Admin");
            });
        }).include(function (roles) {
            return roles.property("addresses");
        }).include(function (roles) {
            return roles.property("people").property("emailAddresses").property("types").where(function (email) {
                return email.property("type").isNotEqualTo("Home");
            });
        });
        
        var includeExpression = query.getExpression().include;
        var visitor = new ODataIncludeVisitor();
        var odataString = visitor.parse(includeExpression);

        assert.equal(odataString, "$expand=People($filter=FirstName eq 'Jared';$expand=Addresses($filter=Areacode eq '435'),EmailAddresses($expand=Types($filter=Type ne 'Home'))),Permissions($filter=Name eq 'Admin'),Addresses");
    };

});
