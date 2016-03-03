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
        
        this.x = 0;
        this.y = 0;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.rootView = rootView;
        this.timer = new Timer();
        this.followView = followView;
        this.canvas = canvas;
        
        if (!canvas || !rootView || !followView) {
            throw new Error("All arguments are expected.");
        }
        
        Animation.setAnimationManager(new AnimationManager(this.timer));
        
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
            
            self.rootView.draw(self.context);
            
            gameLoopAnimation.observe("tick", function () {
                self.draw(self.context);
            });
            
            self.timer.play();
        };
        
        initialize();
    };
    
    BASE.canvas.FollowCamera.prototype.centerFollowedView = function () {
        var centerLeft = (this.canvas.width / 2) - (this.followView.width / 2);
        var centerTop = (this.canvas.height / 2) - (this.followView.height / 2);
        
        var left = this.followView.x;
        var top = this.followView.y;
        
        this.top = top - centerTop;
        this.left = left - centerLeft;
    };
    
    BASE.canvas.FollowCamera.prototype.withinBounds = function () {
        var left = this.left;
        var top = this.top;
        
        var right = Math.min(left + this.width, this.rootView.width);
        var bottom = Math.min(top + this.height, this.rootView.height);
        
        left = right - this.width;
        top = bottom - this.height;
        
        this.left = Math.floor(left > 0 ? left : 0);
        this.top = Math.floor(top > 0 ? top : 0);
    };
    
    BASE.canvas.FollowCamera.prototype.findDirtyViews = function (view, dirtyType, dirtyViews) {
        var children = view.children;
        
        if (view[dirtyType]) {
            dirtyViews.push(view);
        }
        
        for (var x = 0; x < children.length; x++) {
            this.findDirtyViews(children[x], dirtyType, dirtyViews);
        }
      
    };
    
    BASE.canvas.FollowCamera.prototype.draw = function (context) {
        
        var x = 0;
        var y = 0;
        var width = 0;
        var height = 0;
        var right = 0;
        var bottom = 0;
        var view;
        
        var dirtyViews = [];
        this.findDirtyViews(this.rootView, "dirty", dirtyViews);
        
        if (dirtyViews.length > 0) {
            //for (var index = 0; index < dirtyViews.length; index++) {
            //    var view = dirtyViews[index];
            //    x = Math.min(view.lastX, view.x, x);
            //    y = Math.min(view.lastY, view.y, y);
            
            //    right = Math.max(view.lastWidth + view.lastX, view.width + view.x, right);
            //    bottom = Math.max(view.lastHeight + view.lastY, view.height + view.y, bottom);
            
            //}
            this.scrollView.draw(context);
        }
        
        this.centerFollowedView();
        this.withinBounds();
        
    };

});



