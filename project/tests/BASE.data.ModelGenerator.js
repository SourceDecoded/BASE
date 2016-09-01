var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.data.ModelGenerator",
    "BASE.data.Edm",
    "Integer"
], function () {

    var ModelGenerator = BASE.data.ModelGenerator;
    var Edm = BASE.data.Edm;

    var config = {
        models: [{
            "@type": "model.Person",
            "collectionName": "people",
            "properties": {
                "id": {
                    "@type": "Integer",
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "firstName": {
                    "@type": "String"
                },
                "lastName": {
                    "@type": "String"
                },
                "age": {
                    "@type": "Integer"
                }
            }
        }, {
                "@type": "model.Employee",
                "@baseType": "model.Person",
                "collectionName": "employees",
                "properties": {
                    "salary": {
                        "@type": "Integer"
                    }
                }
            }, {
                "@type": "model.Address",
                "collectionName": "addresses",
                "properties": {
                    "id": {
                        "@type": "Integer",
                        "primaryKey": true,
                        "autoIncrement": true
                    },
                    "street1": {
                        "@type": "String"
                    }
                }
            }, {
                "@type": "model.PhoneNumber",
                "collectionName": "phoneNumbers",
                "properties": {
                    "id": {
                        "@type": "Integer",
                        "primaryKey": true,
                        "autoIncrement": true
                    },
                    "lineNumber": {
                        "@type": "String"
                    }
                }
            }],
        relationships: {
            oneToOne: [{
                "@type": "model.Person",
                "hasKey": "id",
                "hasOne": "phoneNumber",
                "@ofType": "model.PhoneNumber",
                "withKey": "id",
                "withForeignKey": "personId",
                "withOne": "person"
            }],
            oneToMany: [{
                "@type": "model.Person",
                "hasKey": "id",
                "hasMany": "addresses",
                "@ofType": "model.Address",
                "withKey": "id",
                "withForeignKey": "personId",
                "withOne": "person"
            }],
            manyToMany: []
        }
    };

    var json = JSON.stringify(config);

    exports["BASE.data.ModelGenerator: Check to see if entities are created on the global namespace."] = function () {
        var generator = new ModelGenerator(config);

        var Person = BASE.getObject("model.Person");
        var Employee = BASE.getObject("model.Employee");

        assert.equal(new Employee() instanceof Person, true);
        assert.equal(BASE.isObject("model.Person"), true);
        assert.equal(BASE.isObject("model.Employee"), true);
        assert.equal(BASE.isObject("model.PhoneNumber"), true);
        assert.equal(BASE.isObject("model.Address"), true);
    };

    exports["BASE.data.ModelGenerator: Run through an Edm."] = function () {
        var edm = new Edm();
        edm.fromJson(json);

        assert.equal(BASE.isObject("model.Person"), true);
        assert.equal(BASE.isObject("model.PhoneNumber"), true);
        assert.equal(BASE.isObject("model.Address"), true);
    };
});