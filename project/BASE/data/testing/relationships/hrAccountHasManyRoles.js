BASE.require([
    "BASE.data.testing.HrAccount",
    "BASE.data.testing.Role"
], function () {
    
    BASE.namespace("BASE.data.testing.relationships");
    
    BASE.data.testing.relationships.hrAccountHasManyRoles = {
        type: BASE.data.testing.HrAccount,
        hasKey: "id",
        hasMany: "roles",
        ofType: BASE.data.testing.Role,
        withKey: "id",
        withForeignKey: "hrAccountId",
        withOne: "hrAccount"
    };

});