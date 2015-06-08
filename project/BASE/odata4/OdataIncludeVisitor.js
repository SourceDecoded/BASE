BASE.require([
    "BASE.query.ExpressionVisitor",
    "BASE.collections.Hashmap",
    "Array.prototype.indexOfByFunction",
    "BASE.query.Queryable",
    "BASE.odata4.ODataVisitor",
    "BASE.odata.convertToOdataValue"
], function () {
    var Future = BASE.async.Future;
    var ExpressionVisitor = BASE.query.ExpressionVisitor;
    var Hashmap = BASE.collections.Hashmap;
    var Queryable = BASE.query.Queryable;
    var ODataVisitor = BASE.odata4.ODataVisitor;
    var getOdataValue = BASE.odata.convertToOdataValue;
    
    BASE.namespace("BASE.odata4");
    
    var ODataIncludeVisitor = function () {
        var self = this;
        ExpressionVisitor.call(this);
        
        self._propertyAccessors = {};
        self._currentNamespace = "";
    };
    
    ODataIncludeVisitor.protoype = Object.create(ExpressionVisitor.prototype);
    ODataIncludeVisitor.prototype.constructor = ODataIncludeVisitor;
    
    ODataIncludeVisitor.prototype["_innerWriteIncude"] = function (property, propertyAccessor) {
        var self = this;
        return "$expand=" + self._writeIncude(property, propertyAccessor);
    };
    
    ODataIncludeVisitor.prototype["_writeIncude"] = function (property, propertyAccessor) {
        var self = this;
        var commands = [];
        
        if (typeof propertyAccessor.filter === "string") {
            commands.push(propertyAccessor.filter)
        }
        
        var expands = Object.keys(propertyAccessor).filter(function (key) {
            return key === "filter" ? false: true;
        });
        
        if (expands.length > 0) {
            commands.push("$expand=" + expands.map(function (key) {
                return self._writeIncude(key, propertyAccessor[key]);
            }).join(","));
        }
        
        if (commands.length > 0) {
            return property + "(" + commands.join(";") + ")";
        }
        
        return property;
    };
    
    ODataIncludeVisitor.prototype["include"] = function () {
        var self = this;
        return "$expand=" + Object.keys(self._propertyAccessors).map(function (key) {
            return self._writeIncude(key, self._propertyAccessors[key]);
        }).join(",");
    };
    
    ODataIncludeVisitor.prototype["queryable"] = function (whereExpression) {
        var odataVisitor = new ODataVisitor();
        return odataVisitor.parse(whereExpression.value);
    };
    
    ODataIncludeVisitor.prototype["propertyAccess"] = function (propertyAccessors, property, filter) {
        var metaData = propertyAccessors[property] = propertyAccessors[property] || {};
        
        if (typeof filter !== "undefined") {
            metaData.filter = filter;
        }
        
        return metaData;
    };
    
    ODataIncludeVisitor.prototype["property"] = function (expression) {
        var propertyName = expression.value;
        return propertyName.substr(0, 1).toUpperCase() + propertyName.substring(1);
    };
    
    ODataIncludeVisitor.prototype["type"] = function (value) {
        return this._currentNamespace = this._propertyAccessors;
    };
    
    BASE.odata4.ODataIncludeVisitor = ODataIncludeVisitor;

});
