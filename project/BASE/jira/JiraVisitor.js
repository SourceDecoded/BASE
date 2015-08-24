BASE.require([
    "BASE.query.ExpressionVisitor"
], function () {
    BASE.namespace("BASE.jira");
    
    var toLocal = function (str) {
        return str.substr(0, 1).toLowerCase() + str.substring(1);
    };
    
    var getJiraValue = function (value) {
        if (typeof value === "string") {
            return "\"" + value.replace(/"/g, "\\\"") + "\"";
        } else if (typeof value === "boolean") {
            return value.toString();
        } else if (typeof value === "number") {
            return value.toString();
        } else if (value instanceof Date) {
            makeJiraDate(value);
        } else if (value === null) {
            return "null";
        } else {
            return value;
        }
    };
    
    var makeJiraDate = function (value) {
        var now = new Date();
        var startOfDay = new Date(now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate());
        var minutes = parseInt(((value.getTime() - startOfDay.getTime()) / 1000) / 60, 10);
        var minutes = minutes > 0 ? "+" + minutes : minutes;
        
        return "startOfDay(\"" + minutes + "m\")";
    };
    
    BASE.jira.JiraVisitor = (function (Super) {
        var JiraVisitor = function (config) {
            var self = this;
            BASE.assertNotGlobal(self);
            
            Super.call(self);
            config = config || {};
            self.scope = config.scope || "";
            
            var model = self.model = config.model || { properties: {} };
            
            self.getValue = function (key, value) {
                var property = model.properties[toLocal(key)];
                
                if (property) {
                    if (value === null) {
                        return "null";
                    }
                    
                    return getJiraValue(value);
                }
            };
            
            return self;
        };
        
        BASE.extend(JiraVisitor, Super);
        
        JiraVisitor.prototype["isIn"] = function (property, array) {
            var self = this;
            return property + " in (" + array.map(function (value) { return self.getValue(value); }).join(", ") + ")";
        };

        JiraVisitor.prototype["isNotIn"] = function(property, array) {
            var self = this;
            return property + " not in (" + array.map(function(value) { return self.getValue(value); }).join(", ") + ")";
        };
        
        JiraVisitor.prototype["ascending"] = function (namespace) {
            return namespace + " asc";
        };
        
        JiraVisitor.prototype["descending"] = function (namespace) {
            return namespace + " desc";
        };
        
        JiraVisitor.prototype["orderBy"] = function () {
            var result = Array.prototype.slice.call(arguments, 0);
            return "order by " + result.join(", ");
        };
        
        JiraVisitor.prototype["_and"] = function () {
            var children = Array.prototype.slice.call(arguments, 0);
            return children.join(" and ");
        };
        
        JiraVisitor.prototype["where"] = function () {
            var self = this;
            var filterString = self["_and"].apply(self.parsers, arguments);
            
            if (filterString) {
                return "jql=" + filterString;
            } else {
                return "";
            }
        };
        
        JiraVisitor.prototype["and"] = function () {
            var self = this;
            if (arguments.length === 1) {
                return arguments[0];
            }
            
            var joined = this["_and"].apply(self.parsers, arguments);
            
            return "(" + joined + ")";
        };
        
        JiraVisitor.prototype["or"] = function () {
            var children = Array.prototype.slice.call(arguments, 0);
            if (children.length === 1) {
                return children[0];
            }
            
            return "(" + children.join(" OR ") + ")";
        };
        
        JiraVisitor.prototype["equalTo"] = function (left, right) {
            if (right === null) {
                return left + " is " + this.getValue(right);
            } else {
                return left + " = " + this.getValue(right);
            }
        };
        
        JiraVisitor.prototype["notEqualTo"] = function (left, right) {
            if (right === null) {
                return left + " is not " + this.getValue(right);
            } else {
                return left + " != " + this.getValue(right);
            }
        };
        
        JiraVisitor.prototype["greaterThan"] = function (left, right) {
            return left + " > " + self.getValue(right);
        };
        
        JiraVisitor.prototype["lessThan"] = function (left, right) {
            return left + " < " + self.getValue(right);
        };
        
        JiraVisitor.prototype["greaterThanOrEqualTo"] = function (left, right) {
            return left + " >= " + self.getValue(right);
        };
        
        JiraVisitor.prototype["lessThanOrEqualTo"] = function (left, right) {
            return left + " <= " + self.getValue(right);
        };
        
        JiraVisitor.prototype["constant"] = function (expression) {
            return expression.value;
        };
        
        JiraVisitor.prototype["property"] = function (expression) {
            return expression.value;
        };
        
        JiraVisitor.prototype["propertyAccess"] = function (left, property) {
            return property;
        };
        
        JiraVisitor.prototype["type"] = function (type) {
            return type;
        };
        
        JiraVisitor.prototype["substringOf"] = function (left, right) {
            return left + " ~ " + self.getValue(right);
        };
        
        JiraVisitor.prototype["startsWith"] = function (left, right) {
            return left + " ~ " + self.getValue(right + "*");
        };
        
        JiraVisitor.prototype["endsWith"] = function (left, right) {
            return left + " ~ " + self.getValue("*" + right);
        };
        
        JiraVisitor.prototype["null"] = function () {
            return null;
        };
        
        JiraVisitor.prototype["object"] = function (expression) {
            return expression.value;
        };
        
        JiraVisitor.prototype["undefined"] = function (expression) {
            return expression.value;
        };
        
        JiraVisitor.prototype["date"] = function (expression) {
            return expression.value;
        };
        
        JiraVisitor.prototype["string"] = function (expression) {
            return expression.value;
        };
        
        JiraVisitor.prototype["number"] = function (expression) {
            return expression.value;
        };
        
        JiraVisitor.prototype["boolean"] = function (expression) {
            return expression.value;
        };
        
        JiraVisitor.prototype["expression"] = function (expression) {
            return expression.value;
        };
        
        JiraVisitor.prototype["array"] = function (expression) {
            return expression.value;
        };
        
        JiraVisitor.prototype["has"] = function (left, right) {
            return left + " has " + right;
        };
        
        JiraVisitor.prototype["skip"] = function (value) {
            return "startAt=" + value;
        };
        
        JiraVisitor.prototype["take"] = function (value) {
            return "maxResults=" + value;
        };
        
        return JiraVisitor;
    }(BASE.query.ExpressionVisitor));
});