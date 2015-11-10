BASE.require([
    "BASE.odata4.EndPoint",
    "BASE.collections.Hashmap",
    "BASE.query.Provider",
    "BASE.odata.convertToOdataValue"
], function () {
    var EndPoint = BASE.odata4.EndPoint;
    var Hashmap = BASE.collections.Hashmap;
    var Future = BASE.async.Future;
    var Provider = BASE.query.Provider;
    var convertToOdataValue = BASE.odata.convertToOdataValue;
    
    BASE.namespace("BASE.odata4");
    
    BASE.odata4.Service = function (edm) {
        var self = this;
        var endPoints = new Hashmap();
        
        if (edm == null) {
            throw new Error("Null Argument Exception: edm has to be defined.");
        }
        
        var getEndPoint = function (Type) {
            var endPoint = endPoints.get(Type);
            if (endPoint === null) {
                throw new Error("Coundn't find endPoint for type: " + Type);
            }
            
            return endPoint;
        };
        
        self.add = function (Type, entity) {
            var endPoint = getEndPoint(Type);
            return endPoint.add(entity);
        };
        
        self.update = function (Type, entity, updates) {
            var endPoint = getEndPoint(Type);
            return endPoint.update(entity, updates);
        };
        
        self.remove = function (Type, entity) {
            var endPoint = getEndPoint(Type);
            return endPoint.remove(entity);
        };
        
        self.getSourcesOneToOneTargetEntity = function (sourceEntity, relationship) {
            var targetType = relationship.ofType;
            var targetQueryable = self.asQueryable(targetType);
            
            return targetQueryable.where(function (e) {
                return e.property(relationship.withForeignKey).isEqualTo(sourceEntity[relationship.hasKey]);
            }).firstOrDefault();
        };
        
        self.getTargetsOneToOneSourceEntity = function (targetEntity, relationship) {
            var sourceType = relationship.type;
            var sourceQueryable = self.asQueryable(sourceType);
            
            return sourceQueryable.where(function (e) {
                return e.property(relationship.hasKey).isEqualTo(targetEntity[relationship.withForeignKey]);
            }).firstOrDefault();
        };
        
        self.getSourcesOneToManyQueryProvider = function (sourceEntity, relationship) {
            var provider = new Provider();
            var targetType = relationship.ofType;
            
            provider.execute = provider.toArray = function (queryable) {
                var targetsQueryable = self.asQueryable(targetType);
                var targetQueryable = targetsQueryable.where(function (e) {
                    return e.property(relationship.withForeignKey).isEqualTo(sourceEntity[relationship.hasKey]);
                });
                
                return targetQueryable.merge(queryable).toArray();
            };
            
            provider.count = function (queryable) {
                var targetsQueryable = self.asQueryable(targetType);
                var targetQueryable = targetsQueryable.where(function (e) {
                    return e.property(relationship.withForeignKey).isEqualTo(sourceEntity[relationship.hasKey]);
                });
                return targetQueryable.merge(queryable).count();
            };
            
            return provider;
        };
        
        self.getTargetsOneToManySourceEntity = function (targetEntity, relationship) {
            var sourceType = relationship.type;
            var sourceQueryable = self.asQueryable(sourceType);
            
            return sourceQueryable.where(function (e) {
                return e.property(relationship.hasKey).isEqualTo(targetEntity[relationship.withForeignKey]);
            }).firstOrDefault();
        };
        
        self.getSourcesManyToManyQueryProvider = function (sourceEntity, relationship) {
            var provider = new Provider();
            var targetType = relationship.ofType;
            var timestamp = new Date().getTime();
            var mappingDataQueryable = self.asQueryable(relationship.usingMappingType);
            var targetDataQueryable = self.asQueryable(relationship.ofType);
            
            provider.execute = provider.toArray = function (queryable) {
                return mappingDataQueryable.where(function (e) {
                    return e.property(relationship.withForeignKey).isEqualTo(sourceEntity[relationship.hasKey]);
                }).toArray().chain(function (mappingEntities) {
                    return targetDataQueryable.merge(queryable).where(function (e) {
                        var ids = [];
                        mappingEntities.forEach(function (mappingEntity) {
                            ids.push(e.property(relationship.withKey).isEqualTo(mappingEntity[relationship.hasForeignKey]));
                        });
                        
                        return e.or.apply(e, ids);
                    }).toArray().chain(function (entities) {
                        return executeHooks(targetType, "queried", [entities, timestamp]).chain(function () {
                            return entities;
                        });
                    });
                });
            };
            
            provider.count = function (queryable) {
                return mappingDataQueryable.where(function (e) {
                    return e.property(relationship.withForeignKey).isEqualTo(sourceEntity[relationship.hasKey]);
                }).toArray().chain(function (mappingEntities) {
                    return targetDataQueryable.merge(queryable).where(function (e) {
                        var ids = [];
                        mappingEntities.forEach(function (mappingEntity) {
                            ids.push(e.property(relationship.withKey).isEqualTo(mappingEntity[relationship.hasForeignKey]));
                        });
                        
                        return e.or.apply(e, ids);
                    }).count();
                });
            };
            
            return provider;
        };
        
        self.getTargetsManyToManyQueryProvider = function (targetEntity, relationship) {
            var provider = new Provider();
            var sourceType = relationship.type;
            var timestamp = new Date().getTime();
            var mappingDataQueryable = self.asQueryable(relationship.usingMappingType);
            var sourceDataQueryable = self.asQueryable(relationship.type);
            
            provider.execute = provider.toArray = function (queryable) {
                
                return mappingDataQueryable.where(function (e) {
                    
                    return e.property(relationship.hasForeignKey).isEqualTo(targetEntity[relationship.withKey]);

                }).toArray().chain(function (mappingEntities) {
                    
                    return sourceDataQueryable.merge(queryable).where(function (e) {
                        
                        var ids = [];
                        mappingEntities.forEach(function (mappingEntity) {
                            ids.push(e.property(relationship.hasKey).isEqualTo(mappingEntity[relationship.withForeignKey]));
                        });
                        
                        return e.or.apply(e, ids);

                    }).toArray().chain(function (entities) {
                        
                        return executeHooks(sourceType, "queried", [entities, timestamp]).chain(function () {
                            return entities;
                        });

                    });
                });

            };
            
            provider.count = function (queryable) {
                
                return mappingDataQueryable.where(function (e) {
                    
                    return e.property(relationship.hasForeignKey).isEqualTo(targetEntity[relationship.withKey]);

                }).toArray().chain(function (mappingEntities) {
                    
                    return sourceDataQueryable.merge(queryable).where(function (e) {
                        
                        var ids = [];
                        mappingEntities.forEach(function (mappingEntity) {
                            ids.push(e.property(relationship.hasKey).isEqualTo(mappingEntity[relationship.withForeignKey]));
                        });
                        
                        return e.or.apply(e, ids);

                    }).count();
                });
            };
            
            return provider;
        };
        
        self.getQueryProvider = function (Type) {
            return getEndPoint(Type).getQueryProvider();
        };
        
        self.asQueryable = function (Type) {
            return getEndPoint(Type).asQueryable();
        };
        
        self.getEdm = function () {
            return edm;
        };
        
        self.supportsType = function (Type) {
            return getEndPoint.hasKey(Type);
        };
        
        self.initialize = function () {
            return Future.fromResult();
        };
        
        self.dispose = function () {
            return Future.fromResult();
        };
        
        self.addEndPoint = function (Type, endPoint) {
            if (!(endPoint instanceof EndPoint)) {
                throw new Error("Invalid Argument Expection: Expected an BASE.odata4.EndPoint.");
            }
            
            endPoints.add(Type, endPoint);
        };
        
        self.invokeClassMethod = function (Type, methodName, parameters, ajaxOptions) {
            var endPoint = getEndPoint(Type);
            return endPoint.invokeClassFunction(methodName, parameters, ajaxOptions);
        };
        
        self.invokeInstanceMethod = function (Type, entity, methodName, parameters, ajaxOptions) {
            var endPoint = getEndPoint(Type);
            return endPoint.invokeInstanceFunction(methodName, parameters, ajaxOptions);
        };
        
        self.invokeClassMethodWithQueryable = function (Type, methodName, parameters, queryable) {
            var endPoint = getEndPoint(Type);
            return endPoint.invokeClassMethodWithQueryable(methodName, parameters, queryable);
        };
        
        self.getEndPoint = getEndPoint;

    };

});