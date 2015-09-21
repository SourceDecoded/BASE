
BASE.require([
    "BASE.collections.Hashmap",
    "BASE.async.Future",
    "node.postgreSql.DataStore"
], function () {
    
    var postgreSql = require("pg");
    
    BASE.namespace("node.postgreSql");
    
    var Future = BASE.async.Future;
    var Hashmap = BASE.collections.Hashmap;
    var DataStore = node.postgreSql.DataStore;
    
    var Transaction = function (client, done) {
        this._client = client;
        this._done = done;
    };
    
    Transaction.prototype.executeSql = function (sql, values) {
        var client = this._client;
        var done = this._done;
        
        return new Future(function (setValue, setError) {
            client.query(sql, values, function (error, results) {
                done();
                
                if (error) {
                    setError(error);
                    return;
                }
                
                setValue(results);
            });
        });
    };
    
    node.postgreSql.Database = function (config) {
        var self = this;
        var username = config.username;
        var password = config.password;
        var name = config.name;
        var edm = config.edm;
        var dataStores = new Hashmap();
        
        var connectionString = "postgres://" + username + ":" + password + "@localhost/" + name;
        
        if (typeof username !== "string") {
            throw new Error("Null Argument Exception: username cannot be undefined or null.");
        }
        
        if (typeof password !== "string") {
            throw new Error("Null Argument Exception: password cannot be undefined or null.");
        }
        
        if (typeof name !== "string") {
            throw new Error("Null Argument Exception: name cannot be undefined or null.");
        }
        
        if (edm == null) {
            throw new Error("Null Argument Exception: edm cannot be undefined or null.");
        }
        
        this.getTransaction = function () {
            return new Future(function (setValue, setError) {
                postgreSql.connect(connectionString, function (error, client, done) {
                    if (error) {
                        setError(error);
                        return;
                    }
                    
                    setValue(new Transaction(client, done));
                });
            });
        };
        
        this.getDataStore = function (Type) {
            return dataStores.get(Type);
        };
        
        this.getEdm = function () {
            return edm;
        };
        
        edm.getModels().getValues().forEach(function (model) {
            var dataStore = new DataStore(model.type, self, edm);
            
            dataStores.add(model.type, dataStore);
        });

    };

});