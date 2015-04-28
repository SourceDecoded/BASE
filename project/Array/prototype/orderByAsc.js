Array.prototype.orderByAsc = function (expr) {
    return this.sort(function (a, b) {
        return expr(b) - expr(a);
    });
};