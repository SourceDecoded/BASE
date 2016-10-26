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

        if (typeof edm === "undefined") {
            throw new Error("The edm cannot be undefined.");
        }

        if (typeof name !== "string") {
            throw new Error("Database needs a name.");
        }

        var tables = new Hashmap();
        var tableInitializationFutures = new Hashmap();

        var createTableAsync = function (Type) {
            var relationships = edm.getOneToOneAsTargetRelationships(Type);
            relationships = relationships.concat(edm.getOneToManyAsTargetRelationships(Type));

            var dependencyFutures = relationships.map(function (relationship) {
                var Type = relationship.ofType;
                var initializeFuture = tableInitializationFutures.get(Type);

                if (initializeFuture === null) {
                    var table = new Table(Type, edm, database);
                    initializeFuture = table.initializeAsync();
                    tables.add(Type, table);
                    tableInitializationFutures.add(Type, initializeFuture);
                }

                return initializeFuture;
            });

            return Future.all(dependencyFutures).chain(function () {
                var table = tables.get(Type);
                var initializeFuture;

                if (table === null) {
                    table = new Table(Type, edm, database);
                    initializeFuture = table.initializeAsync();
                    tables.add(Type, table);
                    tableInitializationFutures.add(Type, initializeFuture);
                }

                return initializeFuture;
            });

        };

        var tableFutures = edm.getModels().getValues().map(function (model) {
            return createTableAsync(model.type);
        });

        var initialize = Future.all(tableFutures);

        var getTable = function (Type) {
            var table = tables.get(Type);
            if (table === null) {
                throw new Error("Couldn't find table for type.");
            }
            return table;
        };

        self.getEdm = function () {
            return edm;
        };

        self.addAsync = function (Type, entity) {
            var table = getTable(Type);
            return table.addAsync(entity);
        };

        self.updateAsync = function (Type, entity, updates) {
            var table = getTable(Type);
            return table.updateAsync(entity, updates);
        };

        self.removeAsync = function (Type, entity) {
            var table = getTable(Type);
            return table.removeAsync(entity);
        };

        self.asQueryable = function (Type) {
            var table = getTable(Type);
            return table.asQueryable();
        };

        self.getQueryProvider = function (Type) {
            var table = getTable(Type);
            return table.getQueryProvider();
        };

        self.initializeAsync = function () {
            return initialize;
        };

        self.getTable = function (Type) {
            return tables.get(Type);
        };

        self.nativeDatabase = database;

        self.dropAll = function () {
            var futures = tables.getKeys().map(function (key) {
                return tables.get(key).drop();
            });
            return Future.all(futures);
        };

    };

});