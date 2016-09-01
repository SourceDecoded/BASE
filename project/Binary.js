var global = (function () { return this; } ());

global.Binary = function () {
    Number.apply(this, arguments);
};

BASE.extend(Binary, Number);