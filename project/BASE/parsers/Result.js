BASE.namespace("BASE.parsers");

BASE.parsers.Result = function (startAt, endAt, expression) {
    this.startAt = startAt;
    this.endAt = endAt;
    this.expression = expression || null;
};