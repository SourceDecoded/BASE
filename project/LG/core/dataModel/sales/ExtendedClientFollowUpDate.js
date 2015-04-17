BASE.require(["LG.core.dataModel.sales.Client"], function () {
    BASE.namespace("LG.core.dataModel.sales");

    var _globalObject = this;

    LG.core.dataModel.sales.ExtendedClientFollowUpDate = (function (Super) {
        var Client = function () {
            var self = this;
            if (self === _globalObject) {
                throw new Error("Client constructor invoked with global context.  Say new.");
            }

            Super.call(self);

            self["id"] = null;
            self["name"] = null;

            self["isArchived"] = null;
            self["street1"] = null;
            self["street2"] = null;
            self["city"] = null;
            self["state"] = null;
            self["zip"] = null;
            self["country"] = null;
            self["county"] = null;
            self["longitude"] = null;
            self["latitude"] = null;
            self["primaryContactFirstName"] = null;
            self["primaryContactLastName"] = null;
            self["primaryContactWorkAreaCode"] = null;
            self["primaryContactWorkCountryCode"] = null;
            self["primaryContactWorkExtension"] = null;
            self["primaryContactWorkLineNumber"] = null;       
            self["followUpDate"] = null;

            self["ownerId"] = null;
            self["createdDate"] = null;
            self["lastModifiedDate"] = null;
            self["startDate"] = null;
            self["endDate"] = null;

            return self;
        };

        BASE.extend(Client, Super);

        return Client;
    }(LG.core.dataModel.sales.Client));
});