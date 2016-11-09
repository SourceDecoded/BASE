BASE.require([], function () {

    BASE.namespace("BASE.web");

    var Future = BASE.async.Future;
    var isSuccessfulRequest = function (xhr) {
        return (xhr.status < 300 && xhr.status >= 200) || (xhr.status === 0 && xhr.responseText);
    };

    var global = (function () {
        return this;
    }());

    var invokeMethod = function (obj, methodName, args) {
        arg = args || [];
        if (obj != null && typeof obj[methodName] === "function") {
            return obj[methodName].apply(obj, args);
        }
    };

    BASE.web.HttpRequest = function (url, options) {
        var self = this;

        options = options || {};

        var state;
        var responseFuture = null;
        var asyncResponseFuture = null;
        var method = options.method || "GET";
        var body = options.data || options.body || null;
        var headers = options.headers || {};
        var delegate = options.delegate || {};
        // This helps ie browsers go to the proxy instead of a cross domain site.
        url = global.XDomainRequest ? options.proxyUrl || url : url;

        var throwSentError = function () {
            throw new Error("Request already sent.");
        };

        var defaultState = {
            sendAsync: function () {
                var xhr = new XMLHttpRequest();

                invokeMethod(delegate, "prepareXhr", [xhr]);

                asyncResponseFuture = new Future(function (setValue, setError) {
                    state = sentState;
                    xhr.onreadystatechange = function (event) {
                        if (xhr.readyState == 4) {
                            state = completeState;

                            if (isSuccessfulRequest(xhr)) {
                                setValue(xhr);
                            } else {
                                setError(xhr);
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
                        setError(xhr);
                    }
                });

                asyncResponseFuture.ifCanceled(function () {
                    xhr.abort();
                });

                return asyncResponseFuture;
            },
            send: function () {
                return defaultState.sendAsync().chain(function (xhr) {
                    return xhr.responseText;
                })["catch"](function (xhr) {
                    var error = new Error("Request Error");
                    error.status = xhr.status;
                    error.statusText = xhr.statusText;
                    error.responseBody = xhr.responseBody;
                    error.xhr = xhr;
                    return Future.fromError(error);
                });
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
            sendAsync: function () {
                return asyncResponseFuture;
            },
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

        self.sendAsync = function () {
            return state.sendAsync();
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