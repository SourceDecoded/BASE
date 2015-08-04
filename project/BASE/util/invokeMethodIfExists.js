BASE.require([
    "BASE.async.Future"
], function () {
    BASE.namespace('BASE.util');
    
    var Future = BASE.async.Future;
    
    BASE.util.invokeMethodIfExists = function (controller, methodName, args) {
        var value;
        if (!(controller instanceof Object)) {
            throw new Error("A controller must be supplied");
        }
        if (typeof controller[methodName] === "function") {
            value = controller[methodName].apply(controller, args);
        }
        return value;
    }
});
