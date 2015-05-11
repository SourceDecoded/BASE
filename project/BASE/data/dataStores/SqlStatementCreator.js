BASE.require([
    "BASE.collections.Hashmap"
], function () {
    
    var Hashmap = BASE.collections.Hashmap;
    
    BASE.namespace("BASE.data.dataStores");
    
    var SqlStatementCreator = function (edm, typeMapping) {
        if (typeof edm === "undefined") {
            throw new Error("Need an edm.");
        }
        
        if (typeof typeMapping === "undefined") {
            throw new Error("Need an typeMapping hashmap.");
        }
        
        this._edm = edm;
        this._typeMapping = typeMapping;
    };
    
    SqlStatementCreator.prototype.createTableClause = function (model) {
        return "CREATE TABLE `" + model.collectionName + "`" + this.createColumnDefinition(model);
    };
    
    SqlStatementCreator.prototype.createColumnDefinition = function (model) {
        var foreignKeys = [];
        var columns = [];
        var indexes = new Hashmap();
        var primaryKeys = [];
        var properties = model.properties;
        var typesMap = this._typeMapping;
        
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
                    columns.push("`" + key + "` " + sqlType + primaryKey);
                }
                if (property.foreignKeyRelationship) {
                    indexes.add(property.foreignKeyRelationship.withForeignKey, property.foreignKeyRelationship.withForeignKey);
                    var sourceModel = edm.getModelByType(property.foreignKeyRelationship.type);
                    foreignKeys.push("FOREIGN KEY (`" + property.foreignKeyRelationship.withForeignKey + "`) REFERENCES `" + sourceModel.collectionName + "`(`" + property.foreignKeyRelationship.hasKey + "`)");
                }
            }
        });
        
        primaryKeysStatement = "";
        if (primaryKeys.length > 1) {
            primaryKeysStatement = ", PRIMARY KEY (`" + primaryKeys.join("`, `") + "`)";
        }
        
        var indexValues = indexes.getValues();
        var definition = "(\n\t";
        definition += columns.concat(foreignKeys).join(", \n\t");
        definition += primaryKeysStatement;
        definition += "\n)";
        return definition;
    };
    
    SqlStatementCreator.prototype.createIndexes = function (model) {
        var indexes = new Hashmap();
        var typesMap = this._typeMapping;
        
        Object.keys(model.properties).forEach(function (key) {
            var property = model.properties[key];
            if (typeof property.type !== "undefined") {
                var sqlType = typesMap.get(property.type);
                
                if (mapper !== null) {
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
    
    SqlStatementCreator.prototype.createInsertStatement = function (entity) {
        var self = this;
        var edm = this._edm;
        var typesMap = this._typeMapping;
        var Type = entity.constructor
        var model = edm.getModelByType(Type);
        var columns = [];
        var values = [];
        var properties = model.properties;
        
        this._filterReleventProperties(properties).forEach(function (key) {
            var defaultValue = self._getDefaultValue(model, key);
            if (typeof entity[key] !== "undefined" && entity[key] !== null) {
                var mapper = typesMap.get(properties[key].type);
                columns.push("`" + key + "`");
                if (entity[key] === null) {
                    values.push(defaultValue);
                } else {
                    values.push(entity[key]);
                }
            }
        });
        
        if (values.length === 0) {
            return {
                statement: "INSERT INTO `" + model.collectionName + "` DEFAULT VALUES",
                values: values
            };
        } else {
            return {
                statement: "INSERT INTO `" + model.collectionName + "` (" + columns.join(", ") + ") VALUES (" + values.map(function () { return "?"; }).join(", ") + ")",
                values: values
            };
        }


    };
    
    SqlStatementCreator.prototype.createUpdateStatement = function (entity, updates) {
        var edm = this._edm;
        var typesMap = this._typeMapping;
        var model = edm.getModelByType(entity.constructor);
        var primaryKeyExpr = [];
        var primaryKeyValues = [];
        var columnSet = [];
        var values = [];
        var properties = model.properties;
        
        Object.keys(properties).forEach(function (key) {
            var property = properties[key];
            
            if (typeof updates[key] !== "undefined" && typesMap.hasKey(property.type)) {
                var mapper = typesMap.get(properties[key].type);
                
                columnSet.push("`" + key + "` = ?");
                values.push(updates[key]);
            }
        });
        
        this._filterReleventProperties(properties).forEach(function (key) {
            if (properties[key].primaryKeyRelationships.length !== 0 || properties[key].primaryKey) {
                primaryKeyExpr.push("`" + key + "` = ?");
                primaryKeyValues.push(entity[key]);
            }
        });
        
        values = values.concat(primaryKeyValues);
        
        if (columnSet.length === 0) {
            return {
                statement: "UPDATE `" + model.collectionName + "` WHERE " + primaryKeyExpr.join(" AND "),
                values: values
            };
        } else {
            return {
                statement: "UPDATE `" + model.collectionName + "` SET " + columnSet.join(", ") + " WHERE " + primaryKeyExpr.join(" AND "),
                values: values
            };
        }
    };
    
    SqlStatementCreator.prototype.createDeleteStatement = function (entity) {
        var edm = this._edm;
        var typesMap = this._typeMapping;
        var model = edm.getModelByType(entity.constructor);
        var primaryKeysExpr = [];
        var values = [];
        var properties = model.properties;
        var primaryKeys = edm.getPrimaryKeyProperties(entity.constructor);
        
        primaryKeys.forEach(function (primaryKey) {
            var mapper = typesMap.get(properties[primaryKey].type);
            
            if (entity[primaryKey] === null) {
                primaryKeysExpr.push("`" + primaryKey + "` IS NULL");
            } else {
                primaryKeysExpr.push("`" + primaryKey + "` = ?");
                values.push(entity[primaryKey]);
            }

        });
        
        return {
            statement: "DELETE FROM `" + model.collectionName + "` WHERE " + primaryKeysExpr.join(" AND ") + "",
            values: values
        };
    };
    
    SqlStatementCreator.prototype._filterReleventProperties = function (properties) {
        var typesMap = this._typeMapping;
        return Object.keys(properties).filter(function (key) {
            var property = properties[key];
            if (typeof property.type !== "undefined") {
                return typesMap.hasKey(property.type);
            }
            return false;
        });

    };
    
    SqlStatementCreator.prototype._findPrimaryKeys = function (properties) {
        return this._filterReleventProperties(properties).filter(function (key) {
            if (properties[key].primaryKeyRelationships.length > 0) {
                return true;
            }
            return false;
        });
    };
    
    SqlStatementCreator.prototype._getDefaultValue = function (model, property) {
        var defaultValue = null;
        var getter = model.properties[property].defaultValue;
        
        if (typeof getter === "function") {
            defaultValue = getter();
        } else if (typeof getter !== "undefined") {
            defaultValue = getter;
        }
        
        return defaultValue;
    };
    
    BASE.data.dataStores.SqlStatementCreator = SqlStatementCreator;

});