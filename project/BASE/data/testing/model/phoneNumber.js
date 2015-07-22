BASE.require([
    "BASE.data.Edm",
    "BASE.data.testing.PhoneNumber",
    "BASE.data.testing.PhoneNumberType"
], function () {
    
    var PhoneNumber = BASE.data.testing.PhoneNumber;
    var PhoneNumberType = BASE.data.testing.PhoneNumberType;
    
    BASE.namespace("BASE.data.testing.model");
    
    BASE.data.testing.model.phoneNumber = {
        type: PhoneNumber,
        collectionName: "phoneNumbers",
        properties: {
            id: {
                type: Integer,
                primaryKey: true,
                autoIncrement: true
            },
            areacode: {
                type: Integer
            },
            lineNumber: {
                type: Integer
            },
            personId: {
                type: Integer
            },
            type: {
                type: Enum,
                genericTypeParameters: [PhoneNumberType]
            }
        }
    };

});
