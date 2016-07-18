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

    var toValue = function (value) {
        value = value == null ? "" : value;
        return "\"" + value.replace("\"", "\"\"") + "\"";
    };

    CsvGenerator.prototype.toAnchorElement = function (array, titleText, downloadName) {
        var csvFile = this.toCsvBlob(array);
        var fileName = downloadName + ".csv";
        downloadName = downloadName || "download";

        var a = document.createElement("a");
        a.textContent = titleText || "Download CSV";

        if (window.navigator.msSaveOrOpenBlob) {
            a.addEventListener("click", function () {
                window.navigator.msSaveOrOpenBlob(csvFile, fileName);
            }, false);
            a.style.cursor = "pointer";
        } else {
            a.download = fileName;
            a.href = window.URL.createObjectURL(csvFile);
            a.dataset.downloadurl = [contentType, a.download, a.href].join(':');
        }

        return a;
    };

    CsvGenerator.prototype.toCsv = function (array) {
        var entity = this.tempEntity
        var mappings = this.propertyMapping;

        if (Array.isArray(array) && array.length > 0) {
            var keys = Object.keys(entity);
            var results = [];

            var header = keys.map(function (key) {
                return toValue(mappings[key] || key);
            }).join(",");

            results.push(header);

            array.forEach(function (item) {
                results.push(keys.map(function (key) {
                    return toValue(item[key]);
                }).join(", "));
            });

            var result = results.join("\n");

            return result;

        } else {
            return "";
        }
    };

    CsvGenerator.prototype.toCsvBlob = function (array) {
        return new Blob([this.toCsv(array)], { type: contentType });
    };

    BASE.data.CsvGenerator = CsvGenerator;

} ());