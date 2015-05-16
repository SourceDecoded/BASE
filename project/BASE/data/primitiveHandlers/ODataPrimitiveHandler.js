BASE.require([
    "BASE.data.PrimitiveHandler",
    "BASE.data.Edm"
], function () {
    var PrimitiveHandler = BASE.data.PrimitiveHandler;
    
    BASE.namespace("BASE.data.primitiveHandlers");
    
    BASE.data.primitiveHandlers.ODataPrimitiveHandler = function () {
        var self = this
        PrimitiveHandler.call(self);
        
        var _superResolve = self.resolve;
        
        var isAcronym = function (key) {
            return key.substr(0, 2).toUpperCase() === key.substr(0, 2);
        };
        
        self.resolve = function (model, dto) {
            Object.keys(dto).forEach(function (key) {
                var javascriptKey = key;
                
                if (!isAcronym(key)) {
                    javascriptKey = key.substr(0, 1).toLowerCase() + key.substring(1);
                }
                
                if (typeof dto[key] !== "object") {
                    dto[javascriptKey] = dto[key];
                }
                
                if (key !== javascriptKey) {
                    dto[key] = undefined;
                }
            });
            
            //If we need to have concrete types created use the dto._type and make a hash with name to Type.
            
            var entity = _superResolve.call(self, model, dto);
            entity._type = dto._type;
            
            return entity;
        };
        
        var handlerDate = function (value) {
            if (typeof value === "string") {
                return new Date(value);
            } else {
                return null;
            }
        };
        
        self.addHandler(Date, handlerDate);
        self.addHandler(DateTimeOffset, handlerDate);
        self.addHandler(Location, function (value) {
            
            if (value !== null) {
                var location = new Location();
                location.longitude = value.longitude;
                location.latitude = value.latitude;
            } else {
                location = value;
            }
            
            return location;
        });
    };
    
    BASE.extend(BASE.data.primitiveHandlers.ODataPrimitiveHandler, PrimitiveHandler);

});