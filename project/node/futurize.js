(function () {
    BASE.namespace("node");

    var Future = BASE.async.Future;
    var futurize = function (method, args) {
        return new Future(function (setValue, setError) {
            args.push(function (err) {
                if (err) {
                    setError(err);
                } else {
                    setValue(Array.prototype.slice.call(arguments, 1));
                } 
            });
            method.apply(method, args);
        });
    };

    node.futurize = futurize;

}());