BASE.require([
	"BASE.async.Future"
], function () {
	BASE.namespace('BASE.util');
	
	var Future = BASE.async.Future;
	
	BASE.util.invokeMethodIfExistsAsync = function (controller, methodName, args) {
		var value;
		if (!(controller instanceof Object)) {
			throw new Error("A controller must be supplied");	
		}
		if (typeof controller[methodName] === "function") {
			value = controller[methodName].apply(controller, args);
			if (value instanceof Future) {
				return value;
			}
		}
		return Future.fromResult(value);
	}
});
