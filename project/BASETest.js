var futureTestSimpleNoError = function () {
    var future = new BASE.async.Future(function (setValue, setError, cancel) {
        setTimeout(setValue, 1000, "Finished");
    });

    var wrappedFuture = future.ifError(function (error) {
        console.log(error);
    });

    wrappedFuture.then(function (value) {
        //EXPECT Finished in 1 sec
        console.log(value);
    });
};



var futureTestSimpleIfError = function () {
    var future = new BASE.async.Future(function (setValue, setError, cancel) {
        setTimeout(setError, 1000, new Error("Error"));
    });

    var wrappedFuture = future.ifError(function (error) {
        //EXPECT Finished in 1 sec
        console.log(error);
    });

    wrappedFuture.then(function (value) {
        console.log(value);
    });
};



var futureTestSimpleNoErrorAndChain = function () {
    var future = new BASE.async.Future(function (setValue, setError, cancel) {
        setTimeout(setValue, 1000, "Finished");
    });

    var wrappedFuture = future.chain(function (value) {
        return value + " beautifully.";
    }).ifError(function (error) {
        console.log(error);
    });

    wrappedFuture.then(function (value) {
        //EXPECT Finished in 1 sec
        console.log(value);
    });
};

var futureTestSimpleNoErrorAndChainWithCancel = function () {
    var future = new BASE.async.Future(function (setValue, setError, cancel) {
        setTimeout(setValue, 1000, "Finished");
    });

    var wrappedFuture = future.chain(function (value) {
        return value + " beautifully.";
    }).ifError(function (error) {
        console.log(error);
    });

    wrappedFuture.then(function (value) {
        //EXPECT Finished in 1 sec
        console.log(value);
    });

    future.ifCanceled(function (reason) {
        console.log("future: " + reason);
    });

    wrappedFuture.ifCanceled(function (reason) {
        console.log("wrappedFuture: " + reason);
    });

    setTimeout(function () {
        wrappedFuture.cancel("CANCEL TRIGGERED");
    }, 500);
};

var futureThreeChainTest = function () {
    var foundationFuture = new BASE.async.Future(function (setValue, setError, cancel) {
        setTimeout(setValue, 1000, "Foundation done.");
        console.log("Pouring foundation...");
    });

    var wallsFuture = foundationFuture.chain(function (value) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            setTimeout(setValue, 1000, "Walls done.");
            console.log("Building walls...");
        });
    });

    var roofFuture = wallsFuture.chain(function (value) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            setTimeout(setValue, 1000, "Roof done.");
            console.log("Roofing...");
        });
    });

    foundationFuture.ifError(function (reason) {
        console.log("foundationFuture error: " + reason);
    });

    wallsFuture.ifError(function (reason) {
        console.log("wallsFuture error: " + reason);
    });

    roofFuture.ifError(function (reason) {
        console.log("roofFuture error: " + reason);
    });

    foundationFuture.ifCanceled(function (reason) {
        console.log("foundationFuture canceled: " + reason);
    });

    wallsFuture.ifCanceled(function (reason) {
        console.log("wallsFuture canceled: " + reason);
    });

    roofFuture.ifCanceled(function (reason) {
        console.log("roofFuture canceled: " + reason);
    });

    console.log("construction starting...");
    roofFuture.then(function () {
        console.log("Construction ended...");
    });
};

var futureThreeChainWithErrorTest = function () {
    var foundationFuture = new BASE.async.Future(function (setValue, setError, cancel) {
        setTimeout(setValue, 1000, "Foundation done.");
        console.log("Pouring foundation...");
    });

    var wallsFuture = foundationFuture.chain(function (value) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            setTimeout(setError, 1000, "Walls...RAN OUT OF WOOD.");
            console.log("Building walls...");
        });
    });

    var roofFuture = wallsFuture.chain(function (value) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            setTimeout(setValue, 1000, "Roof done.");
            console.log("Roofing...");
        });
    });

    foundationFuture.ifError(function (reason) {
        console.log("foundationFuture error: " + reason);
    });

    wallsFuture.ifError(function (reason) {
        console.log("wallsFuture error: " + reason);
    });

    roofFuture.ifError(function (reason) {
        console.log("roofFuture error: " + reason);
    });

    foundationFuture.ifCanceled(function (reason) {
        console.log("foundationFuture canceled: " + reason);
    });

    wallsFuture.ifCanceled(function (reason) {
        console.log("wallsFuture canceled: " + reason);
    });

    roofFuture.ifCanceled(function (reason) {
        console.log("roofFuture canceled: " + reason);
    });


    console.log("construction starting...");
    roofFuture.then(function () {
        console.log("Construction ended...");
    });
};

