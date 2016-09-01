var global = (function () { return this; } ());

global.DateTimeOffset = function () {
    Date.apply(this, arguments);
};

BASE.extend(DateTimeOffset, Date);