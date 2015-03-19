BASE.require([
    "BASE.data.Edm",
    "LG.core.dataModel.core.Person",
    "LG.core.dataModel.theGame.TheGameTeam",
    "LG.core.dataModel.theGame.TheGameTeamTour",
    "LG.core.dataModel.theGame.TheGameTeamPoint",
    "LG.core.dataModel.theGame.TheGameTeamName",
    "LG.core.dataModel.theGame.TheGameTeamToPerson",
    "LG.data.services.ODataService"
], function () {

    var ODataService = LG.data.services.ODataService;
    var Person = LG.core.dataModel.core.Person;
    var TheGameTeam = LG.core.dataModel.theGame.TheGameTeam;
    var TheGameTeamTour = LG.core.dataModel.theGame.TheGameTeamTour;
    var TheGameTeamPoint = LG.core.dataModel.theGame.TheGameTeamPoint;
    var TheGameTeamName = LG.core.dataModel.theGame.TheGameTeamName;
    var TheGameTeamToPerson = LG.core.dataModel.theGame.TheGameTeamToPerson;


    BASE.namespace("LG.core.dataModel.teamBuilder");

    LG.core.dataModel.teamBuilder.Service = function (edm, appId, token) {
        var self = this;

        var host = "https://api.leavitt.com";
        ODataService.call(self, edm, appId, token);

        var serverUrisToTypes = {
            "/Core/People": Person,
            "/TheGame/TheGameTeamToPersons": TheGameTeamToPerson,
            "/TheGame/TheGameTeamNames": TheGameTeamName,
            "/TheGame/TheGameTeamPoints": TheGameTeamPoint,
            "/TheGame/TheGameTeams": TheGameTeam,
            "/TheGame/TheGameTeamTours": TheGameTeamTour
        };

        Object.keys(serverUrisToTypes).forEach(function (key) {
            self.addEndPoint(serverUrisToTypes[key], host + key);
        });
    };

    BASE.extend(LG.core.dataModel.teamBuilder.Service, ODataService);

});