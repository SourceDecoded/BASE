(function () {
    
    var View = function () {
        var x = 0;
        var y = 0;
        var width = 0;
        var height = 0;
        
        this.lastX = 0;
        this.lastY = 0;
        this.lastWidth = 0;
        this.lastHeight = 0;
        this.dirty = false;
        this.children = [];
        this.behaviors = [];
        
        Object.defineProperties(this, {
            "left": {
                get: function () {
                    return x - ((this.parent && this.parent.x) || 0);
                },
                set: function (value) {
                    this.x = Math.ceil(((this.parent && this.parent.x) || 0) + value);
                }
            },
            "top": {
                get: function () {
                    return y - (this.parent && this.parent.y) || 0;
                },
                set: function (value) {
                    this.y = Math.ceil(((this.parent && this.parent.y) || 0) + value);
                }
            },
            "x": {
                get: function () {
                    return x;
                },
                set: function (value) {
                    if (typeof value === "number" && !isNaN(value) && x !== value) {
                        if (!this.dirty) {
                            this.lastX = x;
                        }
                        x = Math.ceil(value);
                        var difference = x - this.lastX;
                        
                        for (var index = 0; index < this.children.length; index++) {
                            this.children[index].x += difference;
                        }
                        
                        this.dirty = true;
                    }

                }
            },
            "y": {
                get: function () {
                    return y;
                },
                set: function (value) {
                    if (typeof value === "number" && !isNaN(value) && y !== value) {
                        if (!this.dirty) {
                            this.lastY = y;
                        }
                        
                        y = Math.ceil(value);
                        var difference = y - this.lastY;
                        
                        for (var index = 0; index < this.children.length; index++) {
                            this.children[index].y += difference;
                        }
                        
                        this.dirty = true;
                    }
                }
            },
            "width": {
                get: function () {
                    return width;
                },
                set: function (value) {
                    if (typeof value === "number" && !isNaN(value) && value !== width) {
                        if (!this.dirty) {
                            this.lastWidth = width;
                        }
                        width = Math.ceil(value);
                        this.dirty = true;
                    }
                }
            },
            "height": {
                get: function () {
                    return height;
                },
                set: function (value) {
                    if (typeof value === "number" && !isNaN(value) && value !== height) {
                        if (!this.dirty) {
                            this.lastHeight = height;
                        }
                        height = Math.ceil(value);
                        this.dirty = true;
                    }
                }
            }
        });
        
    };
    
    View.prototype.insertBeforeChild = function (view, referenceView) {
        var children = this.children;
        
        if (!(view instanceof View) || !(referenceView instanceof View)) {
            throw new Error("Child views need to be a view.");
        }
        var referenceIndex = children.indexOf(referenceView);
        
        if (referenceIndex === -1) {
            throw new Error("Couldn't find reference view.");
        }
        
        view.parent = this;
        children.splice(referenceIndex, 0, view);
        
        view.left = view.left;
        view.top = view.top;
        
        this.dirty = true;
    };
    
    View.prototype.appendChild = function (view) {
        var children = this.children;
        if (!(view instanceof View)) {
            throw new Error("Child views need to be a view.");
        }
        view.parent = this;
        children.push(view);
        
        // This will accurately assign the positions of the children.
        view.left = view.left;
        view.top = view.top;
        
        this.dirty = true;
    };
    
    View.prototype.removeChild = function (view) {
        var children = this.children;
        if (!(view instanceof View)) {
            throw new Error("Child views need to be a view.");
        }
        
        var referenceIndex = children.indexOf(view);
        
        if (referenceIndex === -1) {
            throw new Error("Couldn't find reference view.");
        }
        
        view.parent = this;
        children.splice(referenceIndex, 1);
        
        view.left = view.left;
        view.top = view.top;
        
        this.dirty = true;
    };
    
    View.prototype.draw = function (context, x, y, width, height) {
        var child;
        
        x = typeof x === "number" ? x : this.x;
        y = typeof y === "number" ? y : this.y;
        
        width = typeof width === "number" ? width: this.width;
        height = typeof height === "number" ? height: this.height;
        
        x = Math.max(x, this.x);
        y = Math.max(y, this.y);
        
        var right = Math.min(x + width, this.x + this.width);
        var bottom = Math.min(y + height, this.y + this.height);
        
        var behaviors = this.behaviors;
        var children = this.children;
        
        width = right - x;
        height = bottom - y;
        
        if (width > 0 & height > 0) {
            context.save();
            
            for (var index = 0; index < behaviors.length; index++) {
                if (typeof behaviors[index].draw === "function") {
                    behaviors[index].draw(context, x, y, width, height);
                }
                if (typeof behaviors[index].update === "function") {
                    behaviors[index].update(this);
                }
            }
            
            for (index = 0; index < children.length; index++) {
                child = children[index];
                child.draw(context, x, y, width, height);
            }
            
            context.restore();
        }
        
        this.lastX = this.x;
        this.lastY = this.y;
        this.lastWidth = this.width;
        this.lastHeight = this.height;
        
        this.dirty = false;
    };
    
    View.prototype.addBehavior = function (behavior) {
        if (typeof behavior.setView === "function") {
            behavior.setView(this);
        }
        this.behaviors.push(behavior);
    };
    
    View.prototype.removeBehavior = function (behavior) {
        var indexOf = this.behaviors.indexOf(behavior);
        if (indexOf > -1) {
            if (typeof behavior.removeView === "function") {
                behavior.removeView(this);
            }
            this.behaviors.splice(indexOf, 1);
        }
    };
    
    View.prototype.getBehaviors = function (Type) {
        return this.behaviors.filter(function (behavior) {
            return behavior.constructor === Type;
        });
    };
    
    BASE.namespace("BASE.canvas");
    
    BASE.canvas.View = View;
}());