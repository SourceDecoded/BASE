BASE.require([
    "BASE.sqlite.Visitor",
    "BASE.query.Provider",
    "BASE.sql.EntityBuilder"
], function () {

    var Future = BASE.async.Future;
    var Provider = BASE.query.Provider;
    var Visitor = BASE.sqlite.Visitor;
    var EntityBuilder = BASE.sql.EntityBuilder;

    BASE.namespace("BASE.sqlite");

    BASE.sqlite.Provider = function (Type, edm, database) {
        var self = this;
        Provider.call(this);

        this.edm = edm;
        this.Type = Type;
        this.database = database;

        if (edm == null || Type == null || database == null) {
            throw new Error("Type edm, and database need to be provided.");
        }

        self.toArray = function (queryable) {
            var visitor = new Visitor(this.Type, this.edm);
            var query = queryable.getQuery();
            var statement = visitor.createStatement(query);
            var database = this.database;

            return new Future(function (setValue, setError) {
                database.transaction(function (transaction) {
                    transaction.executeSql(statement, [], function (transaction, results) {
                        setValue(results);
                    }, function (transaction, error) {
                        setError(error);
                    });
                });
            }).chain(function (results) {
                var builder = new EntityBuilder(Type, edm);
                var entities = [];
                var length = results.rows.length;

                for (var x = 0; x < length; x++) {
                    entities.push(results.rows.item(x));
                }

                return builder.convert(entities);
            });
        };

        self.execute = self.toArray;

        self.count = function (queryable) {
            var alias = "COUNT";
            var visitor = new Visitor(this.Type, this.edm);
            var query = queryable.getQuery();
            var statement = visitor.createStatementWithCount(query, alias);
            var database = this.database;

            return new Future(function (setValue, setError) {
                database.transaction(function (transaction) {
                    transaction.executeSql(statement, [], function (transaction, results) {
                        setValue(results.rows[0][alias]);
                    }, function (transaction, error) {
                        setError(error);
                    });
                });
            });
        };

    };

    BASE.extend(BASE.sqlite.Provider, Provider);
});