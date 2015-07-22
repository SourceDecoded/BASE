BASE.require([
    "String.prototype.trim"
], function () {
    String.prototype.toEnum = function (Type) {
        var keys = this.split(",");
        
        return keys.filter(function (string) {
            return Type[string.trim()] == null ? false : true;
        }).map(function (string) {
            return Type[string];
        }).reduce(function (last, next) {
            return last | next;
        });
    };
});

