BASE.namespace("BASE.canvas");

BASE.canvas.ImageLoader = function () {
    this.load = function (src) {
        return new BASE.async.Future(function (setValue, setError) {
            var image = new Image();
            
            image.onload = function () {
                setValue(image);
            };
            
            image.src = src;

        });
    };
};