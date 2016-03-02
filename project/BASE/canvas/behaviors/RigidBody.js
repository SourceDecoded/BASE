BASE.namespace("BASE.canvas.behaviors");

BASE.canvas.behaviors.RigidBody = function () {
    this.position = {
        x: 0,
        y: 0
    };
    
    this.previousPosition = {
        x: 0,
        y: 0
    };
    
    this.force = {
        x: 0,
        y: 0
    }
    
    this.drag = {
        x: 0,
        y: 0
    };
    
    this.torque = {
        x: 0,
        y: 0
    };
    
    this.previousAngle = 0;
    this.angle = 0;
    this.angleVelocity = 0;
    this.density = 0.001;
    this.area = 0;
    this.mass = 0;
};