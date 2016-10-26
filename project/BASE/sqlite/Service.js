BASE.require([
    "BASE.sqlite.Provider",
    "BASE.data.utils"
], function () {

    BASE.namespace("BASE.sqlite");

    var Provider = BASE.sqlite.Provider;
    var flattenEntity = BASE.data.utils.flattenEntity;

    BASE.sqlite.Service = function (edm) {
        var self = this;

        self.add = function (entity) {
            var sql = self.createInsertStatement(entity);

            return self.executeAsync(sql.statement, sql.values).chain(function (results) {
                var id = results.insertId;
                var newEntity = flattenEntity(entity, true);

                // This could be problematic, because many to many entities often times use the two
                // Foreign keys as their primary key.
                var primaryKeys = edm.getPrimaryKeyProperties(Type);
                if (primaryKeys.length === 1) {
                    newEntity[primaryKeys[0]] = id;
                }

                var response = new AddedResponse("Entity was successfully added.", newEntity);

                setValue(response);
            }).ifError(function (error) {
                // TODO: we need to get the error messages of the sql.
                setError(new ErrorResponse("Sql error."));
            });
        };

        self.update = function () {

        };

        self.remove = function () {

        };

        self.asQueryable = function (Type) {

        };

        self.getQueryProvider = function () {

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

        self.createInsertStatement = function (entity) {
            var Type = entity.constructor
            var model = edm.getModelByType(Type);
            var columns = [];
            var values = [];
            var properties = model.properties;

            filterReleventProperties(properties).forEach(function (key) {
                var defaultValue = getDefaultValue(model, key);
                if (typeof entity[key] !== "undefined" && entity[key] !== null) {
                    columns.push(key);
                    if (entity[key] === null) {
                        values.push(sqlizePrimitive(defaultValue));
                    } else {
                        values.push(sqlizePrimitive(entity[key]));
                    }
                }
            });

            if (values.length === 0) {
                return {
                    statement: "INSERT INTO " + model.collectionName + " DEFAULT VALUES",
                    values: values
                };
            } else {
                return {
                    statement: "INSERT INTO " + model.collectionName + " (" + columns.join(", ") + ") VALUES (" + values.map(function () { return "?"; }).join(", ") + ")",
                    values: values
                };
            }


        };

        self.createUpdateStatement = function (entity, updates) {
            var model = edm.getModelByType(entity.constructor);
            var primaryKeyExpr = [];
            var primaryKeyValues = [];
            var columnSet = [];
            var values = [];
            var properties = model.properties;

            Object.keys(properties).forEach(function (key) {
                var property = properties[key];

                if (typeof updates[key] !== "undefined" && typesMap.hasKey(property.type)) {
                    columnSet.push(key + " = ?");
                    values.push(sqlizePrimitive(updates[key]));
                }
            });

            filterReleventProperties(properties).forEach(function (key) {
                if (properties[key].primaryKeyRelationships.length !== 0 || properties[key].primaryKey) {
                    primaryKeyExpr.push(key + " = ?");
                    primaryKeyValues.push(entity[key]);
                }
            });

            values = values.concat(primaryKeyValues);

            return {
                statement: "UPDATE " + model.collectionName + " SET " + columnSet.join(", ") + " WHERE " + primaryKeyExpr.join(" AND "),
                values: values
            };
        };

        self.createDeleteStatement = function (entity) {
            var model = edm.getModelByType(entity.constructor);
            var primaryKeysExpr = [];
            var values = [];
            var properties = model.properties;
            var primaryKeys = edm.getPrimaryKeyProperties(entity.constructor);

            primaryKeys.forEach(function (primaryKey) {

                if (entity[primaryKey] === null) {
                    primaryKeysExpr.push(primaryKey + " IS NULL");
                } else {
                    primaryKeysExpr.push(primaryKey + " = ?");
                    values.push(sqlizePrimitive(entity[primaryKey]));
                }

            });

            return {
                statement: "DELETE FROM " + model.collectionName + " WHERE " + primaryKeysExpr.join(" AND "),
                values: values
            };
        };


    };


});