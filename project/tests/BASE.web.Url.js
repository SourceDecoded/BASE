var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.web.Url"
], function () {
    
    exports["BASE.web.Url"] = function () {
        // Alias BASE.web.Url to a shorter variable.
        var Url = BASE.web.Url;
        
        var googleAddress = "https://www.google.com/#coolHash";
        var leavittAddress = "https://www.leavitt.com:8080/path/page.html?firstName=Jared&lastName=Barnes";
        
        var googleUrl = new Url(googleAddress);
        assert.equal(googleUrl.getHost(), "www.google.com"); //-->
        assert.equal(googleUrl.getScheme(), "https"); //-->"https"
        assert.equal(googleUrl.getPort(), "443"); //-->"443"
        assert.equal(googleUrl.getHash(), "coolHash"); //-->"coolHash"
        
        var leavittUrl = new Url(leavittAddress);
        assert.equal(leavittUrl.getHost(), "www.leavitt.com"); //-->"www.leavitt.com"
        assert.equal(leavittUrl.getScheme(), "https"); //-->"https"
        assert.equal(leavittUrl.getPort(), "8080"); //-->"8080" 
        assert.equal(leavittUrl.getPath(), "path/page.html"); //-->"path/page.html" 
        assert.equal(leavittUrl.getPage(), "page.html"); //-->"page.html"
        assert.equal(leavittUrl.getExtension(), ".html"); //-->".html" 
        assert.equal(leavittUrl.getQuery(), "firstName=Jared&lastName=Barnes"); //-->"firstName=Jared&lastName=Barnes"
        var parameters = leavittUrl.getParsedQuery();
        assert.ok(parameters.firstName === "Jared" && parameters.lastName === "Barnes", true);
        
        // Let's change the leavittUrl to be pointed to amc now.
        leavittUrl.setHost("amc.leavitt.com");
        leavittUrl.setPort("80");
        //assert.equal(leavittUrl.toString(), "https://amc.leavitt.com:80/path/page.html?firstName=Jared&lastName=Barnes");
        
        assert.equal(leavittUrl.getHash(), "");
        
        // Let's add some more parameters.
        var params = leavittUrl.getParsedQuery();
        params.age = 30;
        leavittUrl.setQuery(params);
        //assert.equal(leavittUrl.toString());
    };
});