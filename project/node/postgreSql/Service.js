BASE.require([
    "BASE.data.services.DataStoreBackedService"
], function () {
    
    var Future = BASE.async.Future;
    var DataStoreBackedService = BASE.data.services.DataStoreBackedService;
    
    BASE.namespace("node.postgreSql");
    
    node.postgreSql.Service = function (database) {
        var self = this;
        
        var config = {};
        config.edm = database.getEdm();
        config.readyFuture = Future.fromResult();
        
        config.getDataStore = function (Type) {
            return database.getDataStore(Type);
        };
        
        DataStoreBackedService.call(self, config);
    };

});