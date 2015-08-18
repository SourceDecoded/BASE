BASE.require([
    "BASE.query.Queryable",
    "BASE.web.PathResolver",
    "BASE.odata4.ODataProvider",
    "BASE.odata4.ToServiceDto"
], function () {
    var Queryable = BASE.query.Queryable;
    var ToServiceDto = BASE.odata4.ToServiceDto;
    
    var getPrimaryKeys = function (model) {
        var primaryKey = Object.keys(model.properties).filter(function (key) {
            var property = model.properties[key];
            return property.primaryKey;
        })[0];
        
        if (typeof primaryKey === "undefined") {
            throw new Error("No primary key found for '" + model.collectionName + "'.");
        }
        
        return primaryKey;
    };
    
    BASE.namespace("BASE.odata4");
    
    // TODO: We need a way to handle Many to Many add and removes.
    BASE.odata4.EndPoint = function (config) {
        config = config || {};
        var self = this;
        var url = config.url;
        var model = config.model;
        var edm = config.edm;
        var queryProvider = config.queryProvider;
        var ajaxProvider = config.ajaxProvider;
        
        if (typeof url === "undefined" || url === null) {
            throw new Error("EndPoint: Null Argument Exception - url needs to be a string.");
        }
        
        if (typeof model === "undefined" || model === null) {
            throw new Error("EndPoint: Null Argument Exception - model needs to be supplied.");
        }
        
        if (typeof edm === "undefined" || edm === null) {
            throw new Error("EndPoint: Null Argument Exception - model needs to be supplied.");
        }
        
        if (typeof queryProvider === "undefined" || queryProvider === null) {
            throw new Error("EndPoint: Null Argument Exception - queryProvider cannot be undefined.");
        }
        
        if (typeof ajaxProvider === "undefined" || ajaxProvider === null) {
            throw new Error("EndPoint: Null Argument Exception - ajaxProvider cannot be undefined.");
        }
        
        if (url.lastIndexOf("/") === url.length - 1) {
            url = url.substr(0, url.length - 1);
        }

        var toServiceDto = new ToServiceDto(edm);
        var primaryKey = getPrimaryKeys(model);
        
        var buildEntityUrl = function (entity) {
            var id = entity[primaryKey];
            if (typeof id === "undefined") {
                throw new Error("Entity doesn't have a primary key value.");
            }
            
            var entityUrl = url + "(" + id + ")";
            
            return entityUrl;
        };
        
        self.add = function (entity) {
            if (entity == null) {
                throw new Error("The parameter entity cannot be null or undefined.");
            }
            
            var dto = toServiceDto.resolve(entity);
            
            return ajaxProvider.request(url, {
                method: "POST",
                data: dto
            });
        };
        
        self.update = function (entity, updates) {
            if (entity == null) {
                throw new Error("The parameter entity cannot be null or undefined.");
            }
            
            if (Object.keys(updates).length === 0) {
                throw new Error("Need to have at least one property to update.");
            }
            
            var dto = toServiceDto.resolveUpdate(entity, updates);
            
            return ajaxProvider.request(buildEntityUrl(entity), {
                method: "PATCH",
                data: dto
            });
        };
        
        self.remove = function (entity) {
            return ajaxProvider.request(buildEntityUrl(entity), {
                method: "DELETE"
            });
        };
        
        self.getQueryProvider = function () {
            return queryProvider;
        };
        
        self.asQueryable = function () {
            var queryable = new Queryable();
            queryable.provider = self.getQueryProvider();
            return queryable;
        };
        
        self.invokeInstanceFunction = function (key, methodName, parameters) {
            parameters = parameters || {};
            
            var parameterString = Object.keys(parameters).map(function (key) {
                return key + "=" + convertToOdataValue(parameters[key]);
            }).join(", ");
            
            var methodSignature = parameterString.length > 0 ? methodName + "(" + parameterString + ")" : methodName;
            
            var fullUrl = url + "(" + convertToOdataValue(key) + ")/" + methodSignature;
            
            return ajaxProvider.request(fullUrl);

        };
        
        self.invokeClassFunction = function (methodName, parameters) {
            parameters = parameters || {};
            
            var parameterString = Object.keys(parameters).map(function (key) {
                return key + "=" + convertToOdataValue(parameters[key]);
            }).join(", ");
            
            var methodSignature = parameterString.length > 0 ? methodName + "(" + parameterString + ")" : methodName;
            
            var fullUrl = url + "/" + methodSignature;
            
            return ajaxProvider.request(fullUrl);

        };
        
        self.getUrl = function () {
            return url;
        };
        
        self.getAjaxProvider = function () {
            return ajaxProvider;
        };

    };

});