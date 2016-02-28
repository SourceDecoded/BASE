BASE.require([
    "BASE.canvas.Timer",
    "BASE.canvas.View",
    "BASE.web.animation.Animation",
    "BASE.web.animation.AnimationManager",
], function () {
    
    var Animation = BASE.web.animation.Animation;
    var Timer = BASE.canvas.Timer;
    var View = BASE.canvas.View;
    var AnimationManager = BASE.web.animation.AnimationManager;
    
    BASE.namespace("BASE.canvas");
    
    BASE.canvas.FollowCamera = function (canvas, rootView, followView) {
        var self = this;
        
        this.left = 0;
        this.top = 0;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.rootView = rootView;
        this.scrollView = new View();
        this.timer = new Timer();
        this.followView = followView;
        this.animationManager = new AnimationManager(this.timer);
        this.canvas = canvas;
        
        if (!canvas || !rootView || !followView) {
            throw new Error("All arguments are expected.");
        }
        
        this.scrollView.appendChild(this.rootView);
        this.scrollView.width = canvas.width;
        this.scrollView.height = canvas.height;
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
            
            self.scrollView.draw(self.context);
            
            gameLoopAnimation.observe("tick", function () {
                self.centerFollowedView();
                self.withinBounds();
                
                self.rootView.left = -self.left;
                self.rootView.top = -self.top;
                
                self.draw(self.context, self.scrollView);
            });
            
            self.timer.play();
        };
        
        initialize();
    };
    
    BASE.canvas.FollowCamera.prototype.centerFollowedView = function () {
        var centerTop = (this.scrollView.height / 2) - (this.followView.height / 2);
        var centerLeft = (this.scrollView.width / 2) - (this.followView.width / 2);
        
        var top = this.followView.calculateTopPosition() - this.rootView.top;
        var left = this.followView.calculateLeftPosition() - this.rootView.left;
        
        this.top = top - centerTop;
        this.left = left - centerLeft;
    };
    
    BASE.canvas.FollowCamera.prototype.withinBounds = function () {
        var left = this.left;
        var top = this.top;
        
        var right = Math.min(left + this.scrollView.width, this.rootView.width);
        var bottom = Math.min(top + this.scrollView.height, this.rootView.height);
        
        left = right - this.scrollView.width;
        top = bottom - this.scrollView.height;
        
        this.left = Math.floor(left > 0 ? left : 0);
        this.top = Math.floor(top > 0 ? top : 0);
    };
    
    BASE.canvas.FollowCamera.prototype.findRoot = function (view) {
        if (view.parent !== null) {
            return this.findRoot(view.parent);
        }
        
        return view;
    };
    
    BASE.canvas.FollowCamera.prototype.findDirtyViews = function (view, dirtyType, dirtyViews) {
        var children = view.children;
        
        for (var x = 0; x < children.length; x++) {
            this.findDirtyViews(children[x], dirtyType, dirtyViews);
        }
        
        if (view[dirtyType]) {
            dirtyViews.push(view);
        }
    };
    
    BASE.canvas.FollowCamera.prototype.draw = function (context, view) {
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



