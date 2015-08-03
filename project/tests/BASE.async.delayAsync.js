var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
	"BASE.async.delayAsync"
], function () {
	var watchFuture = function (future) {
		var canceledCount = 0;
		var errorCount = 0;
		var successCount = 0;
		
		return future.chain(function () {
			successCount++;
		}).catchCanceled(function () {
			canceledCount++;
		}).catch(function () {
			errorCount++;
		}).chain(function () {
			return {
				canceledCount: canceledCount,
				errorCount: errorCount,
				successCount: successCount
			};
		});
	};
	
	var delayAsync = BASE.async.delayAsync;
	
	exports["BASE.async.delayAsync: Success"] = function () {
		
		watchFuture(delayAsync(1)).then(function (counts) {
			assert.equal(counts.canceledCount, 0);
			assert.equal(counts.errorCount, 0);
			assert.equal(counts.successCount, 1);
		});
		
	};
	
	exports["BASE.async.delayAsync: Expect Error with a NaN is passed as a parameter."] = function () {
		assert.throws(function () {
			delayAsync("Not a Number");
		});
	};
	
	exports["BASE.async.delayAsync: Cancel"] = function () {
		var delayFuture = delayAsync(1);
		delayFuture.cancel();
		
		watchFuture(delayFuture).then(function (counts) {
			assert.equal(counts.canceledCount, 1);
			assert.equal(counts.errorCount, 0);
			assert.equal(counts.successCount, 0);
		});
		
	};
});