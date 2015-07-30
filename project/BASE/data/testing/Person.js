BASE.namespace("BASE.data.testing");

BASE.data.testing.Person = function () {
    var self = this;
    self.id = null;
    self.humanoidType = 0;
    self.firstName = null;
    self.lastName = null;
    self.age = null;
    self.hrAccount = null;
    self.dateOfBirth = null;
    self.placeOfBirth = null;
    self.addresses = [];
    self.phoneNumbers = [];
    self.permissions = [];
};