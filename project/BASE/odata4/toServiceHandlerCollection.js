BASE.require([
    "BASE.collection.Hashmap"
], function () {
    
    var HashMap = BASE.collection.HashMap;
    
    BASE.namespace("BASE.odata4");
    
    var handlers = new HashMap();
    
    var enumHandler = function (value) {
        if (value != null) {
            return value.name;
        }
        return null;
    }
    
    var locationHandler = function (value) {
        return location;
    };
    
    var dateHandler = function (value) {
        var value = value.toISOString();
        value = value.substr(0, value.length - 1);
        value += "-00:00";
        return "DateTime'" + value + "'";
    };
    
    handlers.add(Enum, enumHandler);
    handlers.add(Location, locationHandler);
    handlers.add(Date, dateHandler);
    handlers.add(DateTimeOffset, dateHandler);
    
    BASE.odata4.fromServiceHandlerCollection = handlers;

});