var futureThreeChainWithErrorTest2 = function () {
    var foundationFuture = new BASE.async.Future(function (setValue, setError, cancel) {
        setTimeout(setValue, 1000, "Foundation done.");
        console.log("Pouring foundation...");
    });

    var wallsFuture = foundationFuture.chain(function (value) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            setTimeout(setValue, 1000, "Walls complete.");
            setTimeout(function () {
                wallsFuture.cancel();
            }, 500, "Walls...RAN OUT OF WOOD.");
            console.log("Building walls...");
        });
    });

    var roofFuture = wallsFuture.chain(function (value) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            setTimeout(setValue, 1000, "Roof done.");
            console.log("Roofing...");
        });
    });

    foundationFuture.ifError(function (reason) {
        console.log("foundationFuture error: " + reason);
    });

    wallsFuture.ifError(function (reason) {
        console.log("wallsFuture error: " + reason);
    });

    roofFuture.ifError(function (reason) {
        console.log("roofFuture error: " + reason);
    });

    foundationFuture.ifCanceled(function (reason) {
        console.log("foundationFuture canceled: " + reason);
    });

    wallsFuture.ifCanceled(function (reason) {
        console.log("wallsFuture canceled: " + reason);
    });

    roofFuture.ifCanceled(function (reason) {
        console.log("roofFuture canceled: " + reason);
    });


    console.log("construction starting...");
    roofFuture.then(function () {
        console.log("Construction ended...");
    });
};

var futureThreeChainWithCancelationTest = function () {
    var foundationFuture = new BASE.async.Future(function (setValue, setError, cancel) {
        setTimeout(setValue, 1000, "Foundation done.");
        console.log("Pouring foundation...");
    });

    var wallsFuture = foundationFuture.chain(function (value) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            setTimeout(cancel, 1000, "Cancelled construction durning build walls");
            console.log("Building walls...");
        });
    });

    var roofFuture = wallsFuture.chain(function (value) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            setTimeout(setValue, 1000, "Roof done.");
            console.log("Roofing...");
        });
    });

    foundationFuture.ifError(function (reason) {
        console.log("foundationFuture error: " + reason);
    });

    wallsFuture.ifError(function (reason) {
        console.log("wallsFuture error: " + reason);
    });

    roofFuture.ifError(function (reason) {
        console.log("roofFuture error: " + reason);
    });

    foundationFuture.ifCanceled(function (reason) {
        console.log("foundationFuture canceled: " + reason);
    });

    wallsFuture.ifCanceled(function (reason) {
        console.log("wallsFuture canceled: " + reason);
    });

    roofFuture.ifCanceled(function (reason) {
        console.log("roofFuture canceled: " + reason);
    });


    console.log("construction starting...");
    roofFuture.then(function () {
        console.log("Construction ended...");
    });
};

var futureCancelOncompleteFutureTest = function () {
    var foundationFuture = new BASE.async.Future(function (setValue, setError, cancel) {
        setTimeout(setValue, 1000, "Foundation done.");
        console.log("Pouring foundation...");
    });

    var wallsFuture = foundationFuture.chain(function (value) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            foundationFuture.cancel("cause you let me");
            setTimeout(setValue, 1000, "Cancelled construction durning build walls");
            console.log("Building walls...");
        });
    });

    var roofFuture = wallsFuture.chain(function (value) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            setTimeout(setValue, 1000, "Roof done.");
            console.log("Roofing...");
        });
    });

    foundationFuture.ifError(function (reason) {
        console.log("foundationFuture error: " + reason);
    });

    wallsFuture.ifError(function (reason) {
        console.log("wallsFuture error: " + reason);
    });

    roofFuture.ifError(function (reason) {
        console.log("roofFuture error: " + reason);
    });

    foundationFuture.ifCanceled(function (reason) {
        console.log("foundationFuture canceled: " + reason);
    });

    wallsFuture.ifCanceled(function (reason) {
        console.log("wallsFuture canceled: " + reason);
    });

    roofFuture.ifCanceled(function (reason) {
        console.log("roofFuture canceled: " + reason);
    });


    console.log("construction starting...");
    roofFuture.then(function () {
        console.log("Construction ended...");
    });
};



var futureRecoverOnFailureFutureTest = function () {
    var foundationFuture = new BASE.async.Future(function (setValue, setError, cancel) {
        setTimeout(setValue, 1000, "Foundation done.");
        console.log("Pouring foundation...");
    });

    var wallsFuture = foundationFuture.chain(function (value) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            setTimeout(setError, 1000, "Error during building of walls");
            console.log("Building walls...");
        });
    });

    var temp = wallsFuture.catch(function (error) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            console.log("fixing walls error.... '" + error + "'");
            setTimeout(setValue, 1000, "Walls error fixed and walls complete.");
        });
    });

    var roofFuture = temp.chain(function (value) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            setTimeout(setValue, 1000, "Roof done.");
            console.log("Roofing...");
        });
    });

    foundationFuture.ifError(function (reason) {
        console.log("foundationFuture error: " + reason);
    });

    wallsFuture.ifError(function (reason) {
        console.log("wallsFuture error: " + reason);
    });

    roofFuture.ifError(function (reason) {
        console.log("roofFuture error: " + reason);
    });

    foundationFuture.ifCanceled(function (reason) {
        console.log("foundationFuture canceled: " + reason);
    });

    wallsFuture.ifCanceled(function (reason) {
        console.log("wallsFuture canceled: " + reason);
    });

    roofFuture.ifCanceled(function (reason) {
        console.log("roofFuture canceled: " + reason);
    });


    console.log("construction starting...");
    roofFuture.then(function () {
        console.log("Construction ended...");
    });
};



