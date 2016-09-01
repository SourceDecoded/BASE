var global = (function () { return this; } ());

global.Integer = function () {
    Number.apply(this, arguments);
};

BASE.extend(Integer, Number);