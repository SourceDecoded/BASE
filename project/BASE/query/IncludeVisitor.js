BASE.require([
    "jQuery",
    "BASE.query.ExpressionVisitor",
    "BASE.collections.Hashmap",
    "Array.prototype.indexOfByFunction"
], function () {
    var Future = BASE.async.Future;
    var ExpressionVisitor = BASE.query.ExpressionVisitor;
    var Hashmap = BASE.collections.Hashmap;

    BASE.namespace("BASE.query");

    var IncludeVisitor = function (entities, service, parameters) {
        ExpressionVisitor.call(this);
        this._entities = entities;
        this._service = service;
        this._edm = service.getEdm();
        this._propertyAccessFutures = {};
        this._currentNamespace = "";
        this._parameters = parameters;
    };

    IncludeVisitor.protoype = Object.create(ExpressionVisitor.prototype);
    IncludeVisitor.prototype.constructor = IncludeVisitor;

    IncludeVisitor.prototype["include"] = function (entitiesFuture) {
        var entities = this._entities;
        return arguments.length > 0 ? Future.all(Array.prototype.slice.call(arguments, 0)).chain(function () {
            return entities;
        }) : Future.fromResult(entities);
    };

    IncludeVisitor.prototype["propertyAccess"] = function (entitiesFuture, propertyFuture) {
        var edm = this._edm;
        var service = this._service;
        var propertyAccessFutures = this._propertyAccessFutures;
        var currentNamespace = this._currentNamespace;
        var parameters = this._parameters;

        return Future.all([entitiesFuture, propertyFuture]).chain(function (results) {
            var Type;
            var primaryKeys;
            var primaryKey;
            var entity;
            var entities = results[0];
            var property = results[1];
            var firstEntity = entities[0];

            if (typeof firstEntity === "undefined") {
                return [];
            }

            Type = firstEntity.constructor;

            primaryKeys = edm.getPrimaryKeyProperties(Type);
            primaryKey = primaryKeys[0];

            if (typeof propertyAccessFutures[currentNamespace] !== "undefined") {
                return propertyAccessFutures[currentNamespace];
            }

            var oneToOneResults = edm.getOneToOneRelationships(firstEntity).reduce(function (results, oneToOne) {
                if (oneToOne.hasOne === property) {

                    var entityIds = entities.map(function (entity) {
                        return entity[oneToOne.hasKey];
                    });

                    results.push(service.asQueryable(oneToOne.ofType).where(function (e) {
                        return e.property(oneToOne.withForeignKey).isIn(entityIds);
                    }).withParameters(parameters).toArray().chain(function (targets) {

                        var entitiesHash = entities.reduce(function (hashmap, entity) {
                            hashmap.add(entity[oneToOne.hasKey], entity);
                            return hashmap;
                        }, new Hashmap());

                        targets.forEach(function (target) {
                            var source = entitiesHash.get(target[oneToOne.withForeignKey]);
                            if (source !== null) {
                                source[oneToOne.hasOne] = target;
                            }
                        });

                        return targets;
                    }));
                }
                return results;
            }, []);

            if (oneToOneResults.length > 0) {
                return propertyAccessFutures[currentNamespace] = oneToOneResults[0];
            }

            var oneToOneAsTargetsResults = edm.getOneToOneAsTargetRelationships(firstEntity).reduce(function (results, oneToOne) {
                if (oneToOne.withOne === property) {

                    var entityIds = entities.map(function (entity) {
                        return entity[oneToOne.withForeignKey];
                    });

                    results.push(service.asQueryable(oneToOne.type).where(function (e) {
                        return e.property(oneToOne.hasKey).isIn(entityIds);
                    }).withParameters(parameters).toArray().chain(function (sources) {

                        var entitiesHash = entities.reduce(function (hashmap, entity) {
                            hashmap.add(entity[oneToOne.withForeignKey], entity);
                            return hashmap;
                        }, new Hashmap());

                        sources.forEach(function (source) {
                            var target = entitiesHash.get(source[oneToOne.hasKey]);
                            if (target !== null) {
                                target[oneToOne.withOne] = source;
                            }
                        });

                        return sources;
                    }));

                }
                return results;
            }, []);

            if (oneToOneAsTargetsResults.length > 0) {
                return propertyAccessFutures[currentNamespace] = oneToOneAsTargetsResults[0];
            }

            var oneToManyResults = edm.getOneToManyRelationships(firstEntity).reduce(function (results, oneToMany) {
                if (oneToMany.hasMany === property) {

                    var entityIds = entities.map(function (entity) {
                        return entity[oneToMany.hasKey];
                    });

                    results.push(service.asQueryable(oneToMany.ofType).where(function (e) {
                        return e.property(oneToMany.withForeignKey).isIn(entityIds);
                    }).withParameters(parameters).toArray().chain(function (targets) {

                        var entitiesHash = entities.reduce(function (hashmap, entity) {
                            hashmap.add(entity[oneToMany.hasKey], entity);
                            return hashmap;
                        }, new Hashmap());

                        targets.forEach(function (target) {
                            var source = entitiesHash.get(target[oneToMany.withForeignKey]);
                            var collection;

                            if (source !== null) {
                                collection = source[oneToMany.hasMany];

                                if (!Array.isArray(collection)) {
                                    collection = source[oneToMany.hasMany] = [];
                                }

                                var targetIndex = collection.indexOfByFunction(function (item) {
                                    return item[oneToMany.withKey] === target[oneToMany.withKey];
                                });

                                if (targetIndex === -1) {
                                    collection.push(target);
                                }

                            }
                        });

                        return targets;
                    }));

                }
                return results;
            }, []);

            if (oneToManyResults.length > 0) {
                return propertyAccessFutures[currentNamespace] = oneToManyResults[0];
            };

            var oneToManyAsTargetsResults = edm.getOneToManyAsTargetRelationships(firstEntity).reduce(function (results, oneToMany) {
                if (oneToMany.withOne === property) {

                    var entityIds = entities.map(function (entity) {
                        return entity[oneToMany.withForeignKey];
                    });

                    results.push(service.asQueryable(oneToMany.type).where(function (e) {
                        return e.property(oneToMany.hasKey).isIn(entityIds);
                    }).withParameters(parameters).toArray().chain(function (sources) {

                        var entitiesHash = entities.reduce(function (hashmap, entity) {
                            hashmap.add(entity[oneToMany.withForeignKey], entity);
                            return hashmap;
                        }, new Hashmap());

                        sources.forEach(function (source) {
                            var target = entitiesHash.get(source[oneToMany.hasKey]);
                            if (target !== null) {
                                target[oneToMany.withOne] = source;
                            }
                        });

                        return sources;
                    }));

                }
                return results;
            }, []);

            if (oneToManyAsTargetsResults.length > 0) {
                return propertyAccessFutures[currentNamespace] = oneToManyAsTargetsResults[0];
            };

            return [];
        })
    };

    IncludeVisitor.prototype["property"] = function (expression) {
        var property = expression.value;
        this._currentNamespace += property;
        return Future.fromResult(property);
    };

    IncludeVisitor.prototype["type"] = function () {
        this._currentNamespace = "entity";
        return Future.fromResult(this._entities);
    };

    BASE.query.IncludeVisitor = IncludeVisitor;

});