var futureRecoverOnFailureFutureWithSideChainTest = function () {
    var foundationFuture = new BASE.async.Future(function (setValue, setError, cancel) {
        setTimeout(setValue, 1000, "Foundation done.");
        console.log("Pouring foundation...");
    });

    var wallsFuture = foundationFuture.chain(function (value) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            setTimeout(setError, 1000, "Error during building of walls");
            console.log("Building walls...");
        });
    });

    //side chain
    var sideChain = wallsFuture.catch(function (error) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            console.log("(side-chain) fixing walls error.... '" + error + "'");
            setTimeout(setValue, 1000, "Walls (side-chain) error fixed and walls complete.");
        });
    }).chain(function (value) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            setTimeout(setError, 1000, "Error (side-chain) building of walls");

        });
    }).try();

    sideChain.ifError(function (reason) {
        console.log("sideCatch error: " + reason);
    });
    //side chain

    var wallsCatchFuture = wallsFuture.catch(function (error) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            console.log("fixing walls error.... '" + error + "'");
            setTimeout(setValue, 1000, "Walls error fixed and walls complete.");
        });
    });

    var roofFuture = wallsCatchFuture.chain(function (value) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            setTimeout(setValue, 1000, "Roof done.");
            console.log("Roofing...");
        });
    });

    foundationFuture.ifError(function (reason) {
        console.log("foundationFuture error: " + reason);
    });

    wallsFuture.ifError(function (reason) {
        console.log("wallsFuture error: " + reason);
    });

    roofFuture.ifError(function (reason) {
        console.log("roofFuture error: " + reason);
    });

    foundationFuture.ifCanceled(function (reason) {
        console.log("foundationFuture canceled: " + reason);
    });

    wallsFuture.ifCanceled(function (reason) {
        console.log("wallsFuture canceled: " + reason);
    });

    roofFuture.ifCanceled(function (reason) {
        console.log("roofFuture canceled: " + reason);
    });


    console.log("construction starting...");
    roofFuture.then(function () {
        console.log("Construction ended...");
    });
};









var futureRecoverOnFailureFutureWithSideChainTest = function () {
    var foundationFuture = new BASE.async.Future(function (setValue, setError, cancel) {
        setTimeout(setValue, 1000, "Foundation done.");
        console.log("Pouring foundation...");
    });

    var wallsFuture = foundationFuture.chain(function (value) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            setTimeout(setError, 1000, "Error during building of walls");
            console.log("Building walls...");
        });
    });

    //side chain
    var sideChain = wallsFuture.catch(function (error) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            console.log("(side-chain) fixing walls error.... '" + error + "'");
            setTimeout(setValue, 1000, "Walls (side-chain) error fixed and walls complete.");
        });
    }).chain(function (value) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            setTimeout(setError, 1000, "Error (side-chain) building of walls");

        });
    });

    sideChain.ifError(function (reason) {
        console.log("sideCatch error: " + reason);
    });
    //side chain


    var wallsCatchFuture = wallsFuture.catch(function (error) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            console.log("fixing walls error.... '" + error + "'");
            setTimeout(setError, 1000, "Walls error couldn't be fixed...");
        });
    });

    var roofFuture = wallsCatchFuture.chain(function (value) {
        return new BASE.async.Future(function (setValue, setError, cancel) {
            setTimeout(setValue, 1000, "Roof done.");
            console.log("Roofing...");
        });
    });

    foundationFuture.ifError(function (reason) {
        console.log("foundationFuture error: " + reason);
    });

    wallsFuture.ifError(function (reason) {
        console.log("wallsFuture error: " + reason);
    });

    roofFuture.ifError(function (reason) {
        console.log("roofFuture error: " + reason);
    });

    foundationFuture.ifCanceled(function (reason) {
        console.log("foundationFuture canceled: " + reason);
    });

    wallsFuture.ifCanceled(function (reason) {
        console.log("wallsFuture canceled: " + reason);
    });

    roofFuture.ifCanceled(function (reason) {
        console.log("roofFuture canceled: " + reason);
    });


    console.log("construction starting...");
    roofFuture.then(function () {
        console.log("Construction ended...");
    });
};