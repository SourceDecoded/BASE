(function () {
    var View = function () {
        var top = 0;
        var left = 0;
        var right = 0;
        var bottom = 0;
        var width = 0;
        var height = 0;
        var zIndex = 0;
        var children = [];
        var lastTop = 0;
        var lastLeft = 0;
        var lastWidth = 0;
        var lastHeight = 0;
        var behaviors = [];
        var parent = null;
        this.x = 0;
        this.y = 0;
        
        Object.defineProperties(this, {
            "top": {
                get: function () {
                    return top;
                },
                set: function (value) {
                    if (typeof value === "number" && value !== top) {
                        if (!this.dirtyPlacement) {
                            lastTop = top;
                        }
                        top = Math.floor(value);
                        this.y = this.calculateTopPosition();
                        this.dirtyPlacement = true;
                    }
                }
            },
            "left": {
                get: function () {
                    return left;
                },
                set: function (value) {
                    if (typeof value === "number" && value !== left) {
                        if (!this.dirtyPlacement) {
                            lastLeft = left;
                        }
                        left = Math.floor(value);
                        this.x = this.calculateLeftPosition();
                        this.dirtyPlacement = true;
                    }
                }
            },
            "width": {
                get: function () {
                    return width;
                },
                set: function (value) {
                    if (typeof value === "number" && value !== width) {
                        if (!this.dirtyPlacement) {
                            lastWidth = width;
                        }
                        width = Math.floor(value);
                        this.dirtyPlacement = true;
                    }
                }
            },
            "height": {
                get: function () {
                    return height;
                },
                set: function (value) {
                    if (typeof value === "number" && value !== height) {
                        if (!this.dirtyPlacement) {
                            lastHeight = height;
                        }
                        height = Math.floor(value);
                        this.dirtyPlacement = true;
                    }
                }
            },
            "children": {
                get: function () {
                    return children;
                }
            },
            "behaviors": {
                get: function () {
                    return behaviors;
                }
            },
            "parent": {
                get: function () {
                    return parent;
                },
                set: function (view) {
                    parent = view;
                    this.y = this.calculateTopPosition();
                    this.x = this.calculateLeftPosition();
                }
            }
        });
        
        this.dirtyPlacement = false;
        this.dirtyContent = false;
        
        this.insertBeforeChild = function (view, referenceView) {
            if (!(view instanceof View) || !(referenceView instanceof View)) {
                throw new Error("Child views need to be a view.");
            }
            var referenceIndex = children.indexOf(referenceView);
            
            if (referenceIndex === -1) {
                throw new Error("Couldn't find reference view.");
            }
            
            view.parent = this;
            children.splice(referenceIndex, 0, view);
            this.dirtyContent = true;
        };
        
        this.appendChild = function (view) {
            if (!(view instanceof View)) {
                throw new Error("Child views need to be a view.");
            }
            view.parent = this;
            children.push(view);
            this.dirtyContent = true;
        };
        
        this.removeChild = function (view) {
            if (!(view instanceof View)) {
                throw new Error("Child views need to be a view.");
            }
            
            var referenceIndex = children.indexOf(view);
            
            if (referenceIndex === -1) {
                throw new Error("Couldn't find reference view.");
            }
            
            view.parent = this;
            children.splice(referenceIndex, 1);
            this.dirtyContent = true;
        };
        
        this.draw = function (context, renderLeft, renderTop, renderWidth, renderHeight) {
            var child;
            var top = this.y;
            var left = this.x;
            var width = this.width;
            var height = this.height;
            var bottom = top + height;
            var right = left + width;
            var parent = this.parent || this;
            
            renderLeft = typeof renderLeft === "number" ? renderLeft : left;
            renderTop = typeof renderTop === "number" ? renderTop : top;
            renderWidth = typeof renderWidth === "number" ? renderWidth : width;
            renderHeight = typeof renderHeight === "number" ? renderHeight : height;
            
            var renderBottom = renderTop + renderHeight;
            var renderRight = renderLeft + renderWidth;
            
            top = Math.max(top, renderTop);
            left = Math.max(left, renderLeft);
            bottom = Math.min(bottom, renderBottom);
            right = Math.min(right, renderRight);
            width = right - left;
            height = bottom - top;
            
            if (width > 0 && height > 0) {
                context.save();
                
                for (var x = 0; x < behaviors.length; x++) {
                    if (typeof behaviors[x].draw === "function") {
                        behaviors[x].draw(context, this);
                    }
                    if (typeof behaviors[x].update === "function") {
                        behaviors[x].update(this);
                    }
                }
                
                for (var x = 0; x < children.length; x++) {
                    child = children[x];
                    child.draw(context, left, top, width, height);
                }
                
                context.restore();
            }
            
            lastLeft = this.left;
            lastTop = this.top;
            lastWidth = this.width;
            lastHeight = this.height;
            
            this.dirtyContent = false;
            this.dirtyPlacement = false;
        };
        
        this.drawPlacement = function (context) {
            if (parent !== null) {
                parent.draw(context, lastLeft, lastTop, lastWidth, lastHeight);
                parent.draw(context, this.left, this.top, this.width, this.height);
                parent.drawPlacement(context);
            }
        };
        
        this.calculateTopPosition = function () {
            if (parent === null) {
                return 0;
            }
            return parent.calculateTopPosition() + top;
        };
        
        this.calculateLeftPosition = function () {
            if (parent === null) {
                return 0;
            }
            return parent.calculateLeftPosition() + left;
        };
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