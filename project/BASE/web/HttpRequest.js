BASE.require([
    "BASE.web.Url",
], function () {

    var Url = BASE.web.Url;
    var Future = BASE.async.Future;

    BASE.namespace("BASE.web");

    BASE.web.HttpRequest = function (url, options) {
        var self = this;

        options = options || {};

        var state;
        var urlObject = new Url(url);
        var responseFuture = null;
        var method = options.method || "GET";
        var body = null;
        var headers = options.headers || {};

        var throwSentError = function () {
            throw new Error("Request already sent.");
        };

        var defaultState = {
            send: function () {
                var xhr = new XMLHttpRequest();

                responseFuture = new Future(function (setValue, setError) {
                    state = sentState;
                    xhr.onreadystatechange = function (event) {
                        if (xhr.readyState == 4) {
                            state = completeState;

                            if (xhr.status < 300 && xhr.status >= 200) {
                                setValue(xhr.responseText);
                            } else {
                                var error = new Error("Request Error");
                                error.status = xhr.status;
                                error.statusText = xhr.statusText;
                                error.responseBody = xhr.responseBody;
                                setError(error);
                            }
                        }
                    };

                    try {

                        xhr.open(method, url, true);
                        Object.keys(headers).forEach(function (key) {
                            if (headers[key] !== false) {
                                xhr.setRequestHeader(key, headers[key]);
                            }
                        });

                        xhr.send(body);
                    } catch (e) {
                        var error = new Error("Url: \"" + url + "\" couldn't be retrieved, maybe because CORS isn't enabled, or you are working in ie 8 and below.");
                        setError(error);
                    }
                });

                responseFuture.ifCanceled(function () {
                    xhr.abort();
                });

                return responseFuture;
            },
            setHeader: function (name, value) {
                if (typeof name === "string" && typeof value === "string") {
                    headers[name] = value;
                } else {
                    throw new Error("Name and value need to be strings.");
                }
            },
            setHeaders: function (headers) {
                Object.keys(headers).forEach(function (key) {
                    self.setHeader(key, headers[key]);
                });
            },
            setBody: function (value) {
                if (typeof value === "string") {
                    body = value;
                }
            },
            setMethod: function (value) {
                method = value;
            }
        };

        var sentState = {
            send: function () {
                return responseFuture;
            },
            setHeader: throwSentError,
            setHeaders: throwSentError,
            setBody: throwSentError,
            setMethod: throwSentError
        };

        var completeState = sentState;

        self.send = function () {
            return state.send();
        };

        self.setHeader = function () {
            return state.setHeader.apply(state, arguments);
        };

        self.setHeaders = function () {
            return state.setHeaders.apply(state, arguments);
        };

        self.setBody = function () {
            return state.setBody.apply(state, arguments);
        };

        self.setMethod = function () {
            return state.setMethod.apply(state, arguments);
        };

        state = defaultState;

    };

});