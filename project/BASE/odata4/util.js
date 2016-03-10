BASE.require([
    "BASE.odata4.ODataAnnotation",
    "BASE.collections.Hashmap"
], function () {
    var ODataAnnotation = BASE.odata4.ODataAnnotation;
    var Hashmap = BASE.collections.Hashmap;
    
    BASE.odata4.util = {
        createNamespaceToTypeHashmap: function (edm) {
            var models = edm.getModels();
            var hashmap = new Hashmap();
            
            models.getValues().forEach(function (model) {
                annotations = model.type.annotations;
                if (Array.isArray(annotations)) {
                    annotations.filter(function (annotation) {
                        return annotation instanceof ODataAnnotation;
                    }).forEach(function (annotation) {
                        if (typeof annotation.namespace === "string") {
                            hashmap.add(annotation.namespace, model.type);
                        }
                    });
                }
            });
            
            return hashmap;
        },
        createTypeToNamespaceHashmap: function (edm) {
            var models = edm.getModels();
            var hashmap = new Hashmap();
            
            models.getValues().forEach(function (model) {
                annotations = model.type.annotations;
                if (Array.isArray(annotations)) {
                    annotations.filter(function (annotation) {
                        return annotation instanceof ODataAnnotation;
                    }).forEach(function (annotation) {
                        if (typeof annotation.namespace === "string") {
                            hashmap.add(model.type, annotation.namespace);
                        }
                    });
                }
            });
            
            return hashmap;
        }
    };
});