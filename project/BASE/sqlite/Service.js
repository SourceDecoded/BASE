BASE.require([
    "BASE.sqlite.Provider",
    "BASE.data.utils",
    "BASE.collections.Hashmap",
    "BASE.async.Fulfillment",
    "BASE.sqlite.Table"
], function () {

    BASE.namespace("BASE.sqlite");

    var Provider = BASE.sqlite.Provider;
    var flattenEntity = BASE.data.utils.flattenEntity;
    var Hashmap = BASE.collections.Hashmap;
    var Future = BASE.async.Future;
    var Fulfillment = BASE.async.Fulfillment;
    var Table = BASE.sqlite.Table;

    BASE.sqlite.Service = function (edm, database) {
        var self = this;
        var tablesByType = new Hashmap();
        var readyFuture = new Fulfillment();

        var createTableAsync = function () {
            var table = new Table();
        };

        self.initializeAsync = function () {

        };

        self.add = function (Type, entity) {

        };

        self.update = function (Type, entity) {

        };

        self.remove = function (Type, entity) {

        };

        self.asQueryable = function (Type) {

        };

        self.getQueryProvider = function (Type) {

        };

        self.executeAsync = function (sql, values) {
            if (!Array.isArray(values)) {
                values = [];
            }

            return new Future(function (setValue, setError) {
                db.transaction(function (transaction) {
                    transaction.executeSql(sql, values, function (transaction, results) {
                        setValue(results);
                    }, function (transaction, error) {
                        setError(error);
                    });
                });

            });
        };

        self.getSourcesOneToOneTargetEntity = function (sourceEntity, relationship) {
            var targetType = relationship.ofType;
            var targetQueryable = self.asQueryable(targetType);

            return targetQueryable.where(function (e) {
                return e.property(relationship.withForeignKey).isEqualTo(sourceEntity[relationship.hasKey]);
            }).firstOrDefault();
        };

        self.getTargetsOneToOneSourceEntity = function (targetEntity, relationship) {
            var sourceType = relationship.type;
            var sourceQueryable = self.asQueryable(sourceType);

            return sourceQueryable.where(function (e) {
                return e.property(relationship.hasKey).isEqualTo(targetEntity[relationship.withForeignKey]);
            }).firstOrDefault();
        };

        self.getSourcesOneToManyQueryProvider = function (sourceEntity, relationship) {
            var provider = new Provider();
            var targetType = relationship.ofType;

            provider.execute = provider.toArray = function (queryable) {
                var targetsQueryable = self.asQueryable(targetType);
                var targetQueryable = targetsQueryable.where(function (e) {
                    return e.property(relationship.withForeignKey).isEqualTo(sourceEntity[relationship.hasKey]);
                });

                return targetQueryable.merge(queryable).toArray();
            };

            provider.count = function (queryable) {
                var targetsQueryable = self.asQueryable(targetType);
                var targetQueryable = targetsQueryable.where(function (e) {
                    return e.property(relationship.withForeignKey).isEqualTo(sourceEntity[relationship.hasKey]);
                });
                return targetQueryable.merge(queryable).count();
            };

            return provider;
        };

        self.getTargetsOneToManySourceEntity = function (targetEntity, relationship) {
            var sourceType = relationship.type;
            var sourceQueryable = self.asQueryable(sourceType);

            return sourceQueryable.where(function (e) {
                return e.property(relationship.hasKey).isEqualTo(targetEntity[relationship.withForeignKey]);
            }).firstOrDefault();
        };

        self.getSourcesManyToManyQueryProvider = function (sourceEntity, relationship) {
            var provider = new Provider();
            var targetType = relationship.ofType;
            var timestamp = new Date().getTime();
            var mappingDataQueryable = self.asQueryable(relationship.usingMappingType);
            var targetDataQueryable = self.asQueryable(relationship.ofType);

            provider.execute = provider.toArray = function (queryable) {
                return mappingDataQueryable.where(function (e) {
                    return e.property(relationship.withForeignKey).isEqualTo(sourceEntity[relationship.hasKey]);
                }).toArray().chain(function (mappingEntities) {
                    return targetDataQueryable.merge(queryable).where(function (e) {
                        var ids = [];
                        mappingEntities.forEach(function (mappingEntity) {
                            ids.push(e.property(relationship.withKey).isEqualTo(mappingEntity[relationship.hasForeignKey]));
                        });

                        return e.or.apply(e, ids);
                    }).toArray();
                });
            };

            provider.count = function (queryable) {
                return mappingDataQueryable.where(function (e) {
                    return e.property(relationship.withForeignKey).isEqualTo(sourceEntity[relationship.hasKey]);
                }).toArray().chain(function (mappingEntities) {
                    return targetDataQueryable.merge(queryable).where(function (e) {
                        var ids = [];
                        mappingEntities.forEach(function (mappingEntity) {
                            ids.push(e.property(relationship.withKey).isEqualTo(mappingEntity[relationship.hasForeignKey]));
                        });

                        return e.or.apply(e, ids);
                    }).count();
                });
            };

            return provider;
        };

        self.getTargetsManyToManyQueryProvider = function (targetEntity, relationship) {
            var provider = new Provider();
            var sourceType = relationship.type;
            var timestamp = new Date().getTime();
            var mappingDataQueryable = self.asQueryable(relationship.usingMappingType);
            var sourceDataQueryable = self.asQueryable(relationship.type);

            provider.execute = provider.toArray = function (queryable) {

                return mappingDataQueryable.where(function (e) {

                    return e.property(relationship.hasForeignKey).isEqualTo(targetEntity[relationship.withKey]);

                }).toArray().chain(function (mappingEntities) {

                    return sourceDataQueryable.merge(queryable).where(function (e) {

                        var ids = [];
                        mappingEntities.forEach(function (mappingEntity) {
                            ids.push(e.property(relationship.hasKey).isEqualTo(mappingEntity[relationship.withForeignKey]));
                        });

                        return e.or.apply(e, ids);

                    }).toArray();
                });

            };

            provider.count = function (queryable) {

                return mappingDataQueryable.where(function (e) {

                    return e.property(relationship.hasForeignKey).isEqualTo(targetEntity[relationship.withKey]);

                }).toArray().chain(function (mappingEntities) {

                    return sourceDataQueryable.merge(queryable).where(function (e) {

                        var ids = [];
                        mappingEntities.forEach(function (mappingEntity) {
                            ids.push(e.property(relationship.hasKey).isEqualTo(mappingEntity[relationship.withForeignKey]));
                        });

                        return e.or.apply(e, ids);

                    }).count();
                });
            };

            return provider;
        };

    };


});