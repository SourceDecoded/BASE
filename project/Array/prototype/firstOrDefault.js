Array.prototype.firstOrDefault = function (expr) {
    var array = this;

    if (typeof expr === "function") {
        array = this.filter(expr);
    }

    return typeof array[0] === "undefined" ? null : array[0];
};

