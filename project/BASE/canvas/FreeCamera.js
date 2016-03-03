BASE.require([
    "BASE.canvas.Timer",
    "BASE.web.animation.Animation",
    "BASE.web.animation.AnimationManager",
], function () {
    
    var Animation = BASE.web.animation.Animation;
    var Timer = BASE.canvas.Timer;
    var AnimationManager = BASE.web.animation.AnimationManager;
    
    BASE.namespace("BASE.canvas");
    
    BASE.canvas.FreeCamera = function (canvas, rootView) {
        var rootViewCanvas = document.createElement("canvas");
        rootViewCanvas.width = rootView.width;
        rootViewCanvas.height = rootView.height;
        var self = this;
        
        this.left = 0;
        this.top = 0;
        this.width = canvas.width;
        this.height = canvas.height;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.rootView = rootView;
        this.timer = new Timer();
        this.animationManager = new AnimationManager(this.timer);
        this.rootViewContext = rootViewCanvas.getContext("2d");
        
        if (!canvas || !rootView) {
            throw new Error("All arguments are expected.");
        }
        
        Animation.prototype.animationManager = this.animationManager;
        
        var initialize = function () {
            var gameLoopAnimation = new Animation({
                target: {},
                properties: {
                    second: {
                        from: 0,
                        to: 0
                    }
                },
                duration: 1000
            });
            
            gameLoopAnimation.repeat = Infinity;
            gameLoopAnimation.play();
            
            self.rootView.draw(self.rootViewContext);
            
            gameLoopAnimation.observe("tick", function () {
                self.withinBounds();
                self.draw(self.rootViewContext, self.rootView);
                var imageData = self.rootViewContext.getImageData(self.left, self.top, self.width, self.height);
                self.context.putImageData(imageData, 0, 0);
            });
            
            self.timer.play();
        };
        
        initialize();
    };
    
    BASE.canvas.FreeCamera.prototype.withinBounds = function () {
        var left = this.left;
        var top = this.top;
        
        var right = Math.min(this.left + this.width, this.rootView.width);
        var bottom = Math.min(this.top + this.height, this.rootView.height);
        
        left = right - this.width;
        top = bottom - this.height;
        
        this.left = parseInt(left > 0 ? left : 0);
        this.top = parseInt(top > 0 ? top : 0);
    };
    
    BASE.canvas.FreeCamera.prototype.findRoot = function (view) {
        if (view.parent !== null) {
            return this.findRoot(view.parent);
        }
        
        return view;
    };
    
    BASE.canvas.FreeCamera.prototype.findDirtyViews = function (view, dirtyType, dirtyViews) {
        var children = view.children;
        
        for (var x = 0; x < children.length; x++) {
            this.findDirtyViews(children[x], dirtyType, dirtyViews);
        }
        
        if (view[dirtyType]) {
            dirtyViews.push(view);
        }
    };
    
    BASE.canvas.FreeCamera.prototype.draw = function (context, view) {
        var root = this.findRoot(view);
        var dirtyContentViews = [];
        var dirtyPlacementViews = [];
        var view;
        var x;
        
        this.findDirtyViews(root, "dirtyPlacement", dirtyPlacementViews);
        this.findDirtyViews(root, "dirtyContent", dirtyContentViews);
        
        for (x = 0; x < dirtyPlacementViews.length; x++) {
            view = dirtyPlacementViews[x];
            if (view.dirtyPlacement) {
                view.drawPlacement(context);
            }
        }
        
        for (x = 0; x < dirtyContentViews.length; x++) {
            view = dirtyContentViews[x];
            if (view.dirtyContent) {
                view.draw(context);
            }
        }
        
    };

});



