BASE.require([
    "BASE.odata4.toCamelCasedProperties",
    "BASE.odata4.toPascalCasedProperties",
    "BASE.async.Future", 
    "BASE.data.responses.ValidationErrorResponse",
    "BASE.data.responses.ConnectionErrorResponse",
    "BASE.data.responses.ForbiddenErrorResponse",
    "BASE.data.responses.UnauthorizedErrorResponse",
    "BASE.data.responses.EntityNotFoundErrorResponse",
    "BASE.data.responses.ErrorResponse"
], function () {
    BASE.namespace("BASE.odata4");
    
    var toCamelCasedProperties = BASE.odata4.toCamelCasedProperties;
    var toPascalCasedProperties = BASE.odata4.toPascalCasedProperties;
    var ValidationErrorResponse = BASE.data.responses.ValidationErrorResponse;
    var UnauthorizedErrorResponse = BASE.data.responses.UnauthorizedErrorResponse;
    var ForbiddenErrorResponse = BASE.data.responses.ForbiddenErrorResponse;
    var EntityNotFoundErrorResponse = BASE.data.responses.EntityNotFoundErrorResponse;
    var ConnectionErrorResponse = BASE.data.responses.ConnectionErrorResponse;
    var ErrorResponse = BASE.data.responses.ErrorResponse;
    var Future = BASE.async.Future;
    
    var parseError = function (xhr) {
        var text = xhr.responseText;
        
        if (text && typeof text === "string") {
            try {
                var response = JSON.parse(text);
                return response.error.message || "";
            } catch (error) {
                return error.message;
            }
        }
        
        return "";
    };

    BASE.odata4.OData4DataConverter = function () {
        this.handleResponseAsync = function (xhr) {
            var json;
            
            if (typeof xhr === "undefined" || xhr === null) {
                throw new Error("Null Argument Exception: xhr is undefined or null");
            }
            
            if (xhr.responseText === "") {
                return Future.fromResult(undefined);
            }
            
            try {
                json = JSON.parse(xhr.responseText);
                return Future.fromResult(toCamelCasedProperties(json));
            } catch (e) {
                return Future.fromError(new Error("XHR response contains invalid json."));
            }
            
        };
        
        
        this.handleRequestAsync = function (options) {
            var data = options.data;
            
            try {
                
                if (typeof data === "object" && data !== null) {
                    options.data = JSON.stringify(toPascalCasedProperties(data));
                    return Future.fromResult();
                }
                
                return Future.fromResult(options);

            } catch (e) {
                
                return Future.fromError(new Error("The data property needs to be an object."));
            
            }
        };
        
        this.handleErrorResponseAsync = function (xhr) {
            var error;
            
            var message = parseError(xhr);
            
            if (xhr.status === 0) {
                message = message || "Could not perform action due to a connection problem, please verify connectivity";
                error = new ConnectionErrorResponse(message);
            } else if (xhr.status === 400) {
                error = new ValidationErrorResponse(message);
            } else if (xhr.status === 401) {
                message = message || "Unauthorized";
                error = new UnauthorizedErrorResponse(message);
            } else if (xhr.status === 403) {
                message = message || "Forbidden";
                error = new ForbiddenErrorResponse(message);
            } else if (xhr.status === 404) {
                message = message || "File Not Found";
                error = new EntityNotFoundErrorResponse(message);
            } else {
                message = message || "Unknown Error";
                error = new ErrorResponse(message);
            }
            
            return Future.fromError(error);
        };
    };
});