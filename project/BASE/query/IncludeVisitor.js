BASE.require([
    "BASE.query.ExpressionVisitor",
    "BASE.collections.Hashmap", 
    "Array.prototype.indexOfByFunction",
    "BASE.query.Queryable"
], function () {
    BASE.namespace("BASE.query");
    
    var Future = BASE.async.Future;
    var ExpressionVisitor = BASE.query.ExpressionVisitor;
    var Hashmap = BASE.collections.Hashmap;
    var Queryable = BASE.query.Queryable;
    
    var emptyResultsFuture = Future.fromResult([]);
    
    var getNavigationProperties = function (edm, model) {
        var propertyModels = {};
        
        var tempEntity = new model.type();
        var oneToOneRelationships = edm.getOneToOneRelationships(tempEntity);
        var oneToOneAsTargetRelationships = edm.getOneToOneAsTargetRelationships(tempEntity);
        var oneToManyRelationships = edm.getOneToManyRelationships(tempEntity);
        var oneToManyAsTargetRelationships = edm.getOneToManyAsTargetRelationships(tempEntity);
        
        oneToOneRelationships.reduce(function (propertyModels, relationship) {
            propertyModels[relationship.hasOne] = edm.getModelByType(relationship.ofType);
            return propertyModels;
        }, propertyModels);
        
        oneToOneAsTargetRelationships.reduce(function (propertyModels, relationship) {
            propertyModels[relationship.withOne] = edm.getModelByType(relationship.type);
            return propertyModels;
        }, propertyModels);
        
        oneToManyRelationships.reduce(function (propertyModels, relationship) {
            propertyModels[relationship.hasMany] = edm.getModelByType(relationship.ofType);
            return propertyModels;
        }, propertyModels);
        
        oneToManyAsTargetRelationships.reduce(function (propertyModels, relationship) {
            propertyModels[relationship.withOne] = edm.getModelByType(relationship.type);
            return propertyModels;
        }, propertyModels);
        
        return propertyModels;
    };
    
    var IncludeVisitor = function (entities, service, parameters) {
        var self = this;
        
        ExpressionVisitor.call(this);
        
        this._entities = entities;
        this._service = service;
        this._edm = service.getEdm();
        this._propertyAccessors = {};
        this._currentNamespace = "";
        this._currentModel = config.model;
        this._propertyModels = {};
        this._currentPropertyModel = config.model;
        this._parameters = parameters;

    };
    
    IncludeVisitor.prototype = Object.create(ExpressionVisitor.prototype);
    IncludeVisitor.prototype.constructor = IncludeVisitor;
    
    ODataIncludeVisitor.prototype["_getIncludeAsync"] = function (entities, property, modalMetaData) {
        var self = this;
       
    };
    
    IncludeVisitor.prototype["include"] = function () {
        var self = this;
        var entities = self._entities;
        
        if (Object.keys(self._propertyAccessors).length === 0) {
            return emptyResultsFuture;
        }
        
        return Future.all(Object.keys(self._propertyAccessors).map(function (key) {
            return self._getIncludeAsync(entities, key, self._propertyAccessors[key]);
        }));
    };
    
    IncludeVisitor.prototype["queryable"] = function (modelMetaData, expression) {
        var namespace = BASE.getObject(modelMetaData.namespace, this._propertyAccessors);
        
        Object.keys(modelMetaData).forEach(function (key) {
            namespace[key] = modelMetaData[key];
        });

        modelMetaData.filters;
    };
    
    IncludeVisitor.prototype["expression"] = function (expression) {
        return expression.value;
    };
    
    IncludeVisitor.prototype["propertyAccess"] = function (modelMetaData, property) {
        this._currentNamespace = this._currentNamespace;
        BASE.namespace(this._currentNamespace, this._propertyAccessors);
        
        var propertyModel = modelMetaData.navigationProperties[property];
        this._currentModel = propertyModel;
        
        if (typeof propertyModel === "undefined") {
            throw new Error("Cannot find navigation property with name: " + property);
        }
        
        var navigationProperties = getNavigationProperties(this._edm, propertyModel);
        
        return {
            model: propertyModel,
            namespace: this._currentNamespace,
            navigationProperties: navigationProperties
        };
    };
    
    IncludeVisitor.prototype["property"] = function (valueExpression) {
        return valueExpression.value;
    };
    
    IncludeVisitor.prototype["type"] = function () {
        this._currentNamespace = "";
        this._currentModel = this._model;
        var navigationProperties = getNavigationProperties(this._edm, this._model);
        
        return {
            model: this._model,
            namespace: this._currentNamespace,
            navigationProperties: navigationProperties
        };
    };
    
    BASE.query.IncludeVisitor = IncludeVisitor;

});
