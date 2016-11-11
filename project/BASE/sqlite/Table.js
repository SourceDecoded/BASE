BASE.require([
    "BASE.data.Edm",
    "BASE.data.utils",
    "BASE.sqlite.Provider",
    "BASE.query.Queryable",
    "Date.prototype.format",
    "BASE.collections.Hashmap",
    "BASE.data.responses.AddedResponse",
    "BASE.data.responses.UpdatedResponse",
    "BASE.data.responses.RemovedResponse",
    "BASE.data.responses.ErrorResponse"
], function () {

    BASE.namespace("BASE.sqlite");

    var Future = BASE.async.Future;
    var Hashmap = BASE.collections.Hashmap;
    var Provider = BASE.sqlite.Provider;
    var Queryable = BASE.query.Queryable;

    var AddedResponse = BASE.data.responses.AddedResponse;
    var UpdatedResponse = BASE.data.responses.UpdatedResponse;
    var RemovedResponse = BASE.data.responses.RemovedResponse;
    var ErrorResponse = BASE.data.responses.ErrorResponse;
    var flattenEntity = BASE.data.utils.flattenEntity;

    var sqlizePrimitive = function (value) {

        if (typeof value === "string") {
            return value;
        } else if (typeof value === "number") {
            return value.toString();
        } else if (typeof value === "boolean") {
            return value ? 1 : 0;
        } else if (value instanceof Date) {
            return value.getTime();
        } else if (value === null) {
            return null;
        }

    };

    var typesMap = new Hashmap();
    typesMap.add(Double, "REAL");
    typesMap.add(Float, "REAL");
    typesMap.add(Integer, "INTEGER");
    typesMap.add(Byte, "INTEGER");
    typesMap.add(Binary, "INTEGER");
    typesMap.add(Boolean, "NUMERIC");
    typesMap.add(Date, "NUMERIC");
    typesMap.add(DateTimeOffset, "NUMERIC");
    typesMap.add(Decimal, "NUMERIC");
    typesMap.add(Enum, "NUMERIC");
    typesMap.add(String, "TEXT");

    var filterReleventProperties = function (properties) {
        return Object.keys(properties).filter(function (key) {
            var property = properties[key];
            if (typeof property.type !== "undefined") {
                return typesMap.hasKey(property.type);
            }
            return false;
        });

    };

    var findPrimaryKeys = function (properties) {
        return filterReleventProperties(properties).filter(function (key) {
            if (properties[key].primaryKeyRelationships.length > 0) {
                return true;
            }
            return false;
        });
    };

    var getDefaultValue = function (model, property) {
        var defaultValue = null;
        var getter = model.properties[property].defaultValue;

        if (typeof getter === "function") {
            defaultValue = getter();
        } else if (typeof getter !== "undefined") {
            defaultValue = getter;
        }

        return defaultValue;
    };

    var SqlWriter = function (edm) {
        var self = this;

        self.createTableClause = function (model) {
            return "CREATE TABLE " + model.collectionName + self.createColumnDefinition(model);
        };

        self.createColumnDefinition = function (model) {
            var foreignKeys = [];
            var columns = [];
            var indexes = new Hashmap();
            var primaryKeys = [];
            var properties = model.properties;

            Object.keys(properties).forEach(function (property) {
                if (properties[property].primaryKey) {
                    primaryKeys.push(property);
                }
            });

            Object.keys(model.properties).forEach(function (key) {
                var property = model.properties[key];
                if (typeof property.type !== "undefined") {
                    var sqlType = typesMap.get(property.type);
                    var primaryKey = "";

                    if (sqlType !== null) {
                        if (property.primaryKey) {
                            indexes.add(key, key);

                            if (primaryKeys.length === 1) {
                                primaryKey = " PRIMARY KEY";
                            }

                            if (property.autoIncrement) {
                                primaryKey += " AUTOINCREMENT";
                            }
                        }
                        columns.push(key + " " + sqlType + primaryKey);
                    }
                    if (property.foreignKeyRelationship) {
                        indexes.add(property.foreignKeyRelationship.withForeignKey, property.foreignKeyRelationship.withForeignKey);
                        var sourceModel = edm.getModelByType(property.foreignKeyRelationship.type);
                        foreignKeys.push("FOREIGN KEY (" + property.foreignKeyRelationship.withForeignKey + ") REFERENCES " + sourceModel.collectionName + "(" + property.foreignKeyRelationship.hasKey + ")");
                    }
                }
            });
            primaryKeysStatement = "";
            if (primaryKeys.length > 1) {
                primaryKeysStatement = ", PRIMARY KEY (" + primaryKeys.join(", ") + ")";
            }

            var indexValues = indexes.getValues();
            var definition = "(\n\t";
            definition += columns.concat(foreignKeys).join(", \n\t");
            definition += primaryKeysStatement;
            definition += "\n)";
            return definition;
        };

        self.createIndexes = function (model) {
            var indexes = new Hashmap();

            Object.keys(model.properties).forEach(function (key) {
                var property = model.properties[key];
                if (typeof property.type !== "undefined") {
                    var sqlType = typesMap.get(property.type);

                    if (sqlType !== null) {
                        if (property.primaryKeyRelationships.length > 0 || property.primaryKey) {
                            indexes.add(key, key);
                        }
                    }
                    if (property.foreignKeyRelationship) {
                        indexes.add(property.foreignKeyRelationship.withForeignKey, property.foreignKeyRelationship.withForeignKey);
                    }
                }
            });

            var indexValues = indexes.getValues();
            definition = "CREATE INDEX IF NOT EXISTS " + indexValues.join("_") + " ON " + model.collectionName + " (\n\t" + indexValues.join(", \n\t") + "\n)";
            return definition;
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

    BASE.sqlite.Table = function (Type, edm, database) {
        var self = this;
        var edmModel = edm.getModelByType(Type);
        var properties = edmModel.properties;
        var tableName = edmModel.collectionName;
        var sqlWriter = new SqlWriter(edm);
        var tableSql = sqlWriter.createTableClause(edmModel);
        var indexesSql = sqlWriter.createIndexes(edmModel);
        var primaryKeys = findPrimaryKeys(edmModel.properties);
        var primaryKey = primaryKeys[0];
        var provider = new Provider(Type, edm, database);

        var executeAsync = function (sql, values) {
            if (!Array.isArray(values)) {
                values = [];
            }

            return new Future(function (setValue, setError) {
                database.transaction(function (transaction) {
                    transaction.executeSql(sql, values, function (transaction, results) {
                        setValue(results);
                    }, function (transaction, error) {
                        setError(error);
                    });
                });

            });
        };

        var createTableAsync = function () {
            return executeAsync(tableSql).chain(function () {
                return executeAsync(indexesSql);
            });
        };

        var initialize = executeAsync("SELECT sql FROM sqlite_master WHERE tbl_name = '" + tableName + "'").chain(function (results) {

            if (results.rows.length > 0) {
                var oldTableSql = results.rows.item(0).sql;
                if (oldTableSql !== tableSql) {
                    return executeAsync("DROP TABLE IF EXISTS " + tableName).chain(function () {
                        return createTableAsync();
                    });
                } else {
                    return;
                }

            } else {
                return createTableAsync();
            }
        });

        self.addAsync = function (entity) {
            return initialize.chain(function () {
                var relationships = edm.getOneToOneAsTargetRelationships(entity);
                relationships = relationships.concat(edm.getOneToManyAsTargetRelationships(entity));

                var constraint;
                var isEmptyTarget = relationships.some(function (relationship) {
                    if (relationship.optional !== true) {
                        var value = typeof entity[relationship.withForeignKey] === "undefined" || entity[relationship.withForeignKey] === null;
                        if (value) {
                            constraint = relationship
                        }
                        return value;
                    } else {
                        return false;
                    }
                });

                if (isEmptyTarget) {
                    return Future.fromError(new ErrorResponse("Foreign key constraint on relationship."));
                }

                var addSql = sqlWriter.createInsertStatement(entity);
                return executeAsync(addSql.statement, addSql.values);

            }).chain(function (results) {
                var id = results.insertId;
                var newEntity = flattenEntity(entity, true);

                // This could be problematic, because many to many entities often times use the two
                // Foreign keys as their primary key.
                var primaryKeys = edm.getPrimaryKeyProperties(Type);
                if (primaryKeys.length === 1) {
                    newEntity[primaryKeys[0]] = id;
                }

                return new AddedResponse("Entity was successfully added.", newEntity);

            }).catch(function () {
                return Future.fromError(new ErrorResponse("Failed to add entity."));
            });
        };

        self.updateAsync = function (entity, updates) {
            return initialize.chain(function () {
                var sql = sqlWriter.createUpdateStatement(entity, updates);
                return executeAsync(sql.statement, sql.values);
            }).chain(function (results) {
                return new UpdatedResponse("Successfully updated the entity.");
            }).catch(function () {
                return Future.fromError(new ErrorResponse("Failed to update entity."));
            });
        };

        self.removeAsync = function (entity) {
            return initialize.chain(function () {
                var sql = sqlWriter.createDeleteStatement(entity);
                return executeAsync(sql.statement, sql.values);
            }).chain(function (results) {
                return new RemovedResponse("Successfully removed the entity.");
            }).catch(function (error) {
                return Future.fromError(new ErrorResponse("Failed to remove entity."));
            });
        };

        self.dropAsync = function () {
            return new Future(function (setValue, setError) {
                var sql = "DROP TABLE '" + tableName + "'";
                executeAsync(sql).then(function () {
                    setValue();
                }).ifError(function (error) {
                    setError(new ErrorResponse("Failed to drop table: " + tableName));
                });
            }).then();
        };

        self.getQueryProvider = function () {
            return provider;
        };

        self.asQueryable = function () {
            var queryable = new Queryable(Type);
            queryable.provider = self.getQueryProvider();
            return queryable;
        };

        self.disposeAsync = function () {
            return Future.fromResult();
        };

        self.initializeAsync = function () {
            return initialize;
        };

    };

});