BASE.require([
], function () {
    BASE.namespace("BASE.data");

    BASE.data.ModelGenerator = function (config) {
        if (config == null || config.relationships == null || config.models == null) {
            throw new Error("The config needs to include both models and relationships.");
        }

        this.config = config;
        this.relationships = config.relationships;
        this.models = config.models;
        this.buildEntities(this.models, this.relationships);
    };

    BASE.data.ModelGenerator.prototype.buildEntities = function (models, relationships) {
        var self = this;
        models.forEach(function (model) {
            self.buildEntity(model, relationships);
        });
    };

    BASE.data.ModelGenerator.prototype.addToEdm = function (edm) {
        var self = this;
        var relationships = this.relationships;
        var models = this.models;

        models.forEach(function (model) {
            model.type = BASE.getObject(model["@type"]);
            Object.keys(model.properties).forEach(function (key) {
                var property = model.properties[key];

                property.type = BASE.getObject(property["@type"]);
            });

            edm.addModel(model);
        });

        relationships.oneToOne.forEach(function (relationship) {
            relationship.type = BASE.getObject(relationship["@type"]);
            relationship.ofType = BASE.getObject(relationship["@ofType"]);

            edm.addOneToOne(relationship);
        });

        relationships.oneToMany.forEach(function (relationship) {
            relationship.type = BASE.getObject(relationship["@type"]);
            relationship.ofType = BASE.getObject(relationship["@ofType"]);

            edm.addOneToMany(relationship);
        });

        relationships.manyToMany.forEach(function (relationship) {
            relationship.type = BASE.getObject(relationship["@type"]);
            relationship.ofType = BASE.getObject(relationship["@ofType"]);
            relationship.usingMappingType = BASE.getObject(relationship["@usingMappingType"]);
            edm.addManyToMany(relationship);
        });

    };

    BASE.data.ModelGenerator.prototype.buildEntity = function (model, relationships) {

        if (BASE.isObject(model["@type"])) {
            return;
        }

        if (model["@baseType"] && !BASE.isObject(model["@baseType"])) {
            throw new Error("The base type wasn't found.");
        }

        var oneToOne = relationships.oneToOne.filter(function (relationship) {
            return relationship["@type"] === model["@type"] || relationship["@ofType"] === model["@type"]
        }).map(function (relationship) {
            if (relationship["@type"] === model["@type"]) {
                return {
                    propertyName: relationship.hasOne,
                    getValue: function () {
                        return null;
                    }
                };
            } else {
                return {
                    propertyName: relationship.withOne,
                    getValue: function () {
                        return null;
                    }
                };
            }
        });

        var oneToMany = relationships.oneToMany.filter(function (relationship) {
            return relationship["@type"] === model["@type"] || relationship["@ofType"] === model["@type"]
        }).map(function (relationship) {
            if (relationship["@type"] === model["@type"]) {
                return {
                    propertyName: relationship.hasMany,
                    getValue: function () {
                        return [];
                    }
                };
            } else {
                return {
                    propertyName: relationship.withOne,
                    getValue: function () {
                        return null;
                    }
                };
            }
        });

        var manyToMany = relationships.manyToMany.filter(function (relationship) {
            return relationship["@type"] === model["@type"] || relationship["@ofType"] === model["@type"]
        }).map(function (relationship) {
            if (relationship["@type"] === model["@type"]) {
                return {
                    propertyName: relationship.hasMany,
                    getValue: function () {
                        return [];
                    }
                };
            } else {
                return {
                    propertyName: relationship.withMany,
                    getValue: function () {
                        return [];
                    }
                };
            }
        });

        var Entity = function () {
            var entity = this;

            if (model["@baseType"]) {
                BASE.getObject(model["@baseType"]).call(entity);
            }

            Object.keys(model.properties).forEach(function (key) {
                var type = model.properties[key];
                entity[key] = type.defaultValue == null ? null : type.defaultValue;
            });

            oneToOne.forEach(function (property) {
                entity[property.propertyName] = property.getValue();
            });

            oneToMany.forEach(function (property) {
                entity[property.propertyName] = property.getValue();
            });

            manyToMany.forEach(function (property) {
                entity[property.propertyName] = property.getValue();
            });

        };

        var namespaceParts = model["@type"].split(".");
        var className = namespaceParts.pop();
        var namespace = namespaceParts.join(".");

        BASE.namespace(namespace);

        var namespaceObject = BASE.getObject(namespace);
        namespaceObject[className] = Entity;

        return Entity;
    };

});

