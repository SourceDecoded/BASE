BASE.require([
    "jQuery"
], function () {
    
    var webComponents = BASE.web.components;
    
    BASE.namespace("app.components.layouts");
    
    app.components.layouts.List = function (elem, tags, scope) {
        var self = this;
        var $elem = $(elem);
        
        var itemComponent = $elem.attr("item-component");
        
        if (typeof itemComponent === "string") {
            throw new Error("app.components.layouts.List needs a item-component attribute.");
        }
        
        self.setItems = function (array) {
            $elem.empty();
            
            array.map(function (item) {
                return webComponents.createComponent(itemComponent).then(function (component) {
                    var controller = $(component).controller();
                    
                    if (typeof controller === "undefined") {
                        throw new Error("The item-component needs to have a controller.");
                    }
                    
                    if (typeof controller.setItem !== "function") {
                        throw new Error("The item-component needs to have a setItem function.");
                    }
                });
            }).reduce(function (future, componentFuture) {
                return future.chain(function () {
                    return componentFuture;
                }).chain(function (component) {
                    $elem.append(component);
                });
            }, Future.fromResult());

        };

    };

});