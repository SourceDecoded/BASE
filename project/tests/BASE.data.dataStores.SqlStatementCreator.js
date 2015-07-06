var assert = require("assert");

require("../BASE.js");
BASE.require.loader.setRoot("./");


BASE.require([
    "BASE.data.Edm",
    "BASE.data.dataStores.SqlStatementCreator",
    "BASE.collections.Hashmap"
], function () {
    var Edm = BASE.data.Edm;
    var Hashmap = BASE.collections.Hashmap;
    var SqlStatementCreator = BASE.data.dataStores.SqlStatementCreator;
    
    var typesMap = new Hashmap();
    typesMap.add(Double, "REAL");
    typesMap.add(Float, "REAL");
    typesMap.add(Integer, "INTEGER");
    typesMap.add(Byte, "INTEGER");
    typesMap.add(Binary, "INTEGER");
    typesMap.add(Boolean, "NUMERIC");
    typesMap.add(Date, "NUMERIC");
    typesMap.add(DateTimeOffset, "NUMERIC");
    typesMap.add(Decimal, "NUMERIC");
    typesMap.add(String, "TEXT");
    
    var Entity = function () {
        this.string = null;
        this.integer = null;
        this.decimal = null;
        this.float = null;
        this.date = null;
        this.boolean = null;
        this.binary = null;
        this.byte = null;
        this.dateTimeOffset = null;
    };
    
    var edm = new Edm();
    edm.addModel({
        type: Entity,
        collectionName: "entities",
        properties: {
            string: {
                type: String
            },
            integer: {
                type: Integer,
                primaryKey: true
            },
            decimal: {
                type: Decimal
            },
            float: {
                type: Float
            },
            date: {
                type: Date
            },
            boolean: {
                type: Boolean
            },
            binary: {
                type: Binary
            },
            byte: {
                type: Byte
            },
            dateTimeOffset: {
                type: DateTimeOffset
            }
        }
    });
    
    exports["BASE.data.dataStores.SqlStatementCreator: Create table clause."] = function () {
        var sqlWriter = new SqlStatementCreator(edm, typesMap);
        var createTableSyntax = sqlWriter.createTableClause(edm.getModelByType(Entity));
        
        assert.equal(createTableSyntax, 
            "CREATE TABLE `entities`(\n\t" +
            "`string` TEXT, \n\t" +
            "`integer` INTEGER PRIMARY KEY, \n\t" +
            "`decimal` NUMERIC, \n\t" +
            "`float` REAL, \n\t" +
            "`date` NUMERIC, \n\t" +
            "`boolean` NUMERIC, \n\t" +
            "`binary` INTEGER, \n\t" +
            "`byte` INTEGER, \n\t" +
            "`dateTimeOffset` NUMERIC" +
            "\n)"
        );
    };
    
    exports["BASE.data.dataStores.SqlStatementCreator: Insert statement."] = function () {
        var sqlWriter = new SqlStatementCreator(edm, typesMap);
        var entity = new Entity();
        entity.string = "Some Text";
        entity.integer = 1;
        entity.double = 3.14;
        entity.float = 1.2345;
        entity.date = new Date();
        entity.dateTimeOffset = new Date();
        entity.byte = 0;
        entity.boolean = true;
        
        var insertStatement = sqlWriter.createInsertStatement(entity);
        assert.equal(insertStatement.statement, "INSERT INTO `entities` (`string`, `integer`, `float`, `date`, `boolean`, `byte`, `dateTimeOffset`) VALUES (?, ?, ?, ?, ?, ?, ?)");
    };
    
    exports["BASE.data.dataStores.SqlStatementCreator: Update statement."] = function () {
        var sqlWriter = new SqlStatementCreator(edm, typesMap);
        var entity = new Entity();
        entity.string = "Some Text";
        entity.integer = 1;
        entity.double = 3.14;
        entity.float = 1.2345;
        entity.date = new Date();
        entity.dateTimeOffset = new Date();
        entity.byte = 0;
        entity.boolean = true;
        
        var updateStatement = sqlWriter.createUpdateStatement(entity, entity);
        assert.equal(updateStatement.statement, "UPDATE `entities` SET `string` = ?, `integer` = ?, `decimal` = ?, `float` = ?, `date` = ?, `boolean` = ?, `binary` = ?, `byte` = ?, `dateTimeOffset` = ? WHERE `integer` = ?");
    };

    exports["BASE.data.dataStores.SqlStatementCreator: Delete statement."] = function () {
        var sqlWriter = new SqlStatementCreator(edm, typesMap);
        var entity = new Entity();
        entity.string = "Some Text";
        entity.integer = 1;
        entity.double = 3.14;
        entity.float = 1.2345;
        entity.date = new Date();
        entity.dateTimeOffset = new Date();
        entity.byte = 0;
        entity.boolean = true;
        
        var deleteStatement = sqlWriter.createDeleteStatement(entity);
        assert.equal(deleteStatement.statement, "DELETE FROM `entities` WHERE `integer` = ?");
    };


});