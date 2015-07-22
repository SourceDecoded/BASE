BASE.require([
    "BASE.data.Edm",
    "BASE.collections.Hashmap",
    "Array.prototype.firstOrDefault"
], function () {
    
    BASE.namespace("BASE.odata4");
    
    var Hashmap = BASE.collections.Hashmap;
    var primitiveHandlers = BASE.odata4.toServiceHandlerCollection;
    var defaultHandler = function (value) {
        return value;
    };
    
    BASE.odata4.ToServiceDto = function (edm) {
        var self = this;
        var models = new Hashmap();
        
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
                return primitiveHandlers.get(property.type) || defaultHandler;
            }).firstOrDefault();
        };
        
        var getHandlers = function (entity, model) {
            
            return model.properties.reduce(function (handlers, key) {
                handlers[key] = getHandler(entity.constructor, key);
                return handlers;
            }, {});

        };
        
        self.resolve = function (Type, dto) {
            var model = getModel(Type);
            var entity = new Type();
            
            var handlers = getHandlers(entity, edm, model);
            
            Object.keys(handlers).forEach(function (key) {
                entity[key] = handler[key](dto[key]);
            });
            
            return entity;
        };
        
        
    };

});