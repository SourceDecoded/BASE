BASE.namespace("BASE.odata");

BASE.odata.convertToOdataValue = function (value) {
    if (typeof value === "string") {
        var escapedString = value.replace(/'/g, "''").replace(/\&/g, "%26").replace(/\#/g, "%23");
        return "'" + escapedString + "'";
    } else if (typeof value === "boolean") {
        return value.toString();
    } else if (typeof value === "number") {
        return value.toString();
    } else if (value instanceof Date) {
        var dateString = value.toISOString();
        dateString = dateString.substr(0, dateString.length - 1);
        dateString += "-00:00";
        return "DateTime'" + dateString + "'";
    } else if (value === null) {
        return "null";
    } else if (typeof value !== "undefined" && value.constructor === Enum) {
        if (typeof value.odataNamespace === "undefined") {
            throw new Error("The " + value.name + " Enum needs to have a odataNamespace property.");
        }
        return value.odataNamespace + "'" + value.name + "'";
    }  else {
        return value;
    }
};
