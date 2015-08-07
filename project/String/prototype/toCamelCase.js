(function () {
    
    var toCamelCase = function (string) {
        if (string.substr(0, 2) !== string.substr(0, 2).toUpperCase()) {
            return string.substr(0, 1).toLowerCase() + string.substr(1);
        } else {
            return string;
        }
    };
    
    
    String.prototype.toCamelCase = function (delimiter) {
        if (typeof delimiter === "string" && delimiter.length > 0) {
            var parts = this.split(delimiter);
            
            return parts.map(function (part, index) {
                if (index === 0) {
                    return toCamelCase(part);
                } else {
                    return part.substr(0, 1).toUpperCase() + part.substr(1);
                }
            }).join("");
        }
        
        return toCamelCase(this);
    };

}());