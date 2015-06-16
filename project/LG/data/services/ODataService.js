BASE.require([
    "BASE.collections.Hashmap",
    "BASE.query.Queryable",
    "LG.data.dataStores.ODataDataStore",
    "BASE.data.services.DataStoreBackedService",
    "BASE.query.Provider",
    "LG.query.ApiProvider",
    "BASE.web.PathResolver"
], function () {
    
    BASE.namespace("LG.data.services");
    
    var PathResolver = BASE.web.PathResolver;
    var ApiProvider = LG.query.ApiProvider;
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
        
        // This doesn't yet execute hooks.
        //TODO: Hooks.
        self.getSourcesManyToManyQueryProvider = function (sourceEntity, relationship) {
            var sourceDataStore = getDataStore(relationship.type);
            var targetDataStore = getDataStore(relationship.ofType);
            var endPoint = sourceDataStore.getEndPoint();
            var model = targetDataStore.getModel();
            var property = relationship.hasMany;
            var odataProperty = property.substr(0, 1).toUpperCase() + property.substr(1);
            
            var provider = new Provider();
            provider.execute = provider.toArray = function (queryable) {
                var pathResolver = new PathResolver(endPoint);
                var baseUrl = pathResolver.resolve("./" + sourceEntity[relationship.hasKey] + "/" + odataProperty + "/");
                
                var apiProvider = new ApiProvider({
                    baseUrl: baseUrl,
                    model: model,
                    appId: sourceDataStore.getAppId(),
                    token: sourceDataStore.getToken()
                });
                return apiProvider.execute(queryable);
            };
            
            provider.count = function (queryable) {
                var pathResolver = new PathResolver(endPoint);
                var baseUrl = pathResolver.resolve("./" + sourceEntity[relationship.hasKey] + "/" + odataProperty + "/");
                
                var apiProvider = new ApiProvider({
                    baseUrl: baseUrl,
                    model: model,
                    appId: sourceDataStore.getAppId(),
                    token: sourceDataStore.getToken()
                });
                
                return apiProvider.count(queryable);
            };
            
            return provider;
        };
        
        // This doesn't yet execute hooks.
        //TODO: Hooks.
        self.getTargetsManyToManyQueryProvider = function (targetEntity, relationship) {
            var targetDataStore = getDataStore(relationship.ofType);
            var sourceDataStore = getDataStore(relationship.type);
            var endPoint = targetDataStore.getEndPoint();
            var model = sourceDataStore.getModel();
            var pathResolver = new PathResolver(endPoint);
            var property = relationship.withMany;
            var odataProperty = property.substr(0, 1).toUpperCase() + property.substr(1);
            
            var provider = new Provider();
            provider.execute = provider.toArray = function (queryable) {
                var pathResolver = new PathResolver(endPoint);
                var baseUrl = pathResolver.resolve("./" + targetEntity[relationship.withKey] + "/" + odataProperty + "/");
                
                var apiProvider = new ApiProvider({
                    baseUrl: baseUrl,
                    model: model,
                    appId: targetDataStore.getAppId(),
                    token: targetDataStore.getToken()
                });
                
                return apiProvider.execute(queryable);
            };
            
            provider.count = function (queryable) {
                var pathResolver = new PathResolver(endPoint);
                var baseUrl = pathResolver.resolve("./" + targetEntity[relationship.withKey] + "/" + odataProperty + "/");
                
                var apiProvider = new ApiProvider({
                    baseUrl: baseUrl,
                    model: model,
                    appId: targetDataStore.getAppId(),
                    token: targetDataStore.getToken()
                });
                
                return apiProvider.count(queryable);
            };
            
            return provider;
        };

    };

});