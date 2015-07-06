BASE.require([
    "LG.query.ApiProvider",
    "BASE.query.Queryable",
    "BASE.collections.Hashmap",
    "BASE.data.responses.AddedResponse",
    "BASE.data.responses.UpdatedResponse",
    "BASE.data.responses.RemovedResponse",
    "BASE.data.responses.ErrorResponse",
    "BASE.data.responses.ValidationErrorResponse",
    "BASE.data.responses.ConnectionErrorResponse",
    "BASE.data.responses.ForbiddenErrorResponse",
    "BASE.data.responses.UnauthorizedErrorResponse",
    "BASE.data.responses.EntityNotFoundErrorResponse",
    "LG.data.dataStores.createErrorFromXhr",
    "BASE.web.ajax",
    "BASE.data.utils"
], function () {
    BASE.namespace("LG.data.dataStores");
    
    var ApiProvider = LG.query.ApiProvider;
    var ajax = BASE.web.ajax;
    var Future = BASE.async.Future;
    var ErrorResponse = BASE.data.responses.ErrorResponse;
    var Queryable = BASE.query.Queryable;
    var ValidationErrorResponse = BASE.data.responses.ValidationErrorResponse;
    var UnauthorizedErrorResponse = BASE.data.responses.UnauthorizedErrorResponse;
    var ForbiddenErrorResponse = BASE.data.responses.ForbiddenErrorResponse;
    var EntityNotFoundErrorResponse = BASE.data.responses.EntityNotFoundErrorResponse;
    var ConnectionErrorResponse = BASE.data.responses.ConnectionErrorResponse;
    var AddedResponse = BASE.data.responses.AddedResponse;
    var UpdatedResponse = BASE.data.responses.UpdatedResponse;
    var RemovedResponse = BASE.data.responses.RemovedResponse;
    var Hashmap = BASE.collections.Hashmap;
    var isPrimitive = BASE.data.utils.isPrimitive;
    
    
    
    var createErrorFromXhr = LG.data.dataStores.createErrorFromXhr;
    
    LG.data.dataStores.ODataDataStore = function (config) {
        var self = this;
        config = config || {};
        var baseUrl = config.baseUrl;
        var appId = config.appId;
        var token = config.token;
        var Type = config.Type;
        var edm = config.edm;
        var model = edm.getModelByType(Type);
        var properties = model.properties;
        var isMappingType = edm.getMappingTypes().hasKey(Type);
        var primaryKey = edm.getPrimaryKeyProperties(Type)[0];
        
        if (typeof baseUrl === "undefined" ||
             typeof appId === "undefined" ||
             typeof token === "undefined" ||
             typeof primaryKey === "undefined" ||
             typeof Type !== "function") {
            throw new Error("Null argument error.");
        }
        
        BASE.assertNotGlobal(self);
        
        var setUpHeaders = function (settings) {
            settings.headers = {
                "X-LGAppId": appId,
                "X-LGToken": token
            };
        };
        
        var convertToLocalDto = function (Type, dto) {
            var entity = new Type();
            
            for (var x in dto) {
                var objX = x;
                
                if (x.substr(0, 2) !== x.substr(0, 2).toUpperCase()) {
                    objX = x.substr(0, 1).toLowerCase() + x.substring(1);
                }
                
                if (isPrimitive(dto[x])) {
                    entity[objX] = dto[x];
                }
            }
            
            return entity;
        }
        
        var makeServerDto = function (entity) {
            var DTO = {};
            
            for (var x in entity) {
                var objX = x.substr(0, 1).toUpperCase() + x.substring(1);
                if ((typeof entity[x] === "string" ||
                        typeof entity[x] === "number" ||
                        typeof entity[x] === "boolean" ||
                        entity[x] === null ||
                        entity[x] instanceof Date) &&
                        x.indexOf("_") !== 0) {
                    if (x === primaryKey) {
                        if (entity[primaryKey] !== null) {
                            DTO[objX] = entity[x];
                        }
                    } else {
                        DTO[objX] = entity[x];
                    }
                }
            }
            
            return DTO;
        };
        
        var provider = new ApiProvider(config);
        
        self.add = function (entity) {
            var url = baseUrl;
            var dto = makeServerDto(entity);
            
            return new Future(function (setValue, setError) {
                if (url) {
                    var settings = {
                        type: "POST",
                        data: JSON.stringify(dto)
                    };
                    
                    setUpHeaders(settings);
                    
                    ajax.request(url, settings).then(function (response) {
                        var data = response.data;
                        if (data && data.Error) {
                            var err = new ValidationErrorResponse(data.Message, data.ValidationErrors);
                            setError(err);
                        } else {
                            var entity = convertToLocalDto(Type, data.Data);
                            
                            Object.keys(entity).forEach(function (key) {
                                if (properties[key]) {
                                    var Type = properties[key].type;
                                    
                                    if ((Type === Date || Type === DateTimeOffset) && entity[key] !== null) {
                                        entity[key] = new Date(entity[key]);
                                    }
                                }
                            });
                            
                            var response = new AddedResponse(response.message, entity);
                            setValue(response);
                        }
                    }).ifError(function (error) {
                        setError(createErrorFromXhr(error, entity));
                    });
                } else {
                    throw new Error("Could not find url for this type.");
                }
            });
        };
        
        self.update = function (entity, updates) {
            var id = entity[primaryKey];
            var url = baseUrl + "/" + id;
            
            return new Future(function (setValue, setError) {
                if (url) {
                    var dto = makeServerDto(updates);
                    var settings = {
                        type: "PATCH",
                        data: JSON.stringify(dto)
                    };
                    
                    setUpHeaders(settings);
                    
                    ajax.request(url, settings).then(function (response) {
                        var data = response.data;
                        if (data && data.Error) {
                            var err = new ValidationErrorResponse(data.Message, data.ValidationErrors);
                            setError(err);
                        } else {
                            var response = new UpdatedResponse(data.Message);
                            setValue(response);
                        }
                    }).ifError(function (error) {
                        setError(createErrorFromXhr(error, entity));
                    });
                } else {
                    setValue({});
                }
            });
        };
        
        self.remove = function (entity) {
            var id;
            var url;
            var payload;
            
            if (isMappingType) {
                url = baseUrl
                
                return new BASE.async.Future(function (setValue, setError) {
                    if (url) {
                        var settings = {
                            type: "DELETE"
                        };
                        
                        setUpHeaders(settings);
                        settings.data = JSON.stringify(makeServerDto(entity));
                        
                        ajax.request(url, settings).then(function (response) {
                            var data = response.data;
                            
                            if (data && data.Error) {
                                entity[primaryKey] = null;
                                var err = new ErrorResponse(data.Message);
                                setError(err);
                            } else {
                                var response = new RemovedResponse(data.Message);
                                setValue(response);
                            }
                        }).ifError(function (error) {
                            setError(createErrorFromXhr(error, entity));
                        });

                    } else {
                        setValue({});
                    }
                });
            } else {
                id = entity[primaryKey];
                url = baseUrl + "/" + id;
                
                return new BASE.async.Future(function (setValue, setError) {
                    if (url) {
                        var settings = {
                            type: "DELETE"
                        };
                        
                        setUpHeaders(settings);
                        
                        ajax.request(url, settings).then(function (response) {
                            var data = response.data;
                            if (data && data.Error) {
                                entity[primaryKey] = null;
                                var err = new ErrorResponse(data.Message);
                                setError(err);
                            } else {
                                var response = new RemovedResponse(data.Message);
                                setValue(response);
                            }
                        }).ifError(function (error) {
                            setError(createErrorFromXhr(error, entity));
                        });
                    } else {
                        setValue({});
                    }
                });
            }
            
        };
        
        self.asQueryable = function () {
            var queryable = new Queryable(Type);
            queryable.provider = provider;
            return queryable;
        };
        
        self.getQueryProvider = function () {
            return provider;
        };
        
        self.initialize = function () {
            Future.fromResult(null);
        };
        
        self.getEndPoint = function () {
            return baseUrl;
        };
        
        self.getModel = function () {
            return model;
        };
        
        self.getAppId = function () {
            return appId;
        };
        
        self.getToken = function () {
            return token
        };
        
        self.dispose = function () {
            Future.fromResult(null);
        };
    };

});