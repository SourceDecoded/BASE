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
    "BASE.async.Continuation",
    "BASE.data.responses.EntityNotFoundErrorResponse",
    "performance"
], function() {

    BASE.namespace("BASE.data");

    var Orm = BASE.data.Orm;
    var Entity = BASE.data.Entity;
    var DataSet = BASE.data.DataSet;
    var ChangeTracker = BASE.data.ChangeTracker;
    var Hashmap = BASE.collections.Hashmap;
    var MultiKeyMap = BASE.collections.MultiKeyMap;
    var Future = BASE.async.Future;
    var Task = BASE.async.Task;
    var Continuation = BASE.async.Continuation;
    var Queryable = BASE.query.Queryable;
    var Provider = BASE.query.Provider;
    var Observable = BASE.util.Observable;
    var EntityNotFoundErrorResponse = BASE.data.responses.EntityNotFoundErrorResponse;

    var isPrimitive = BASE.data.utils.isPrimitive;
    var emptyFuture = Future.fromResult();
    var emptyQueryable = [].asQueryable();

    var flattenMultiKeyMap = function(multiKeyMap) {
        var keys = multiKeyMap.getKeys();
        return keys.reduce(function(array, key) {
            return array.concat(multiKeyMap.get(key).getValues());
        }, []);
    };
    BASE.data.DataContext = function(service) {
        var self = this;
        var edm = service.getEdm();
        BASE.assertNotGlobal(self);

        if (typeof service === "undefined") {
            throw new Error("Data Context needs to have a service.");
        }

        Observable.call(self);

        var dataContext = self;
        var orm = new Orm(edm);

        var changeTrackersHash = new Hashmap();
        var loadedBucket = new MultiKeyMap();
        var addedBucket = new MultiKeyMap();
        var updatedBucket = new MultiKeyMap();
        var removedBucket = new MultiKeyMap();
        var sequenceBucket = [];
        var transactionId = 0;

        var removeEntityFromChangeTrackerBuckets = function(entity) {
            addedBucket.remove(entity.constructor, entity);
            updatedBucket.remove(entity.constructor, entity);
            removedBucket.remove(entity.constructor, entity);

            var index = sequenceBucket.indexOf(entity);
            if (index >= 0) {
                sequenceBucket.splice(index, 1);
            }
        };

        var getDependentiesForEntity = function(entity) {
            var oneToOne = edm.getOneToOneAsTargetRelationships(entity);
            var oneToMany = edm.getOneToManyAsTargetRelationships(entity);
            return oneToOne.concat(oneToMany);
        };

        var handleEntityRelationshipError = function(error) {
            if (error instanceof EntityNotFoundErrorResponse) {
                setValue(null);
            } else {
                setError(error);
            }
        };

        var saveEntityDependenciesSequentially = function(entity) {
            var dependencies = getDependentiesForEntity(entity);

            return new Future(function(setValue) {
                return dependencies.reduce(function(continuation, relationship) {
                    var property = relationship.withOne;
                    var source = entity[property];
                    if (source) {
                        continuation.then(function() {
                            return saveEntitySequentially(source);
                        });
                    }
                    return continuation;
                }, new Continuation(emptyFuture)).then(setValue);
            });
        };

        var saveEntitySequentially = function(entity) {
            return new Future(function(setValue, setError) {
                var changeTracker = changeTrackersHash.get(entity);

                if (changeTracker === null) {
                    throw new Error("The entity supplied wasn't part of the dataContext.");
                }

                saveEntityDependenciesSequentially(entity).then(function() {
                    changeTracker.save(service).then(setValue).ifError(setError);
                });

            }).then();
        };

        var saveEntityDependencies = function(entity) {
            var task = new Task();

            var dependencies = getDependentiesForEntity(entity);

            dependencies.forEach(function(relationship) {
                var property = relationship.withOne;
                var source = entity[property];
                if (source) {
                    task.add(saveEntity(source));
                }
            });

            return task.toFuture();
        };

        var saveEntity = function(entity) {
            return new Future(function(setValue, setError) {
                var changeTracker = changeTrackersHash.get(entity);

                if (changeTracker === null) {
                    throw new Error("The entity supplied wasn't part of the dataContext.");
                }

                saveEntityDependencies(entity).then(function() {
                    changeTracker.save(service).then(setValue).ifError(setError);
                });

            }).then();
        };

        var setOneToOneSourcesTarget = function(target, relationship) {
            if (target !== null) {
                var loadedTarget = loadEntity(relationship.ofType, target);
                setValue(loadedTarget);
            } else {
                setValue(target);
            }
        };

        var createSourcesOneToOneProvider = function(entity, relationship) {
            if (typeof relationship.hasOne !== "undefined") {
                entity.registerProvider(relationship.hasOne, function(entity, property) {
                    return new Future(function(setValue, setError) {
                        service.getSourcesOneToOneTargetEntity(entity, relationship).then(function(target) {
                            setOneToOneSourcesTarget(target, relationship);
                        }).ifError(function(error) {
                            handleEntityRelationshipError(error);
                        });
                    });
                });
            }
        };

        var setOneToOneTargetsSource = function(source, relationship) {
            if (source !== null) {
                var loadedSource = loadEntity(relationship.type, source);
                setValue(loadedSource);
            } else {
                setValue(source);
            }
        };

        var createTargetsOneToOneProvider = function(entity, relationship) {
            if (typeof relationship.withOne !== "undefined") {
                entity.registerProvider(relationship.withOne, function(entity, property) {
                    return new Future(function(setValue, setError) {
                        service.getTargetsOneToOneSourceEntity(entity, relationship).then(function(source) {
                            setOneToOneTargetsSource(source, relationship);
                        }).ifError(function(error) {
                            handleEntityRelationshipError(error);
                        });
                    });
                });
            }
        };

        var createTargetsOneToManyProvider = function(entity, relationship) {
            if (typeof relationship.withOne !== "undefined") {
                entity.registerProvider(relationship.withOne, function(entity, property) {
                    return new Future(function(setValue, setError) {
                        service.getTargetsOneToManySourceEntity(entity, relationship).then(function(source) {
                            setOneToOneTargetsSource(source, relationship);
                        });
                    });
                });
            }
        };

        var getLoadProviderFutureForQueryable = function(queryable, providerForType, fillArray, relationship) {
            return new Future(function(setValue, setError) {
                var provider = providerForType;
                var queryableCopy = queryable.copy();
                queryableCopy.provider = provider;

                if (provider === null) {
                    throw new Error("Couldn't find a provider for type.");
                }

                queryableCopy.toArray(function(dtos) {
                    var entities = loadEntities(relationshipType, dtos);
                    entities.forEach(function(entity) {
                        if (fillArray.indexOf(entity) === -1) {
                            fillArray.load(entity);
                        }
                    });
                    setValue(entities);

                }).ifError(setError);
            });
        };

        var createOneToManyProvider = function(entity, fillArray, relationship) {
            var provider = new Provider();
            var sourcesProvider = service.getSourcesOneToManyQueryProvider(entity, relationship);
            provider.toArray = provider.execute = function(queryable) {
                return getLoadProviderFutureForQueryable(queryable, sourcesProvider, fillArray, relationship.ofType);
            };

            provider.count = sourcesProvider.count;
            return provider;
        };

        var createManyToManyProvider = function(entity, fillArray, relationship) {
            var provider = new Provider();
            var sourcesProvider = service.getSourcesManyToManyQueryProvider(entity, relationship);
            provider.toArray = provider.execute = function(queryable) {
                return getLoadProviderFutureForQueryable(queryable, sourcesProvider, fillArray, relationship.ofType);
            };

            provider.count = sourcesProvider.count;
            return provider;
        };

        var createManyToManyAsTargetProvider = function(entity, fillArray, relationship) {
            var provider = new Provider();
            var targetsProvider = service.getTargetsManyToManyQueryProvider(entity, relationship);
            provider.toArray = provider.execute = function(queryable) {
                return getLoadProviderFutureForQueryable(queryable, targetsProvider, fillArray, relationship.type);
            };

            provider.count = targetsProvider.count;
            return provider;
        };

        var addOneToOneProviders = function(entity) {
            var oneToOneRelationships = edm.getOneToOneRelationships(entity);
            var oneToOneAsTargetsRelationships = edm.getOneToOneAsTargetRelationships(entity);

            oneToOneRelationships.forEach(function(relationship) {
                createSourcesOneToOneProvider(entity, relationship);
            });

            oneToOneAsTargetsRelationships.forEach(function(relationship) {
                createTargetsOneToOneProvider(entity, relationship);
            });
        };

        var addOneToManyProviders = function(entity) {
            var oneToManyRelationships = edm.getOneToManyRelationships(entity);
            var oneToManyAsTargetsRelationships = edm.getOneToManyAsTargetRelationships(entity);

            oneToManyRelationships.forEach(function(relationship) {
                var property = relationship.hasMany;
                if (typeof property !== "undefined") {

                    var provider = createOneToManyProvider(entity, entity[property], relationship);

                    entity[property].getProvider = function() { return provider; };
                }
            });

            oneToManyAsTargetsRelationships.forEach(function(relationship) {
                createTargetsOneToManyProvider(entity, relationship);
            });
        };

        var addManyToManyAsSourceRelationshipToEntity = function(relationship, entity) {
            var property = relationship.hasMany;
            if (typeof property !== "undefined") {
                var provider = createManyToManyProvider(entity, entity[property], relationship);
                entity[property].getProvider = function() { return provider; };
            }
        };

        var addManyToManyAsTargetRelationshipToEntity = function(relationship, entity) {
            var property = relationship.withMany;
            if (typeof property !== "undefined") {
                var provider = createManyToManyAsTargetProvider(entity, entity[property], relationship);
                entity[property].getProvider = function() { return provider; };
            }
        };

        var addManyToManyProviders = function(entity) {
            var sourceRelationships = edm.getManyToManyRelationships(entity);
            var targetRelationships = edm.getManyToManyAsTargetRelationships(entity);

            sourceRelationships.forEach(function(relationship) {
                addManyToManyAsSourceRelationshipToEntity(relationship, entity);
            });

            targetRelationships.forEach(function(relationship) {
                addManyToManyAsTargetRelationshipToEntity(relationship, entity);
            });
        };

        var removeOneToOneProviders = function(entity) {
            var oneToOneRelationships = edm.getOneToOneRelationships(entity);
            var oneToOneAsTargetsRelationships = edm.getOneToOneAsTargetRelationships(entity);

            oneToOneRelationships.forEach(function(relationship) {
                entity[relationship.hasOne] = null;
            });

            oneToOneAsTargetsRelationships.forEach(function(relationship) {
                entity[relationship.withForeignKey] = null;
                entity[relationship.withOne] = null;
            });
        };

        var removeHasManyRelationshipsFromEntity = function(entity, relationship) {
            var array = entity[relationship.hasMany];
            if (typeof array !== "undefined") {
                while (array.length > 0) {
                    array.pop();
                }
            }
        };

        var removeWithManyRelationshipsFromEntity = function(entity, relationship) {
            var array = entity[relationship.withMany];
            if (typeof array !== "undefined") {
                while (array.length > 0) {
                    array.pop();
                }
            }
        };

        var removeOneToManyProviders = function(entity) {
            var oneToManyRelationships = edm.getOneToManyRelationships(entity);
            var oneToManyAsTargetsRelationships = edm.getOneToManyAsTargetRelationships(entity);

            oneToManyRelationships.forEach(function(relationship) {
                removeHasManyRelationshipsFromEntity(entity, relationship);
            });

            // TODO: set to Array Providers;
            oneToManyAsTargetsRelationships.forEach(function(relationship) {
                entity[relationship.withForeignKey] = null;
                entity[relationship.withOne] = null;
            });
        };

        var removeManyToManyProviders = function(entity) {
            // TODO: set to Array Providers;
            var sourceRelationships = edm.getManyToManyRelationships(entity);
            var targetRelationships = edm.getManyToManyAsTargetRelationships(entity);

            sourceRelationships.forEach(function(relationship) {
                removeHasManyRelationshipsFromEntity(entity, relationship);
            });

            targetRelationships.forEach(function(relationship) {
                removeWithManyRelationshipsFromEntity(entity, relationship);
            });
        };

        var getUniqueValue = function(entity) {
            var uniqueKey = {};
            var properties = edm.getPrimaryKeyProperties(entity.constructor);

            properties.forEach(function(key) {
                uniqueKey[key] = entity[key];
            });

            return JSON.stringify(uniqueKey);
        };

        var hasAllPrimaryKeys = function(entity) {
            var properties = edm.getPrimaryKeyProperties(entity.constructor);

            return properties.every(function(key) {
                return entity[key] !== null;
            });
        };

        var setUpEntity = function(entity) {
            addOneToOneProviders(entity);
            addOneToManyProviders(entity);
            addManyToManyProviders(entity);
        };

        var tearDownEntity = function(entity) {
            removeOneToOneProviders(entity);
            removeOneToManyProviders(entity);
            removeManyToManyProviders(entity);
        };

        var actOnLoadedEntitiesByType = function(Type, action) {
            var entityHash = loadedBucket.get(Type);
            if (entityHash !== null) {
                entityHash.getValues().reduce(function(hash, entity) {
                    action(entity);
                }, {});
            }
        };

        var getLoadedEntitiesByTypeAndKey = function(Type, key) {
            var hash = {};
            actOnLoadedEntitiesByType(Type, function(entity) {
                if (!hash[entity[key]]) {
                    hash[entity[key]] = [];
                }

                hash[entity[key]].push(entity);
            });
            return hash;
        };

        var establishOneToOneRelationshipForEntities = function(relationship, entities) {
            var TargetType = relationship.ofType;
            var targetsHashByKey = getLoadedEntitiesByTypeAndKey(TargetType, relationship.withForeignKey);

            entities.forEach(function(entity) {
                if (typeof relationship.hasOne === "undefined") {
                    return;
                }

                var targets = targetsHashByKey[entity[relationship.hasKey]];
                if (targets && targets[0]) {
                    entity[relationship.hasOne] = targets[0];
                }
            });
        };

        var establishOneToOneRelationshipAsTargetForEntities = function(relationship, entities) {
            var SourceType = relationship.type;
            var sourcesHashByKey = getLoadedEntitiesByTypeAndKey(SourceType, relationship.hasKey);

            entities.forEach(function(entity) {
                if (typeof relationship.withOne === "undefined") {
                    return;
                }

                var sources = sourcesHashByKey[entity[relationship.withForeignKey]];
                if (Array.isArray(sources)) {
                    entity[relationship.withOne] = sources[0];
                }
            });
        };

        var establishOneToManyRelationshipForEntities = function(relationship, entities) {
            var TargetType = relationship.ofType;
            var targetsHashByKey = getLoadedEntitiesByTypeAndKey(TargetType, relationship.withForeignKey);

            entities.forEach(function(entity) {
                if (typeof relationship.hasMany === "undefined" || !Array.isArray(entity[relationship.hasMany])) {
                    return;
                }

                var targets = targetsHashByKey[entity[relationship.hasKey]];
                if (Array.isArray(targets)) {
                    targets.forEach(function(target) {
                        if (entity[relationship.hasMany].indexOf(target) < 0) {
                            entity[relationship.hasMany].add(target);
                        }
                    });
                }
            });
        };

        var establishOneToManyRelationshipAsTargetForEntities = function(relationship, entities) {
            var SourceType = relationship.type;
            var sourcesHashByKey = getLoadedEntitiesByTypeAndKey(SourceType, relationship.hasKey);

            entities.forEach(function(entity) {
                if (typeof relationship.withOne === "undefined") {
                    return;
                }

                var sources = sourcesHashByKey[entity[relationship.withForeignKey]];
                if (Array.isArray(sources)) {
                    entity[relationship.withOne] = sources[0];
                }
            });
        };

        var connectRelationships = function(Type, entities) {
            var entity = new Type();

            var oneToOneRelationships = edm.getOneToOneRelationships(entity);
            var oneToOneRelationshipsAsTargets = edm.getOneToOneAsTargetRelationships(entity);
            var oneToManyRelationships = edm.getOneToManyRelationships(entity);
            var oneToManyRelationshipsAsTargets = edm.getOneToManyAsTargetRelationships(entity);

            oneToOneRelationships.forEach(function(relationship) {
                establishOneToOneRelationshipForEntities(relationship, entities);
            });
            oneToOneRelationshipsAsTargets.forEach(function(relationship) {
                establishOneToOneRelationshipAsTargetForEntities(relationship, entities);
            });
            oneToManyRelationships.forEach(function(relationship) {
                establishOneToManyRelationshipForEntities(relationship, entities);
            });
            oneToManyRelationshipsAsTargets.forEach(function(relationship) {
                establishOneToManyRelationshipAsTargetForEntities(relationship, entities);
            });
        };

        var loadEntity = function(Type, dto) {
            var entity = loadedBucket.get(Type, getUniqueValue(dto));
            var primitives = edm.getPrimitiveTypes();

            if (entity === null) {
                entity = new Type();

                Object.keys(dto).forEach(function(key) {
                    var value = dto[key];
                    var Type;

                    if (value && key !== "constructor" && primitives.hasKey(value.constructor)) {
                        entity[key] = value;
                    } else if (typeof value !== "undefined") {
                        entity[key] = value;
                    }

                    if (typeof value === "object" && value !== null) {
                        if (Array.isArray(value)) {
                            value.forEach(function(childEntity, index) {
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

        var loadEntities = function(Type, dtos) {
            var entities = [];
            dtos.forEach(function(dto) {
                entities.push(loadEntity(Type, dto));
            });

            connectRelationships(Type, entities);

            return entities;
        };

        var getTransactionService = function(name) {
            var transactionService = null;
            if (typeof service.getTransactionService === "function") {
                transactionService = service.getTransactionService(name);
            }
            return transactionService;
        };

        self.loadEntity = function(entity) {
            return loadEntity(entity.constructor, entity);
        };

        self.addEntity = function(entity) {
            orm.add(entity);
        };

        self.removeEntity = function(entity) {
            orm.remove(entity);
        };

        self.syncEntity = function(entity, dto) {
            var changeTracker = changeTrackersHash.get(entity);
            if (changeTracker !== null) {
                changeTracker.sync(dto);
            } else {
                throw new Error("Entity isn't part of the data context.");
            }
        };

        self.saveEntity = saveEntity;

        self.saveChangesAsync = function(name) {
            return self.saveChanges(name).chain(function(futures) {

                var saveChangesResult = futures.reduce(function(saveChangesResult, future) {
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
                    responses: [],

                });

                if (saveChangesResult.errorResponses.length === 0) {
                    saveChangesResult.toString = function() { return "Successfully saved." };
                    return Future.fromResult(saveChangesResult);
                } else {

                    var message;
                    var errorCount = saveChangesResult.errorResponses.length;
                    if (errorCount > 1) {
                        message = errorCount + " errors occurred while saving to database.";
                    } else {
                        message = "An error occurred while saving to database.";
                    }

                    saveChangesResult.toString = function() { return message; };
                    return Future.fromError(saveChangesResult);
                }
            });
        };


        self.saveChanges = function(name) {
            var mappingTypes = edm.getMappingTypes();
            var entitiesToSave = sequenceBucket.slice(0);
            var transactionService = getTransactionService(name);

            if (typeof name === "string" && transactionService === null) {
                throw new Error("Cannot find service for transaction.");
            }

            if (transactionService === null) {

                return new Future(function(setValue, setError) {
                    var task = new Task();
                    var mappingEntities = [];

                    var forEachEntity = function(entity) {
                        if (mappingTypes.hasKey(entity.constructor)) {
                            mappingEntities.push(entity);
                            return false;
                        } else {
                            task.add(saveEntityDependencies(entity));
                            return true;
                        }
                    };

                    entitiesToSave = entitiesToSave.filter(forEachEntity);

                    task.start().whenAll(function() {
                        var task = new Task();

                        entitiesToSave.forEach(function(entity) {
                            var changeTracker = changeTrackersHash.get(entity);
                            task.add(changeTracker.save(service));
                        });

                        task.start().whenAll(function(savedEntityFutures) {

                            var task = new Task();

                            mappingEntities.forEach(function(entity) {
                                if (entity.relationship) {
                                    entity[entity.relationship.withForeignKey] = entity.source[entity.relationship.hasKey];
                                    entity[entity.relationship.hasForeignKey] = entity.target[entity.relationship.withKey];
                                }
                                task.add(saveEntity(entity));
                            });

                            task.start().whenAll(function(futures) {
                                setValue(savedEntityFutures.concat(futures));
                            });

                        });
                    });

                }).then();
            } else {
                return new Future(function(setValue, setError) {
                    var task = new Task();
                    var mappingEntities = [];

                    var forEachEntity = function(entity) {
                        if (mappingTypes.hasKey(entity.constructor)) {
                            mappingEntities.push(entity);
                        } else {
                            var changeTracker = changeTrackersHash.get(entity);
                            task.add(changeTracker.save(transactionService));
                        }
                    };

                    transactionId++;
                    transactionService.startTransaction(transactionId);

                    entitiesToSave.forEach(forEachEntity);
                    mappingEntities.forEach(function(entity) {
                        task.add(saveEntity(entity));
                    });

                    transactionService.endTransaction(transactionId);
                    task.start().whenAll(function(futures) {
                        setValue(futures);
                    });
                });
            }
        };

        //TODO: Almost all this code could be rewritten so much better with chain.
        self.saveChangesSequentially = function() {
            var mappingTypes = edm.getMappingTypes();
            var savedEntityFutures = [];

            var entitiesToSave = sequenceBucket.slice(0);

            return new Future(function(setValue, setError) {
                var mappingEntities = [];

                var forEachEntity = function(continuation, entity) {
                    if (mappingTypes.hasKey(entity.constructor)) {
                        mappingEntities.push(entity);
                    } else {
                        continuation = continuation.then(function() {
                            var future = saveEntityDependenciesSequentially(entity);
                            savedEntityFutures.push(future);
                            future.ifError(setError);
                            return future;
                        });
                    }
                    return continuation;
                };

                entitiesToSave = entitiesToSave.filter(function(entity) {
                    if (mappingTypes.hasKey(entity.constructor)) {
                        return false;
                    } else {
                        return true;
                    }
                });

                entitiesToSave.reduce(forEachEntity, new Continuation(emptyFuture)).then(function() {

                    entitiesToSave.reduce(function(continuation, entity) {
                        var changeTracker = changeTrackersHash.get(entity);

                        return continuation.then(function(value) {
                            var future = changeTracker.save(service);
                            savedEntityFutures.push(future);
                            future.ifError(setError);
                            return future;
                        });

                    }, new Continuation(emptyFuture)).then(function() {

                        mappingEntities.reduce(function(continuation, entity) {
                            if (entity.relationship) {
                                entity[entity.relationship.withForeignKey] = entity.source[entity.relationship.hasKey];
                                entity[entity.relationship.hasForeignKey] = entity.target[entity.relationship.withKey];
                            }
                            return continuation.then(function() {
                                var future = saveEntity(entity);
                                savedEntityFutures.push(future);
                                future.ifError(setError);
                                return future;
                            });
                        }, new Continuation(emptyFuture)).then(function() {
                            setValue(savedEntityFutures);
                        });

                    });

                });

            }).then();
        };

        self.revert = function() {
            var added = flattenMultiKeyMap(addedBucket);
            var updated = flattenMultiKeyMap(updatedBucket);
            var removed = flattenMultiKeyMap(removedBucket);

            var entitiesToRevert = added.concat(updated).concat(removed).map(function(item) {
                return item.entity;
            }).forEach(function(entity) {
                var changeTracker = changeTrackersHash.get(entity);
                if (changeTracker) {
                    changeTracker.revert();
                }
            });
        };

        self.asQueryableLocal = function(Type) {
            var bucket = loadedBucket.get(Type);
            if (bucket !== null) {
                return bucket.getValues().asQueryable();
            } else {
                return emptyQueryable;
            }
        };

        self.asQueryable = function(Type) {
            var queryable = new Queryable(Type);

            var provider = self.getQueryProvider(Type);
            queryable.provider = provider;

            return queryable;
        };

        self.getQueryProvider = function(Type) {
            var provider = new Provider();

            var serviceProvider = service.getQueryProvider(Type);

            provider.toArray = provider.execute = function(queryable) {
                return serviceProvider.execute(queryable).chain(function(dtos) {
                    return loadEntities(Type, dtos);
                });
            };

            provider.count = serviceProvider.count;

            return provider;
        };

        self.getOrm = function() {
            return orm;
        };

        self.getPendingEntities = function() {
            return {
                added: flattenMultiKeyMap(addedBucket),
                removed: flattenMultiKeyMap(removedBucket),
                updated: flattenMultiKeyMap(updatedBucket)
            };
        };

        self.getLoadedEntities = function() {
            return loadedBucket.copy();
        };

        // Add DataSets
        edm.getModels().getValues().forEach(function(model) {
            if (model.collectionName) {
                self[model.collectionName] = new DataSet(model.type, self);
            }
        });

        var observeEntityDetachedEvents = function(changeTracker, entity) {
            changeTracker.observeType("detached", function() {
                removeEntityFromChangeTrackerBuckets(entity);
                loadedBucket.remove(entity.constructor, getUniqueValue(entity));
                changeTrackersHash.remove(entity);
                tearDownEntity(entity);
            });
        };

        var observeEntityAddedEvents = function(changeTracker, entity) {
            changeTracker.observeType("added", function() {
                removeEntityFromChangeTrackerBuckets(entity);
                addedBucket.add(entity.constructor, entity, {
                    entity: entity,
                    timestamp: performance.now()
                });
                sequenceBucket.push(entity);
            });
        };

        var observeEntityUpdatedEvents = function(changeTracker, entity) {
            changeTracker.observeType("updated", function () {
                removeEntityFromChangeTrackerBuckets(entity);
                updatedBucket.add(entity.constructor, entity, {
                    entity: entity,
                    timestamp: performance.now()
                });
                sequenceBucket.push(entity);
            });
        };

        var observeEntityRemovedEvents = function(changeTracker, entity) {
            changeTracker.observeType("removed", function () {
                removeEntityFromChangeTrackerBuckets(entity);
                removedBucket.add(entity.constructor, entity, {
                    entity: entity,
                    timestamp: performance.now()
                });
                sequenceBucket.push(entity);
            });
        };

        var observeEntityLoadedEvents = function(changeTracker, entity) {
            changeTracker.observeType("loaded", function () {
                removeEntityFromChangeTrackerBuckets(entity);
                
                // We want to use the entity's key as the key for the hash, so we can sync.
                loadedBucket.add(entity.constructor, getUniqueValue(entity), entity);
            });
        };
        
        var ensureEntityDataContextIntegrity = function(entity) {
            if (typeof entity.__dataContext__ !== "undefined" && entity.__dataContext__ !== self) {
                console.log(entity);
                throw new Error("Entity cannot be part of two contexts.");
            }
            
            entity.__dataContext__ = self;
            
            // As requested by Ben
            entity.save = function () {
                return self.saveEntity(entity);
            };
            
            setUpEntity(entity);
        }

        var setUpChangeTracker = function(entity) {
            ensureEntityDataContextIntegrity(entity);

            var changeTracker = new ChangeTracker(entity, service);

            observeEntityDetachedEvents(changeTracker, entity);
            observeEntityAddedEvents(changeTracker, entity);
            observeEntityUpdatedEvents(changeTracker, entity);
            observeEntityRemovedEvents(changeTracker, entity);
            observeEntityLoadedEvents(changeTracker, entity);

            changeTrackersHash.add(entity, changeTracker);
            return changeTracker;
        };

        var onEntityAdded = function(e) {
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
        };

        orm.observeType("entityAdded", onEntityAdded);

        orm.observeType("entityRemoved", function(e) {
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

    };

});