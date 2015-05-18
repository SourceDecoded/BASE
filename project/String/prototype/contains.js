if (!String.prototype.contains) {
    String.prototype.contains = function (value) {
        return this.indexOf(value) > -1;
    };
}

