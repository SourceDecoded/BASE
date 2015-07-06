BASE.require(["Object"], function () {
    BASE.namespace("LG.core.dataModel.theGame");

    var _globalObject = this;

    LG.core.dataModel.theGame.TheGameTeamPoint = (function (Super) {
        var TheGameTeamPoint = function () {
            var self = this;
            if (self === _globalObject) {
                throw new Error("TheGameTeamPoint constructor invoked with global context.  Say new.");
            }

            Super.call(self);
            
            self["id"] = null;
            self["value"] = null;
            self["theGameTeamId"] = null;
            self["theGameTeam"] = null;
            self["startDate"] = null;
            self["endDate"] = null;
            self["createdDate"] = null;
            self["lastModifiedDate"] = null;
                                                  

            return self;
        };

        BASE.extend(TheGameTeamPoint, Super);

        return TheGameTeamPoint;
    }(Object));
});