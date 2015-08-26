BASE.require([
    "BASE.query.ExpressionVisitor",
    "Array.prototype.indexOfByFunction"
], function () {
    BASE.namespace("BASE.parse");
    
    BASE.parse.Visitor = (function (Super) {
        var Visitor = function (config) {
            var self = this;
            BASE.assertNotGlobal(self);
            
            Super.call(self);
            config = self.config = (config || {});
            self.scope = config.scope || "";
            
            if (typeof config.model === "undefined") {
                throw new Error("Null Argument Exception: model cannot be undefined in configurations.");
            }
            
            if (typeof config.edm === "undefined") {
                throw new Error("Null Argument Exception: edm cannot be undefined in configurations.");
            }
            
            var model = self.model = config.model || { properties: {} };
            self.currentModel = self.model;
            self.edm = config.edm;
            
            var superParse = self.parse;
            self.parse = function () {
                self.currentWhere = {};
                self.currentExpression = self.currentWhere;
                return superParse.apply(self, arguments);
            };
            
            return self;
        };
        
        BASE.extend(Visitor, Super);
        
        Visitor.prototype["isIn"] = function (propertyObject, array) {
           
        };
        
        Visitor.prototype["isNotIn"] = function (propertyObject, array) {
           
        };
        
        Visitor.prototype["ascending"] = function (propertyObject) {
        };
        
        Visitor.prototype["descending"] = function (propertyObject) {
        };
        
        Visitor.prototype["orderBy"] = function () {
           
        };
        
        Visitor.prototype["where"] = function (propertyAccess) {
            return "where=" + JSON.stringify(this.currentWhere);
        };
        
        Visitor.prototype["and"] = function () {
            return this.currentWhere;
        };
        
        Visitor.prototype["or"] = function () {
            var ors = Array.prototype.slice.call(arguments, 0);
            
            if (!this.currentWhere.hasOwnProperty("$or")) {
                this.currentWhere = { "$or": ors };
            } else {
                this.currentWhere["$or"].concat(ors);
            }
            
            return this.currentWhere;
        };
        
        Visitor.prototype["equalTo"] = function (propertyAccess, value) {
            propertyAccess.currentExpression[propertyAccess.property] = value;
            return this.currentExpression;
        };
        
        Visitor.prototype["notEqualTo"] = function (propertyAccess, value) {
            if (typeof propertyAccess.propertyObject === "object" && propertyAccess.propertyObject !== null) {
                propertyAccess.propertyObject["$ne"] = value;
            }
            return this.currentExpression;
        };
        
        Visitor.prototype["greaterThan"] = function (propertyAccess, value) {
            if (typeof propertyAccess.propertyObject === "object" && propertyAccess.propertyObject !== null) {
                propertyAccess.propertyObject["$gt"] = value;
            }
            return this.currentExpression;
        };
        
        Visitor.prototype["lessThan"] = function (propertyAccess, value) {
            if (typeof propertyAccess.propertyObject === "object" && propertyAccess.propertyObject !== null) {
                propertyAccess.propertyObject["$lt"] = value;
            }
            return this.currentExpression;
        };
        
        Visitor.prototype["greaterThanOrEqualTo"] = function (propertyAccess, value) {
            if (typeof propertyAccess.propertyObject === "object" && propertyAccess.propertyObject !== null) {
                propertyAccess.propertyObject["$gte"] = value;
            }
            return this.currentExpression;
        };
        
        Visitor.prototype["lessThanOrEqualTo"] = function (propertyAccess, value) {
            if (typeof propertyAccess.propertyObject === "object" && propertyAccess.propertyObject !== null) {
                propertyAccess.propertyObject["$lte"] = value;
            }
            return this.currentExpression;
        };
        
        Visitor.prototype["substringOf"] = function (propertyAccess, value) {
            if (typeof propertyAccess.propertyObject === "object" && propertyAccess.propertyObject !== null) {
                propertyAccess.propertyObject["$regex"] = value.split("").reduce(function (acc, value) {
                    return acc + "[" + value + "]";
                }, "");
            }
            return this.currentExpression;
        };
        
        Visitor.prototype["startsWith"] = function (propertyAccess, value) {
            if (typeof propertyAccess.propertyObject === "object" && propertyAccess.propertyObject !== null) {
                propertyAccess.propertyObject["$regex"] = "^" + value;
            }
            return this.currentExpression;
        };
        
        Visitor.prototype["endsWith"] = function (propertyAccess, value) {
            if (typeof propertyAccess.propertyObject === "object" && propertyAccess.propertyObject !== null) {
                propertyAccess.propertyObject["$regex"] = value + "$";
            }
            return this.currentExpression;
        };
        
        
        Visitor.prototype["constant"] = function (expression) {
            return expression.value;
        };
        
        Visitor.prototype["property"] = function (expression) {
            return expression.value;
        };
        
        Visitor.prototype["propertyAccess"] = function (propertyAccess, property) {
            BASE.namespace(property, propertyAccess.currentExpression);
            var propertyObject = BASE.getObject(property, propertyAccess.currentExpression);
            
            return {
                property: property,
                propertyObject: propertyObject,
                currentExpression: propertyAccess.currentExpression
            };
        };
        
        Visitor.prototype["type"] = function (type) {
            return {
                property: "",
                propertyObject: {},
                currentExpression: this.currentExpression
            };
        };
        
        Visitor.prototype["null"] = function (expression) {
            return expression.value;
        };
        
        Visitor.prototype["object"] = function (expression) {
            return expression.value;
        };
        
        Visitor.prototype["undefined"] = function (expression) {
            return null;
        };
        
        Visitor.prototype["date"] = function (expression) {
            return expression.value;
        };
        
        Visitor.prototype["string"] = function (expression) {
            return expression.value;
        };
        
        Visitor.prototype["number"] = function (expression) {
            return expression.value;
        };
        
        Visitor.prototype["boolean"] = function (expression) {
            return expression.value;
        };
        
        Visitor.prototype["all"] = function (propertyObject, expression) {
          
        };
        
        Visitor.prototype["any"] = function (propertyObject, expression) {
         
        };
        
        Visitor.prototype["expression"] = function (expression) {
        
        };
        
        Visitor.prototype["array"] = function (expression) {

        }
        
        Visitor.prototype["has"] = function (propertyObject, value) {

        };
        
        Visitor.prototype["not"] = function (expression) {

        };
        
        Visitor.prototype["skip"] = function (value) {

        };
        
        Visitor.prototype["take"] = function (value) {

        };
        
        return Visitor;
    }(BASE.query.ExpressionVisitor));
});