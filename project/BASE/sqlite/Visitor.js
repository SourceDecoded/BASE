BASE.require([
    "BASE.query.ExpressionVisitor",
    "Date.prototype.format",
    "BASE.data.Edm"
], function () {
    BASE.namespace("BASE.sqlite");
    
    var escapeSingleQuotes = function (value) {
        if (typeof value !== "string") {
            value = value.toString();
        }
        
        return value.replace("'", "''");
    };
    
    var sqlizePrimitive = function (value) {
        
        if (typeof value === "string") {
            return "'" + escapeSingleQuotes(value) + "'";
        } else if (typeof value === "number") {
            return value.toString();
        } else if (typeof value === "boolean") {
            return value ? 1 : 0;
        } else if (value instanceof Date) {
            return value.getTime();
        }

    };
    
    var buildLeftJoinStatementFromSource = function (edm, relationship) {
        var targetModel = edm.getModelByType(relationship.ofType);
        var sourceModel = edm.getModelByType(relationship.type);
        
        return "LEFT JOIN \"" + targetModel.collectionName + "\" ON \"" + sourceModel.collectionName + "\".\"" + relationship.hasKey + "\" = \"" + targetModel.collectionName + "\".\"" + relationship.withForeignKey + "\"";
    };
    
    var buildLeftJoinStatementFromTarget = function (edm, relationship) {
        var targetModel = edm.getModelByType(relationship.ofType);
        var sourceModel = edm.getModelByType(relationship.type);
        
        return "LEFT JOIN \"" + sourceModel.collectionName + "\" ON \"" + targetModel.collectionName + "\".\"" + relationship.withForeignKey + "\" = \"" + sourceModel.collectionName + "\".\"" + relationship.hasKey + "\"";
    };
    
    var getNavigationProperties = function (edm, model) {
        var propertyModels = {};
        
        var tempEntity = new model.type();
        var oneToOneRelationships = edm.getOneToOneRelationships(tempEntity);
        var oneToOneAsTargetRelationships = edm.getOneToOneAsTargetRelationships(tempEntity);
        var oneToManyRelationships = edm.getOneToManyRelationships(tempEntity);
        var oneToManyAsTargetRelationships = edm.getOneToManyAsTargetRelationships(tempEntity);
        var manyToManyRelationships = edm.getManyToManyRelationships(tempEntity);
        var manyToManyAsTargetRelationships = edm.getManyToManyAsTargetRelationships(tempEntity);
        
        oneToOneRelationships.reduce(function (propertyModels, relationship) {
            propertyModels[relationship.hasOne] = {
                model: edm.getModelByType(relationship.ofType),
                joinClause: buildLeftJoinStatementFromSource(edm, relationship)
            };
            
            return propertyModels;
        }, propertyModels);
        
        oneToOneAsTargetRelationships.reduce(function (propertyModels, relationship) {
            propertyModels[relationship.withOne] = {
                model: edm.getModelByType(relationship.type),
                joinClause: buildLeftJoinStatementFromTarget(edm, relationship)
            };
            return propertyModels;
        }, propertyModels);
        
        oneToManyRelationships.reduce(function (propertyModels, relationship) {
            propertyModels[relationship.hasMany] = {
                model: edm.getModelByType(relationship.ofType),
                joinClause: buildLeftJoinStatementFromSource(edm, relationship)
            };
            return propertyModels;
        }, propertyModels);
        
        oneToManyAsTargetRelationships.reduce(function (propertyModels, relationship) {
            propertyModels[relationship.withOne] = {
                model: edm.getModelByType(relationship.type),
                joinClause: buildLeftJoinStatementFromTarget(edm, relationship)
            };
            return propertyModels;
        }, propertyModels);
        
        manyToManyRelationships.reduce(function (propertyModels, relationship) {
            propertyModels[relationship.hasMany] = {
                model: edm.getModelByType(relationship.ofType),
                joinClause: buildLeftJoinStatementFromTarget(edm, {
                    type: relationship.usingMappingType,
                    hasKey: relationship.withForeignKey,
                    hasMany: relationship.hasMany,
                    ofType: relationship.type,
                    withKey: relationship.hasKey,
                    withOne: "mapping",
                    withForeignKey: relationship.hasKey
                }) + " " +
                buildLeftJoinStatementFromSource(edm, {
                    type: relationship.usingMappingType,
                    hasKey: relationship.hasForeignKey,
                    hasMany: relationship.withMany,
                    ofType: relationship.ofType,
                    withKey: relationship.withKey,
                    withOne: "mapping",
                    withForeignKey: relationship.withKey
                })
            };
            return propertyModels;
        }, propertyModels);
        
        manyToManyAsTargetRelationships.reduce(function (propertyModels, relationship) {
            propertyModels[relationship.withMany] = {
                model: edm.getModelByType(relationship.type),
                joinClause: buildLeftJoinStatementFromTarget(edm, {
                    type: relationship.usingMappingType,
                    hasKey: relationship.hasForeignKey,
                    hasMany: relationship.withMany,
                    ofType: relationship.ofType,
                    withKey: relationship.withKey,
                    withOne: "mapping",
                    withForeignKey: relationship.withKey
                }) + " " +
                buildLeftJoinStatementFromSource(edm, {
                    type: relationship.usingMappingType,
                    hasKey: relationship.withForeignKey,
                    hasMany: relationship.hashMany,
                    ofType: relationship.type,
                    withKey: relationship.hasKey,
                    withOne: "mapping",
                    withForeignKey: relationship.hasKey
                })
            };
            return propertyModels;
        }, propertyModels);
        
        return propertyModels;
    };
    
    var Super = BASE.query.ExpressionVisitor;
    
    var Visitor = BASE.sqlite.Visitor = function (Type, edm) {
        var self = this;
        if (typeof Type !== "function" || !(edm instanceof BASE.data.Edm)) {
            throw new Error("Type and edm are both required.");
        }
        
        Super.call(self);
        
        var model = edm.getModelByType(Type);
        
        self.model = model;
        self.currentNavigationModel = model;
        self.edm = edm;
        self.joinClauses = [];
        
        return self;
    };
    
    BASE.extend(Visitor, Super);
    
    Visitor.prototype["isIn"] = function (property, array) {
        var self = this;
        return "(" + array.map(function (value) {
            return self.equalTo(property, value);
        }).join(" OR ") + ")";
    };
    
    Visitor.prototype["isNotIn"] = function (property, array) {
        var self = this;
        return "(" + array.map(function (value) {
            return self.notEqual(property, value);
        }).join(" AND ") + ")";
    };
    
    Visitor.prototype["ascending"] = function (propertyAccessor) {
        var namespace = propertyAccessor.value;
        return namespace + " ASC";
    };
    
    Visitor.prototype["descending"] = function (propertyAccessor) {
        var namespace = propertyAccessor.value;
        return namespace + " DESC";
    };
    
    Visitor.prototype["orderBy"] = function () {
        var result = Array.prototype.slice.call(arguments, 0).join(", ");
        if (!result) {
            return "";
        }
        
        return "ORDER BY " + result;
    };
    
    Visitor.prototype["count"] = function (left, right) {
        throw new Error("Not yet implemented.");
    };
    
    Visitor.prototype["where"] = function (expression) {
        var self = this;
        if (!expression) {
            return "";
        }
        return "WHERE " + self["and"].apply(self, arguments);
    };
    
    Visitor.prototype["and"] = function () {
        var children = Array.prototype.slice.call(arguments, 0);
        var result = [];
        children.forEach(function (expression, index) {
            result.push(expression);
            if (index !== children.length - 1) {
                result.push(" AND ");
            }
        });
        
        var joined = result.join("");
        
        if (joined === "") {
            return "";
        }
        
        return "(" + joined + ")";
    };
    
    Visitor.prototype["or"] = function () {
        var children = Array.prototype.slice.call(arguments, 0);
        var result = [];
        children.forEach(function (expression, index) {
            result.push(expression);
            if (index !== children.length - 1) {
                result.push(" OR ");
            }
        });
        
        var joined = result.join("");
        
        if (joined === "") {
            return "";
        }
        
        return "(" + joined + ")";
    };
    
    Visitor.prototype["equalTo"] = function (propertyAccessor, right) {
        var left = propertyAccessor.value;
        if (right === null) {
            return left + " IS NULL";
        } else {
            return left + " = " + sqlizePrimitive(right);
        }
    };
    
    Visitor.prototype["notEqualTo"] = function (propertyAccessor, right) {
        var left = propertyAccessor.value;
        if (right === null) {
            return left + " IS NOT NULL";
        } else {
            return left + " <> " + sqlizePrimitive(right);
        }
    };
    
    Visitor.prototype["greaterThan"] = function (propertyAccessor, right) {
        var left = propertyAccessor.value;
        return left + " > " + sqlizePrimitive(right);
    };
    
    Visitor.prototype["lessThan"] = function (propertyAccessor, right) {
        var left = propertyAccessor.value;
        return left + " < " + sqlizePrimitive(right);
    };
    
    Visitor.prototype["greaterThanOrEqualTo"] = function (propertyAccessor, right) {
        var left = propertyAccessor.value;
        return left + " >= " + sqlizePrimitive(right);
    };
    
    Visitor.prototype["lessThanOrEqualTo"] = function (propertyAccessor, right) {
        var left = propertyAccessor.value;
        return left + " <= " + sqlizePrimitive(right);
    };
    
    Visitor.prototype["not"] = function (left, right) {
        return left + " NOT " + right;
    };
    
    Visitor.prototype["skip"] = function (value) {
        return " OFFSET " + value;
    };
    
    Visitor.prototype["take"] = function (value) {
        if (value === Infinity) {
            return " LIMIT -1";
        } else {
            return " LIMIT " + value;
        }
    };
    
    Visitor.prototype["constant"] = function (expression) {
        return expression.value;
    };
    
    Visitor.prototype["property"] = function (expression) {
        var property = expression.value;
        return property;
    };
    
    Visitor.prototype.addJoinClause = function (clause) {
        var index = this.joinClauses.indexOf(clause);
        if (index === -1) {
            this.joinClauses.push(clause);
        }
    };
    
    Visitor.prototype.wrapInQuotes = function (value) {
        return "\"" + value + "\"";
    };
    
    Visitor.prototype.writeTableProperty = function (table, property) {
        return this.wrapInQuotes(table) + "." + this.wrapInQuotes(property);
    };
    
    Visitor.prototype["propertyAccess"] = function (modelMetaData, property) {
        var propertyData = modelMetaData.navigationProperties && modelMetaData.navigationProperties[property] || null;
        var propertyModel = propertyData && propertyData.model || null;
        var currentTableName = this.currentNavigationModel.collectionName;
        
        var navigationProperties = null;
        
        if (propertyModel) {
            this.addJoinClause(propertyData.joinClause);
            this.currentNavigationModel = propertyModel;
            navigationProperties = getNavigationProperties(this.edm, propertyModel);
        }
        
        return {
            model: propertyModel,
            value : this.writeTableProperty(currentTableName , property),
            navigationProperties: navigationProperties
        };
    };
    
    Visitor.prototype["type"] = function (type) {
        this.currentNavigationModel = this.model;
        var navigationProperties = getNavigationProperties(this.edm, this.model);
        
        return {
            model: this.model,
            value : "",
            navigationProperties: navigationProperties
        };
    };
    
    Visitor.prototype["include"] = function () {
        
    };
    
    Visitor.prototype["substringOf"] = function (propertyAccessor, value) {
        var namespace = propertyAccessor.value;
        return namespace + " LIKE '%" + escapeSingleQuotes(value) + "%'";
    };
    
    Visitor.prototype["startsWith"] = function (propertyAccessor, value) {
        var namespace = propertyAccessor.value;
        return namespace + " LIKE '" + escapeSingleQuotes(value) + "%'";
    };
    
    Visitor.prototype["endsWith"] = function (propertyAccessor, value) {
        var namespace = propertyAccessor.value;
        return namespace + " LIKE '%" + escapeSingleQuotes(value) + "'";
    };
    
    Visitor.prototype["null"] = function (expression) {
        return null;
    };
    
    Visitor.prototype["date"] = function (expression) {
        return sqlizePrimitive(expression.value);
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
        return expression.value;
    };
    
    Visitor.prototype.include = function () { 
    
    };
    
    Visitor.prototype.queryable = function (property, expression) {
        var model = property.model;
        var visitor = new Visitor(model.type, this.edm);
        
        return visitor.parse(expression);
    };
    
    Visitor.prototype.any = function (property, expression) {
        var model = property.model;
        var visitor = new Visitor(model.type, this.edm);
        
        return visitor.parse(expression);
    };
    
    Visitor.prototype["array"] = function (expression) {
        return expression.value;
    };
    
    Visitor.prototype.parseQuery = function (query) {
        var queryParts = [];
        
        this.joinClauses = [];
        
        var where = this.parse(query.where);
        var orderBy = this.parse(query.orderBy);
        var include = this.parse(query.include);
        
        queryParts.push(
            "SELECT * FROM " + this.wrapInQuotes(this.model.collectionName),
            this.joinClauses.join(" "),
            where,
            orderBy
        );
        
        return queryParts.join(" ");
    };
});