BASE.require([
    "BASE.query.ExpressionVisitor",
    "Array.prototype.indexOfByFunction",
    "BASE.odata4.ODataVisitor"
], function () {
    var ExpressionVisitor = BASE.query.ExpressionVisitor;
    var ODataVisitor = BASE.odata4.ODataVisitor;
    
    BASE.namespace("BASE.odata4");
    
    var ODataIncludeVisitor = function (config) {
        config = config || { type: Object, model: { properties: {} } };
        var self = this;
        ExpressionVisitor.call(this);
        
        self._config = config;
        self._edm = config.edm;
        self._propertyAccessors = {};
        self._currentNamespace = "";
        self._propertyModels = {};
        self._currentPropertyModel = null;
        
        if (typeof edm !== "undefined") {
            var oneToManyRelationships = edm.getOneToManyRelationships(model.type);
            
            oneToManyRelationships.reduce(function (propertyModels, relationship) {
                var model = edm.getModelByType(relationship.ofType);
                propertyModels[relationship.hasMany] = model;
                return propertyModels;
            }, self._propertyModels);
        }
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
            commands.push(propertyAccessor.filter);
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
        
        if (Object.keys(self._propertyAccessors).length === 0) {
            return "";
        }
        
        return "$expand=" + Object.keys(self._propertyAccessors).map(function (key) {
            return self._writeIncude(key, self._propertyAccessors[key]);
        }).join(",");
    };
    
    ODataIncludeVisitor.prototype["queryable"] = function (whereExpression) {
        var self = this;
        var config = {
            edm: self._edm,
            model: self._currentPropertyModel
        };
        var odataVisitor = new ODataVisitor(config);
        return odataVisitor.parse(whereExpression.value);
    };
    
    ODataIncludeVisitor.prototype["propertyAccess"] = function (propertyAccessors, property, filter) {
        var self = this;
        var metaData = propertyAccessors[property] = propertyAccessors[property] || {};
        
        if (typeof filter !== "undefined") {
            metaData.filter = filter;
        }
        var propertyModel = self._propertyModels[property];
        if (propertyModel) {
            self._currentPropertyModel = propertyModel;
        } else {
            self._currentPropertyModel = null;
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
