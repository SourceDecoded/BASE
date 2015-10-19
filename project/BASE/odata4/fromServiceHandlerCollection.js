BASE.require([
    "BASE.collections.Hashmap",
    "BASE.data.Edm"
], function () {
    BASE.namespace("BASE.odata4");
    
    var Hashmap = BASE.collections.Hashmap;
    var handlers = new Hashmap();
    
    var dateHandler = function (dateString) {
        if (typeof dateString === "string") {
            return new Date(dateString);
        } else {
            return null;
        }
    };
    
    var locationHandler = function (value) {
        
        if (value !== null) {
            var location = new Location();
            location.longitude = value.longitude;
            location.latitude = value.latitude;
        } else {
            location = value;
        }
        
        return location;
    };
    
    handlers.add(Date, dateHandler);
    handlers.add(DateTimeOffset, dateHandler);
    handlers.add(Location, locationHandler);
    
    BASE.odata4.fromServiceHandlerCollection = handlers;

});
