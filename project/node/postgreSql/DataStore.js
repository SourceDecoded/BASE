BASE.require([
    "BASE.query.Queryable",
    "BASE.query.Provider",
    "BASE.query.SqlVisitor",
    "BASE.util.Guid",
    "BASE.collections.Hashmap",
    "BASE.data.Edm",
    "BASE.data.responses.AddedResponse",
    "BASE.data.responses.UpdatedResponse",
    "BASE.data.responses.RemovedResponse",
    "BASE.data.responses.ErrorResponse",
    "Date.prototype.format",
    "BASE.data.utils",
    "BASE.data.dataStores.SqlStatementCreator",
    "String.prototype.toPascalCase"
], function () {
    
    var Future = BASE.async.Future;
    var Hashmap = BASE.collections.Hashmap;
    var Provider = BASE.query.Provider;
    var Queryable = BASE.query.Queryable;
    var SqlVisitor = BASE.query.SqlVisitor;
    var emptyFuture = Future.fromResult();
    
    var AddedResponse = BASE.data.responses.AddedResponse;
    var UpdatedResponse = BASE.data.responses.UpdatedResponse;
    var RemovedResponse = BASE.data.responses.RemovedResponse;
    var ErrorResponse = BASE.data.responses.ErrorResponse;
    var flattenEntity = BASE.data.utils.flattenEntity;
    
    var typesMap = new Hashmap();
    typesMap.add(Double, "REAL");
    typesMap.add(Float, "REAL");
    typesMap.add(Integer, "INTEGER");
    typesMap.add(Byte, "INTEGER");
    typesMap.add(Binary, "INTEGER");
    typesMap.add(Boolean, "NUMERIC");
    typesMap.add(Date, "NUMERIC");
    typesMap.add(DateTimeOffset, "NUMERIC");
    typesMap.add(Decimal, "NUMERIC");
    typesMap.add(Enum, "NUMERIC");
    typesMap.add(String, "TEXT");
    
    BASE.namespace("node.postgreSql");
    
    var SqlStatementCreator = BASE.data.dataStores.SqlStatementCreator;
    
    node.postgreSql.DataStore = function (Type, db, edm) {
        var self = this;
        
        BASE.assertNotGlobal(self);
        
        var edmModel = edm.getModelByType(Type);
        var properties = edmModel.properties;
        var tableName = edmModel.collectionName.toPascalCase();
        var sqlStatementCreator = new SqlStatementCreator(edm, typesMap);
        var primaryKeys = edm.getPrimaryKeyProperties(Type);
        var primaryKey = primaryKeys[0];
        var returnIdStatement = primaryKeys.length === 1 ? " RETURNING " + primaryKey :"";
        
        var execute = function (sql, values) {
            if (!Array.isArray(values)) {
                values = [];
            }
            
            return db.getTransaction().chain(function (transaction) {
                return transaction.executeSql(sql, values);
            });
        };
        
        self.add = function (entity) {
            var relationships = edm.getOneToOneAsTargetRelationships(entity);
            relationships = relationships.concat(edm.getOneToManyAsTargetRelationships(entity));
            
            var constraint;
            var isEmptyTarget = relationships.some(function (relationship) {
                if (relationship.optional !== true) {
                    var value = typeof entity[relationship.withForeignKey] === "undefined" || entity[relationship.withForeignKey] === null;
                    if (value) {
                        constraint = relationship;
                    }
                    return value;
                } else {
                    return false;
                }
            });
            
            if (isEmptyTarget) {
                throw new Error("Foreign key constraint on relationship.");
            }
            
            var addSql = sqlStatementCreator.createInsertStatement(entity);
            
            return execute(addSql.statement + returnIdStatement, addSql.values).chain(function (results) {
                var id = results.rows[0][primaryKey];
                var newEntity = flattenEntity(entity, true);
                
                // This could be problematic, because many to many entities often times use the two
                // Foreign keys as their primary key.
                var primaryKeys = edm.getPrimaryKeyProperties(Type);
                if (primaryKeys.length === 1) {
                    newEntity[primaryKeys[0]] = id;
                }
                
                var response = new AddedResponse("Entity was successfully added.", newEntity);
                
                return response;
            });

        };
        
        self.update = function (entity, updates) {
            var sql = sqlStatementCreator.createUpdateStatement(entity, updates);
            
            return execute(sql.statement, sql.values).chain(function () {
                var response = new UpdatedResponse("Successfully updated the entity.");
                return response;
            }).catch(function () {
                return Future.fromError(new ErrorResponse("Failed to updated entity."));
            });
        };
        
        self.remove = function (entity) {
            var sql = sqlStatementCreator.createDeleteStatement(entity);
            
            return execute(sql.statement, sql.values).chain(function () {
                var response = new RemovedResponse("Successfully removed the entity.");
                return response;
            }).catch(function () {
                return Future.fromError(new ErrorResponse("Failed to updated entity."));
            });
        };
        
        self.drop = function () {
            var sql = "DROP TABLE \"" + tableName+ "\"";
            return execute(sql).catch(function (error) {
                return Future.fromError(new ErrorResponse("Failed to drop table: " + tableName));
            });
        };
        
        self.getQueryProvider = function () {
            var provider = new Provider();
            
            provider.toArray = provider.execute = function (queryable) {
                var expression = queryable.getExpression();
                var model = edm.getModelByType(Type);
                var visitor = new SqlVisitor(tableName, model);
                
                var where = "";
                var take = "";
                var skip = "";
                var orderBy = "";
                var sql = "SELECT * FROM \"" + tableName + "\" ";
                
                if (expression.where) {
                    where = visitor.parse(expression.where);
                }
                
                if (expression.skip) {
                    skip = visitor.parse(expression.skip);
                }
                
                if (expression.take) {
                    take = visitor.parse(expression.take);
                }
                
                if (expression.orderBy) {
                    orderBy = " " + visitor.parse(expression.orderBy);
                }
                
                sql += where + orderBy + take + skip;
                return execute(sql).chain(function (results) {
                    
                    return results.rows.map(function (dto) {
                        var entity = new Type();
                        
                        Object.keys(dto).forEach(function (key) {
                            var Type = properties[key].type;
                            
                            if ((Type === Date || Type === DateTimeOffset) && dto[key] !== null) {
                                entity[key] = new Date(dto[key]);
                            } else if (Type === Boolean) {
                                entity[key] = dto[key] ? true : false;
                            } else {
                                entity[key] = dto[key];
                            }

                        });
                        
                        return entity;
                    });

                });
            };
            
            return provider;
        };
        
        self.asQueryable = function () {
            var queryable = new Queryable(Type);
            
            queryable.provider = self.getQueryProvider();
            return queryable;
        };
        
        self.dispose = function () {
            return emptyFuture;
        };
        
        self.onReady = function (callback) {
            return emptyFuture.then(callback);
        };
        
    };

});