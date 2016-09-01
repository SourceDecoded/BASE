var global = (function () { return this; } ());

global.Byte = function () {
    Number.apply(this, arguments);
};

BASE.extend(Byte, Number);