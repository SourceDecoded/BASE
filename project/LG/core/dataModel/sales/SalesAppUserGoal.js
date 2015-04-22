BASE.require(['Object'], function () {
    BASE.namespace("LG.core.dataModel.sales");

    var _globalObject = this;

    LG.core.dataModel.sales.SalesAppUserGoal = (function (Super) {
        var SalesAppUserGoal = function () {
            var self = this;
            if (self === _globalObject) {
                throw new Error("Opportunity constructor invoked with global context. Say new.");
            }

            Super.call(self);

            self['id'] = null;
            self['createdDate'] = null;
            self['lastModifiedDate'] = null;
            self['startDate'] = null;
            self['endDate'] = null;
            self['ownerId'] = null;
            self['owner'] = null;
            self['goalYear'] = null;
            self['amount'] = null;

            return self;
        };

        BASE.extend(SalesAppUserGoal, Super);

        return SalesAppUserGoal;
    })(Object);
});