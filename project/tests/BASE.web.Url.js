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
        var partiallyEncodedUrl = "https://leavittdev.crm.dynamics.com/%7B635986657500000088%7D/WebResources/new_/_WebResources/pages/sendToAms360.html?id=%7bFE672AA1-54F7-E511-80E0-6C3BE5A8A0D0%7d&orglcid=1033&orgname=orgc4baf3eb&type=1&typename=account&userlcid=1033";
        
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
    
    exports["BASE.web.Url: Handle trailing equals."] = function () {
        // Alias BASE.web.Url to a shorter variable.
        var Url = BASE.web.Url;
        var urlString = "https://leavittdev.crm.dynamics.com?token=afdgk3kgg-gage-bbb2t3%3D";
        var url = new Url(urlString);
        
        assert.equal(url.getHost(), "leavittdev.crm.dynamics.com");
        assert.equal(url.getScheme(), "https");
        assert.equal(url.getPort(), "443");
        assert.equal(url.getPath(), "");
        assert.equal(url.getPage(), "");
        assert.equal(url.getExtension(), "");
        assert.equal(url.getQuery(), "token=afdgk3kgg-gage-bbb2t3%3D");
        assert.equal(url.getParsedQuery().token, "afdgk3kgg-gage-bbb2t3=");
        assert.equal(url.toString(), urlString);

    };
    
    exports["BASE.web.Url: Handle Partially Encoded."] = function () {
        // Alias BASE.web.Url to a shorter variable.
        var Url = BASE.web.Url;
        var urlString = "https://leavittdev.crm.dynamics.com/%7B635986657500000088%7D/WebResources/new_/_WebResources/pages/sendToAms360.html?id=%7BFE672AA1-54F7-E511-80E0-6C3BE5A8A0D0%7D&orglcid=1033&orgname=orgc4baf3eb&type=1&typename=account&userlcid=1033";
        var url = new Url(urlString);
        
        assert.equal(url.getHost(), "leavittdev.crm.dynamics.com");
        assert.equal(url.getScheme(), "https");
        assert.equal(url.getPort(), "443");
        assert.equal(url.getPath(), "{635986657500000088}/WebResources/new_/_WebResources/pages/sendToAms360.html");
        assert.equal(url.getPage(), "sendToAms360.html");
        assert.equal(url.getExtension(), ".html");
        assert.equal(url.getQuery(), "id={FE672AA1-54F7-E511-80E0-6C3BE5A8A0D0}&orglcid=1033&orgname=orgc4baf3eb&type=1&typename=account&userlcid=1033");
        assert.equal(url.toString(), urlString);
        
        var loginUrlString = "https://login.leavitt.com/";
        var loginUrl = new Url(loginUrlString);
        
        loginUrl.setQuery({
            "continue": url.toString()
        });
        
        assert.equal(loginUrl.getParsedQuery().continue, url.toString());
        assert.equal(loginUrl.getParsedQuery().continue, urlString);
    };
    
    exports["BASE.web.Url: Set query parameters encoded."] = function () {
        var Url = BASE.web.Url;
        
        var urlString = "http://leavitt.com/";
        var url = new Url(urlString);
        
        url.setQuery({
            "%7B%7D": "%7BBOO%7D",
            "%25": ["%7BBOO%7D", "%7BBOO%7D"]
        });
        
        var parameters = url.getParsedQuery();
        
        assert.equal(parameters["%7B%7D"], "%7BBOO%7D");
        assert.equal(parameters["%25"][0], "%7BBOO%7D");
        assert.equal(parameters["%25"][1], "%7BBOO%7D");
        //assert.equal(parameters["%"], "{BOO}");
    };
});