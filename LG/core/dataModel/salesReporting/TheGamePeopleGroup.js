BASE.require(["LG.core.dataModel.core.PeopleGroup"], function () {
    BASE.namespace("LG.core.dataModel.salesReporting");

    LG.core.dataModel.salesReporting.TheGamePeopleGroup = (function (Super) {
        var TheGamePeopleGroup = function () {
            var self = this;
            if (!(self instanceof arguments.callee)) {
                return new TheGamePeopleGroup();
            }

            Super.call(self);

            self.gameNumber = null;
            self.theGameTour = null;
            self.points = null;

            return self;
        };

        BASE.extend(TheGamePeopleGroup, Super);

        return TheGamePeopleGroup;
    }(LG.core.dataModel.core.PeopleGroup));
});
