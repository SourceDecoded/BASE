BASE.require([
    'jQuery',
    'BASE.async.Future',
    'BASE.async.Fulfillment'
], function () {
    var Future = BASE.async.Future;
    var Fulfillment = BASE.async.Fulfillment;
    
    if (!speechSynthesis || !SpeechSynthesisUtterance) {
        throw new Error('Sorry but speech synthesis is not supported on this platform.');
    }

    BASE.namespace('BASE.speech');
    
    BASE.speech.WebSpeechSynthesis = function () {
        var self = this;
        var setupFulfillment = new Fulfillment();
        
        var getVoicesAsync = function () {
            return setupFulfillment.chain(function () {
                return speechSynthesis.getVoices();
            });
        };
        
        var utteranceProperties = {
            voiceUri: 'native',
            volume: 1,
            rate: 1,
            pitch: 1,
            language: 'en-US'
        };
        
        Object.defineProperty(self, 'language', {
            get: function () {
                return utteranceProperties.language
            },
            set: function (value) {
                if (typeof value === 'string') {
                    utteranceProperties.language = value;
                } else {
                    throw new Error('The language must be a string');
                }
            }
        });
        
        Object.defineProperty(self, 'voice', {
            get: function () {
                return utteranceProperties.voice
            },
            set: function (value) {
                if (typeof value === 'object') {
                    utteranceProperties.voice = value;
                } else {
                    throw new Error('The voice must be an object of SpeechSynthesisVoice');
                }
            }
        });
        
        Object.defineProperty(self, 'volume', {
            get: function () {
                return utteranceProperties.volume;
            },
            set: function (value) {
                if (typeof value === 'number' && value >= 0 && value <= 1) {
                    utteranceProperties.volume = value;
                } else {
                    throw new Error('The volume must be a number between 0 and 1 inclusive');
                }
            }
        });
        
        Object.defineProperty(self, 'rate', {
            get: function () {
                return utteranceProperties.rate;
            },
            set: function (value) {
                if (typeof value === 'number' && value >= 0.1 && value <= 10) {
                    utteranceProperties.rate = value;
                } else {
                    throw new Error('The rate must be a number between 0.1 and 10 inclusive');
                }
            }
        });
        
        Object.defineProperty(self, 'pitch', {
            get: function () {
                return utteranceProperties.pitch;
            },
            set: function (value) {
                if (typeof value === 'number' && value >= 0 && value <= 2) {
                    utteranceProperties.pitch = value;
                } else {
                    throw new Error('The pitch must be a number between 0 and 2 inclusive.');
                }
            }
        });
        
        self.getVoicesAsync = function () {
            return getVoicesAsync();
        };
        
        self.pause = function () {
            speechSynthesis.pause();
        };
        
        self.resume = function () {
            speechSynthesis.resume();
        };
        
        self.speakAsync = function (message) {
            return new Future(function (setValue, setError, cancel, ifCanceled) {
                var utterance = new SpeechSynthesisUtterance();
                utterance.voice = utteranceProperties.voice;
                utterance.voiceUri = utteranceProperties.voiceUri;
                utterance.volume = utteranceProperties.volume;
                utterance.rate = utteranceProperties.rate;
                utterance.pitch = utteranceProperties.pitch
                utterance.text = message;
                utterance.lang = utteranceProperties.language;
                
                speechSynthesis.speak(utterance);
                
                utterance.onend = function (event) {
                    setValue(event);
                };
                
                utterance.onerror = function (event) {
                    setError(event);
                };
                
                ifCanceled(function () {
                    speechSynthesis.cancel();
                });
            });
        };
        
        speechSynthesis.onvoiceschanged = function () {
            setupFulfillment.setValue();
        }
    };
})