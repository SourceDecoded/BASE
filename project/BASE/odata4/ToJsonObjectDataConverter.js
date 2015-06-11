BASE.require([
    "BASE.async.Future", 
    "BASE.data.responses.ValidationErrorResponse",
    "BASE.data.responses.ConnectionErrorResponse",
    "BASE.data.responses.ForbiddenErrorResponse",
    "BASE.data.responses.UnauthorizedErrorResponse",
    "BASE.data.responses.EntityNotFoundErrorResponse",
    "BASE.data.responses.ErrorResponse"
], function () {
    BASE.namespace("BASE.odata4");
    
    var ValidationErrorResponse = BASE.data.responses.ValidationErrorResponse;
    var UnauthorizedErrorResponse = BASE.data.responses.UnauthorizedErrorResponse;
    var ForbiddenErrorResponse = BASE.data.responses.ForbiddenErrorResponse;
    var EntityNotFoundErrorResponse = BASE.data.responses.EntityNotFoundErrorResponse;
    var ConnectionErrorResponse = BASE.data.responses.ConnectionErrorResponse;
    var ErrorResponse = BASE.data.responses.ErrorResponse;
    var Future = BASE.async.Future;
    
    var convertToCamelCase = function (obj) {
        if (typeof obj !== "object" || obj === null) {
            return obj;
        }
        
        var newObj = Array.isArray(obj) ? [] : {};
        return Object.keys(obj).reduce(function (newObj, key) {
            var camelCaseKey = key;
            if (key.substr(0, 2) !== key.substr(0, 2).toUpperCase()) {
                camelCaseKey = key.substr(0, 1).toLowerCase() + key.substr(1);
            }
            
            if (typeof obj[key] === "object" && obj[key] !== null) {
                newObj[camelCaseKey] = convertToCamelCase(obj[key]);
            } else {
                newObj[camelCaseKey] = obj[key];
            }
            
            return newObj;
        }, newObj);
    };
    
    BASE.odata4.ToJsonObjectDataConverter = function () {
        this.handleResponseAsync = function (xhr) {
            
            if (typeof xhr === "undefined" || xhr === null) {
                throw new Error("Null Argument Exception: xhr is undefined or null");
            }
            
            var json;
            
            try {
                json = JSON.parse(xhr.responseText);
            } catch (e) {
                return Future.fromError(new Error("XHR response contains invalid json."));
            }
            
            return Future.fromResult(convertToCamelCase(json));
        };
        
        
        this.handleRequestAsync = function (options) {
            //TODO: covert to JSON and create send request 
            return Future.fromResult();
        };
        
        this.handleErrorResponseAsync = function (xhr) {
            var error;
            
            // I really hate this, but its comparing primitives and is only in one place.
            if (xhr.status === 0) {
                error = new ConnectionErrorResponse("Connection Error");
            } else if (xhr.status === 400) {
                error = new ValidationErrorResponse();
            } else if (xhr.status === 401) {
                error = new UnauthorizedErrorResponse("Unauthorized");
            } else if (xhr.status === 403) {
                error = new ForbiddenErrorResponse("Forbidden");
            } else if (xhr.status === 404) {
                error = new EntityNotFoundErrorResponse("File Not Found");
            } else {
                error = new ErrorResponse("Unknown Error");
            }
            
            return Future.fromError(error);
        };
    };
});