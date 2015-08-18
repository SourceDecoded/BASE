BASE.require([
    "BASE.collections.Hashmap",
    "BASE.data.Edm"
], function () {
    BASE.namespace("BASE.odata4");
    
    var Hashmap = BASE.collections.Hashmap;
    var handlers = new Hashmap();
    
    var locationHandler = function (location) {
        return location;
    };
    
    handlers.add(Location, locationHandler);
    
    BASE.odata4.toServiceHandlerCollection = handlers;

});
