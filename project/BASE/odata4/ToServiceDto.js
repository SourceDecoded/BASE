BASE.require([
    "BASE.data.Edm"
], function () {
    
    BASE.namespace("BASE.odata4");
    
    var primitiveHandlers = BASE.odata4.toServiceHandlerCollection;
    var defaultHandler = function (value) {
        return value;
    };
    
    BASE.odata4.ToServiceDto = function (edm) {
        var self = this;
        
        var getHandlers = function (entity, model) {
            var handlers = {};
            var properties = model.properties;
            
            model.properties.forEach(function (key) {
                var property = properties[key];
                handlers[key] = primitiveHandlers.get(property.type) || defaultHandler;
            });

            return handlers;
        };
        
        self.resolve = function (model, dto) {
            var entity = new model.type();
            
            var handlers = getHandlers(entity, edm, model);
            
            Object.keys(handlers).forEach(function (key) {
                entity[key] = handler[key](dto[key]);
            });
            
            return entity;
        };
        
    };
    
});