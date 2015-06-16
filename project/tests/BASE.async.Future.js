var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.async.Future"
], function () {
    
    var Future = BASE.async.Future;
    
    var bindToFutureAndCountCallbacks = function (future) {
        var counts = {
            then: 0,
            ifError: 0,
            ifCanceled: 0,
            catch: 0,
            catchCanceled: 0,
            chain: 0,
            finally: 0
        };
        
        Object.keys(counts).forEach(function (methodName) {
            future[methodName](function () {
                counts[methodName]++;
            }).try();
        });
        
        return counts;
    };
    
    exports["BASE.async.Future: Success"] = function () {
        
        var future = new Future(function (setValue) {
            setTimeout(setValue, 0, "Hey");
        });
        
        var counts = bindToFutureAndCountCallbacks(future);
        
        future.finally(function () {
            assert.equal(counts.then, 1);
            assert.equal(counts.ifError, 0);
            assert.equal(counts.ifCanceled, 0);
            assert.equal(counts.chain, 1);
            assert.equal(counts.catch, 0);
            assert.equal(counts.catchCanceled, 0);
            assert.equal(counts.finally, 1);
        });
    };
    
    exports["BASE.async.Future: all method."] = function () {
        
        var futureSuccess = future.fromResult();
        var futureSuccess1 = future.fromResult();

        var future = Future.all([futureSuccess, futureSuccess1]);
        var counts = bindToFutureAndCountCallbacks(future);
        
        future.finally(function () {
            assert.equal(counts.then, 1);
            assert.equal(counts.ifError, 0);
            assert.equal(counts.ifCanceled, 0);
            assert.equal(counts.chain, 1);
            assert.equal(counts.catch, 0);
            assert.equal(counts.catchCanceled, 0);
            assert.equal(counts.finally, 1);
        });
    };
  
});