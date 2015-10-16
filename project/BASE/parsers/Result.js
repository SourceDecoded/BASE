BASE.namespace("BASE.parsers");

BASE.parsers.Result = function (startAt, endAt, value) {
    this.startAt = startAt;
    this.endAt = endAt;
    this.value = value || null;
};