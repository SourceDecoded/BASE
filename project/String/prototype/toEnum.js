BASE.require([
    "String.prototype.trim"
], function () {
    String.prototype.toEnum = function (Type) {
        var keys = this.split(",");

        var stringList = keys.filter(function(string) {
            return Type[string.trim()] == null ? false : true;
        }).map(function(string) {
            return Type[string.trim()];
        });
        
        if (stringList.length === 0) {
            return 0;
        }

        return stringList.reduce(function (last, next) {
            return last | next;
        });
    };
});

