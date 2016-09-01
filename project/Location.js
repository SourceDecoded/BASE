var global = (function () { return this; } ());

global.Location = function () {
    var self = this;
    self.longitude = null;
    self.latitude = null;
};