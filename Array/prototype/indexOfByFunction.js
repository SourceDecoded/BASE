Array.prototype.indexOfByFunction = function (filter) {
    var match;
    var array = this;
    var index = -1;
    var length = array.length;

    for (var x = 0 ; x < length; x++){
        match = filter(array[x], x);
        if (match) {
            index = x;
            break;
        }
    }

    return index;
};