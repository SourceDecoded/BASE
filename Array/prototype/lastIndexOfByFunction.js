Array.prototype.lastIndexOfByFunction = function (filter) {
    var array = this;
    var index = -1;
    var length = array.length;
    var match;

    for (var x = length - 1; x >= 0 ; x--) {
        match = filter(array[x], x);
        if (match) {
            index = x;
            break;
        }
    }

    return index;
};