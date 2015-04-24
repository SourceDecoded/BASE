BASE.require([
    "jQuery",
    "BASE.query.ExpressionVisitor",
    "BASE.collections.Hashmap"
], function () {
    var Future = BASE.async.Future;
    var ExpressionVisitor = BASE.query.ExpressionVisitor;
    var Hashmap = BASE.collections.Hashmap;

    BASE.namespace("BASE.query");

    var IncludeVisitor = function (entities, service) {
        ExpressionVisitor.call(this);
        this._entities = entities;
        this._service = service;
        this._edm = service.getEdm();
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

        return Future.all([entitiesFuture, propertyFuture]).chain(function (results) {
            var Type;
            var entityIds;
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

            entityIds = entities.map(function (entity) {
                return entity[primaryKey];
            });

            var oneToOneResults = edm.getOneToOneRelationships(firstEntity).reduce(function (results, oneToOne) {
                if (oneToOne.hasOne === property) {

                    results.push(service.asQueryable(oneToOne.ofType).where(function (e) {
                        return e.property(oneToOne.withForeignKey).isIn(entityIds);
                    }).toArray().chain(function (targets) {

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
                return oneToOneResults[0];
            }

            var oneToOneAsTargetsResults = edm.getOneToOneAsTargetRelationships(firstEntity).reduce(function (results, oneToOne) {
                if (oneToOne.withOne === property) {

                    results.push(service.asQueryable(oneToOne.type).where(function (e) {
                        return e.property(oneToOne.hasKey).isIn(entityIds);
                    }).toArray().chain(function (sources) {

                        var entitiesHash = entities.reduce(function (hashmap, entity) {
                            hashmap.add(entity[oneToOne.withForeignKey], entity);
                            return hashmap;
                        }, new Hashmap());

                        sources.forEach(function (source) {
                            var target = entities.get(source[oneToOne.hasKey]);
                            if (target !== null) {
                                target[oneToOne.withOne] = source;
                            }
                        });

                        return targets;
                    }));

                }
                return results;
            }, []);

            if (oneToOneAsTargetsResults.length > 0) {
                return oneToOneAsTargetsResults[0];
            }

            var oneToManyResults = edm.getOneToManyRelationships(firstEntity).reduce(function (results, oneToMany) {
                if (oneToMany.hasMany === property) {

                    results.push(service.asQueryable(oneToMany.ofType).where(function (e) {
                        return e.property(oneToMany.withForeignKey).isIn(entityIds);
                    }).toArray().chain(function (targets) {

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

                                collection.push(target);

                            }
                        });

                        return targets;
                    }));

                }
                return results;
            }, []);

            if (oneToManyResults.length > 0) {
                return oneToManyResults[0];
            };

            var oneToManyAsTargetsResults = edm.getOneToManyAsTargetRelationships(firstEntity).reduce(function (results, oneToMany) {
                if (oneToMany.withOne === property) {

                    results.push(service.asQueryable(oneToMany.type).where(function (e) {
                        return e.property(oneToMany.hasKey).isIn(entityIds);
                    }).toArray().chain(function (sources) {

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

                        return targets;
                    }));

                }
                return results;
            }, []);

            if (oneToManyAsTargetsResults.length > 0) {
                return oneToManyAsTargetsResults[0];
            };

            return [];
        })
    };

    IncludeVisitor.prototype["property"] = function (expression) {
        return Future.fromResult(expression.value);
    };

    IncludeVisitor.prototype["type"] = function () {
        return Future.fromResult(this._entities);
    };

    BASE.query.IncludeVisitor = IncludeVisitor;

});
