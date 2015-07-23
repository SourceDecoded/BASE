var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");

BASE.require([
    "BASE.collections.Hashmap"
], function () {
    var Hashmap = BASE.collections.Hashmap;
    
    exports["BASE.collections.Hashmap: Object key and falsy value."] = function () {
        var hashmap = new Hashmap();
        
        var emptyStringKey = {};
        var zeroKey = {};
        var falseKey = {};
        
        hashmap.add(emptyStringKey, "");
        hashmap.add(zeroKey, 0);
        hashmap.add(falseKey, false);
        
        assert.equal(hashmap.get(emptyStringKey), "");
        assert.equal(hashmap.get(zeroKey), 0);
        assert.equal(hashmap.get(falseKey), false);
    };
    
    exports["BASE.collections.Hashmap: Add value with Object key check for key then remove value and check for key."] = function () {
        
        var hashmap = new Hashmap();
        var key = {};
        
        hashmap.add(key, 0);
        
        assert.equal(hashmap.get(key), 0);
        assert.equal(hashmap.hasKey(key), true);
        
        hashmap.remove(key);
        
        assert.equal(hashmap.get(key), null);
        assert.equal(hashmap.hasKey(key), false);

    };
    
    exports["BASE.collections.Hashmap: Add value with string and number as the key check for key then remove value and check for key."] = function () {
        
        var hashmap = new Hashmap();
        var key1 = "string";
        var key2 = 0;
        
        hashmap.add(key1, "string");
        hashmap.add(key2, 0);
        
        assert.equal(hashmap.get(key1), "string");
        assert.equal(hashmap.hasKey(key1), true);
        
        assert.equal(hashmap.get(key2), 0);
        assert.equal(hashmap.hasKey(key2), true);
        
        hashmap.remove(key1);
        hashmap.remove(key2);
        
        assert.equal(hashmap.get(key1), null);
        assert.equal(hashmap.hasKey(key1), false);
        assert.equal(hashmap.get(key2), null);
        assert.equal(hashmap.hasKey(key2), false);

    };
    
    exports["BASE.collections.Hashmap: getValues, getKeys."] = function () {
        
        var hashmap = new Hashmap();
        var key1 = {};
        var key2 = {};

        hashmap.add(key1, "value1");
        hashmap.add(key2, "value2");

        var values = hashmap.getValues();

        assert.equal(values[0], "value1");
        assert.equal(values[1], "value2");

        hashmap.remove(key1);
        hashmap.remove(key2);

        values = hashmap.getValues();

        assert.equal(values.length, 0);
    };

});