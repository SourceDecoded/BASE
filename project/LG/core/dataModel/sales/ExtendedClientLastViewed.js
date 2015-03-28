BASE.require(["Object"], function () {
    BASE.namespace("LG.core.dataModel.sales");

    var _globalObject = this;

    LG.core.dataModel.sales.ExtendedClientLastViewed = (function (Super) {
        var Client = function () {
            var self = this;
            if (self === _globalObject) {
                throw new Error("Client constructor invoked with global context.  Say new.");
            }

            Super.call(self);

            self["id"] = null;
            self["name"] = null;

            self["isArchived"] = null;
            self["lastViewed"] = null;

            self["ownerId"] = null;
            self["createdDate"] = null;
            self["lastModifiedDate"] = null;
            self["startDate"] = null;
            self["endDate"] = null;

            return self;
        };

        BASE.extend(Client, Super);

        return Client;
    }(Object));
});