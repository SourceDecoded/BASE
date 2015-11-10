BASE.require([
    "BASE.query.Queryable",
    "BASE.web.PathResolver",
    "BASE.odata4.ODataProvider",
    "BASE.odata4.ToServiceDto",
    "BASE.odata4.FromServiceDto",
    "BASE.odata.convertToOdataValue",
    "BASE.data.responses.AddedResponse",
    "BASE.data.responses.UpdatedResponse",
    "BASE.data.responses.RemovedResponse",
    "BASE.odata4.FunctionInvocation"
], function () {
    var Queryable = BASE.query.Queryable;
    var ToServiceDto = BASE.odata4.ToServiceDto;
    var FromServiceDto = BASE.odata4.FromServiceDto;
    var convertToOdataValue = BASE.odata.convertToOdataValue;
    var AddedResponse = BASE.data.responses.AddedResponse;
    var UpdatedResponse = BASE.data.responses.UpdatedResponse;
    var RemovedResponse = BASE.data.responses.RemovedResponse;
    var FunctionInvocation = BASE.odata4.FunctionInvocation;
    var ODataProvider = BASE.odata4.ODataProvider;
    
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
        
        if (typeof queryProvider === "undefined" || queryProvider === null) {
            throw new Error("EndPoint: Null Argument Exception - queryProvider cannot be undefined.");
        }
        
        if (typeof ajaxProvider === "undefined" || ajaxProvider === null) {
            throw new Error("EndPoint: Null Argument Exception - ajaxProvider cannot be undefined.");
        }
        
        if (typeof edm === "undefined" || edm === null) {
            throw new Error("EndPoint: Null Argument Exception - model needs to be supplied.");
        }
        
        if (url.lastIndexOf("/") === url.length - 1) {
            url = url.substr(0, url.length - 1);
        }
        
        var toServiceDto = new ToServiceDto(edm);
        var fromServiceDto = new FromServiceDto(edm);
        var primaryKey = getPrimaryKeys(model);
        var functionInvocation = new FunctionInvocation(ajaxProvider);
        
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
            }).chain(function (dto) {
                dto = fromServiceDto.resolve(model, dto);
                return new AddedResponse("Successfully Added.", dto);
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
            }).chain(function () {
                return new UpdatedResponse("Successfully Updated.");
            });
        };
        
        self.remove = function (entity) {
            return ajaxProvider.request(buildEntityUrl(entity), {
                method: "DELETE"
            }).chain(function () {
                return new RemovedResponse("Successfully Removed.");
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
        
        self.invokeInstanceFunction = function (entity, methodName, parameters, ajaxOptions) {
            var keyName = edm.getPrimaryKeyProperties(model.type)[0];
            var fullUrl = url + "(" + convertToOdataValue(entity[keyName]) + ")";
            return functionInvocation.invokeAsync(fullUrl, methodName, parameters, ajaxOptions);
        };
        
        self.invokeClassFunction = function (methodName, parameters, ajaxOptions) {
            return functionInvocation.invokeAsync(url, methodName, parameters, ajaxOptions);
        };
        
        self.invokeClassMethodWithQueryable = function (methodName, parameters, queryable) {
            var functionInvocationUrl = functionInvocation.buildUrl(url, methodName, parameters);
            
            var config = {
                url: functionInvocationUrl,
                model: model,
                edm: edm,
                ajaxProvider: ajaxProvider
            };
            
            var odataProvider = new ODataProvider(config);
            return odataProvider.execute(queryable);
        };
        
        self.getUrl = function () {
            return url;
        };
        
        self.getAjaxProvider = function () {
            return ajaxProvider;
        };

    };

});