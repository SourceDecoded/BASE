BASE.require([
    "String.prototype.trim"
], function () {
    String.prototype.toEnum = function (Type) {
        var string = this;
        var value = Type[string.trim()];
        
        if (value == null || (typeof value !== "number" && value.constructor !== Number)) {
            throw new Error("Coundn't resolve string to an Enum value.");
        }
        
        return value;
    };
});

