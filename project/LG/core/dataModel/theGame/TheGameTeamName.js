BASE.require(["Object"], function () {
    BASE.namespace("LG.core.dataModel.theGame");

    var _globalObject = this;

    LG.core.dataModel.theGame.TheGameTeamName = (function (Super) {
        var TheGameTeamName = function () {
            var self = this;
            if (self === _globalObject) {
                throw new Error("TheGameTeamName constructor invoked with global context.  Say new.");
            }

            Super.call(self);
            
            self["id"] = null;
            self["name"] = null;
            self["theGameTeamId"] = null;
            self["theGameTeam"] = null;
            self["startDate"] = null;
            self["endDate"] = null;
            self["createdDate"] = null;
            self["lastModifiedDate"] = null;
                                                  

            return self;
        };

        BASE.extend(TheGameTeamName, Super);

        return TheGameTeamName;
    }(Object));
});