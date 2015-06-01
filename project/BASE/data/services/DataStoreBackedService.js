BASE.require([
    "BASE.collections.Hashmap",
    "BASE.query.Queryable",
    "Array.prototype.intersect",
    "Array.convertToArray",
    "BASE.query.Provider",
    "BASE.data.utils",
    "BASE.query.IncludeVisitor"
], function () {
    
    var Future = BASE.async.Future;
    var Task = BASE.async.Task;
    var Hashmap = BASE.collections.Hashmap;
    var Queryable = BASE.query.Queryable;
    var Provider = BASE.query.Provider;
    var flattenEntity = BASE.data.utils.flattenEntity;
    var IncludeVisitor = BASE.query.IncludeVisitor;
    var global = (function () { return this; })();
    
    BASE.namespace("BASE.data.services");
    
    BASE.data.services.DataStoreBackedService = function (config) {
        var self = this;
        
        var edm = config.edm;
        var version = config.version || 1;
        var getDataStore = config.getDataStore || function () { return null; };
        var readyFuture = config.readyFuture || Future.fromResult();
        var models = edm.getModels();
        var hooks = new Hashmap();
        var transactionsServicesByName = {};
        
        if (typeof edm === "undefined") {
            throw new Error("BASE.data.services.DataStoreBackedService needs to have an edm in the config object.");
        }
        
        if (typeof getDataStore !== "function") {
            throw new Error("The config needs to have a getDataStore function.");
        }
        
        var getHookByType = function (Type) {
            var hook = hooks.get(Type);
            if (hook === null) {
                hook = [];
                hooks.add(Type, hook);
            }
            
            return hook;
        };
        
        var addHook = function (Type, hook) {
            var hooks = getHookByType(Type);
            
            hooks.push(hook);
        };
        
        var removeHook = function (Type, hook) {
            var hooks = getHookByType(Type);
            var index = hooks.indexOf(hook);
            
            if (index >= 0) {
                hooks.splice(index, 1);
            }
            hooks.push(hook);
        };
        
        var executeHooks = function (Type, actionType, args) {
            var typeHooks = hooks.get(Type)
            if (typeHooks !== null) {
                return new Future(function (setValue, setError) {
                    
                    typeHooks.map(function (hook) {
                        var action = hook.actions[actionType];
                        
                        if (typeof action === "function") {
                            return action;
                        } else {
                            return function () { return Future.fromResult(); };
                        }

                    }).reduce(function (task, action) {
                        task.add(action.apply(null, args));
                        return task;
                    }, new Task()).start().whenAll(setValue);
                });
            } else {
                return Future.fromResult();
            }
        };
        
        self.add = function (entity) {
            var Type = entity.constructor;
            var dataStore = getDataStore(Type);
            var timestamp = new Date().getTime();
            
            return dataStore.add(entity).chain(function (response) {
                return executeHooks(Type, "added", [response.entity, timestamp]).chain(function () {
                    return response;
                });
            });
        };
        
        self.update = function (entity, updates) {
            var Type = entity.constructor;
            var dataStore = getDataStore(Type);
            var timestamp = new Date().getTime();
            
            return dataStore.update(entity, updates).chain(function (response) {
                return executeHooks(Type, "updated", [entity, updates, timestamp]).chain(function () {
                    return response;
                });
            });
        };
        
        self.remove = function (entity) {
            var Type = entity.constructor;
            var dataStore = getDataStore(Type);
            var timestamp = new Date().getTime();
            
            return dataStore.remove(entity).chain(function (response) {
                return executeHooks(Type, "removed", [entity, timestamp]).chain(function () {
                    return response;
                });
            });
        };
        
        self.getSourcesOneToOneTargetEntity = function (sourceEntity, relationship) {
            var targetType = relationship.ofType;
            var targetQueryable = self.asQueryable(targetType);
            var timestamp = new Date().getTime();
            
            return targetQueryable.where(function (e) {
                return e.property(relationship.withForeignKey).isEqualTo(sourceEntity[relationship.hasKey]);
            }).firstOrDefault().chain(function (entity) {
                return executeHooks(targetType, "queried", [[entity], timestamp]).chain(function () {
                    return entity;
                });
            });
        };
        
        self.getTargetsOneToOneSourceEntity = function (targetEntity, relationship) {
            var sourceType = relationship.type;
            var sourceQueryable = self.asQueryable(sourceType);
            var timestamp = new Date().getTime();
            
            return sourceQueryable.where(function (e) {
                return e.property(relationship.hasKey).isEqualTo(targetEntity[relationship.withForeignKey]);
            }).firstOrDefault().chain(function (entity) {
                return executeHooks(sourceType, "queried", [[entity], timestamp]).chain(function () {
                    return entity;
                });
            });
        };
        
        self.getSourcesOneToManyQueryProvider = function (sourceEntity, relationship) {
            var provider = new Provider();
            var targetType = relationship.ofType;
            var timestamp = new Date().getTime();
            
            var targetsQueryable = self.asQueryable(relationship.ofType);
            var targetQueryable = targetsQueryable.where(function (e) {
                return e.property(relationship.withForeignKey).isEqualTo(sourceEntity[relationship.hasKey]);
            });
            
            provider.execute = provider.toArray = function (queryable) {
                return targetQueryable.merge(queryable).toArray().chain(function (entities) {
                    return executeHooks(targetType, "queried", [entities, timestamp]).chain(function () {
                        return entities;
                    });
                });
            };
            
            provider.count = function (queryable) {
                return targetQueryable.merge(queryable).count().chain(function (entities) {
                    return executeHooks(targetType, "queried", [entities, timestamp]).chain(function () {
                        return entities;
                    });
                });
            };
            
            return provider;
        };
        
        self.getTargetsOneToManySourceEntity = function (targetEntity, relationship) {
            var sourceType = relationship.type;
            var sourceQueryable = self.asQueryable(sourceType);
            var timestamp = new Date().getTime();
            
            return sourceQueryable.where(function (e) {
                return e.property(relationship.hasKey).isEqualTo(targetEntity[relationship.withForeignKey]);
            }).firstOrDefault().chain(function (entity) {
                return executeHooks(sourceType, "queried", [[entity], timestamp]).chain(function () {
                    return entity;
                });
            })
        };
        
        self.getSourcesManyToManyQueryProvider = function (sourceEntity, relationship) {
            var provider = new Provider();
            var targetType = relationship.ofType;
            var timestamp = new Date().getTime();
            
            provider.execute = provider.toArray = function (queryable) {
                var mappingDataQueryable = self.asQueryable(relationship.usingMappingType);
                var targetDataQueryable = self.asQueryable(relationship.ofType);
                
                return mappingDataQueryable.where(function (e) {
                    return e.property(relationship.withForeignKey).isEqualTo(sourceEntity[relationship.hasKey])
                }).toArray().chain(function (mappingEntities) {
                    return targetDataQueryable.where(function (e) {
                        var ids = [];
                        mappingEntities.forEach(function (mappingEntity) {
                            ids.push(e.property(relationship.withKey).isEqualTo(mappingEntity[relationship.hasForeignKey]));
                        });
                        
                        return e.or.apply(e, ids);
                    }).toArray().chain(function (entities) {
                        return executeHooks(targetType, "queried", [entities, timestamp]).chain(function () {
                            return entities;
                        });
                    });
                });
            };
            
            provider.count = function (queryable) {
                var mappingDataQueryable = self.asQueryable(relationship.usingMappingType);
                
                return mappingDataQueryable.where(function (e) {
                    return e.property(relationship.withForeignKey).isEqualTo(sourceEntity[relationship.hasKey])
                }).count();
            };
            
            return provider;
        };
        
        self.getTargetsManyToManyQueryProvider = function (targetEntity, relationship) {
            var provider = new Provider();
            var sourceType = relationship.type;
            var timestamp = new Date().getTime();
            
            provider.execute = provider.toArray = function (queryable) {
                var mappingDataQueryable = self.asQueryable(relationship.usingMappingType);
                var sourceDataQueryable = self.asQueryable(relationship.type);
                
                return mappingDataQueryable.where(function (e) {
                    return e.property(relationship.hasForeignKey).isEqualTo(targetEntity[relationship.withKey])
                }).toArray().chain(function (mappingEntities) {
                    return sourceDataQueryable.where(function (e) {
                        var ids = [];
                        mappingEntities.forEach(function (mappingEntity) {
                            ids.push(e.property(relationship.hasKey).isEqualTo(mappingEntity[relationship.withForeignKey]));
                        });
                        
                        return e.or.apply(e, ids);
                    }).toArray().chain(function (entities) {
                        return executeHooks(sourceType, "queried", [entities, timestamp]).chain(function () {
                            return entities;
                        });
                    });
                });

            };
            
            provider.count = function (queryable) {
                var mappingDataQueryable = self.asQueryable(relationship.usingMappingType);
                var sourceDataQueryable = self.asQueryable(relationship.type);
                
                return mappingDataQueryable.where(function (e) {
                    return e.property(relationship.hasForeignKey).isEqualTo(targetEntity[relationship.withKey])
                }).count();

            };
            
            return provider;
        };
        
        self.getQueryProvider = function (Type) {
            var dataStore = getDataStore(Type);
            var timestamp = new Date().getTime();
            var provider = dataStore.getQueryProvider();
            var oldExecute = provider.execute;
            
            provider.execute = provider.toArray = function (queryable) {
                var args = arguments;
                
                return oldExecute.apply(provider, arguments).chain(function (results) {
                    entities = results;
                    return executeHooks(Type, "queried", [entities, timestamp]).chain(function () {
                        var parameters = queryable.getExpression().parameters;
                        var includeVisitor = new IncludeVisitor(entities, self, parameters);
                        var expression = queryable.getExpression();
                        var includeExpression = expression.include;
                        
                        return includeVisitor.parse(includeExpression).then(function () {
                            return entities;
                        });
                    });
                });

            };
            
            return provider;
        };
        
        self.asQueryable = function (Type) {
            var queryable = new Queryable(Type);
            queryable.provider = self.getQueryProvider(Type);
            
            return queryable;
        };
        
        self.getEdm = function () {
            return edm;
        };
        
        self.supportsType = function (Type) {
            var dataStore = getDataStore(Type);
            return dataStore === null || typeof dataStore === "undefined" ? true : false;
        };
        
        self.addTransactionService = function (name, service) {
            transactionsServicesByName[name] = service;
        };
        
        self.getTransactionService = function (name) {
            var service = transactionsServicesByName[name];
            return service ? service : null;
        };
        
        // The actions should be an object with the methods it wants to hook on to.
        // {queried: function(entities){}, added: function(entity){}, updated: function(entity){}, removed: function(entity){}}
        self.createHook = function (Type, actions) {
            
            var hook = {
                actions: actions,
                dispose: function () {
                    removeHook(Type, hook);
                }
            };
            
            addHook(Type, hook);
        };
        
        self.initialize = function () {
            return readyFuture;
        };
        
        self.dispose = function () {
            return Future.fromResult(null);
        };
        
        readyFuture.then();

    };

});