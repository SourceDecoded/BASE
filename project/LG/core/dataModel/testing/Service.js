BASE.require([
    "LG.core.dataModel.testing.Edm",
    "LG.data.services.ODataService"
], function () {
    var Edm = LG.core.dataModel.testing.Edm;

    BASE.namespace("LG.core.dataModel.testing");

    LG.core.dataModel.testing.Service = (function (Super) {
        var Service = function (token) {
            var self = this;
            var edm = new Edm()

            Super.call(self, edm, 3, token);

            self.addEndPoint(LG.core.dataModel.testing.Fruit, "https://api.leavitt.com/Testing/Fruits");
            self.addEndPoint(LG.core.dataModel.testing.FruitShape, "https://api.leavitt.com/Testing/FruitShapes");
            self.addEndPoint(LG.core.dataModel.testing.Pesticide, "https://api.leavitt.com/Testing/Pesticides");
            self.addEndPoint(LG.core.dataModel.testing.Basket, "https://api.leavitt.com/Testing/Baskets");
            self.addEndPoint(LG.core.dataModel.testing.FruitToPesticide, "https://api.leavitt.com/Testing/FruitToPesticides");

            return self;
        };

        BASE.extend(Service, Super);

        return Service;
    }(LG.data.services.ODataService));
});