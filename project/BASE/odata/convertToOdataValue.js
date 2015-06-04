BASE.namespace("BASE.odata");

BASE.odata.convertToOdataValue = function (value) {
    if (typeof value === "string") {
        return "'" + value.replace(/'/g, "''") + "'";
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
    } else {
        return value;
    }
};
