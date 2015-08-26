BASE.require([
    "String.prototype.trim"
], function () {
    String.prototype.toEnum = function (Type) {
        var string = this;
        var value = Type[string.trim()];
        
        if (typeof value !== "number") {
            throw new Error("Coundn't resolve string to an Enum value.");
        }
        
        return value;
    };
});

