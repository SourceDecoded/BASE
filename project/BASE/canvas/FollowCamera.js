BASE.require([
    "BASE.canvas.Timer",
    "BASE.canvas.View",
    "BASE.canvas.Rect",
    "BASE.web.animation.Animation",
    "BASE.web.animation.AnimationManager",
], function () {
    
    var Animation = BASE.web.animation.Animation;
    var Timer = BASE.canvas.Timer;
    var View = BASE.canvas.View;
    var AnimationManager = BASE.web.animation.AnimationManager;
    var Rect = BASE.canvas.Rect;
    
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
        this.width = canvas.width;
        this.height = canvas.height;
        
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
            
            self.rootView.draw(self.context, self);
            
            gameLoopAnimation.observe("tick", function () {
                self.draw(self.context);
            });
            
            self.timer.play();
        };
        
        initialize();
    };
    
    BASE.canvas.FollowCamera.prototype.centerFollowedView = function () {
        var centerLeft = (this.width / 2) - (this.followView.width / 2);
        var centerTop = (this.height / 2) - (this.followView.height / 2);
        
        var x = this.followView.x;
        var y = this.followView.y;
        
        this.x = x - centerLeft;
        this.y = y - centerTop;
    };
    
    BASE.canvas.FollowCamera.prototype.withinBounds = function () {
        var x = this.x;
        var y = this.y;
        
        var right = Math.min(x + this.width, this.rootView.width);
        var bottom = Math.min(y + this.height, this.rootView.height);
        
        x = right - this.width;
        y = bottom - this.height;
        
        this.x = Math.floor(x > 0 ? x : 0);
        this.y = Math.floor(y > 0 ? y : 0);
        
    };
    
    BASE.canvas.FollowCamera.prototype.findDirtyViews = function (view, dirtyViews) {
        var children = view.children;
        dirtyViews = dirtyViews || [];
        
        if (view.dirty) {
            dirtyViews.push(view);
        }
        
        for (var x = 0; x < children.length; x++) {
            this.findDirtyViews(children[x], dirtyViews);
        }
        
        return dirtyViews;
    };
    
    
    BASE.canvas.FollowCamera.prototype.draw = function (context) {
        this.centerFollowedView();
        this.withinBounds();
        
        if (this.findDirtyViews(this.rootView).length > 0) {
            this.rootView.draw(context, this);
        }
        
    };

});



