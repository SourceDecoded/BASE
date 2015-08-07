BASE.require([
    "String.prototype.toPascalCase"
], function () {

    BASE.namespace("BASE.odata4");
    
    BASE.odata4.toPascalCasedProperties = function (obj) {
        if (typeof obj !== "object" || obj === null) {
            return obj;
        }
        
        var newObj = Array.isArray(obj) ? [] : {};
        return Object.keys(obj).reduce(function (newObj, key) {
            var pascalCaseKey = key.toPascalCase();
            
            if (typeof obj[key] === "object" && obj[key] !== null) {
                newObj[pascalCaseKey] = BASE.odata4.toPascalCasedProperties(obj[key]);
            } else {
                newObj[pascalCaseKey] = obj[key];
            }
            
            return newObj;
        }, newObj);
    };

});

