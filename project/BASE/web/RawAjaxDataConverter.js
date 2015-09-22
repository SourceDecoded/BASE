BASE.require([], function () {

    BASE.namespace("BASE.web");

    BASE.web.RawAjaxDataConverter = function () {

        this.handleResponseAsync = function (xhr) {
            return Future.fromResult(xhr);
        };

        this.handleRequestAsync = function (options) {
            return Future.fromResult(options);
        };

        this.handleErrorResponseAsync = function (xhr) {
            var error = new Error("Response Error");
            error.xhr = xhr;

            return Future.fromError(error);
        };

    };

});