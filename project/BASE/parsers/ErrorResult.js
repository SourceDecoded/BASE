BASE.require([
    "BASE.parsers.Result"
], function () {
    BASE.namespace("BASE.parsers");
    
    BASE.parsers.ErrorResult = function (startAt, endAt, value) {
        BASE.parsers.Result.call(this, startAt, endAt, value);
    };
    
    BASE.extend(BASE.parsers.ErrorResult, BASE.parsers.Result);
});
