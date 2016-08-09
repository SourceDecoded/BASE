BASE.require([
    "BASE.sqlite.Provider"
], function () {

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