BASE.require([
    "BASE.query.ExpressionVisitor",
    "Date.prototype.format"
], function () {
    BASE.namespace("BASE.query");
    
    var singleQuotesRegEx = /\'/gi;
    var backSlashRegEx = /\\/gi;
    
    var escapeSpecialCharacters = function (value) {
        if (typeof value !== "string") {
            value = value.toString();
        }
        
        return value.replace(backSlashRegEx, "\\\\").replace(singleQuotesRegEx, "\\'");
    };
    
    var toJavascriptValue = function (value) {
        if (typeof value === "string") {
            return "'" + escapeSpecialCharacters(value) + "'";
        } else if (typeof value === "number") {
            return value.toString();
        } else if (typeof value === "boolean") {
            return value ? "true" : "false";
        } else if (value instanceof Date) {
            return "new Date(" + value.getTime() + ")";
        }
    };
    
    BASE.query.ArrayVisitor = (function (Super) {
        var ArrayVisitor = function () {
            var self = this;
            BASE.assertNotGlobal(self);
            
            Super.call(self);
            
            return self;
        };
        
        BASE.extend(ArrayVisitor, Super);
        
        ArrayVisitor.prototype.createGetPropertyValue = function (property) {
            return "function(entity){return " + property + ";}";
        };
        
        ArrayVisitor.prototype["isIn"] = function (left, array) {
            return "(" + array.map(function (value) {
                return left + " === " + toJavascriptValue(value);
            }).join(" || ") + ")";
        };

        ArrayVisitor.prototype["isNotIn"] = function(left, array) {
            return "(" + array.map(function (value) {
                return left + " !== " + toJavascriptValue(value);
            }).join(" && ") + ")";
        };
        
        ArrayVisitor.prototype["ascending"] = function (namespace) {
            return "function(itemA, itemB){ var a = (" + this.createGetPropertyValue(namespace) + ")(itemA); if (typeof a === 'string'){ a = a.toLowerCase();  } var b = (" + this.createGetPropertyValue(namespace) + ")(itemB); if (typeof b === 'string'){ b = b.toLowerCase();  } if (a === b){ return 0; } else if (a < b){ return -1; } else if (a > b){ return 1; }}";
        };
        
        ArrayVisitor.prototype["descending"] = function (namespace) {
            return "function(itemA, itemB){ var a = (" + this.createGetPropertyValue(namespace) + ")(itemA); if (typeof a === 'string'){ a = a.toLowerCase();  } var b = (" + this.createGetPropertyValue(namespace) + ")(itemB); if (typeof b === 'string'){ b = b.toLowerCase();  } if (a === b){ return 0; } else if (a > b){ return -1; } else if (a < b){ return 1; }}";
        };
        
        ArrayVisitor.prototype["orderBy"] = function () {
            var result = Array.prototype.slice.call(arguments, 0);
            
            if (result.length > 0) {
                fnString = "var returnValue = 0;";
                fnString += "[" + result.join(", ") + "]";
                fnString += ".every(function(orderBy){ returnValue = orderBy(itemA, itemB);  if (returnValue===0){return true;} else {return false;} });";
                fnString += " return returnValue;";
                return new Function("itemA", "itemB", fnString);
            } else {
                return function (a, b) { return -1 };
            }

        };
        
        ArrayVisitor.prototype["where"] = function () {
            var self = this;
            return new Function("entity", "return " + self["and"].apply(self, arguments) + ";");
        };
        
        ArrayVisitor.prototype["and"] = function () {
            var children = Array.prototype.slice.call(arguments, 0);
            var result = [];
            children.forEach(function (expression, index) {
                result.push(expression);
                if (index !== children.length - 1) {
                    result.push(" && ");
                }
            });
            
            var joined = result.join("");
            
            if (joined === "") {
                return "";
            }
            
            return "(" + joined + ")";
        };
        
        ArrayVisitor.prototype["or"] = function () {
            var children = Array.prototype.slice.call(arguments, 0);
            var result = [];
            children.forEach(function (expression, index) {
                result.push(expression);
                if (index !== children.length - 1) {
                    result.push(" || ");
                }
            });
            
            var joined = result.join("");
            
            if (joined === "") {
                return "";
            }
            
            return "(" + joined + ")";
        };
        
        ArrayVisitor.prototype["equalTo"] = function (left, right) {
            return left + " === " + right;
        };
        
        ArrayVisitor.prototype["notEqualTo"] = function (left, right) {
            return left + " !== " + right;
        };
        
        ArrayVisitor.prototype["greaterThan"] = function (left, right) {
            return left + " > " + right;
        };
        
        ArrayVisitor.prototype["lessThan"] = function (left, right) {
            return left + " < " + right;
        };
        
        ArrayVisitor.prototype["greaterThanOrEqualTo"] = function (left, right) {
            return left + " >= " + right;
        };
        
        ArrayVisitor.prototype["lessThanOrEqualTo"] = function (left, right) {
            return left + " <= " + right;
        };
        
        ArrayVisitor.prototype["not"] = function (left, right) {
            return left + " !== " + right;
        };
        
        ArrayVisitor.prototype["constant"] = function (expression) {
            return expression.value;
        };
        
        ArrayVisitor.prototype["property"] = function (expression) {
            return expression.value;
        };
        
        ArrayVisitor.prototype["propertyAccess"] = function (type, property) {
            return type + "['" + property + "']";
        };
        
        ArrayVisitor.prototype["type"] = function (type) {
            return "entity";
        };
        
        ArrayVisitor.prototype["substringOf"] = function (namespace, value) {
            return namespace + ".toLowerCase().indexOf(" + value.toLowerCase() + ") >= 0";
        };
        
        ArrayVisitor.prototype["startsWith"] = function (namespace, value) {
            return namespace + ".toLowerCase().indexOf(" + value.toLowerCase() + ") === 0";
        };
        
        ArrayVisitor.prototype["endsWith"] = function (namespace, value) {
            return namespace + ".toLowerCase().indexOf(" + value.toLowerCase() + ") === " + namespace + ".length - " + (value.length - 2);
        };
        
        ArrayVisitor.prototype["null"] = function (expression) {
            return "null";
        };
        
        ArrayVisitor.prototype["date"] = function (expression) {
            return toJavascriptValue(expression.value);
        };
        
        ArrayVisitor.prototype["string"] = function (expression) {
            return toJavascriptValue(expression.value);
        };
        
        ArrayVisitor.prototype["guid"] = ArrayVisitor.prototype["string"];
        
        ArrayVisitor.prototype["number"] = function (expression) {
            return toJavascriptValue(expression.value);
        };
        
        ArrayVisitor.prototype["boolean"] = function (expression) {
            return toJavascriptValue(expression.value);
        };
        
        ArrayVisitor.prototype["array"] = function (expression) {
            return expression.value;
        };
        
        ArrayVisitor.prototype["expression"] = function (expression) {
            return expression.value;
        };
        
        return ArrayVisitor;
    }(BASE.query.ExpressionVisitor));

});