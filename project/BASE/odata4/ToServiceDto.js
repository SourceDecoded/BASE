BASE.require([
    "BASE.collections.Hashmap",
    "Array.prototype.firstOrDefault",
    "Number.prototype.toEnumString",
    "BASE.odata4.toServiceHandlerCollection"
], function () {
    
    BASE.namespace("BASE.odata4");
    
    var Hashmap = BASE.collections.Hashmap;
    var primitiveHandlers = BASE.odata4.toServiceHandlerCollection;
    var defaultHandler = function (value) {
        return value;
    };
    
    var enumHandler = function (property, value) {
        if (typeof value === "number" || value.constructor === Number) {
            return value.toEnumString(property.genericTypeParameters[0]);
        }
        return "None";
    };
    
    var enumFlagHandler = function (property, value) {
        if (typeof value === "number" || value.constructor === Number) {
            return value.toEnumFlagString(property.genericTypeParameters[0]);
        }
        return "None";
    };
    
    BASE.odata4.ToServiceDto = function (edm) {
        var self = this;
        var models = new Hashmap();
        
        var primitiveTypes = edm.getPrimitiveTypes();
        
        var getModel = function (Type) {
            var model = models.get(Type);
            if (model === null) {
                model = edm.getModelByType(Type);
                models.add(Type, model);
            }
            return model;
        };
        
        var getHandler = function (EntityType, propertyName) {
            var model = getModel(EntityType);
            var properties = model.properties;
            
            return Object.keys(properties).filter(function (key) {
                return key === propertyName;
            }).map(function (key) {
                var property = properties[key];
                
                if (property.type === Enum) {
                    return function (value) {
                        return enumHandler(property, value);
                    }
                } else if (property.type === EnumFlag) {
                    return function (value) {
                        return enumFlagHandler(property, value);
                    };
                }
                
                return primitiveHandlers.get(property.type) || defaultHandler;
            }).firstOrDefault();
        };
        
        var getHandlers = function (entity, model) {
            return Object.keys(model.properties).filter(function (key) {
                var property = model.properties[key];
                return !property.autoIncrement && primitiveTypes.hasKey(property.type);
            }).reduce(function (handlers, key) {
                handlers[key] = getHandler(entity.constructor, key);
                return handlers;
            }, {});
        };
        
        self.resolve = function (entity) {
            var Type = entity.constructor;
            var model = getModel(Type);
            var dto = {};
            
            var handlers = getHandlers(entity, model);
            
            Object.keys(handlers).forEach(function (key) {
                dto[key] = handlers[key](entity[key]);
            });
            
            return dto;
        };
        
        self.resolveUpdate = function (entity, updates) {
            var Type = entity.constructor;
            var model = getModel(Type);
            var dto = {};
            
            var handlers = getHandlers(entity, model);
            
            Object.keys(updates).forEach(function (key) {
                if (typeof handlers[key] === "function") {
                    dto[key] = handlers[key](updates[key]);
                } else {
                    dto[key] = updates[key];
                }
            });
            
            return dto;
        };


    };

});