BASE.namespace("BASE.web");

BASE.web.isCORSEnabled = function () {
    //Detect browser support for CORS
    if ("withCredentials" in new XMLHttpRequest()) {
        /* supports cross-domain requests */
        return true;
    } else {
        return false;
    }
};