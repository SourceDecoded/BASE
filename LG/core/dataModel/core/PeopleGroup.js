BASE.require([], function () {
    BASE.namespace("LG.core.dataModel.core");

    var _globalObject = this;

    LG.core.dataModel.core.PeopleGroup = (function (Super) {
        var PeopleGroup = function () {
            var self = this;
            if (self === _globalObject) {
                throw new Error("PeopleGroup constructor invoked with global context.  Say new.");
            }

            Super.call(self);

            self.id = null;
            self.personToPeopleGroups = [];
            self.permissions = [];
            self.permissionGroups = [];
            self.name = null;
            self.description = null;
            self.createdDate = null;
            self.lastModifiedDate = null;

            return self;
        };

        BASE.extend(PeopleGroup, Super);

        return PeopleGroup;
    }(Object));
});