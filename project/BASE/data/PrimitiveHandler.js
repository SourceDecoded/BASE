BASE.require([
    "BASE.collections.Hashmap"
], function () {

    var Hashmap = BASE.collections.Hashmap;

    BASE.namespace("BASE.data");

    BASE.data.PrimitiveHandler = function () {
        var self = this;
        var handlers = new Hashmap();

        self.addHandler = function (PrimitiveType, handler) {
            handlers.add(PrimitiveType, handler);
        };

        self.getHandler = function (Type) {
            return handlers.get(Type);
        };

        self.resolve = function (model, dto) {
            var Type = model.type;
            var properties = model.properties;

            var entity = new Type();
            Object.keys(properties).forEach(function (key) {
                var handler = handlers.get(properties[key].type);
                if (typeof handler === "function") {
                    entity[key] = handler(dto[key]);
                } else if (properties[key].type !== Array && Array.isArray(dto[key])) {
                    entity[key] = dto[key];
                } else if (typeof dto[key] !== "undefined"){
                    entity[key] = dto[key];
                }
            });

            return entity;
        };
    };

});