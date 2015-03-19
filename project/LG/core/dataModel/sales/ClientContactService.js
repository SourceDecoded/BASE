BASE.require([
    "BASE.async.Fulfillment",
    "BASE.collections.Hashmap",
    "LG.core.dataModel.sales.Edm",
    "BASE.data.responses.AddedResponse",
    "BASE.data.responses.ErrorResponse",
    "BASE.data.utils",
    "LG.core.dataModel.core.PersonPhoneNumber",
    "LG.core.dataModel.core.PersonAddress",
    "LG.core.dataModel.core.PersonEmailAddress",
    "LG.core.dataModel.core.Person",
    "LG.core.dataModel.sales.Client",
    "LG.core.dataModel.core.PersonAddress"
], function () {

    BASE.namespace("LG.core.dataModel.sales");

    var Future = BASE.async.Future;
    var Hashmap = BASE.collections.Hashmap;
    var Edm = LG.core.dataModel.sales.Edm;
    var Fulfillment = BASE.async.Fulfillment;
    var AddedResponse = BASE.data.responses.AddedResponse;
    var ErrorResponse = BASE.data.responses.ErrorResponse;
    var convertDto = BASE.data.utils.convertDtoToJavascriptEntity;
    var Client = LG.core.dataModel.sales.Client;
    var Person = LG.core.dataModel.core.Person;
    var EmailAddress = LG.core.dataModel.core.PersonEmailAddress;
    var PhoneNumber = LG.core.dataModel.core.PersonPhoneNumber;
    var Address = LG.core.dataModel.core.PersonAddress;
    var ClientContactPersonRole = LG.core.dataModel.sales.ClientContactPersonRole;

    LG.core.dataModel.sales.ClientContactService = function (rpcService, salesAppUserRoleId) {
        var self = this;
        var edm = new Edm();

        var entityHash = null;
        var entityFulfullment = null;

        var execute = function () {

            var postData = {};
            var entities = entityHash.getValues();
            var clientContact = entityHash.get(LG.core.dataModel.sales.ClientContactPersonRole);
            var person = entityHash.get(LG.core.dataModel.core.Person);
            var phoneNumber = null;
            var emailAddress = null;
            var address = null;

            postData.SalesAppUserPersonRoleId = salesAppUserRoleId;
            postData.ClientId = clientContact.clientId;
            postData.Type = clientContact.type;
            postData.Title = clientContact.title;

            if (person) {
                postData.FirstName = person.firstName;
                postData.LastName = person.lastName;
                phoneNumber = person.phoneNumbers[0];
                emailAddress = person.emailAddresses[0];
                address = person.addresses[0];
            }

            if (phoneNumber) {
                postData.PhoneNumber = phoneNumber.areaCode + phoneNumber.lineNumber;
            }

            if (emailAddress) {
                postData.EmailAddress = emailAddress.address;
            }

            if (address) {
                postData.Street1 = address.street1;
                postData.Street2 = address.street2;
                postData.City = address.city;
                postData.State = address.state;
                postData.Zip = address.zip;
                postData.Country = address.country;
                postData.County = address.county;
            }

            rpcService.setAppIdAndToken(56, localStorage.token);
            rpcService.addClientContact(postData).then(function (response) {
                var data = response.data.Data;

                if (data.length !== entityHash.getValues().length) {
                    throw new Error("The amount of entities saved with the ClientContactService do not match those returned from the server. It may not matter ;)");
                }

                var remotePersonDto = data.filter(function (item) {
                    return item._type === "Person";
                })[0];

                var remoteClientContactDto = data.filter(function (item) {
                    return item._type === "ClientContactPersonRole";
                })[0];

                var remoteEmailAddressDto = data.filter(function (item) {
                    return item._type === "PersonEmailAddress";
                })[0];

                var remotePhoneNumberDto = data.filter(function (item) {
                    return item._type === "PersonPhoneNumber";
                })[0];

                var remoteAddressDto = data.filter(function (item) {
                    return item._type === "PersonAddress";
                })[0];

                var clientContact = convertDto(ClientContactPersonRole, remoteClientContactDto);

                var clientContactFulfillment = entityFulfullment.get(ClientContactPersonRole);
                var clientContactResponse = new AddedResponse("Successfully Added", clientContact);

                clientContactFulfillment.setValue(clientContactResponse);

                if (remotePersonDto) {
                    var person = convertDto(Person, remotePersonDto);
                    var personFulfillment = entityFulfullment.get(Person);
                    var personResponse = new AddedResponse("Successfully Added", person);

                    personFulfillment.setValue(personResponse);
                }

                if (remotePhoneNumberDto) {
                    var phoneNumber = convertDto(PhoneNumber, remotePhoneNumberDto);
                    var phoneNumberFulfillment = entityFulfullment.get(PhoneNumber);
                    var phoneNumberResponse = new AddedResponse("Successfully Added", phoneNumber);

                    phoneNumberFulfillment.setValue(phoneNumberResponse);
                }

                if (remoteEmailAddressDto) {
                    var emailAddress = convertDto(EmailAddress, remoteEmailAddressDto);
                    var emailAddressFulfillment = entityFulfullment.get(EmailAddress);
                    var emailAddressResponse = new AddedResponse("Successfully Added", emailAddress);

                    emailAddressFulfillment.setValue(emailAddressResponse);
                }

                if (remoteAddressDto) {
                    var address = convertDto(Address, remoteAddressDto);
                    var addressFulfillment = entityFulfullment.get(Address);
                    var addressResponse = new AddedResponse("Successfully Added", address);

                    addressFulfillment.setValue(addressResponse);
                }

            }).ifError(function (error) {

                var errorResponse = convertDto(ErrorResponse, JSON.parse(error.xhr.response));

                var clientContactFulfillment = entityFulfullment.get(ClientContactPersonRole);

                clientContactFulfillment.setError(errorResponse);

                var personFulfillment = entityFulfullment.get(Person);
                var phoneNumberFulfillment = entityFulfullment.get(PhoneNumber);
                var emailAddressFulfillment = entityFulfullment.get(EmailAddress);
                var addressFulfillment = entityFulfullment.get(Address);
     
                if (personFulfillment) {
                    personFulfillment.setError(errorResponse);
                }

                if (phoneNumberFulfillment) {
                    phoneNumberFulfillment.setError(errorResponse);
                }

                if (emailAddressFulfillment) {
                    emailAddressFulfillment.setError(errorResponse);
                }

                if (addressFulfillment) {
                    addressFulfillment.setError(errorResponse);
                }
            });

        };

        self.startTransaction = function () {
            entityHash = new Hashmap();
            entityFulfullment = new Hashmap();
        };

        self.endTransaction = function () {
            execute();
        };

        self.add = function (entity) {
            var fulfillment = new Fulfillment();
            entityHash.add(entity.constructor, entity);
            entityFulfullment.add(entity.constructor, fulfillment);
            return fulfillment;
        };

        self.update = function (entity, updates) {
            throw new Error("This service cannot update.");
        };

        self.remove = function (entity) {
            throw new Error("This service cannot remove.");
        };

        self.getSourcesOneToOneTargetEntity = function (sourceEntity, relationship) {
            throw new Error("This service cannot query.");
        };

        self.getTargetsOneToOneSourceEntity = function (targetEntity, relationship) {
            throw new Error("This service cannot query.");
        };

        self.getSourcesOneToManyQueryProvider = function (sourceEntity, relationship) {
            throw new Error("This service cannot query.");
        };

        self.getTargetsOneToManySourceEntity = function (targetEntity, relationship) {
            throw new Error("This service cannot query.");
        };

        self.getSourcesManyToManyQueryProvider = function (sourceEntity, relationship) {
            throw new Error("This service cannot query.");
        };

        self.getTargetsManyToManyQueryProvider = function (targetEntity, relationship) {
            throw new Error("This service cannot query.");
        };

        self.getQueryProvider = function (Type) {
            throw new Error("This service cannot query.");
        };

        self.asQueryable = function (Type) {
            throw new Error("This service cannot query.");
        };

        self.getEdm = function () {
            return edm;
        };

        self.supportsType = function (Type) {
            return true;
        };

        self.initialize = function () {
            return Future.fromResult();
        };

        self.dispose = function () {
            return Future.fromResult();
        };

        self.createHook = function (Type) {
            throw new Error("This future doesn't");
        };

    };

});