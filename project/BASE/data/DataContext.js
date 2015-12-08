BASE.require([
    "Array.prototype.asQueryable",
    "BASE.data.ChangeTracker",
    "BASE.data.Orm",
    "BASE.data.DataSet",
    "BASE.data.Entity",
    "BASE.collections.Hashmap",
    "BASE.collections.MultiKeyMap",
    "BASE.query.Provider",
    "BASE.query.Queryable",
    "BASE.data.utils",
    "Date.fromISO",
    "BASE.util.Observable",
    "BASE.data.responses.EntityNotFoundErrorResponse",
    "performance",
    "BASE.query.ArrayProvider",
    "Array.prototype.orderBy"
], function () {
    
    BASE.namespace("BASE.data");
    
    var Orm = BASE.data.Orm;
    var Entity = BASE.data.Entity;
    var DataSet = BASE.data.DataSet;
    var ChangeTracker = BASE.data.ChangeTracker;
    var Hashmap = BASE.collections.Hashmap;
    var MultiKeyMap = BASE.collections.MultiKeyMap;
    var Future = BASE.async.Future;
    var Queryable = BASE.query.Queryable;
    var Provider = BASE.query.Provider;
    var Observable = BASE.util.Observable;
    var EntityNotFoundErrorResponse = BASE.data.responses.EntityNotFoundErrorResponse;
    var ArrayProvider = BASE.query.ArrayProvider;
    
    var emptyFuture = Future.fromResult();
    var emptyQueryable = [].asQueryable();
    
    var flattenMultiKeyMap = function (multiKeyMap) {
        var keys = multiKeyMap.getKeys();
        return keys.reduce(function (array, key) {
            return array.concat(multiKeyMap.get(key).getValues());
        }, []);
    }
    
    BASE.data.DataContext = function (service) {
        if (service == null) {
            throw new Error("Data Context needs to have a service.");
        }
        
        var self = this;
        Observable.call(self);
        
        var edm = service.getEdm();
        var orm = new Orm(edm);
        var changeTrackersHash = new Hashmap();
        var loadedBucket = new MultiKeyMap();
        var addedBucket = new MultiKeyMap();
        var updatedBucket = new MultiKeyMap();
        var removedBucket = new MultiKeyMap();
        var sequenceBucket = [];
        var transactionId = 0;
        
        var removeEntityFromChangeTrackerBuckets = function (entity) {
            addedBucket.remove(entity.constructor, entity);
            updatedBucket.remove(entity.constructor, entity);
            removedBucket.remove(entity.constructor, entity);
            
            var index = sequenceBucket.indexOf(entity);
            if (index >= 0) {
                sequenceBucket.splice(index, 1);
            }
        };
        
        var saveEntityDependenciesSequentially = function (entity) {
            var oneToOne = edm.getOneToOneAsTargetRelationships(entity);
            var oneToMany = edm.getOneToManyAsTargetRelationships(entity);
            var dependencies = oneToOne.concat(oneToMany);
            
            return dependencies.reduce(function (future, relationship) {
                var property = relationship.withOne;
                var source = entity[property];
                if (source) {
                    return future.chain(function () {
                        return saveEntitySequentially(source);
                    });
                }
                return future;
            }, emptyFuture);
        };
        
        var saveEntitySequentially = function (entity) {
            var changeTracker = changeTrackersHash.get(entity);
            
            if (changeTracker === null) {
                throw new Error("The entity supplied wasn't part of the dataContext.");
            }
            
            return saveEntityDependenciesSequentially(entity).chain(function () {
                return changeTracker.save(service);
            });
        };
        
        var saveEntityDependencies = function (entity) {
            var oneToOne = edm.getOneToOneAsTargetRelationships(entity);
            var oneToMany = edm.getOneToManyAsTargetRelationships(entity);
            var dependencies = oneToOne.concat(oneToMany);
            
            return Future.all(dependencies.map(function (relationship) {
                var property = relationship.withOne;
                var source = entity[property];
                if (source) {
                    return saveEntity(source);
                }
                return emptyFuture;
            }));
        };
        
        var saveEntity = function (entity) {
            var changeTracker = changeTrackersHash.get(entity);
            
            if (changeTracker === null) {
                throw new Error("The entity supplied wasn't part of the dataContext.");
            }
            
            return saveEntityDependencies(entity).chain(function () {
                return changeTracker.save(service);
            });
        };
        
        var createSourcesOneToOneProvider = function (entity, relationship) {
            if (typeof relationship.hasOne !== "undefined") {
                
                entity.registerProvider(relationship.hasOne, function (entity) {
                    
                    return service.getSourcesOneToOneTargetEntity(entity, relationship).chain(function (target) {
                        
                        if (target !== null) {
                            var loadedTarget = loadEntity(relationship.ofType, target);
                            return loadedTarget;
                        } else {
                            return target;
                        }

                    }).catch(function (error) {
                        
                        if (error instanceof EntityNotFoundErrorResponse) {
                            return null;
                        } else {
                            return Future.fromError(error);
                        }

                    });
                });
            }
        };
        
        var createTargetsOneToOneProvider = function (entity, relationship) {
            if (typeof relationship.withOne !== "undefined") {
                
                entity.registerProvider(relationship.withOne, function (entity) {
                    
                    return service.getTargetsOneToOneSourceEntity(entity, relationship).chain(function (source) {
                        
                        if (source !== null) {
                            var loadedSource = loadEntity(relationship.type, source);
                            return loadedSource;
                        } else {
                            return source;
                        }

                    }).chain(function (error) {
                        
                        if (error instanceof EntityNotFoundErrorResponse) {
                            return null;
                        } else {
                            return Future.fromError(error);
                        }

                    });

                });
            }
        };
        
        var createTargetsOneToManyProvider = function (entity, relationship) {
            if (typeof relationship.withOne !== "undefined") {
                
                entity.registerProvider(relationship.withOne, function (entity) {
                    
                    return service.getTargetsOneToManySourceEntity(entity, relationship).chain(function (source) {
                        
                        if (source !== null) {
                            var loadedSource = loadEntity(relationship.type, source);
                            return loadedSource;
                        } else {
                            return source;
                        }

                    });

                });
            }
        };
        
        var createOneToManyProvider = function (entity, fillArray, relationship) {
            var provider = new Provider();
            var sourcesProvider = service.getSourcesOneToManyQueryProvider(entity, relationship);
            
            provider.toArray = provider.execute = function (queryable) {
                var queryableCopy = queryable.copy();
                queryableCopy.provider = sourcesProvider;
                
                if (provider === null) {
                    throw new Error("Couldn't find a provider for type.");
                }
                
                return queryableCopy.toArray().chain(function (dtos) {
                    var entities = loadEntities(relationship.ofType, dtos);
                    
                    entities.forEach(function (entity) {
                        if (fillArray.indexOf(entity) === -1) {
                            fillArray.load(entity);
                        }
                    });
                    
                    return entities;
                });

            };
            
            provider.count = sourcesProvider.count;
            
            return provider;
        };
        
        var createManyToManyProvider = function (entity, fillArray, relationship) {
            var provider = new Provider();
            var sourcesProvider = service.getSourcesManyToManyQueryProvider(entity, relationship);
            
            provider.toArray = provider.execute = function (queryable) {
                var queryableCopy = queryable.copy();
                queryableCopy.provider = sourcesProvider;
                
                if (provider === null) {
                    throw new Error("Couldn't find provider for type.");
                }
                
                return queryableCopy.toArray().chain(function (dtos) {
                    var entities = loadEntities(relationship.ofType, dtos);
                    
                    entities.forEach(function (entity) {
                        if (fillArray.indexOf(entity) === -1) {
                            fillArray.load(entity);
                        }
                    });
                    
                    return entities;
                });

            };
            
            provider.count = sourcesProvider.count;
            
            return provider;

        };
        
        var createManyToManyAsTargetProvider = function (entity, fillArray, relationship) {
            var provider = new Provider();
            var targetsProvider = service.getTargetsManyToManyQueryProvider(entity, relationship);
            
            provider.toArray = provider.execute = function (queryable) {
                var provider = targetsProvider;
                var queryableCopy = queryable.copy();
                queryableCopy.provider = provider;
                
                if (provider === null) {
                    throw new Error("Couldn't find provider for type.");
                }
                
                queryableCopy.toArray().chain(function (dtos) {
                    var entities = loadEntities(relationship.type, dtos);
                    
                    entities.forEach(function (entity) {
                        if (fillArray.indexOf(entity) === -1) {
                            fillArray.load(entity);
                        }
                    });
                    
                    return entities;
                });
            };
            
            provider.count = targetsProvider.count;
            
            return provider;

        };
        
        var addOneToOneProviders = function (entity) {
            var oneToOneRelationships = edm.getOneToOneRelationships(entity);
            var oneToOneAsTargetsRelationships = edm.getOneToOneAsTargetRelationships(entity);
            
            oneToOneRelationships.forEach(function (relationship) {
                createSourcesOneToOneProvider(entity, relationship);
            });
            
            oneToOneAsTargetsRelationships.forEach(function (relationship) {
                createTargetsOneToOneProvider(entity, relationship);
            });
        };
        
        var addOneToManyProviders = function (entity) {
            var oneToManyRelationships = edm.getOneToManyRelationships(entity);
            var oneToManyAsTargetsRelationships = edm.getOneToManyAsTargetRelationships(entity);
            
            oneToManyRelationships.forEach(function (relationship) {
                var property = relationship.hasMany;
                if (typeof property !== "undefined") {
                    
                    var provider = createOneToManyProvider(entity, entity[property], relationship);
                    
                    entity[property].getProvider = function () { return provider; };
                }
            });
            
            oneToManyAsTargetsRelationships.forEach(function (relationship) {
                createTargetsOneToManyProvider(entity, relationship);
            });
        };
        
        var addManyToManyProviders = function (entity) {
            var sourceRelationships = edm.getManyToManyRelationships(entity);
            var targetRelationships = edm.getManyToManyAsTargetRelationships(entity);
            
            sourceRelationships.forEach(function (relationship) {
                var property = relationship.hasMany;
                if (typeof property !== "undefined") {
                    var provider = createManyToManyProvider(entity, entity[property], relationship);
                    
                    entity[property].getProvider = function () { return provider; };
                }
            });
            
            targetRelationships.forEach(function (relationship) {
                var property = relationship.withMany;
                if (typeof property !== "undefined") {
                    var provider = createManyToManyAsTargetProvider(entity, entity[property], relationship);
                    
                    entity[property].getProvider = function () { return provider; };
                }
            });
        };
        
        var removeOneToOneProviders = function (entity) {
            var oneToOneRelationships = edm.getOneToOneRelationships(entity);
            var oneToOneAsTargetsRelationships = edm.getOneToOneAsTargetRelationships(entity);
            
            oneToOneRelationships.forEach(function (relationship) {
                entity.unregisterProvider(relationship.hasOne);
            });
            
            oneToOneAsTargetsRelationships.forEach(function (relationship) {
                entity.unregisterProvider(relationship.withOne);
            });
        };
        
        var removeOneToManyProviders = function (entity) {
            var oneToManyRelationships = edm.getOneToManyRelationships(entity);
            
            oneToManyRelationships.forEach(function (relationship) {
                var array = entity[relationship.hasMany];
                var provider = new ArrayProvider(array);
                array.getProvider = function () {
                    return provider;
                };
            });

        };
        
        var removeManyToManyProviders = function (entity) {
            var sourceRelationships = edm.getManyToManyRelationships(entity);
            var targetRelationships = edm.getManyToManyAsTargetRelationships(entity);
            
            sourceRelationships.forEach(function (relationship) {
                var array = entity[relationship.hasMany];
                var provider = new ArrayProvider(array);
                array.getProvider = function () {
                    return provider;
                };
            });
            
            targetRelationships.forEach(function (relationship) {
                var array = entity[relationship.withMany];
                var provider = new ArrayProvider(array);
                array.getProvider = function () {
                    return provider;
                };
            });
        };
        
        
        var getUniqueValue = function (entity) {
            var uniqueKey = {};
            var properties = edm.getPrimaryKeyProperties(entity.constructor);
            
            properties.forEach(function (key) {
                uniqueKey[key] = entity[key];
            });
            
            return JSON.stringify(uniqueKey);
        };
        
        var hasAllPrimaryKeys = function (entity) {
            var properties = edm.getPrimaryKeyProperties(entity.constructor);
            
            return properties.every(function (key) {
                return entity[key] !== null;
            });
        };
        
        var addRelationshipProviders = function (entity) {
            addOneToOneProviders(entity);
            addOneToManyProviders(entity);
            addManyToManyProviders(entity);
        };
        
        var removeRelationshipProviders = function (entity) {
            removeOneToOneProviders(entity);
            removeOneToManyProviders(entity);
            removeManyToManyProviders(entity);
        };
        
        var attachEntity = function (entity) {
            var Type = entity.constructor;
            var loadedEntity = loadedBucket.get(Type, getUniqueValue(entity));
            
            if (loadedEntity === entity) {
                return;
            }
            
            if (loadedEntity !== null) {
                throw new Error("Entity was already attached to dataContext as a different entity.");
            }
            
            Object.keys(entity).forEach(function () {
                if (typeof value === "object" && value !== null) {
                    if (Array.isArray(value)) {
                        value.forEach(function (childEntity) {
                            attachEntity(childEntity);
                        });
                    } else {
                        attachEntity(value);
                    }
                }
            });
            
            loadedBucket.add(Type, getUniqueValue(entity), entity);
            
            var changeTracker = setUpChangeTracker(entity);
            changeTracker.setStateToLoaded();
            
            self.notify({
                type: "attach",
                Type: entity.constructor,
                entity: entity
            });
        };
        
        var loadEntity = function (Type, dto) {
            var entity = loadedBucket.get(Type, getUniqueValue(dto));
            var primitives = edm.getPrimitiveTypes();
            
            if (entity === null) {
                entity = new Type();
                
                Object.keys(dto).forEach(function (key) {
                    var value = dto[key];
                    var Type;
                    
                    if (value && key !== "constructor" && primitives.hasKey(value.constructor)) {
                        entity[key] = value;
                    } else if (typeof value !== "undefined") {
                        entity[key] = value;
                    }
                    
                    if (typeof value === "object" && value !== null) {
                        if (Array.isArray(value)) {
                            value.forEach(function (childEntity, index) {
                                var Type = childEntity.constructor;
                                childEntity = loadEntity(Type, childEntity);
                                entity[key].splice(index, 1, childEntity);
                            });
                        } else {
                            Type = value.constructor;
                            if (edm.getModelByType(value.constructor) !== null) {
                                entity[key] = loadEntity(Type, value);
                            }
                        }
                    }
                });
                
                loadedBucket.add(Type, getUniqueValue(entity), entity);
                
                self.addEntity(entity);
                
                self.notify({
                    type: "loaded",
                    Type: entity.constructor,
                    entity: entity
                });
            } else {
                self.syncEntity(entity, dto);
            }
            return entity;
        };
        
        var loadEntities = function (Type, dtos) {
            var entities = [];
            dtos.forEach(function (dto) {
                entities.push(loadEntity(Type, dto));
            });
            
            return entities;
        };
        
        var getTransactionService = function (name) {
            var transactionService = null;
            if (typeof service.getTransactionService === "function") {
                transactionService = service.getTransactionService(name);
            }
            return transactionService;
        };
        
        var saveChangesWithTransaction = function (transactionService, name) {
            var savingEntityFutures = [];
            var mappingEntities = [];
            var entitiesToSave = sequenceBucket.slice(0);
            
            transactionId++;
            transactionService.startTransaction(transactionId);
            
            entitiesToSave.forEach(function (entity) {
                if (mappingTypes.hasKey(entity.constructor)) {
                    mappingEntities.push(entity);
                } else {
                    var changeTracker = changeTrackersHash.get(entity);
                    savingEntityFutures.push(changeTracker.save(transactionService));
                }
            });
            
            mappingEntities.forEach(function (entity) {
                savingEntityFutures.push(saveEntity(entity));
            });
            
            transactionService.endTransaction(transactionId);
            return Future.all(savingEntityFutures);
        };
        
        var saveChanges = function (name) {
            var mappingTypes = edm.getMappingTypes();
            var transactionService = getTransactionService(name);
            var resultFutures;
            
            if (typeof name === "string" && transactionService === null) {
                throw new Error("Cannot find service for transaction.");
            }
            
            if (transactionService != null) {
                return saveChangesWithTransaction(transactionService, name);
            }
            
            // Put the mapping entities to the back.
            var entitiesToSave = sequenceBucket.slice(0).orderBy(function (entity) {
                if (mappingTypes.hasKey(entity.constructor)) {
                    return 1;
                } else {
                    return 0;
                }
            });
            
            return Future.all(entitiesToSave.map(function (entity) {
                return saveEntityDependencies(entity);
            })).chain(function () {
                
                resultFutures = entitiesToSave.map(function (entity) {
                    var changeTracker = changeTrackersHash.get(entity);
                    return changeTracker.save(service);
                });
                
                return Future.all(resultFutures);
            }).chain(function () {
                return resultFutures;
            });

        };
        
        self.loadEntity = function (entity) {
            return loadEntity(entity.constructor, entity);
        };
        
        self.attachEntity = function (entity) {
            orm.attach(entity);
        };
        
        self.addEntity = function (entity) {
            orm.add(entity);
        };
        
        self.removeEntity = function (entity) {
            orm.remove(entity);
        };
        
        self.detachEntity = function (entity) {
            var changeTracker = changeTrackersHash.get(entity);
            if (changeTracker != null) {
                orm.detach(entity);
            }
        };
        
        self.syncEntity = function (entity, dto) {
            var changeTracker = changeTrackersHash.get(entity);
            if (changeTracker !== null) {
                changeTracker.sync(dto);
            } else {
                throw new Error("Entity isn't part of the data context.");
            }
        };
        
        self.saveEntity = saveEntity;
        
        self.saveChangesAsync = function (name) {
            return saveChanges(name).chain(function (futures) {
                
                var saveChangesResult = futures.reduce(function (saveChangesResult, future) {
                    if (future.error !== null) {
                        saveChangesResult.errorResponses.push(future.error);
                        saveChangesResult.responses.push(future.error);
                    } else {
                        saveChangesResult.successResponses.push(future.value);
                        saveChangesResult.responses.push(future.value);
                    }
                    return saveChangesResult;
                }, {
                    errorResponses: [],
                    successResponses: [],
                    responses: []
                });
                
                if (saveChangesResult.errorResponses.length === 0) {
                    saveChangesResult.toString = function () { return "Successfully saved." };
                    return Future.fromResult(saveChangesResult);
                } else {
                    
                    var message;
                    var errorCount = saveChangesResult.errorResponses.length;
                    if (errorCount > 1) {
                        message = errorCount + " errors occurred while saving to database.";
                    } else {
                        message = "An error occurred while saving to database.";
                    }
                    
                    saveChangesResult.toString = function () { return message; };
                    return Future.fromError(saveChangesResult);
                }
            });
        };
        
        
        self.saveChanges = function (name) {
            return saveChanges(name).try();
        };
        
        self.saveChangesSequentially = function () {
            var savedEntityFutures = [];
            var mappingTypes = edm.getMappingTypes();
            var entitiesToSave = sequenceBucket.slice(0);
            
            // Put the mapping entities to the back.
            entitiesToSave.orderBy(function (entity) {
                if (mappingTypes.hasKey(entity.constructor)) {
                    return 1;
                } else {
                    return 0;
                }
            });
            
            return entitiesToSave.reduce(function (future, entity) {
                return future.chain(function () {
                    return saveEntityDependenciesSequentially(entity);
                }).chain(function () {
                    var changeTracker = changeTrackersHash.get(entity);
                    var savingFuture = changeTracker.save(service);
                    savedEntityFutures.push(savingFuture);
                    return savingFuture;
                });
            }, emptyFuture);
        };
        
        self.asQueryableLocal = function (Type) {
            var bucket = loadedBucket.get(Type);
            if (bucket !== null) {
                return bucket.getValues().asQueryable();
            } else {
                return emptyQueryable;
            }
        };
        
        self.asQueryable = function (Type) {
            var queryable = new Queryable(Type);
            
            var provider = self.getQueryProvider(Type);
            queryable.provider = provider;
            
            return queryable;
        };
        
        self.getQueryProvider = function (Type) {
            var provider = new Provider();
            
            var serviceProvider = service.getQueryProvider(Type);
            
            provider.toArray = provider.execute = function (queryable) {
                return serviceProvider.execute(queryable).chain(function (dtos) {
                    return loadEntities(Type, dtos);
                });
            };
            
            provider.count = serviceProvider.count;
            
            return provider;
        };
        
        self.getOrm = function () {
            return orm;
        };
        
        self.getPendingEntities = function () {
            return {
                added: flattenMultiKeyMap(addedBucket),
                removed: flattenMultiKeyMap(removedBucket),
                updated: flattenMultiKeyMap(updatedBucket)
            };
        };
        
        self.getLoadedEntities = function () {
            return loadedBucket.copy();
        };
        
        self.dispose = function () {
            changeTrackersHash.getKeys().forEach(function (entity) {
                self.detachEntity(entity);
            });
        };
        
        // Removes all entities from the buckets.
        // The entities that are in the added state will be detached.
        // All the other entities will be set back to loaded.
        self.purgeChangeTracker = function () {
            var buckets = self.getPendingEntities();
            var setToLoaded = function (entityData) {
                var changeTracker = changeTrackersHash.get(entityData.entity);
                changeTracker.setStateToLoaded();
            };
            
            buckets.added.forEach(function (entityData) {
                var changeTracker = changeTrackersHash.get(entityData.entity);
                changeTracker.setStateToDetached();
            });
            
            buckets.updated.forEach(setToLoaded);
            buckets.removed.forEach(setToLoaded);
        };
        
        self.getService = function () {
            return service;
        };
        
        // Add DataSets
        edm.getModels().getValues().forEach(function (model) {
            if (model.collectionName) {
                self[model.collectionName] = new DataSet(model.type, self);
            }
        });
        
        var setUpChangeTracker = function (entity) {
            if (entity.__dataContext__ != null && entity.__dataContext__ !== self) {
                throw new Error("Entity cannot be part of two contexts.");
            }
            
            entity.__dataContext__ = self;
            
            // As requested by Ben
            entity.save = function () {
                return self.saveEntity(entity);
            };
            
            addRelationshipProviders(entity);
            
            var changeTracker = new ChangeTracker(entity, service);
            
            changeTracker.observeType("detached", function () {
                loadedBucket.remove(entity.constructor, getUniqueValue(entity));
                addedBucket.remove(entity.constructor, entity);
                updatedBucket.remove(entity.constructor, entity);
                removedBucket.remove(entity.constructor, entity);
                changeTrackersHash.remove(entity);
                removeRelationshipProviders(entity);
                entity.__dataContext__ = null;
            });
            
            changeTracker.observeType("added", function () {
                removeEntityFromChangeTrackerBuckets(entity);
                addedBucket.add(entity.constructor, entity, {
                    entity: entity,
                    timestamp: performance.now()
                });
                sequenceBucket.push(entity);
            });
            
            changeTracker.observeType("updated", function () {
                removeEntityFromChangeTrackerBuckets(entity);
                updatedBucket.add(entity.constructor, entity, {
                    entity: entity,
                    timestamp: performance.now()
                });
                sequenceBucket.push(entity);
            });
            
            changeTracker.observeType("removed", function () {
                removeEntityFromChangeTrackerBuckets(entity);
                removedBucket.add(entity.constructor, entity, {
                    entity: entity,
                    timestamp: performance.now()
                });
                sequenceBucket.push(entity);
            });
            
            changeTracker.observeType("loaded", function () {
                removeEntityFromChangeTrackerBuckets(entity);
                
                // We want to use the entity's key as the key for the hash, so we can sync.
                loadedBucket.add(entity.constructor, getUniqueValue(entity), entity);
            });
            
            changeTrackersHash.add(entity, changeTracker);
            return changeTracker;
        };
        
        orm.observeType("entityAdded", function (e) {
            var entity = e.entity;
            Entity.apply(entity);
            
            var changeTracker = setUpChangeTracker(entity);
            
            if (hasAllPrimaryKeys(entity)) {
                changeTracker.setStateToLoaded();
            } else {
                changeTracker.add();
                
                self.notify({
                    type: "added",
                    Type: entity.constructor,
                    entity: entity
                });
            }
        });
        
        orm.observeType("entityRemoved", function (e) {
            var entity = e.entity;
            var changeTracker = changeTrackersHash.get(entity);
            
            // This only happens with Many to Many.
            // I really don't like this. Its a broken pattern. I've missed something somewhere.
            if (!changeTracker) {
                changeTracker = setUpChangeTracker(entity);
                changeTracker.setStateToLoaded();
            }
            
            changeTracker.remove();
            
            self.notify({
                type: "removed",
                Type: entity.constructor,
                entity: entity
            });
        });
        
        orm.observeType("entityDetached", function (e) {
            var entity = e.entity;
            var changeTracker = changeTrackersHash.remove(entity);
            
            if (!changeTracker) {
                return;
            }
            
            entity.__dataContext__ = null;
            
            changeTracker.detach();
            
            self.notify({
                type: "detached",
                Type: entity.constructor,
                entity: entity
            });
        });
        
        orm.observeType("entityAttached", function (e) {
            var entity = e.entity;
            Entity.apply(entity);
            
            attachEntity(entity);
            
            self.notify({
                type: "attached",
                Type: entity.constructor,
                entity: entity
            });
        });

    };

});