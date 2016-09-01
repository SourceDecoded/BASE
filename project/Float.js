var global = (function () { return this; } ());

global.Float = function () {
    Number.apply(this, arguments);
};

BASE.extend(Float, Number);