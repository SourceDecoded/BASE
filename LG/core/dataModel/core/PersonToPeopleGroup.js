BASE.require(["Object"], function () {
    BASE.namespace("LG.core.dataModel.core");

    LG.core.dataModel.core.PersonToPeopleGroup = (function (Super) {
        var PersonToPeopleGroup = function () {
            var self = this;
            if (!(self instanceof arguments.callee)) {
                return new PersonToPeopleGroup();
            }

            Super.call(self);

            self.id = null;
            self.createdDate = null;
            self.lastModifiedDate = null;
            self.endDate = null;
            self.startDate = null;
            self.person = null;
            self.personId = null;
            self.peopleGroupId = null;
            self.peopleGroup = null;

            return self;
        };

        BASE.extend(PersonToPeopleGroup, Super);

        return PersonToPeopleGroup;
    }(Object));
});
