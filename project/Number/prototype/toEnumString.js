Number.prototype.toEnumString = function (Type) {
    var number = this.valueOf();
    var response = Object.keys(Type).filter(function (key) {
        return typeof Type[key].name === "string" && Type[key] === number;
    });
    
    var string = response[0];
    
    if (string == null) {
        throw new Error("Couldn't find Enum string value.");
    }
    
    return string;
};