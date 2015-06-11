BASE.require(["Object"], function () {
    BASE.namespace("LG.core.dataModel.theGame");

    var _globalObject = this;

    LG.core.dataModel.theGame.TheGameTeamToPerson = (function (Super) {
        var TheGameTeamToPerson = function () {
            var self = this;
            if (self === _globalObject) {
                throw new Error("TheGameTeamToPerson constructor invoked with global context.  Say new.");
            }

            Super.call(self);
            
            self["id"] = null;
            self["startDate"] = null;
            self["endDate"] = null;
            self["createdDate"] = null;
            self["lastModifiedDate"] = null;
            self["personId"] = null;
            self["person"] = null;
            self["theGameTeamId"] = null;
            self["theGameTeam"] = null;
                                                  

            return self;
        };

        BASE.extend(TheGameTeamToPerson, Super);

        return TheGameTeamToPerson;
    }(Object));
});