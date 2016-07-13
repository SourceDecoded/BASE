BASE.require([], function () {

    BASE.namespace("BASE.sqlite");

    var escapeSingleQuotes = function (value) {
        if (typeof value !== "string") {
            value = value.toString();
        }

        return value.replace("'", "''");
    };

    BASE.sqlite.dataConverter = {
        convertString: function (value) {
            return "'" + escapeSingleQuotes(value) + "'";
        },
        convertContainsString: function (value) {
            return "'%" + escapeSingleQuotes(value) + "%'";
        },
        convertStartsWithString: function (value) {
            return "'" + escapeSingleQuotes(value) + "%'";
        },
        convertEndsWithString: function (value) {
            return "'%" + escapeSingleQuotes(value) + "'";
        },
        convertNumber: function (value) {
            return value.toString();
        },
        convertBoolean: function (value) {
            return value ? 1 : 0;
        },
        convertDate: function (value) {
            return value.getTime();
        }
    };

});