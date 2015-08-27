BASE.require([
    "BASE.data.Edm",
    "BASE.collections.MultiKeyMap",
    "BASE.odata4.fromServiceHandlerCollection",
    "String.prototype.toEnum"
], function () {
    
    BASE.namespace("BASE.odata4");
    
    var MultiKeyMap = BASE.collections.MultiKeyMap;
    var primitiveHandlers = BASE.odata4.fromServiceHandlerCollection;
    var defaultHandler = function (value) {
        if (value == null) {
            return null;
        }
        return value;
    };
    
    var enumHandler = function (property, value) {
        if (typeof value === "string") {
            return value.toEnum(property.genericTypeParameters[0]);
        }
        return 0;
    };
    
    var enumFlagHandler = function (property, value) {
        if (typeof value === "string") {
            return value.toEnumFlag(property.genericTypeParameters[0]);
        }
        return 0;
    };
    
    BASE.odata4.FromServiceDto = function (edm) {
        var self = this;
        var handlers = new MultiKeyMap();
        
        var getHandlers = function (entity) {
            var Type = entity.constructor;
            var model = edm.getModelByType(Type);
            var properties = model.properties;
            
            Object.keys(properties).forEach(function (key) {
                var property = properties[key];
                
                if (property.type === Enum) {
                    handlers.add(Type, key, function (value) {
                        return enumHandler(property, value);
                    });
                    return;
                } else if (property.type === EnumFlag) {
                    handlers.add(Type, key, function (value) {
                        return enumFlagHandler(property, value);
                    });
                    return;
                } 
                
                handlers.add(Type, key, primitiveHandlers.get(property.type) || defaultHandler);
            });
            
            edm.getOneToOneRelationships(entity).forEach(function (relationship) {
                handlers.add(Type, relationship.hasOne, function (dto) {
                    var model = edm.getModelByType(relationship.ofType);
                    return self.resolve(model, dto);
                });
            });
            
            edm.getOneToOneAsTargetRelationships(entity).forEach(function (relationship) {
                handlers.add(Type, relationship.withOne, function (dto) {
                    var model = edm.getModelByType(relationship.type);
                    return self.resolve(model, dto);
                });
            });
            
            edm.getOneToManyRelationships(entity).forEach(function (relationship) {
                handlers.add(Type, relationship.hasMany, function (array) {
                    return array.map(function (dto) {
                        var model = edm.getModelByType(relationship.ofType);
                        return self.resolve(model, dto);
                    });
                });
            });
            
            edm.getOneToManyAsTargetRelationships(entity).forEach(function (relationship) {
                handlers.add(Type, relationship.withOne, function (dto) {
                    var model = edm.getModelByType(relationship.type);
                    return self.resolve(model, dto);
                });
            });
            
            edm.getManyToManyRelationships(entity).forEach(function (relationship) {
                handlers.add(Type, relationship.hasMany, function (array) {
                    return array.map(function (dto) {
                        var model = edm.getModelByType(relationship.ofType);
                        return self.resolve(model, dto);
                    });
                });
            });
            
            edm.getManyToManyAsTargetRelationships(entity).forEach(function (relationship) {
                handlers.add(Type, relationship.withMany, function (array) {
                    return array.map(function (dto) {
                        var model = edm.getModelByType(relationship.type);
                        return self.resolve(model, dto);
                    });
                });
            });
            
            return handlers;
        };
        
        self.resolve = function (model, dto) {
            var entity = new model.type();
            
            handlers.get(model.type).getKeys().forEach(function (key) {
                var handler = handlers.get(model.type, key);
                
                if (typeof handler === "function" && dto[key] != null) {
                    entity[key] = handler(dto[key]);
                }
            });
            
            return entity;
        };
        
        edm.getModels().getValues().forEach(function (model) {
            var entity = new model.type();
            getHandlers(entity);
        });

    };
    
});