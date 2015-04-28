var assert = require('assert');

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require(["BASE.web.Animation"], function () {
    
    exports["Register tick handlers."] = function () {
        
        var obj = {
            property: 0
        };
        
        NumberTickHandler = function (beginningValue, endingValue, currentTime, duration, easingFunction) {
        
        };
        NumberUnitRegEx = /^\d.*?$/i;
        
        var animation = new BASE.web.Animation({
            target: obj,
            duration: 1000,
            easing: "easeOutExpo",
            properties: {
                x: "200px"
            }
        });
        
        animation.registerHandler(NumberUnitRegEx, NumberTickHandler);

       
        
        
    
    };
    

});

