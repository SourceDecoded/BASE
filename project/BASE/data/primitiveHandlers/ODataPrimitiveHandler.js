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

        self.resolve = function (model, dto) {
            Object.keys(dto).forEach(function (key) {
                var javascriptKey = key.substr(0, 1).toLowerCase() + key.substring(1);
                dto[javascriptKey] = dto[key];
                dto[key] = undefined;
            });

            return _superResolve.call(self, model, dto);
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