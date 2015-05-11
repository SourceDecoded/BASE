Array.prototype.orderByDesc = function (expr) {
    return this.sort(function (a, b) {
        return expr(b) - expr(a);
    });
};