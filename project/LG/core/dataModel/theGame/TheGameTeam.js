BASE.require(["Object"], function () {
    BASE.namespace("LG.core.dataModel.theGame");

    var _globalObject = this;

    LG.core.dataModel.theGame.TheGameTeam = (function (Super) {
        var TheGameTeam = function () {
            var self = this;
            if (self === _globalObject) {
                throw new Error("TheGameTeam constructor invoked with global context.  Say new.");
            }

            Super.call(self);
            
            self["names"] = [];
            self["people"] = [];
            self["tours"] = [];
            self["points"] = [];
            self["id"] = null;
            self["startDate"] = null;
            self["endDate"] = null;
            self["createdDate"] = null;
            self["lastModifiedDate"] = null;
            self["gameVersionNumber"] = null;
                                                  

            return self;
        };

        BASE.extend(TheGameTeam, Super);

        return TheGameTeam;
    }(Object));
});