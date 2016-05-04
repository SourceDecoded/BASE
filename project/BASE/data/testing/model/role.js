BASE.require([
    "BASE.data.Edm",
    "BASE.data.testing.Role"
], function () {
    
    var Role = BASE.data.testing.Role;
    
    BASE.namespace("BASE.data.testing.model");
    
    BASE.data.testing.model.role = {
        type: Role,
        collectionName: "roles",
        properties: {
            id: {
                type: Integer,
                primaryKey: true,
                autoIncrement: true
            },
            hrAccountId: {
                type: Integer
            },
            name: {
                type: String
            }
        }
    };

});
