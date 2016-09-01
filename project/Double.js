var global = (function () { return this; } ());

global.Double = function () {
    Number.apply(this, arguments);
};

BASE.extend(Double, Number);