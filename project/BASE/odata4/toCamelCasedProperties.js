BASE.require([
    "String.prototype.toCamelCase"
], function () {
    
    BASE.namespace("BASE.odata4");
    
    BASE.odata4.toCamelCasedProperties = function (obj) {
        if (typeof obj !== "object" || obj === null) {
            return obj;
        }
        
        var newObj = Array.isArray(obj) ? [] : {};
        return Object.keys(obj).reduce(function (newObj, key) {
            var camelCaseKey = key.toCamelCase();
            
            if (typeof obj[key] === "object" && obj[key] !== null) {
                newObj[camelCaseKey] = BASE.odata4.toCamelCasedProperties(obj[key]);
            } else {
                newObj[camelCaseKey] = obj[key];
            }
            
            return newObj;
        }, newObj);
    };

});

