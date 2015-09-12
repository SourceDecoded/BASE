BASE.namespace("BASE.parsers");

BASE.parsers.Expression = function(name) {
    this.name;
};

BASE.parsers.Expression.prototype.match = function() {
    throw new Error("Expected to be overridden.");
};