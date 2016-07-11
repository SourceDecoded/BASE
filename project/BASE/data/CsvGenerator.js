(function () {
    window.URL = window.webkitURL || window.URL;
    var contentType = 'text/csv';

    BASE.namespace("BASE.data");

    var CsvGenerator = function (Type, propertyMapping) {
        if (Type == null) {
            throw new Error("Type needs to be defined.");
        }

        propertyMapping = propertyMapping || {};

        this.Type = Type;
        this.tempEntity = new Type();
        this.propertyMapping = propertyMapping;

    };

    CsvGenerator.prototype.toAnchorElement = function (array, titleText, downloadName) {
        var csvFile = this.toCsvBlob(array);
        downloadName = downloadName || "download";

        var a = document.createElement("a");
        a.download = downloadName + ".csv";
        a.href = window.URL.createObjectURL(csvFile);
        a.textContent = titleText || "Download CSV";

        a.dataset.downloadurl = [contentType, a.download, a.href].join(':');

        return a;
    };

    CsvGenerator.prototype.toCsvBlob = function (array) {
        var entity = this.entity

        if (Array.isArray(array) && array.length > 0) {
            var keys = Object.keys(entity);
            var results = [];

            var result = keys.map(function (key) {
                return "\"" + prettifyName(key) + "\"";
            }).join(",");

            results.push(result);

            array.forEach(function (item) {
                var result = keys.map(function (key) {
                    return "\"" + item[key].replace("\"", "\"\"") + "\"";
                }).join(", ");

                results.push(result);
            });

            var result = results.join("\n");

            return new Blob([result], { type: contentType });

        } else {
            return new Blob([], { type: contentType });
        }
    };

    BASE.data.CsvGenerator;

} ());