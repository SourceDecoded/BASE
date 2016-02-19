BASE.require(["BASE.collections.Hashmap"], function() {
    var Hashmap = BASE.collections.Hashmap;

    if (!Array.prototype.union) {
        var value = {
            enumerable: false,
            configurable: true,
            value: function(array) {

                var hashmap = new Hashmap();
                var add = function(value) {
                    hashmap.add(value, value);
                };

                this.forEach(add);
                array.forEach(add);

                return hashmap.getValues();
            }
        };


         if (Object.defineProperty) {
            //https://stackoverflow.com/questions/4819693/working-around-ie8s-broken-object-defineproperty-implementation
            try { Object.defineProperty(Array.prototype, 'union', value); }
            catch (e) { };
        }
        if (!Array.prototype.union) {
            Array.prototype.union = value.value;
        }
    }
});