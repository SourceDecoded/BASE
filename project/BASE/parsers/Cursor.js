BASE.namespace("BASE.parsers");

BASE.parsers.Cursor = function (source) {
    if (typeof source !== "string") {
        throw new Error("Invalid Argument Exception: source needs to be a string.");
    }
    
    this.currentIndex = -1;
    this.marks = [-1];
    this.source = source;
};

BASE.parsers.Cursor.prototype.hasNext = function () {
    return this.currentIndex + 1 < this.source.length;
};

BASE.parsers.Cursor.prototype.next = function () {
    if (this.hasNext()) {
        this.currentIndex += 1;
    } else {
        throw new Error("End of File.");
    }
    return this.getValue();
};

BASE.parsers.Cursor.prototype.mark = function () {
    this.marks.push(this.currentIndex);
};

BASE.parsers.Cursor.prototype.revert = function () {
    if (this.marks.length > 1) {
        return this.currentIndex = this.marks.pop();
    }
};

BASE.parsers.Cursor.prototype.setIndex = function (index) {
    if (index >= 0 && index < this.source.length) {
        this.currentIndex = index;
    }
};

BASE.parsers.Cursor.prototype.getValue = function () {
    var index = this.currentIndex;
    
    if (index >= 0 && index < this.source.length) {
        this.source.charAt(index);
    }
};

