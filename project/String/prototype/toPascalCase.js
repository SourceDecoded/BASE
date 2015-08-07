(function () {

    var toPascalCase = function(string) {
        return string.substr(0, 1).toUpperCase() + string.substr(1);
    };

    String.prototype.toPascalCase = function (delimiter) {
        if (typeof delimiter === "string" && delimiter.length > 0) {
            var parts = this.split(delimiter);
            
            return parts.map(toPascalCase).join("");
        }

        return toPascalCase(this);
    };
}());