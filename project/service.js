require("./BASE.js");

BASE.require.loader.setRoot("./");

BASE.require([
	"node.postgreSql.Service",
	"node.postgreSql.Database",
	"BASE.data.Edm"
], function(){

	var Service = node.postgreSql.Service;
	var Database = node.postgreSql.Database;
	
	var edm = new BASE.data.Edm();

	var Person = function(){
	    this.id = null;
		this.firstName = null;
		this.lastName = null;
	};
	
	edm.addModel({
		type: Person,
		collectionName: "people",
		properties:{
			id: {
				type: Integer,
				primaryKey: true,
				autoIncrement: true
			},
			firstName: {
				type: String,
			},
			lastName: {
				type: String,
			}
		}
	});
	
	var database = new Database({
		username: "postgres",
		password: "adminadmin",
		name: "SpotOffer",
		edm: edm
	});
	
	var service = new Service(database);
	
	var person = new Person();
	person.firstName = "Ben";
	person.lastName = "Howe";
	
	//service.add(Person, person).then(function(){
		//console.log("Added");
	//});
	//person.id = 1;
	//service.update(Person, person, {firstName: "LeAnn"}).try();
	//person.id = 2;
	//service.remove(Person, person).try();
	
	
	service.asQueryable(Person).where(function(expBuilder){
		return expBuilder.property("firstName").isEqualTo("Nora");
	}).toArray().then(function(array){
		console.log(array[0]);
	});
	
});