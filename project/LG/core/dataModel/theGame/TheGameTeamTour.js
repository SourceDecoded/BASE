BASE.require(["Object"], function () {
    BASE.namespace("LG.core.dataModel.theGame");

    var _globalObject = this;

    LG.core.dataModel.theGame.TheGameTeamTour = (function (Super) {
        var TheGameTeamTour = function () {
            var self = this;
            if (self === _globalObject) {
                throw new Error("TheGameTeamTour constructor invoked with global context.  Say new.");
            }

            Super.call(self);
            
            self["id"] = null;
            self["theGameTour"] = null;
            self["theGameTeamId"] = null;
            self["theGameTeam"] = null;
            self["startDate"] = null;
            self["endDate"] = null;
            self["createdDate"] = null;
            self["lastModifiedDate"] = null;
                                                  

            return self;
        };

        BASE.extend(TheGameTeamTour, Super);

        return TheGameTeamTour;
    }(Object));
});