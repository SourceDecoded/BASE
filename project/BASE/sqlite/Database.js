BASE.require([
    "BASE.sqlite.Table",
    "BASE.collections.Hashmap",
    "BASE.async.Future"
], function () {
    BASE.namespace("BASE.sqlite");

    var Future = BASE.async.Future;
    var Table = BASE.sqlite.Table;
    var Hashmap = BASE.collections.Hashmap;

    BASE.namespace("BASE.sqlite");

    BASE.sqlite.Database = function (config) {
        var self = this;
        var name = config.name;
        var sizeInMegaBytes = config.sizeInMegaBytes || 5;
        var size = sizeInMegaBytes * 1024 * 1024;
        var edm = config.edm;
        var database = openDatabase(name, "1.0", "", size);
        var tables = new Hashmap();

        if (typeof edm === "undefined") {
            throw new Error("The edm cannot be undefined.");
        }

        if (typeof name !== "string") {
            throw new Error("Database needs a name.");
        }

        var tableInitializationFutures = new Hashmap();

        var createTableAsync = function (Type) {
            var relationships = edm.getOneToOneAsTargetRelationships(Type);
            relationships = relationships.concat(edm.getOneToManyAsTargetRelationships(Type));

            var dependencyFutures = relationships.map(function (relationship) {
                var Type = relationship.ofType;
                var initializeFuture = tableInitializationFutures.get(Type);

                if (initializeFuture === null) {
                    var table = new Table(Type, edm, database);
                    tables.add(Type, table);
                    tableInitializationFutures.add(Type, table.initializeAsync());
                }
            });

            return Future.all(dependencyFutures).chain(function () {
                var table = tables.get(Type);
                if (table === null) {
                    table = new Table(Type, edm, database);
                    tables.add(Type, table);
                    tableInitializationFutures.add(Type, table.initializeAsync());
                }
            });

        };

        var readyFuture = new Future(function (setValue, setError) {
            var tableFutures = edm.getModels().getValues().map(function (model) {
                return createTableAsync(model.type);
            });

            return Future.all(tableFutures);
        });

        var getDataStore = function (Type) {
            var table = tables.get(Type);
            if (table === null) {
                throw new Error("Couldn't find table for type.");
            }
            return table;
        };

        self.getEdm = function () {
            return edm;
        };

        self.addAsync = function (entity) {
            var table = getDataStore(entity.constructor);
            return table.add(entity);
        };

        self.updateAsync = function (entity, updates) {
            var table = getDataStore(entity.constructor);
            return table.update(entity, updates);
        };

        self.removeAsync = function (entity) {
            var table = getDataStore(entity.constructor);
            return table.remove(entity);
        };

        self.asQueryable = function (Type) {
            var table = getDataStore(Type);
            return table.asQueryable();
        };

        self.getQueryProvider = function (Type) {
            var table = getDataStore(Type);
            return table.getQueryProvider();
        };

        self.initializeAsync = function () {
            return readyFuture;
        };

        self.getDataStore = function (Type) {
            return tables.get(Type);
        };

        self.dropAll = function () {
            return new Future(function (setValue, setError) {
                var dropTask = new Task();
                tables.getKeys().forEach(function (key) {
                    dropTask.add(tables.get(key).drop());
                });
                dropTask.start().whenAll(setValue);
            });
        };

        readyFuture.then();
    };

});