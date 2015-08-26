BASE.require([
    "String.prototype.trim"
], function () {
    String.prototype.toEnumFlag = function (Type) {
        var keys = this.split(",");
        
        var intList = keys.filter(function (string) {
            return Type[string.trim()] == null ? false : true;
        }).map(function (string) {
            return Type[string.trim()];
        });
        
        if (intList.length === 0) {
            return 0;
        }
        
        return intList.reduce(function (last, next) {
            return last | next;
        });
    };
});

