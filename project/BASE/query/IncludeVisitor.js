BASE.require([
    "BASE.query.ExpressionVisitor",
    "Array.prototype.indexOfByFunction",
    "BASE.collections.Hashmap",
    "BASE.query.Queryable"
], function () {
    BASE.namespace("BASE.query");
    
    var Future = BASE.async.Future;
    var ExpressionVisitor = BASE.query.ExpressionVisitor;
    var Queryable = BASE.query.Queryable;
    var Hashmap = BASE.collections.Hashmap;
    var emptyFuture = Future.fromResult();
    
    var getNavigationProperties = function (edm, model) {
        var propertyModels = {};
        
        var tempEntity = new model.type();
        var oneToOneRelationships = edm.getOneToOneRelationships(tempEntity);
        var oneToOneAsTargetRelationships = edm.getOneToOneAsTargetRelationships(tempEntity);
        var oneToManyRelationships = edm.getOneToManyRelationships(tempEntity);
        var oneToManyAsTargetRelationships = edm.getOneToManyAsTargetRelationships(tempEntity);
        
        oneToOneRelationships.reduce(function (propertyModels, relationship) {
            
            propertyModels[relationship.hasOne] = {
                model: edm.getModelByType(relationship.ofType),
                setupEntities: function (service, entities, queryable) {
                    
                    if (entities.length === 0) {
                        return emptyFuture;
                    }
                    
                    queryable = queryable || new Queryable();
                    var Target = relationship.ofType;
                    var keys = entities.map(function (entity) {
                        return entity[relationship.hasKey];
                    });
                    
                    return service.asQueryable(Target).where(function (expBuilder) {
                        return expBuilder.property(relationship.withForeignKey).isIn(keys);
                    }).merge(queryable).toArray(function (targets) {
                        
                        var entitiesById = entities.reduce(function (entitiesById, entity) {
                            entitiesById.add(entity[relationship.hasKey], entity);
                            return entitiesById;
                        }, new Hashmap());
                        
                        targets.forEach(function (target) {
                            var sourceId = target[relationship.withForeignKey];
                            var source = entitiesById.get(sourceId);
                            source[relationship.hasOne] = target;
                        });
                    });
                }
            };
            
            return propertyModels;
        }, propertyModels);
        
        oneToOneAsTargetRelationships.reduce(function (propertyModels, relationship) {
            propertyModels[relationship.withOne] = {
                model: edm.getModelByType(relationship.type),
                setupEntities: function (service, entities, queryable) {
                    
                    if (entities.length === 0) {
                        return emptyFuture;
                    }
                    
                    queryable = queryable || new Queryable();
                    var Source = relationship.type;
                    var keys = entities.map(function (entity) {
                        return entity[relationship.withKey];
                    });
                    
                    return service.asQueryable(Source).where(function (expBuilder) {
                        return expBuilder.property(relationship.hasKey).isIn(keys);
                    }).merge(queryable).toArray(function (sources) {
                        
                        var entitiesById = sources.reduce(function (entitiesById, entity) {
                            entitiesById.add(entity[relationship.hasKey], entity);
                            return entitiesById;
                        }, new Hashmap());
                        
                        entities.forEach(function (target) {
                            var sourceId = target[relationship.withForeignKey];
                            var source = entitiesById.get(sourceId);
                            target[relationship.withOne] = source;
                        });

                    });
                }
            };
            
            return propertyModels;
        }, propertyModels);
        
        oneToManyRelationships.reduce(function (propertyModels, relationship) {
            propertyModels[relationship.hasMany] = {
                model: edm.getModelByType(relationship.ofType),
                setupEntities: function (service, entities, queryable) {
                    
                    if (entities.length === 0) {
                        return emptyFuture;
                    }
                    
                    queryable = queryable || new Queryable();
                    var Target = relationship.ofType;
                    var keys = entities.map(function (entity) {
                        return entity[relationship.hasKey];
                    });
                    
                    return service.asQueryable(Target).where(function (expBuilder) {
                        return expBuilder.property(relationship.withForeignKey).isIn(keys);
                    }).merge(queryable).toArray(function (targets) {
                        
                        var entitiesById = entities.reduce(function (entitiesById, entity) {
                            entitiesById.add(entity[relationship.hasKey], entity);
                            return entitiesById;
                        }, new Hashmap());
                        
                        targets.forEach(function (target) {
                            var sourceId = target[relationship.withForeignKey];
                            var source = entitiesById.get(sourceId);
                            source[relationship.hasMany].push(target);
                        });

                    });
                }
            };
            return propertyModels;
        }, propertyModels);
        
        oneToManyAsTargetRelationships.reduce(function (propertyModels, relationship) {
            propertyModels[relationship.withOne] = {
                model: edm.getModelByType(relationship.type),
                setupEntities: function (service, entities, queryable) {
                    
                    if (entities.length === 0) {
                        return emptyFuture;
                    }
                    
                    queryable = queryable || new Queryable();
                    var Source = relationship.type;
                    var keys = entities.map(function (entity) {
                        return entity[relationship.withForeignKey];
                    });
                    
                    return service.asQueryable(Source).where(function (expBuilder) {
                        return expBuilder.property(relationship.hasKey).isIn(keys);
                    }).merge(queryable).toArray(function (sources) {
                        
                        var entitiesById = sources.reduce(function (entitiesById, entity) {
                            entitiesById.add(entity[relationship.hasKey], entity);
                            return entitiesById;
                        }, new Hashmap());
                        
                        entities.forEach(function (target) {
                            var sourceId = target[relationship.withForeignKey];
                            var source = entitiesById.get(sourceId);
                            target[relationship.withOne] = source;
                        });
                    });
                }
            };
            return propertyModels;
        }, propertyModels);
        
        return propertyModels;
    };
    
    var IncludeVisitor = function (Type, entities, service, parameters) {
        var self = this;
        
        ExpressionVisitor.call(this);
        
        this._entities = entities;
        this._service = service;
        this._edm = service.getEdm();
        this._model = this._edm.getModelByType(Type);
        this._cache = {};
        this._parameters = parameters;

    };
    
    IncludeVisitor.prototype = Object.create(ExpressionVisitor.prototype);
    IncludeVisitor.prototype.constructor = IncludeVisitor;
    
    IncludeVisitor.prototype["include"] = function () {
        var allQueryables = Array.prototype.slice.call(arguments, 0);
        var entities = this._entities;
        
        return Future.all(allQueryables).chain(function () { return entities; });
    };
    
    IncludeVisitor.prototype["queryable"] = function (properties, expression) {
        var entities = this._entities;
        var service = this._service;
        var cache = this._cache;
        var currentNamespace = "entity";
        
        // Take the first one off because we start with the entities supplied from the constructor.
        properties.shift();
        
        return properties.reduce(function (future, propertyData, index) {
            return future.chain(function (entities) {
                var setupEntitiesArgs = [];
                setupEntitiesArgs.push(service, entities);
                
                if (index === properties.length - 1) {
                    setupEntitiesArgs.push(new Queryable(Object, { where: expression }));
                }
                
                var property = propertyData.property;
                var namespace = currentNamespace = currentNamespace + "." + property;
                var futureArray;
                
                if (typeof cache[namespace] === "undefined") {
                    futureArray = propertyData.propertyAccess.setupEntities.apply(propertyData.propertyAccess, setupEntitiesArgs);
                    cache[namespace] = futureArray;
                } else {
                    futureArray = cache[namespace];
                }
                
                return futureArray;
            });
        }, Future.fromResult(entities));

    };
    
    IncludeVisitor.prototype["expression"] = function (expression) {
        return expression.value;
    };
    
    IncludeVisitor.prototype["propertyAccess"] = function (properties, property) {
        var lastPropertyAccess = properties[properties.length - 1];
        var propertyAccess = lastPropertyAccess.navigationProperties[property];
        var propertyModel = propertyAccess.model;
        
        if (typeof propertyModel === "undefined") {
            throw new Error("Cannot find navigation property with name: " + property);
        }
        
        var navigationProperties = getNavigationProperties(this._edm, propertyModel);
        
        properties.push({
            propertyAccess: propertyAccess,
            propertyModel: propertyModel,
            property: property,
            navigationProperties: navigationProperties
        });
        
        return properties;
    };
    
    IncludeVisitor.prototype["property"] = function (valueExpression) {
        return valueExpression.value;
    };
    
    IncludeVisitor.prototype["type"] = function () {
        var navigationProperties = getNavigationProperties(this._edm, this._model);
        
        return [{
                propertyAccess: null,
                property: "",
                propertyModel: null,
                navigationProperties: navigationProperties
            }];
    };
    
    BASE.query.IncludeVisitor = IncludeVisitor;

});
