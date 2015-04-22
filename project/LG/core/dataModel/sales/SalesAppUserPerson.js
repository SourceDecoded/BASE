BASE.require(["LG.core.dataModel.core.Person"], function () {
    BASE.namespace("LG.core.dataModel.sales");

    var _globalObject = this;

    LG.core.dataModel.sales.SalesAppUserPerson = (function (Super) {
        var SalesAppUserPerson = function () {
            var self = this;
            if (self === _globalObject) {
                throw new Error("SalesAppUserPerson constructor invoked with global context.  Say new.");
            }

            Super.call(self);




            return self;
        };

        BASE.extend(SalesAppUserPerson, Super);

        return SalesAppUserPerson;
    }(LG.core.dataModel.core.Person));
});