﻿BASE.require([
    "BASE.collections.MultiKeyMap",
    "BASE.collections.Hashmap",
    "BASE.query.ExpressionVisitor"
], function () {
    var MultiKeyMap = BASE.collections.MultiKeyMap;
    var Hashmap = BASE.collections.Hashmap;
    var ExpressionVisitor = BASE.query.ExpressionVisitor;

    BASE.namespace("BASE.sql");

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
                entity[withOne] = sourceEntity;
            }
        });

        oneToManyAsTargetRelationships.forEach(function (relationship) {
            var sourceEntity = entityMap.get(relationship.type, entity[relationship.withForeignKey]);

            if (sourceEntity != null) {
                sourceEntity[relationship.hasMany].push(entity);
                entity[withOne] = sourceEntity;
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
        var keys = this.edm.getPrimaryKeyByType(Type);
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
            var key = self.getPrimaryKeyValueByType(type, row);
            var entity = entityMap.get(type, key);

            if (!entity) {
                var entity = new type();
                e.entityMap(type, key, entity);
            }

            entity[propertyName] = row[key];
        });

    };

    EntityBuilder.prototype.convert = function (sqlResults) {
        if (sqlResults.length > 0) {

        } else {
            return [];
        }
    };

});