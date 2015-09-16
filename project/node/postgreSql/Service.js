BASE.require([
    "BASE.data.services.DataStoreBackedService"
], function () {
    
    var DataStoreBackedService = BASE.data.services.DataStoreBackedService;
    
    BASE.namespace("BASE.data.services");
    
    node.postgreSql.Service = function (database) {
        var self = this;
        
        var config = {};
        config.edm = database.getEdm();
        config.readyFuture = database.onReady();

        config.getDataStore = function (Type) {
            return database.getDataStore(Type);
        };
        
        DataStoreBackedService.call(self, config);
    };

});