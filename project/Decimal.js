var global = (function () { return this; } ());

global.Decimal = function () {
    Number.apply(this, arguments);
};

BASE.extend(Decimal, Number);