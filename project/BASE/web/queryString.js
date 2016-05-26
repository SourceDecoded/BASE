BASE.require([], function () {
    
    BASE.namespace("BASE.web.queryString");
    
    var decode = function (value) {
        var decodedValue;
        try {
            decodedValue = decodeURIComponent(value);
        } catch (e) { }
        
        while (decodedValue !== value) {
            value = decodedValue;
            try {
                decodedValue = decodeURIComponent(value);
            } catch (e) { }
        }
        value = decodedValue;
        return value;
    };
    
    BASE.web.queryString.toString = function (obj, includeQuestionMark) {
        if (typeof includeQuestionMark === "undefined") {
            includeQuestionMark = true;
        }
        
        var parts = Object.keys(obj).map(function (key) {
            var value = obj[key];
            
            if (Array.isArray(value)) {
                return obj[key].map(function (value) {
                    value = decode(value);
                    key = decode(key);
                    
                    return encodeURIComponent(key) + "=" + encodeURIComponent(value);
                }).join("&");
            } else {
                value = decode(value);
                key = decode(key);
                
                return encodeURIComponent(key) + "=" + encodeURIComponent(value);
            }
        });
        return (includeQuestionMark ? "?" : "") + parts.join("&");
    };
    
    BASE.web.queryString.parse = function (querystring) {
        var values = {};
        
        if (querystring) {
            
            if (querystring.indexOf("?") === 0) {
                querystring = querystring.substr(1);
            }
            
            var keyValues = querystring.split("&");
            keyValues.forEach(function (keyValue) {
                var split = keyValue.split("=");
                values[split[0]] = decode(split[1]);
            });

        }
        return values;
    };
});