BASE.require([
    "BASE.query.ArrayVisitor",
    "BASE.async.Future",
    "BASE.async.Task",
    "BASE.query.Provider"
], function () {
    BASE.namespace("BASE.query");
    
    var ArrayVisitor = BASE.query.ArrayVisitor;
    var Future = BASE.async.Future;
    
    BASE.query.ArrayProvider = (function (Super) {
        var ArrayProvider = function (array) {
            var self = this;
            BASE.assertNotGlobal(self);
            
            Super.call(self, array);
            
            self.toArray = function (queryable) {
                return new Future(function (setValue, setError) {
                    var visitor = new ArrayVisitor();
                    
                    var query = queryable.getQuery();
                    
                    var filter = null;
                    var sort = null;
                    var skip = query.skip.children[0].value;
                    var take = query.take.children[0].value;
                    var results = null;
                    
                    filter = visitor.parse(query.where);
                    sort = visitor.parse(query.orderBy);
                    
                    results = array.filter(filter);
                    results = results.sort(sort);
                    
                    if (take === Infinity) {
                        take = undefined;
                    } else {
                        take = skip + take;
                    }
                    
                    results = results.slice(skip, take);
                    
                    setTimeout(function () {
                        setValue(results);
                    }, 0);
                });
            };
            
            self.execute = self.toArray;
        };
        
        BASE.extend(ArrayProvider, Super);
        
        return ArrayProvider;
    }(BASE.query.Provider));

});