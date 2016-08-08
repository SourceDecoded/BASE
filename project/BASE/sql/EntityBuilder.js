BASE.require([
    "BASE.collections.MultiKeyMap",
    "BASE.collections.Hashmap",
    "BASE.query.ExpressionVisitor"
], function () {
    var MultiKeyMap = BASE.collections.MultiKeyMap;
    var Hashmap = BASE.collections.Hashmap;
    var ExpressionVisitor = BASE.query.ExpressionVisitor;

    BASE.namespace("BASE.sql");

    var flattenMultiKeyMap = function (multiKeyMap) {
        var keys = multiKeyMap.getKeys();
        return keys.reduce(function (array, key) {
            return array.concat(multiKeyMap.get(key).getValues());
        }, []);
    }

    var EntityBuilder = BASE.sql.EntityBuilder = function (Type, edm) {
        this.Type = Type;
        this.edm = edm;
        this.model = this.edm.getModelByType(Type);
        this.delimiter = "___";
    };

    EntityBuilder.prototype.attachEntityWithRelationships = function (entity, entityMap) {
        var edm = this.edm;
        var oneToOneRelationships = edm.getOneToOneRelationships(entity);
        var oneToOneAsTargetRelationships = edm.getOneToOneAsTargetRelationships(entity);
        var oneToManyRelationships = edm.getOneToManyRelationships(entity);
        var oneToManyAsTargetRelationships = edm.getOneToManyAsTargetRelationships(entity);
        var manyToManyRelationships = edm.getManyToManyRelationships(entity);
        var manyToManyAsTargetRelationships = edm.getManyToManyAsTargetRelationships(entity);

        oneToOneAsTargetRelationships.forEach(function (relationship) {
            var sourceEntity = entityMap.get(relationship.type, entity[relationship.withForeignKey]);

            if (sourceEntity != null) {
                sourceEntity[relationship.hasOne] = entity;
                entity[relationship.withOne] = sourceEntity;
            }
        });

        oneToManyAsTargetRelationships.forEach(function (relationship) {
            var sourceEntity = entityMap.get(relationship.type, entity[relationship.withForeignKey]);

            if (sourceEntity != null) {
                sourceEntity[relationship.hasMany].push(entity);
                entity[relationship.withOne] = sourceEntity;
            }
        });

        manyToManyAsTargetRelationships.forEach(function (relationship) {
            var mappingEntities = entityMap.get(relationship.usingMappingType);

            if (mappingEntities != null) {
                mappingEntities.getValues().forEach(function (mappingEntity) {
                    if (mappingEntity[relationship.withForeignKey] !== entity[relationship.withKey]) {
                        return;
                    }

                    var source = entityMap.get(relationship.type, mappingEntity[relationship.hasKey]);
                    if (source != null) {
                        var index = source[relationship.hasMany].indexOf(entity);
                        if (index === -1) {
                            source[relationship.hasMany].push(entity);
                        }

                        index = target[relationship.withMany].indexOf(source);

                        if (index === -1) {
                            target[relationship.withMany].push(source);
                        }
                    }
                });
            }
        });
    };

    EntityBuilder.prototype.getPrimaryKeyValueByType = function (Type, row) {
        var keys = this.edm.getPrimaryKeyProperties(Type);
        var model = this.edm.getModelByType(Type);
        var delimiter = this.delimiter;

        return keys.map(function (key) {
            return row[model.collectionName + delimiter + key]
        }).join("|");
    };

    EntityBuilder.prototype.convertRow = function (row, entityMap) {
        var self = this;
        var edm = this.edm;
        var entity = new this.Type();
        var key = this.getPrimaryKeyValueByType(this.Type, row);
        entityMap.add(this.Type, key, entity);

        Object.keys(row).forEach(function (key) {
            var parts = key.split("___");
            var collectionName = parts[0];
            var propertyName = parts[1];
            var model = edm.getModel(collectionName);
            var type = model.type;
            var primaryKey = self.getPrimaryKeyValueByType(type, row);
            var entity = entityMap.get(type, primaryKey);

            if (!entity) {
                var entity = new type();
                entityMap.add(type, primaryKey, entity);
            }

            entity[propertyName] = row[key];
        });

    };

    EntityBuilder.prototype.convert = function (sqlResults) {
        var self = this;
        var Type = this.Type;

        if (sqlResults.length > 0) {
            var entityMap = new MultiKeyMap();
            sqlResults.forEach(function (row) {
                self.convertRow(row, entityMap);
            });

            var entities = flattenMultiKeyMap(entityMap);
            entities.forEach(function (entity) {
                self.attachEntityWithRelationships(entity, entityMap);
            });

            return entityMap.get(Type).getValues();
        } else {
            return [];
        }
    };

});