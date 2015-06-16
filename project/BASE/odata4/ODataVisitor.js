BASE.require([
    "BASE.query.ExpressionVisitor",
    "BASE.odata.convertToOdataValue"
], function () {
    BASE.namespace("BASE.odata4");
    
    var toServiceNamespace = function (value) {
        var array = value.split(".");
        var newArray = [];
        var scope = this.scope ? this.scope + "/" : "";
        
        array.forEach(function (name) {
            newArray.push(scope + name.substr(0, 1).toUpperCase() + name.substring(1));
        });
        return newArray.join(".");
    };
    
    var toLocal = function (str) {
        return str.substr(0, 1).toLowerCase() + str.substring(1);
    };
    
    var getOdataValue = BASE.odata.convertToOdataValue;
    
    BASE.odata4.ODataVisitor = (function (Super) {
        var ODataVisitor = function (config) {
            var self = this;
            BASE.assertNotGlobal(self);
            
            Super.call(self);
            config = config || {};
            self.scope = config.scope || "";
            
            var model = self.model = config.model || { properties: {} };
            
            self.toServiceNamespace = toServiceNamespace;
            self.getValue = function (key, value) {
                var property = model.properties[toLocal(key)];
                var dateString;
                
                if (property) {
                    if (value === null) {
                        return "null";
                    }
                    
                    if (property.type === Date) {
                        dateString = value.toISOString();
                        dateString = dateString.substr(0, dateString.length - 1);
                        dateString += "-00:00";
                        return "DateTime'" + dateString + "'";
                    } else if (property.type === Enum) {
                        //TODO: write a ODataVisitorValueConverter.
                        return value.odataNamespace + "'" + value.name + "'";
                    } else if (property.type === DateTimeOffset) {
                        dateString = value.toISOString();
                        dateString = dateString.substr(0, dateString.length - 1);
                        dateString += "-00:00";
                        return "DateTimeOffset'" + dateString + "'";
                    } else if (property.type === Number) {
                        return value.toString();
                    } else if (property.type === String) {
                        return "'" + value.replace(/'/g, "''") + "'";
                    } else if (property.type === Boolean) {
                        return value.toString();
                    } else {
                        return value;
                    }

                } else {
                    return getOdataValue(value);
                }
            };
            return self;
        };
        
        BASE.extend(ODataVisitor, Super);
        
        ODataVisitor.prototype["isIn"] = function (property, array) {
            if (array.length > 0) {
                return "(" + array.map(function (value) {
                    return property + " eq " + getOdataValue(value);
                }).join(" or ") + ")";
            } else {
                return "";
            }
        };
        
        ODataVisitor.prototype["ascending"] = function (namespace) {
            return namespace + " asc";
        };
        
        ODataVisitor.prototype["descending"] = function (namespace) {
            return namespace + " desc";
        };
        
        ODataVisitor.prototype["orderBy"] = function () {
            var result = Array.prototype.slice.call(arguments, 0);
            return "&$orderby=" + result.join(", ");
        };
        
        ODataVisitor.prototype["count"] = function (left, right) {
            return "$count=true";
        };
        
        ODataVisitor.prototype["_and"] = function () {
            var children = Array.prototype.slice.call(arguments, 0);
            var result = [];
            
            return children.join(" and ");
        };
        
        ODataVisitor.prototype["where"] = function () {
            var self = this;
            var filterString = self["_and"].apply(self.parsers, arguments);
            
            if (filterString) {
                return "$filter=" + filterString;
            } else {
                return "";
            }
        };
        
        ODataVisitor.prototype["and"] = function () {
            var self = this;
            if (arguments.length === 1) {
                return arguments[0];
            }
            
            var joined = this["_and"].apply(self.parsers, arguments);
            
            return "(" + joined + ")";
        };
        
        ODataVisitor.prototype["or"] = function () {
            var children = Array.prototype.slice.call(arguments, 0);
            if (children.length === 1) {
                return children[0];
            }
            
            return "(" + children.join(" or ") + ")";
        };
        
        ODataVisitor.prototype["equalTo"] = function (left, right) {
            return left + " eq " + this.getValue(left, right);
        };
        
        ODataVisitor.prototype["notEqualTo"] = function (left, right) {
            return left + " ne " + this.getValue(left, right);
        };
        
        ODataVisitor.prototype["constant"] = function (expression) {
            return expression.value;
        };
        
        ODataVisitor.prototype["property"] = function (expression) {
            return this.toServiceNamespace(expression.value);
        };
        
        ODataVisitor.prototype["propertyAccess"] = function (left, property) {
            if (typeof left.value === "function") {
                return property;
            } else {
                return left + "/" + property;
            }
        };
        
        ODataVisitor.prototype["type"] = function (type) {
            return type;
        };
        
        ODataVisitor.prototype["guid"] = function (expression) {
            return expression.value;
        };
        
        ODataVisitor.prototype["substring"] = function (property, startAt, endAt) {
            return "substring(" + property + (startAt ? "," + startAt : "," + 0) + (endAt ? "," + endAt : "") + ")";
        };
        
        ODataVisitor.prototype["indexOf"] = function (property, value) {
            if (typeof value !== "string") {
                throw new Error("indexOf only allows strings.");
            }
            
            return "indexof(" + property + "," + getOdataValue(value) + ")";
        };
        
        ODataVisitor.prototype["toUpper"] = function (property) {
            return "toupper(" + property + ")";
        };
        
        ODataVisitor.prototype["toLower"] = function (property) {
            return "tolower(" + property + ")";
        };
        
        ODataVisitor.prototype["trim"] = function (property) {
            return "trim(" + property + ")";
        };
        
        ODataVisitor.prototype["concat"] = function (property, value) {
            if (typeof value !== "string") {
                throw new Error("concat only allows strings.");
            }
            
            return "concat(" + property + "," + getOdataValue(value) + ")";
        };
        
        ODataVisitor.prototype["substringOf"] = function (namespace, value) {
            if (typeof value !== "string") {
                throw new Error("substringOf only allows strings.");
            }
            
            return "contains(" + namespace + "," + getOdataValue(value) + ")";
        };
        
        ODataVisitor.prototype["startsWith"] = function (namespace, value) {
            if (typeof value !== "string") {
                throw new Error("startsWith only allows strings.");
            }
            
            return "startswith(" + namespace + "," + getOdataValue(value) + ")";
        };
        
        ODataVisitor.prototype["endsWith"] = function (namespace, value) {
            if (typeof value !== "string") {
                throw new Error("endsWith only allows strings.");
            }
            
            return "endswith(" + namespace + "," + getOdataValue(value) + ")";
        };
        
        ODataVisitor.prototype["null"] = function (expression) {
            return null;
        };
        
        ODataVisitor.prototype["undefined"] = function (expression) {
            return expression.value;
        };
        
        ODataVisitor.prototype["date"] = function (expression) {
            return expression.value;
        };
        
        ODataVisitor.prototype["string"] = function (expression) {
            return expression.value;
        };
        
        ODataVisitor.prototype["number"] = function (expression) {
            return expression.value;
        };
        
        ODataVisitor.prototype["boolean"] = function (expression) {
            return expression.value;
        };
        
        ODataVisitor.prototype["all"] = function (property, expression) {
            var parser = new ODataVisitor("entity");
            return property + "/all(entity: " + parser.parse(expression) + ")";
        };
        
        ODataVisitor.prototype["any"] = function (property, expression) {
            var parser = new ODataVisitor("entity");
            return property + "/any(entity: " + parser.parse(expression) + ")";
        };
        
        ODataVisitor.prototype["expression"] = function (expression) {
            return expression.value;
        };
        
        ODataVisitor.prototype["array"] = function (expression) {
            return expression.value;
        }
        
        ODataVisitor.prototype["greaterThan"] = function (left, right) {
            return left + " gt " + this.getValue(left, right);
        };
        
        ODataVisitor.prototype["has"] = function (left, right) {
            return left + " has " + right;
        };
        
        ODataVisitor.prototype["lessThan"] = function (left, right) {
            var boundary = typeof right.value === "string" ? "'" : "";
            return left + " lt " + this.getValue(left, right);
        };
        
        ODataVisitor.prototype["greaterThanOrEqualTo"] = function (left, right) {
            var boundary = typeof right.value === "string" ? "'" : "";
            return left + " ge " + this.getValue(left, right);
        };
        
        ODataVisitor.prototype["lessThanOrEqualTo"] = function (left, right) {
            var boundary = typeof right.value === "string" ? "'" : "";
            return left + " le " + this.getValue(left, right);
        };
        
        ODataVisitor.prototype["not"] = function (expression) {
            return "not " + expression;
        };
        
        ODataVisitor.prototype["skip"] = function (value) {
            return "$skip=" + value;
        };
        
        ODataVisitor.prototype["take"] = function (value) {
            return "$top=" + value;
        };
        
        return ODataVisitor;
    }(BASE.query.ExpressionVisitor));
});