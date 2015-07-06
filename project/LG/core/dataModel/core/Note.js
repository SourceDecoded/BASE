BASE.require(["Object"], function () {
    BASE.namespace("LG.core.dataModel.core");

    var _globalObject = this;

    LG.core.dataModel.core.Note = (function (Super) {
        var Note = function () {
            var self = this;
            if (self === _globalObject) {
                throw new Error("Note constructor invoked with global context.  Say new.");
            }

            Super.call(self);
            
            self["text"] = null;
            self["personCreatorId"] = null;
            self["personCreator"] = null;
            self["id"] = null;
                                                  

            return self;
        };

        BASE.extend(Note, Super);

        return Note;
    }(Object));
});