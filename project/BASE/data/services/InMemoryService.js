BASE.require([
    "BASE.data.dataStores.InMemoryDataStore",
    "BASE.data.services.DataStoreBackedService",
    "BASE.collections.Hashmap"
], function () {

    BASE.namespace("BASE.data.services");

    var Hashmap = BASE.collections.Hashmap;
    var DataStore = BASE.data.dataStores.InMemoryDataStore;
    var DataStoreBackedService = BASE.data.services.DataStoreBackedService;

    BASE.data.services.InMemoryService = function (edm) {
        var self = this;
        var config = {}
        var dataStores = new Hashmap();

        config.edm = edm;
        config.getDataStore = function (Type) {
            var dataStore = dataStores.get(Type);
            if (!dataStore) {
                dataStore = new DataStore(Type, edm);
                dataStores.add(Type, dataStore);
            }

            return dataStore;
        };

        DataStoreBackedService.call(self, config);

        self.getDataStore = config.getDataStore;

    };


});