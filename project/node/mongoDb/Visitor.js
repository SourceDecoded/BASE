BASE.require([
    "BASE.query.ExpressionVisitor",
    "BASE.data.Edm",
    "BASE.collections.Hashmap"
], function () {
    BASE.namespace("mongoDb");

    var Hashmap = BASE.collections.Hashmap;

    var Super = BASE.query.ExpressionVisitor;

    var Visitor = mongoDb.Visitor = function (Type, edm) {
        var self = this;
        if (typeof Type !== "function" || !(edm instanceof BASE.data.Edm)) {
            throw new Error("Type, and edm, are all required.");
        }

        Super.call(self);

        var model = edm.getModelByType(Type);

        self.model = model;
        self.edm = edm;
        self.queryObject = {};
        self.currentNamespace = "";

        return self;
    };

    BASE.extend(Visitor, Super);

    Visitor.prototype["isIn"] = function (property, array) {
        return this.queryObject[property]["$in"] = array;
    };

    Visitor.prototype["isNotIn"] = function (property, array) {
        return this.queryObject[property]["$nin"] = array;
    };

    Visitor.prototype["ascending"] = function (property) {
        return { property: 1 };
    };

    Visitor.prototype["descending"] = function (property) {
        return { property: -1 };
    };

    Visitor.prototype["orderBy"] = function () {
        var array = Array.prototype.slice.call(arguments, 0);
        return array.reduce(function (orderBy, accumulator) {
            Object.keys(orderBy).forEach(function (key) {
                accumulator[key] = orderBy[key];
            });
        }, {});
    };

    Visitor.prototype["count"] = function () {
        throw new Error("Not yet implemented.");
    };

    Visitor.prototype["where"] = function (expression) {
        return this.queryObject;
    };

    Visitor.prototype["and"] = function () {
        var array = Array.prototype.slice.call(arguments, 0);
        this.queryObject["$and"] = array;
    };

    Visitor.prototype["or"] = function () {
        var array = Array.prototype.slice.call(arguments, 0);
        this.queryObject["$or"] = array;
    };

    Visitor.prototype["equalTo"] = function (propertyAccessor, value) {
        this.queryObject[propertyAccessor] = value;
    };

    Visitor.prototype["notEqualTo"] = function (propertyAccessor, value) {
        return this.queryObject[propertyAccessor] = { $ne: value };
    };

    Visitor.prototype["greaterThan"] = function (propertyAccessor, value) {
        return this.queryObject[propertyAccessor] = { $gt: value };
    };

    Visitor.prototype["lessThan"] = function (propertyAccessor, value) {
        return this.queryObject[propertyAccessor] = { $lt: value };
    };

    Visitor.prototype["greaterThanOrEqualTo"] = function (propertyAccessor, value) {
        return this.queryObject[propertyAccessor] = { $gte: value };
    };

    Visitor.prototype["lessThanOrEqualTo"] = function (propertyAccessor, value) {
        return this.queryObject[propertyAccessor] = { $lte: value };
    };

    Visitor.prototype["not"] = function (propertyAccessor, value) {
        return this.queryObject[propertyAccessor] = value;
    };

    Visitor.prototype["skip"] = function (value) {

    };

    Visitor.prototype["take"] = function (value) {

    };

    Visitor.prototype["constant"] = function (expression) {
        return expression.value;
    };

    Visitor.prototype["property"] = function (expression) {
        return expression.value;
    };

    Visitor.prototype["propertyAccess"] = function (type, property) {
        this.currentNamespace += property;
        return this.currentNamespace;
    };

    Visitor.prototype["type"] = function (type) {
        this.queryObject = {};
        this.currentNamespace = "";
    };

    Visitor.prototype["substringOf"] = function (propertyAccessor, value) {
        return this.queryObject[propertyAccessor] = { $regex: new RegExp(value, ["i", "g"]) };
    };

    Visitor.prototype["startsWith"] = function (propertyAccessor, value) {
        return this.queryObject[propertyAccessor] = { $regex: new RegExp("^" + value, ["i", "g"]) };
    };

    Visitor.prototype["endsWith"] = function (propertyAccessor, value) {
        return this.queryObject[propertyAccessor] = { $regex: new RegExp(value + "$", ["i", "g"]) };
    };

    Visitor.prototype["null"] = function (expression) {
        return expression.value;
    };

    Visitor.prototype["date"] = function (expression) {
        return expression.value;
    };

    Visitor.prototype["string"] = function (expression) {
        return expression.value;
    };

    Visitor.prototype["guid"] = Visitor.prototype["string"];

    Visitor.prototype["number"] = function (expression) {
        return expression.value;
    };

    Visitor.prototype["boolean"] = function (expression) {
        return expression.value;
    };

    Visitor.prototype.expression = function (expression) {
        
    };

    Visitor.prototype.include = function (whereExpression) {

    };

    Visitor.prototype.queryable = function (property, expression) {
        return this.queryObject[property] = expression;
    };

    Visitor.prototype.any = function (property, expression) {

    };

    Visitor.prototype["array"] = function (expression) {

    };

    Visitor.prototype.parseQuery = function (query) {

    };
});