BASE.require([
	"BASE.async.Future"
], function () {
	
	var Future = BASE.async.Future;
	
	BASE.namespace("BASE.async");
	BASE.async.delayAsync = function (delayInMilliseconds) {
		if (typeof delayInMilliseconds !== "number") {
			throw new Error("Expected a number.");
		}
		
		return new Future(function (setValue, setError, cancel, ifCanceled) {
			var timeout = setTimeout(setValue, delayInMilliseconds);
			
			ifCanceled(function () {
				clearTimeout(timeout);
			});
		});
	};

});