Number.prototype.toEnumFlagString = function (Type) {
    var value = this.valueOf();
    var response = Object.keys(Type).filter(function (key) {
        return ((value & Type[key]) == Type[key]) && Type[key] != 0 && typeof Type[key].name === "string";
    }).map(function (key) {
        return Type[key].name || key;
    }).join(", ");
    
    return (response.length > 0 ? response : "None");
};