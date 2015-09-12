BASE.namespace("BASE.parsers");

BASE.parsers.MatchResult = function (isMatch, startAt, endAt, value) {
    this.isMatch = isMatch;
    this.startAt = startAt;
    this.endAt = endAt;
    this.value = value || null;
};