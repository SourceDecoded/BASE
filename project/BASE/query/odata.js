BASE.require([
    "BASE.query.ExpressionBuilder",
    "BASE.query.ODataVisitor"
], function () {

    BASE.namespace("BASE.query");

    var ODataVisitor = BASE.query.ODataVisitor;

    BASE.query.odata = {
        toString: function (queryable) {
            var expression = queryable.getExpression();
            var parser = new ODataVisitor();

            var where = "";
            var take = "";
            var skip = "";
            var orderBy = "";

            if (expression.where) {
                where = parser.parse(expression.where);
            }

            if (expression.skip) {
                skip = parser.parse(expression.skip);
                atIndex = expression.skip.children[0].value;
            }

            if (expression.take) {
                take = parser.parse(expression.take);
                defaultTake = expression.take.children[0].value;
            }

            if (expression.orderBy) {
                orderBy = parser.parse(expression.orderBy);
            }

            return where + skip + take + orderBy;
        }
    };

});