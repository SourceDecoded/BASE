BASE.require([
    "BASE.web.ComponentDocument"
], function () {
    
    BASE.namespace("BASE.web");
    BASE.web.components = new ComponentDocument(document);
    BASE.web.components.init();

});