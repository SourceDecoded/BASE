Array.prototype.orderBy = function (expr) {
    return this.sort(function (a, b) {
        return expr(a) - expr(b);
    });
};