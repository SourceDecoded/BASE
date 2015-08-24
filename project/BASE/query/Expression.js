BASE.require(["BASE.util.Observable"], function () {
    BASE.namespace("BASE.query");
    
    BASE.query.Expression = (function (Super) {
        var Expression = function () {
            var self = this;
            if (!(self instanceof arguments.callee)) {
                return new Expression();
            }
            
            Super.call(self);
            
            self.nodeName = "expression";
            
            self.copy = function () {
                throw new Error("Meant to be overriden");
            };
            
            self.isEqualTo = function () {
                throw new Error("Meant to be overriden");
            };
            
            return self;
        };
        
        BASE.extend(Expression, Super);
        
        return Expression;
    }(Object));
    
    var Expression = BASE.query.Expression;
    
    var ValueExpression = ((function (Super) {
        var ValueExpression = function (nodeName, value) {
            var self = this;
            if (!(self instanceof arguments.callee)) {
                return new ValueExpression();
            }
            
            Super.call(self);
            
            self.value = value;
            self.nodeName = nodeName;
            
            self.copy = function () {
                return new ValueExpression(nodeName, self.value);
            };
            
            self.isEqualTo = function (node) {
                if (node && self.nodeName === node.nodeName && self.value === node.value) {
                    return true;
                }
                return false;
            };
            
            self.contains = function (node) {
                return self.isEqualTo(node);
            }
            
            return self;
        };
        BASE.extend(ValueExpression, Super);
        return ValueExpression;
    })(Expression));
    
    var OperationExpression = ((function (Super) {
        var OperationExpression = function (nodeName) {
            var self = this;
            BASE.assertNotGlobal(self);
            Super.call(self);
            
            var args = Array.prototype.slice.call(arguments, 0);
            
            self.nodeName = nodeName;
            self.children = args.slice(1);
            
            self.copy = function () {
                var children = [];
                var copy = new OperationExpression(self.nodeName);
                
                self.children.forEach(function (expression) {
                    copy.children.push(expression.copy());
                });
                
                return copy;
            };
            
            self.isEqualTo = function (node) {
                if (!Array.isArray(node.children) || self.nodeName !== node.nodeName) {
                    return false;
                }
                
                if (node.children.length !== self.children.length) {
                    return false;
                }
                
                return self.children.every(function (expression, index) {
                    return expression.isEqualTo(node.children[index]);
                });
            };
            
            self.contains = function (node) {
                if (node.nodeName === self.nodeName && Array.isArray(node.children)) {
                    var matched = node.children.every(function (childNode, index) {
                        return childNode.contains(self.children[index]);
                    });
                    
                    if (matched) {
                        return true;
                    }
                }
                
                return self.children.some(function (childNode) {
                    return childNode.contains(node);
                });

            };
            
            self.getMatchingNodes = function (node, matchedNodes) {
                matchedNodes = Array.isArray(matchedNodes) ? matchedNodes : [];
                
                if (node.nodeName === self.nodeName && Array.isArray(node.children)) {
                    var matched = node.children.every(function (childNode, index) {
                        return childNode.contains(self.children[index], matchedNodes);
                    });
                    
                    if (matched) {
                        matchedNodes.push(self);
                    }
                }
                
                self.children.forEach(function (childNode) {
                    if (Array.isArray(childNode.children)) {
                        childNode.getMatchingNodes(node, matchedNodes);
                    }
                }, matchedNodes);
                
                return matchedNodes;
            };
            
            return self;
        };
        BASE.extend(OperationExpression, Super);
        return OperationExpression;
    })(Expression));
    
    BASE.query.OperationExpression = OperationExpression;
    BASE.PropertyExpression = ValueExpression;
    
    Expression.getExpressionType = function (value) {
        if (value instanceof BASE.query.Expression) {
            return value;
        }
        
        if (typeof value === "string") {
            return Expression.string(value);
        } else if (typeof value === "function") {
            return Expression["function"](value);
        } else if (typeof value === "number") {
            return Expression.number(value);
        } else if (typeof value === "boolean") {
            return Expression.boolean(value);
        } else if (value === null) {
            return Expression["null"](value);
        } else if (typeof value === "undefined") {
            return Expression["undefined"](value);
        } else if (Array.isArray(value)) {
            return Expression.array(value);
        } else if (value instanceof Date) {
            return Expression.date(value);
        } else {
            return Expression.object(value);
        }
    };
    
    Expression.property = function (value) {
        return new ValueExpression("property", value);
    };
    
    Expression.constant = function (value) {
        return new ValueExpression("constant", value);
    };
    
    //
    // ValueExpression helpers
    //
    
    Expression.boolean = function (value) {
        var expression = new ValueExpression("boolean");
        expression.value = value;
        return expression;
    };
    
    Expression.string = function (value) {
        var expression = new ValueExpression("string");
        expression.value = value;
        return expression;
    };
    
    Expression.number = function (value) {
        var expression = new ValueExpression("number");
        expression.value = value;
        return expression;
    };
    
    Expression.object = function (value) {
        var expression = new ValueExpression("object");
        expression.value = value;
        return expression;
    };
    
    Expression.date = function (value) {
        var expression = new ValueExpression("date");
        expression.value = value;
        return expression;
    };
    
    Expression["function"] = function (value) {
        var expression = new ValueExpression("function");
        expression.value = value;
        return expression;
    };
    
    Expression["type"] = function (value) {
        var expression = new ValueExpression("type");
        expression.value = value || Object;
        return expression;
    };
    
    Expression["null"] = function (value) {
        var expression = new ValueExpression("null");
        expression.value = value;
        return expression;
    };
    
    Expression["undefined"] = function (value) {
        var expression = new ValueExpression("undefined");
        expression.value = value;
        return expression;
    };
    
    Expression.array = function (value) {
        var expression = new ValueExpression("array");
        expression.value = value;
        return expression;
    };
    
    Expression.queryable = function (leftExpression, rightExpression) {
        var expression = new OperationExpression("queryable");
        expression.children.push(leftExpression, rightExpression);
        return expression;
    };
    
    //
    // OperationExpression helpers
    //
    
    Expression.equalTo = function () {
        var expression = new OperationExpression("equalTo");
        Array.prototype.slice.call(arguments, 0).forEach(function (arg) {
            expression.children.push(arg);
        });
        return expression;
    };
    
    Expression.notEqualTo = function () {
        var expression = new OperationExpression("notEqualTo");
        Array.prototype.slice.call(arguments, 0).forEach(function (arg) {
            expression.children.push(arg);
        });
        return expression;
    };
    
    Expression.or = function () {
        var expression = new OperationExpression("or");
        Array.prototype.slice.call(arguments, 0).forEach(function (arg) {
            expression.children.push(arg);
        });
        return expression;
    };
    
    Expression.and = function () {
        var expression = new OperationExpression("and");
        Array.prototype.slice.call(arguments, 0).forEach(function (arg) {
            expression.children.push(arg);
        });
        return expression;
    };
    
    Expression.where = function () {
        var expression = new OperationExpression("where");
        Array.prototype.slice.call(arguments, 0).forEach(function (arg) {
            expression.children.push(arg);
        });
        return expression;
    };
    
    Expression.greaterThan = function () {
        var expression = new OperationExpression("greaterThan");
        Array.prototype.slice.call(arguments, 0).forEach(function (arg) {
            expression.children.push(arg);
        });
        return expression;
    };
    
    Expression.lessThan = function () {
        var expression = new OperationExpression("lessThan");
        Array.prototype.slice.call(arguments, 0).forEach(function (arg) {
            expression.children.push(arg);
        });
        return expression;
    };
    
    Expression.greaterThanOrEqualTo = function () {
        var expression = new OperationExpression("greaterThanOrEqualTo");
        Array.prototype.slice.call(arguments, 0).forEach(function (arg) {
            expression.children.push(arg);
        });
        return expression;
    };
    
    Expression.lessThanOrEqualTo = function () {
        var expression = new OperationExpression("lessThanOrEqualTo");
        Array.prototype.slice.call(arguments, 0).forEach(function (arg) {
            expression.children.push(arg);
        });
        return expression;
    };
    
    Expression.orderBy = function () {
        var expression = new OperationExpression("orderBy");
        Array.prototype.slice.call(arguments, 0).forEach(function (arg) {
            expression.children.push(arg);
        });
        return expression;
    };
    
    Expression.descending = function () {
        var expression = new OperationExpression("descending");
        Array.prototype.slice.call(arguments, 0).forEach(function (arg) {
            expression.children.push(arg);
        });
        return expression;
    };
    
    Expression.ascending = function () {
        var expression = new OperationExpression("ascending");
        Array.prototype.slice.call(arguments, 0).forEach(function (arg) {
            expression.children.push(arg);
        });
        return expression;
    };
    
    Expression.skip = function () {
        var expression = new OperationExpression("skip");
        Array.prototype.slice.call(arguments, 0).forEach(function (arg) {
            expression.children.push(arg);
        });
        return expression;
    };
    
    Expression.take = function (value) {
        var expression = new OperationExpression("take");
        var valueExpression = Expression.constant(value);
        expression.children.push(valueExpression);
        
        return expression;
    };
    
    Expression.buildOperatorExpression = function (name) {
        var expression = new OperationExpression(name);
        var args = Array.prototype.slice.call(arguments, 1);
        args.forEach(function (arg) {
            expression.children.push(arg);
        });

        return expression;
    };
    
    Expression.guid = function () {
        var expression = new OperationExpression("guid");
        Array.prototype.slice.call(arguments, 0).forEach(function (arg) {
            expression.children.push(arg);
        });
        return expression;
    };
    
    Expression.substring = function () {
        var expression = new OperationExpression("substring");
        Array.prototype.slice.call(arguments, 0).forEach(function (arg) {
            expression.children.push(arg);
        });
        return expression;
    };
    
    Expression.substringOf = function () {
        var expression = new OperationExpression("substringOf");
        Array.prototype.slice.call(arguments, 0).forEach(function (arg) {
            expression.children.push(arg);
        });
        return expression;
    };
    
    Expression.startsWith = function () {
        var expression = new OperationExpression("startsWith");
        Array.prototype.slice.call(arguments, 0).forEach(function (arg) {
            expression.children.push(arg);
        });
        return expression;
    };
    
    Expression.endsWith = function () {
        var expression = new OperationExpression("endsWith");
        Array.prototype.slice.call(arguments, 0).forEach(function (arg) {
            expression.children.push(arg);
        });
        return expression;
    };
    
    Expression.isIn = function (property, array) {
        var expression = new OperationExpression("isIn");
        Array.prototype.slice.call(arguments, 0).forEach(function (arg) {
            expression.children.push(arg);
        });
        return expression;
    };
    
    Expression.isNotIn = function (property, array) {
        var expression = new OperationExpression("isNotIn");
        Array.prototype.slice.call(arguments, 0).forEach(function (arg) {
            expression.children.push(arg);
        });
        return expression;
    };
    
    Expression.include = function () {
        var expression = new OperationExpression("include");
        Array.prototype.slice.call(arguments, 0).forEach(function (arg) {
            expression.children.push(arg);
        });
        return expression;
    };
    
    Expression.any = function (propertyAccessExpression, expression) {
        var anyExpression = new OperationExpression("any");
        var expressionExpression = Expression.expression(expression);
        
        anyExpression.children.push(propertyAccessExpression, expressionExpression);
        return anyExpression;
    };
    
    Expression.all = function (propertyAccessExpression, expression) {
        var allExpression = new OperationExpression("all");
        var expressionExpression = Expression.expression(expression);
        
        allExpression.children.push(propertyAccessExpression, expressionExpression);
        return allExpression;
    };
    
    Expression.expression = function (value) {
        var expresssionExpression = new ValueExpression("expression", value);
        
        return expresssionExpression;
    };
    
    Expression.propertyAccess = function (leftExpression, propertyName) {
        var propertyExpression = Expression.property(propertyName);
        var propertyAccessExpression = new OperationExpression("propertyAccess");
        propertyAccessExpression.children.push(leftExpression, propertyExpression);
        
        return propertyAccessExpression;
    };
    
    Expression.contains = function (Type, namespace, expression) {
        var containsExpression = new OperationExpression("contains");
        var ofTypeExpression = new ValueExpression("ofType", Type);
        var propertyExpression = new ValueExpression("property", namespace);
        
        containsExpression.children.push(ofTypeExpression, propertyExpression, expression);
        
        return containsExpression;
    };
    
    Expression.intersects = function (Type, namespace, expression) {
        var intersectsExpression = new OperationExpression("intersects");
        var ofTypeExpression = new ValueExpression("ofType", Type);
        var propertyExpression = new ValueExpression("property", namespace);
        
        intersectsExpression.children.push(ofTypeExpression, propertyExpression, expression);
        
        return intersectsExpression;
    };

});