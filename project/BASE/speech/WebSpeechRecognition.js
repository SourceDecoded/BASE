BASE.require([
    'jQuery',
    'BASE.async.Future',
    'BASE.async.Fulfillment',
    'BASE.util.Observable'
], function () {
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
    var observable = BASE.util.Observable;
    
    if (!SpeechRecognition || !SpeechGrammarList) {
        throw new Error('Sorry but speech recognition is not supported on this platform.');
    }
    
    var Future = BASE.async.Future;
    var Fulfillment = BASE.async.Fulfillment;
    
    BASE.namespace('BASE.speech');
    
    BASE.speech.WebSpeechRecognition = function () {
        var self = this;
        
        var recognition = new SpeechRecognition();
        var recognitionFuture = Future.fromResult();
        var recognitionFulfillment = Future.fromResult();
        
        observable.apply(self);
        
        Object.defineProperty(self, 'grammars', {
            get: function () {
                return recognition.grammars;
            },
            set: function (value) {
                if (typeof value === 'string') {
                    var grammar = value;
                    var speechRecognitionList = new SpeechGrammarList();
                    speechRecognitionList.addFromString(grammar, 1);
                    recognition.grammars = speechRecognitionList;
                }
                else {
                    throw new Error('the grammars must be a string in JSpeech Grammar Format (JSGF.)');
                }
            }
        });
        
        Object.defineProperty(self, 'language', {
            get: function () {
                return recognition.lang;
            },
            set: function (value) {
                if (typeof value === 'string') {
                    recognition.lang = value
                } else {
                    throw new Error('language must be a string');
                }
            }
        });
        
        Object.defineProperty(self, 'continuous', {
            get: function () {
                return recognition.continuous;
            },
            set: function (value) {
                if (typeof value === 'boolean') {
                    recognition.continuous = value;
                } else {
                    throw new Error('continuous only takes a boolean value');
                }
            }
        });
        
        Object.defineProperty(self, 'interimResults', {
            get: function () {
                return recognition.interimResults;
            },
            set: function (value) {
                if (typeof value === 'boolean') {
                    recognition.interimResults = value;
                } else {
                    throw new Error('interimResults only takes a boolean value');
                }
            }
        });
        
        Object.defineProperty(self, 'maxAlternatives', {
            get: function () {
                return recognition.maxAlternatives;
            },
            set: function (value) {
                if (typeof value === 'number') {
                    recognition.maxAlternatives = value;
                } else {
                    throw new Error('maxAlternatives must be a number');
                }
            }
        });
        
        Object.defineProperty(self, 'serviceURI', {
            get: function () {
                return recognition.serviceURI;
            },
            set: function (value) {
                if (typeof value === 'string') {
                    recognition.serviceURI = value;
                } else {
                    throw new Error('serviceURI must be a string');
                }
            }
        });
        
        self.recognitionAsync = function () {
            recognitionFuture.cancel();
            return recognitionFuture = recognitionFulfillment.chain(function () {
                return new Future(function (setValue, setError, cancel, ifCanceled) {
                    var finalResultArray = [];
                    recognitionFulfillment = new Fulfillment();
                    
                    recognition.start();
                    
                    recognition.onresult = function (event) {
                        var interimSpeech = '';
                        
                        for (var i = event.resultIndex; i < event.results.length; i++) {
                            if (event.results[i].isFinal) {
                                var finalResult = event.results[i][0].transcript;
                                self.notify({
                                    type: 'finalSpeechResult',
                                    value: finalResult
                                });
                                finalResultArray.push(finalResult);
                            } else {
                                interimSpeech += event.results[i][0].transcript;
                                self.notify({
                                    type: 'interimSpeechResult',
                                    value: interimSpeech
                                });
                            }
                        }
                    };
                    
                    recognition.onerror = function (event) {
                        setError(finalResultArray);
                    };
                    
                    recognition.onend = function (event) {
                        setValue(finalResultArray);
                        recognitionFulfillment.setValue();
                    };
                    
                    ifCanceled(function () {
                        recognition.abort();
                    });

                });
            });
        };
    };
})
