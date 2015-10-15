BASE.require([
    "BASE.collections.Hashmap",
    "LG.core.dataModel.sales.Client",
    "LG.core.dataModel.sales.Opportunity",
    "LG.core.dataModel.sales.OpportunityStatus",
    "LG.core.dataModel.sales.ClientContactPersonRole",
    "LG.core.dataModel.sales.ClientAddress",
    "LG.core.dataModel.sales.ClientUserSetting",
    "LG.core.dataModel.core.Person",
    "LG.core.dataModel.core.PersonPhoneNumber",
    "BASE.data.DataContext",
    "BASE.data.utils",
    "BASE.async.Task",
    "BASE.async.Future"
], function () {
    
    BASE.namespace("LG.core.dataModel.sales");
    
    var Hashmap = BASE.collections.Hashmap;
    var Future = BASE.async.Future;
    var Task = BASE.async.Task;
    
    var Client = LG.core.dataModel.sales.Client
    var Opportunity = LG.core.dataModel.sales.Opportunity;
    var OpportunityStatus = LG.core.dataModel.sales.OpportunityStatus;
    var ClientContactPersonRole = LG.core.dataModel.sales.ClientContactPersonRole;
    var ClientAddress = LG.core.dataModel.sales.ClientAddress;
    var PersonPhoneNumber = LG.core.dataModel.core.PersonPhoneNumber;
    var Person = LG.core.dataModel.core.Person;
    var flattenEntity = BASE.data.utils.flattenEntity;
    var DataContext = BASE.data.DataContext;
    var ClientUserSetting = LG.core.dataModel.sales.ClientUserSetting;
    
    var camelCase = function (str) {
        return str.substring(0, 1).toLowerCase() + str.substring(1);
    };
    
    LG.core.dataModel.sales.DenormalizedClientCreator = function (syncer) {
        var self = this;
        
        BASE.assertNotGlobal(self);
        
        var activeService = syncer.getActiveLocalService();
        var localService = syncer.getLocalService();
        
        var addedListeners = new Hashmap();
        var updatedListeners = new Hashmap();
        var removedListeners = new Hashmap();
        
        var addEntity = function (entity) {
            var handler = addedListeners.get(entity.constructor) || function () { };
            
            var clone = flattenEntity(entity, true);
            var dataContext = new DataContext(localService);
            clone = dataContext.loadEntity(clone);
            handler(clone, dataContext);
        };
        
        var updateEntity = function (entity) {
            var handler = updatedListeners.get(entity.constructor) || function () { };
            
            var clone = flattenEntity(entity, true);
            var dataContext = new DataContext(localService);
            clone = dataContext.loadEntity(clone);
            handler(clone, dataContext);
        };
        
        var removeEntity = function (entity) {
            var handler = removedListeners.get(entity.constructor) || function () { };
            
            var clone = flattenEntity(entity, true);
            var dataContext = new DataContext(localService);
            clone = dataContext.loadEntity(clone);
            handler(clone, dataContext);
        };
        
        // Watch for adding entities.
        activeService.observe().filter(function (event) {
            return event.type === "added" && addedListeners.hasKey(event.entity.constructor);
        }).map(function (event) {
            return event.entity;
        }).onEach(addEntity);
        
        // Watch for updating entities.
        activeService.observe().filter(function (event) {
            return event.type === "updated" && updatedListeners.hasKey(event.entity.constructor);
        }).map(function (event) {
            return event.entity;
        }).onEach(updateEntity);
        
        //Watch for removed entities.
        activeService.observe().filter(function (event) {
            return event.type === "removed" && removedListeners.hasKey(event.entity.constructor);
        }).map(function (event) {
            return event.entity;
        }).onEach(removeEntity);
        
        
        // Client
        var addedClient = function (client, dataContext) {
            client.load("denormalizedClient").then(function (denormalizedClient) {
                
                if (denormalizedClient === null) {
                    denormalizedClient = dataContext.denormalizedClients.createInstance();
                    denormalizedClient.client = client;
                }
                
                denormalizedClient.clientName = client.name;
                denormalizedClient.archived = false;
                denormalizedClient.save();
            });
        };
        
        var updatedClient = addedClient;
        
        var statusLock = Future.fromResult();
        // Status
        var addedStatus = function (status) {
            if (status.endDate === null) {
                status.load("opportunity").then(function (opportunity) {
                    opportunity.load("client").then(function (client) {
                        statusLock.then(function () {
                            statusLock = new Future(function (setValue) {
                                client.load("denormalizedClient").then(function (denormalizedClient) {
                                    denormalizedClient[camelCase(status.type) + "Count"] += 1;
                                    denormalizedClient.save().then(setValue);
                                });
                            }).then();
                        });
                    });
                });
            }
        };
        
        
        var updatedStatus = function (status) {
            if (status.endDate !== null) {
                status.load("opportunity").then(function (opportunity) {
                    opportunity.load("client").then(function (client) {
                        statusLock.then(function () {
                            statusLock = new Future(function (setValue) {
                                client.load("denormalizedClient").then(function (denormalizedClient) {
                                    denormalizedClient[camelCase(status.type) + "Count"] -= 1;
                                    denormalizedClient.save().then(setValue);
                                });
                            }).then();
                        });
                    });
                });
            }
        };
        
        var addedClientUserSetting = function (setting) {
            setting.load("client").then(function (client) {
                client.load("denormalizedClient").then(function (denormalizedClient) {
                    if (setting.displayState === "Archived") {
                        denormalizedClient.archived = true;
                    } else {
                        denormalizedClient.archived = false;
                    }
                    denormalizedClient.save();
                });
            });
        };
        
        //Client Address
        var addedClientAddress = function (clientAddress) {
            clientAddress.load("client").then(function (client) {
                client.load("denormalizedClient").then(function (denormalizedClient) {
                    denormalizedClient.longitude = clientAddress.longitude;
                    denormalizedClient.latitude = clientAddress.latitude;
                    denormalizedClient.save();
                });
            });
        };
        
        //PersonPhoneNumber for phone number.
        var addedPhoneNumber = function (phoneNumber, dataContext) {
            var personId = phoneNumber.personId;
            
            dataContext.clientContactPersonRoles.where(function (e) {
                return e.property("personId").isEqualTo(personId);
            }).firstOrDefault().then(function (clientContact) {
                if (clientContact !== null) {
                    clientContact.load("client").then(function (client) {
                        if (client !== null) {
                            client.load("denormalizedClient").then(function (denormalizedClient) {
                                denormalizedClient.phoneNumber = (phoneNumber.countryCode || "") + (phoneNumber.areaCode || "") + (phoneNumber.lineNumber || "");
                                denormalizedClient.save();
                            });
                        }
                    });
                }
            });
        };
        
        //Person for first and last name.
        var addedPerson = function (person, dataContext) {
            var personId = person.id
            dataContext.clientContactPersonRoles.where(function (e) {
                return e.property("personId").isEqualTo(personId);
            }).firstOrDefault().then(function (clientContact) {
                if (clientContact !== null && clientContact.type === "Primary") {
                    clientContact.load("client").then(function (client) {
                        if (client !== null) {
                            client.load("denormalizedClient").then(function (denormalizedClient) {
                                denormalizedClient.firstName = person.firstName || null;
                                denormalizedClient.lastName = person.lastName || null;
                                denormalizedClient.save();
                            });
                        }
                    });
                }
            });
        };
        
        // ClientContactPersonRole
        var addedClientContactPersonRole = function (clientContact, dataContext) {
            if (clientContact.endDate === null) {
                var task = new Task();
                
                task.add(clientContact.load("person"));
                task.add(clientContact.load("client"));
                task.start().whenAll(function () {
                    if (clientContact.person !== null && clientContact.client !== null && clientContact.type === "Primary") {
                        var person = clientContact.person;
                        var client = clientContact.client;
                        
                        clientContact.client.load("denormalizedClient").then(function (denormalizedClient) {
                            if (denormalizedClient === null) {
                                denormalizedClient = dataContext.denormalizedClients.createInstance();
                            }
                            
                            clientContact.person.phoneNumbers.asQueryable().where(function (e) {
                                return e.property("endDate").isEqualTo(null);
                            }).firstOrDefault().then(function (phoneNumber) {
                                if (phoneNumber !== null) {
                                    denormalizedClient.phoneNumber = (phoneNumber.countryCode || "") + (phoneNumber.areaCode || "") + (phoneNumber.lineNumber || "");
                                }
                                
                                denormalizedClient.firstName = person.firstName;
                                denormalizedClient.lastName = person.lastName;
                                denormalizedClient.save();
                            });
                        });
                    }
                });
            }
        };
        
        // Opportunity
        var addedOpportunity = function (opporturnity) {
            opporturnity.load("client").then(function (client) {
                client.opportunities.asQueryable().orderBy(function (e) {
                    return e.property("policyExpirationDate");
                }).take(1).firstOrDefault().then(function (opportunity) {
                    if (opportunity !== null) {
                        client.load("denormalizedClient").then(function (denormalizedClient) {
                            denormalizedClient.expiring = opportunity.policyExpirationDate;
                            denormalizedClient.save();
                        });
                    }
                });
            });
        };
        var updatedOppportunity = addedOpportunity;
        
        // Bind listeners by type.
        addedListeners.add(Client, addedClient);
        addedListeners.add(OpportunityStatus, addedStatus);
        addedListeners.add(ClientAddress, addedClientAddress);
        addedListeners.add(Opportunity, addedOpportunity);
        addedListeners.add(PersonPhoneNumber, addedPhoneNumber);
        addedListeners.add(Person, addedPerson);
        addedListeners.add(ClientContactPersonRole, addedClientContactPersonRole);
        addedListeners.add(ClientUserSetting, addedClientUserSetting);
        
        updatedListeners.add(Client, updatedClient);
        updatedListeners.add(OpportunityStatus, updatedStatus);
        updatedListeners.add(Opportunity, updatedOppportunity);
        updatedListeners.add(PersonPhoneNumber, addedPhoneNumber);
        updatedListeners.add(Person, addedPerson);
        updatedListeners.add(ClientContactPersonRole, addedClientContactPersonRole);
        updatedListeners.add(ClientUserSetting, addedClientUserSetting);
        
        
        syncer.addRemoteSyncTrigger(Client, "added", addEntity);
        syncer.addRemoteSyncTrigger(ClientContactPersonRole, "added", addEntity);
        syncer.addRemoteSyncTrigger(OpportunityStatus, "added", addEntity);
        syncer.addRemoteSyncTrigger(ClientAddress, "added", addEntity);
        syncer.addRemoteSyncTrigger(Opportunity, "added", addEntity);
        syncer.addRemoteSyncTrigger(PersonPhoneNumber, "added", addEntity);
        syncer.addRemoteSyncTrigger(Person, "added", addEntity);
        syncer.addRemoteSyncTrigger(ClientUserSetting, "added", addEntity);
        
        
        syncer.addRemoteSyncTrigger(Client, "updated", updateEntity);
        syncer.addRemoteSyncTrigger(ClientContactPersonRole, "updated", updateEntity);
        syncer.addRemoteSyncTrigger(OpportunityStatus, "updated", updateEntity);
        syncer.addRemoteSyncTrigger(Opportunity, "updated", updateEntity);
        syncer.addRemoteSyncTrigger(PersonPhoneNumber, "updated", updateEntity);
        syncer.addRemoteSyncTrigger(Person, "updated", updateEntity);
        syncer.addRemoteSyncTrigger(ClientUserSetting, "updated", updateEntity);
    };
});