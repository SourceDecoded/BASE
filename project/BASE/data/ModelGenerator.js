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

            edm.addManyToMany(relationship);
        });

    };

    BASE.data.ModelGenerator.prototype.buildEntity = function (model, relationships) {

        if (BASE.isObject(model["@type"])) {
            return;
        }

        var oneToOne = relationships.oneToOne.filter(function (relationship) {
            return relationship["@type"] === model["@type"] || relationship["@ofType"] === model["@ofType"]
        }).map(function (relationship) {
            if (relationship["@type"] === model["@type"]) {
                return {
                    propertyName: relationship.hasOne,
                    value: null
                };
            } else {
                return {
                    propertyName: relationship.withOne,
                    value: null
                };
            }
        });

        var oneToMany = relationships.oneToMany.filter(function (relationship) {
            return relationship["@type"] === model["@type"] || relationship["@ofType"] === model["@ofType"]
        }).map(function (relationship) {
            if (relationship["@type"] === model["@type"]) {
                return {
                    propertyName: relationship.hasMany,
                    value: []
                };
            } else {
                return {
                    propertyName: relationship.withOne,
                    value: null
                };
            }
        });

        var manyToMany = relationships.manyToMany.filter(function (relationship) {
            return relationship["@type"] === model["@type"] || relationship["@ofType"] === model["@ofType"]
        }).map(function (relationship) {
            if (relationship["@type"] === model["@type"]) {
                return {
                    propertyName: relationship.hasMany,
                    value: []
                };
            } else {
                return {
                    propertyName: relationship.withMany,
                    value: []
                };
            }
        });

        var Entity = function () {
            var entity = this;
            Object.keys(model.properties).forEach(function (key) {
                var type = model.properties[key];
                entity[key] = type.defaultValue || null;
            });

            oneToOne.forEach(function (property) {
                entity[property.propertyName] = property.value;
            });

            oneToMany.forEach(function (property) {
                entity[property.propertyName] = property.value;
            });

            manyToMany.forEach(function (property) {
                entity[property.propertyName] = property.value;
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

