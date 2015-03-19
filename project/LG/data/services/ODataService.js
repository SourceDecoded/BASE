BASE.require([
    "BASE.collections.Hashmap",
    "BASE.query.Queryable",
    "LG.data.dataStores.ODataDataStore",
    "BASE.data.services.DataStoreBackedService",
    "BASE.query.Provider"
], function () {

    BASE.namespace("LG.data.services");

    var Hashmap = BASE.collections.Hashmap;
    var Future = BASE.async.Future;
    var DataStore = LG.data.dataStores.ODataDataStore;
    var Provider = BASE.query.Provider;
    var Queryable = BASE.query.Queryable;
    var DataStoreBackedService = BASE.data.services.DataStoreBackedService;

    LG.data.services.ODataService = function (edm, appId, token) {
        var self = this;
        var config = {};

        var dataStores = new Hashmap();

        var getDataStore = function (Type) {
            var dataStore = dataStores.get(Type);
            if (dataStore === null) {
                throw new Error("There isn't a end point for that type.");
            }
            return dataStore;
        };

        self.addEndPoint = function (Type, url) {
            var model = edm.getModelByType(Type);
            var dataStore = new DataStore({
                baseUrl: url,
                appId: appId,
                token: token,
                Type: Type,
                model: model,
                edm: edm
            });

            dataStores.add(Type, dataStore);
        };

        config.getDataStore = getDataStore;
        config.edm = edm;
        DataStoreBackedService.call(self, config);

    };

});