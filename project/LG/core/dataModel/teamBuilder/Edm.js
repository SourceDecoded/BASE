BASE.require([
    "BASE.data.Edm",
    "LG.core.dataModel.core.Person",
    "LG.core.dataModel.theGame.TheGameTeam",
    "LG.core.dataModel.theGame.TheGameTeamTour",
    "LG.core.dataModel.theGame.TheGameTeamPoint",
    "LG.core.dataModel.theGame.TheGameTeamName",
    "LG.core.dataModel.theGame.TheGameTeamToPerson"
], function () {

    var Edm = BASE.data.Edm;
    var Person = LG.core.dataModel.core.Person;
    var TheGameTeam = LG.core.dataModel.theGame.TheGameTeam;
    var TheGameTeamTour = LG.core.dataModel.theGame.TheGameTeamTour;
    var TheGameTeamPoint = LG.core.dataModel.theGame.TheGameTeamPoint;
    var TheGameTeamName = LG.core.dataModel.theGame.TheGameTeamName;
    var TheGameTeamToPerson = LG.core.dataModel.theGame.TheGameTeamToPerson;

    BASE.namespace("LG.core.dataModel.teamBuilder");

    LG.core.dataModel.teamBuilder.Edm = function () {
        var self = this;

        Edm.call(self);

        self.addModel({
            type: Person,
            collectionName: "people",
            properties: {
                id: {
                    type: Integer,
                    primaryKey: true
                },
                firstName: {
                    type: String
                },
                lastName: {
                    type: String
                },
                middleName: {
                    type: String
                },
                dateOfBirth: {
                    type: DateTimeOffset
                },
                biography: {
                    type: String
                },
                dateCreated: {
                    type: DateTimeOffset
                },
                createdDate: {
                    type: DateTimeOffset
                },
                lastModifiedDate: {
                    type: DateTimeOffset
                },
                gender: {
                    type: String
                },
                theGameTeamToPersonId: {
                    type: Integer
                },
                theGameTeamToPerson: {
                    type: Person
                }
            }
        });

        self.addModel({
            type: TheGameTeamToPerson,
            collectionName: "theGameTeamToPersons",
            properties: {
                id: {
                    type: Integer,
                    primaryKey: true
                },
                personId: {
                    type: Integer,
                },
                TheGameTeamId: {
                    type: Integer,
                },
                startDate: {
                    type: DateTimeOffset
                },
                endDate: {
                    type: DateTimeOffset
                },
                createdDate: {
                    type: DateTimeOffset
                },
                lastModifiedDate: {
                    type: DateTimeOffset
                }
            }
        });

        self.addModel({
            type: TheGameTeamName,
            collectionName: "theGameTeamNames",
            properties: {
                id: {
                    type: Integer,
                    primaryKey: true
                },
                name: {
                    type: String
                },
                theGameTeamId: {
                    type: Integer
                },
                startDate: {
                    type: DateTimeOffset
                },
                endDate: {
                    type: DateTimeOffset
                },
                createdDate: {
                    type: DateTimeOffset
                },
                lastModifiedDate: {
                    type: DateTimeOffset
                }
            }
        });

        self.addModel({
            type: TheGameTeamPoint,
            collectionName: "theGameTeamPoints",
            properties: {
                id: {
                    type: Integer,
                    primaryKey: true
                },
                value: {
                    type: Decimal
                },
                theGameTeamId: {
                    type: Integer
                },
                startDate: {
                    type: DateTimeOffset
                },
                endDate: {
                    type: DateTimeOffset
                },
                createdDate: {
                    type: DateTimeOffset
                },
                lastModifiedDate: {
                    type: DateTimeOffset
                }
            }
        });


        self.addModel({
            type: TheGameTeam,
            collectionName: "theGameTeams",
            properties: {
                id: {
                    type: Integer,
                    primaryKey: true
                },
                gameVersionNumber: {
                    type: Decimal
                },
                startDate: {
                    type: DateTimeOffset
                },
                endDate: {
                    type: DateTimeOffset
                },
                createdDate: {
                    type: DateTimeOffset
                },
                lastModifiedDate: {
                    type: DateTimeOffset
                }
            }
        });

        self.addModel({
            type: TheGameTeamTour,
            collectionName: "theGameTeamTours",
            properties: {
                id: {
                    type: Integer,
                    primaryKey: true
                },
                theGameTour: {
                    type: String
                },
                theGameTeamId: {
                    type: Integer
                },
                startDate: {
                    type: DateTimeOffset
                },
                endDate: {
                    type: DateTimeOffset
                },
                createdDate: {
                    type: DateTimeOffset
                },
                lastModifiedDate: {
                    type: DateTimeOffset
                }
            }
        });

        self.addOneToMany({
            type: TheGameTeam,
            hasKey: "id",
            hasMany: "names",
            ofType: TheGameTeamName,
            withKey: "id",
            withForeignKey: "theGameTeamId",
            withOne: "theGameTeam"
        });

        self.addOneToMany({
            type: TheGameTeam,
            hasKey: "id",
            hasMany: "people",
            ofType: TheGameTeamToPerson,
            withKey: "id",
            withForeignKey: "theGameTeamId",
            withOne: "theGameTeam"
        });

        self.addOneToMany({
            type: Person,
            hasKey: "id",
            hasMany: "theGameTeamToPersons",
            ofType: TheGameTeamToPerson,
            withKey: "id",
            withForeignKey: "personId",
            withOne: "person"
        });

        self.addOneToMany({
            type: TheGameTeam,
            hasKey: "id",
            hasMany: "tours",
            ofType: TheGameTeamTour,
            withKey: "id",
            withForeignKey: "theGameTeamId",
            withOne: "theGameTeam"
        });

        self.addOneToMany({
            type: TheGameTeam,
            hasKey: "id",
            hasMany: "points",
            ofType: TheGameTeamPoint,
            withKey: "id",
            withForeignKey: "theGameTeamId",
            withOne: "theGameTeam"
        });

    };

    BASE.extend(LG.core.dataModel.teamBuilder.Edm, Edm);
});