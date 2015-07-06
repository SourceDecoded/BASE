BASE.require([
    "BASE.async.Future"
], function () {

    var Future = BASE.async.Future;

    BASE.namespace("BASE.web");

    BASE.web.getCurrentPosition = function () {
        return new Future(function (setValue, setError) {
            if (!navigator.geolocation) {
                setError(new Error("Geolocation is not supported by your device."));
            } else {
                navigator.geolocation.getCurrentPosition(setValue, setError);
            }
        });
    };

});