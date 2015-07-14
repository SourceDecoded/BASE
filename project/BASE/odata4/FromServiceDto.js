BASE.require([
    "BASE.data.Edm",
    "BASE.odata4.fromServiceHandlerCollection"
], function () {
    
    BASE.namespace("BASE.odata4");
    
    var primitiveHandlers = BASE.odata4.fromServiceHandlerCollection;
    var defaultHandler = function (value) {
        return value;
    };
    
    var enumHandler = function (property, value) {
        if (typeof value === "string") {
            return property.genericTypeParameters[0][value];
        }
        return null;
    };
    
    BASE.odata4.FromServiceDto = function (edm) {
        var self = this;
        
        
        var getHandlers = function (entity, model) {
            var handlers = {};
            var properties = model.properties;
            
            Object.keys(model.properties).forEach(function (key) {
                var property = properties[key];
                
                if (property.type === Enum) {
                    handlers[key] = function (value) {
                        return enumHandler(property, value);
                    };
                    return;
                }
                
                handlers[key] = primitiveHandlers.get(property.type) || defaultHandler;
            });
            
            edm.getOneToOneRelationships(entity).forEach(function (relationship) {
                handlers[relationship.hasOne] = function (dto) {
                    var model = edm.getModelByType(relationship.ofType);
                    return self.resolve(model, dto);
                };
            });
            
            edm.getOneToOneAsTargetRelationships(entity).forEach(function (relationship) {
                handlers[relationship.withOne] = function (dto) {
                    var model = edm.getModelByType(relationship.type);
                    return self.resolve(model, dto);
                };
            });
            
            edm.getOneToManyRelationships(entity).forEach(function (relationship) {
                handlers[relationship.hasMany] = function (array) {
                    return array.map(function (dto) {
                        var model = edm.getModelByType(relationship.ofType);
                        return self.resolve(model, dto);
                    });
                };
            });
            
            edm.getOneToManyAsTargetRelationships(entity).forEach(function (relationship) {
                handlers[relationship.withOne] = function (dto) {
                    var model = edm.getModelByType(relationship.type);
                    return self.resolve(model, dto);
                };
            });
            
            edm.getManyToManyRelationships(entity).forEach(function (relationship) {
                handlers[relationship.hasMany] = function (array) {
                    return array.map(function (dto) {
                        var model = edm.getModelByType(relationship.ofType);
                        return self.resolve(model, dto);
                    });
                };
            });
            
            edm.getManyToManyAsTargetRelationships(entity).forEach(function (relationship) {
                handlers[relationship.withMany] = function (array) {
                    return array.map(function (dto) {
                        var model = edm.getModelByType(relationship.type);
                        return self.resolve(model, dto);
                    });
                };
            });
            
            return handlers;
        };
        
        self.resolve = function (model, dto) {
            var entity = new model.type();
            
            var handlers = getHandlers(entity, model);
            
            Object.keys(handlers).forEach(function (key) {
                if (dto[key] != null) {
                    entity[key] = handlers[key](dto[key]);
                }
            });
            
            return entity;
        };
        
    };
    
});