BASE.require([
    "BASE.data.testing.Person",
    "BASE.data.testing.HumanoidType",
    "BASE.data.Edm"
], function () {
    
    var Person = BASE.data.testing.Person;
    var HumanoidType = BASE.data.testing.HumanoidType;
    
    BASE.namespace("BASE.data.testing.model");
    
    BASE.data.testing.model.person = {
        type: Person,
        collectionName: "people",
        properties: {
            id: {
                type: Integer,
                primaryKey: true,
                autoIncrement: true
            },
            firstName: {
                type: String
            },
            lastName: {
                type: String
            },
            age: {
                type: Integer
            },
            placeOfBirth: {
                type: Location
            },
            dateOfBirth: {
                type: DateTimeOffset
            },
            humanoidType: {
                type: Enum,
                genericTypeParameters: [HumanoidType]
            }
        }
    };

});
