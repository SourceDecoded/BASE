BASE.require([
    "Array.prototype.asQueryable",
    "BASE.query.Provider",
    "BASE.util.Guid",
    "BASE.collections.Hashmap",
    "BASE.data.responses.AddedResponse",
    "BASE.data.responses.UpdatedResponse",
    "BASE.data.responses.RemovedResponse",
    "BASE.data.responses.ErrorResponse",
    "BASE.data.utils",
    "BASE.data.Edm"
], function () {
    
    var createGuid = BASE.util.Guid.create;
    var Future = BASE.async.Future;
    var Hashmap = BASE.collections.Hashmap;
    var Provider = BASE.query.Provider;
    
    var AddedResponse = BASE.data.responses.AddedResponse;
    var UpdatedResponse = BASE.data.responses.UpdatedResponse;
    var RemovedResponse = BASE.data.responses.RemovedResponse;
    var ErrorResponse = BASE.data.responses.ErrorResponse;
    
    var convertDtoToJavascriptEntity = BASE.data.utils.convertDtoToJavascriptEntity;
    
    BASE.namespace("BASE.data.dataStores");
    
    BASE.data.dataStores.InMemoryDataStore = function (Type, edm) {
        var self = this;
        var primaryKeyProperties = edm.getPrimaryKeyProperties(Type);
        var model = edm.getModelByType(Type);
        var index = 0;
        
        BASE.assertNotGlobal(self);
        
        BASE.util.Observable.call(self);
        
        var entities = new Hashmap();
        var provider = new Provider();
        
        provider.execute = provider.toArray = function (queryable) {
            return entities.getValues().asQueryable().merge(queryable).toArray().chain(function (results) {
                return results.map(function (item) { return convertDtoToJavascriptEntity(Type, item); });
            });
        };
        
        provider.count = function (queryable) {
            return entities.getValues().asQueryable().merge(queryable).count();
        };

        var createPrimaryKey = function (propertyName) {
            var property = model.properties[propertyName];
            
            if (typeof property === "undefined") {
                throw new Error("Coudn't find property " + propertyName + " in edm.");
            }
            
            if (property.type === Integer) {
                return index++;
            } else if (property.type === String) {
                return createGuid();
            } else {
                throw new Error("Primary key can only be a String or a Integer");
            }
        };
        
        if (!Array.isArray(primaryKeyProperties) && primaryKeyProperties.length > 0) {
            throw new Error("Argument error: primaryKeyProperties needs to be an array of properties.");
        }
        
        var getUniqueValue = function (entity) {
            return primaryKeyProperties.reduce(function (current, next) {
                return current += entity[next];
            }, "");
        };
        
        var setUniqueValues = function (entity) {
            primaryKeyProperties.forEach(function (key) {
                if (typeof entity[key] === "undefined" || entity[key] === null) {
                    entity[key] = createPrimaryKey(key);
                }
            });
        };
        
        self.add = function (entity) {
            var result;
            if (!entity) {
                var error = new ErrorResponse("An Entity cannot be null or undefined.");
                result = Future.fromError(error);
            } else {
                var id = getUniqueValue(entity);
                
                if (entities.hasKey(id)) {
                    var error = new ErrorResponse("An Entity with that key already exists.");
                    result = Future.fromError(error);
                } else {
                    var clone = convertDtoToJavascriptEntity(Type, entity);
                    setUniqueValues(clone);
                    id = getUniqueValue(clone);
                    
                    entities.add(id, clone);
                    result = Future.fromResult(new AddedResponse("Successfully added enity.", clone));
                    
                    self.notify({
                        type: "added",
                        entity: clone
                    });
                }
            }
            return result;
        };
        
        self.update = function (entity, updates) {
            var result;
            var id = getUniqueValue(entity);
            
            var inMemoryEntity = entities.get(id);
            
            if (inMemoryEntity) {
                Object.keys(updates).forEach(function (key) {
                    inMemoryEntity[key] = updates[key];
                });
                
                result = Future.fromResult(new UpdatedResponse("Update was successful."));
                
                self.notify({
                    type: "updated",
                    id: id,
                    updates: updates
                });

            } else {
                result = Future.fromError(new ErrorResponse("Unknown entity, couldn't update."));
            }
            
            return result;
        };
        
        self.remove = function (entity) {
            var id = getUniqueValue(entity);
            var result;
            var hasKey = entities.hasKey(id);
            
            if (hasKey) {
                entities.remove(id);
                result = Future.fromResult(new RemovedResponse("Entity was successfully removed."));
                
                self.notify({
                    type: "removed",
                    entity: entity
                });

            } else {
                result = Future.fromError(new ErrorResponse("Unknown entity, couldn't remove."));
            }
            
            return result;
        };
        
        self.asQueryable = function () {
            var queryable = new Queryable(Type);
            queryable.provider = self.getQueryProvider();
            
            return queryable;
        };
        
        self.getQueryProvider = function () {
            return provider;
        };
        
        self.getEntities = function () {
            return entities;
        };
        
        self.setEntities = function (value) {
            if (value instanceof Hashmap) {
                entities = value;
            } else {
                throw new Error("Expected a Hashmap.");
            }
        };
        
        self.initialize = function () {
            return Future.fromResult(undefined);
        };
        
        self.dispose = function () {
            return Future.fromResult(undefined);
        };
    };


});