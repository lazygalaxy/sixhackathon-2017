import {assert} from 'meteor/practicalmeteor:chai';
import chatbot from './chatbot.js';

describe('Chatbot', function() {
  it('verb blooper', function() {
    assert.deepEqual(chatbot({
      "language": "en",
      "sentiment": 0.10000000149011612,
      "entities": {
        "other": ["tires"]
      },
      "sentences": ["look at tires"],
      "tokens": [
        {
          "tag": "VERB",
          "mood": "IMPERATIVE",
          "text": "look",
          "partOfSpeech": "Verb (all tenses and modes)",
          "dependencyEdge": {
            "headTokenIndex": 0,
            "label": "ROOT",
            "description": "Root"
          }
        }, {
          "tag": "ADP",
          "text": "at",
          "partOfSpeech": "Adposition (preposition and postposition)",
          "dependencyEdge": {
            "headTokenIndex": 0,
            "label": "PREP",
            "description": "Prepositional modifier"
          }
        }, {
          "tag": "NOUN",
          "number": "PLURAL",
          "text": "tires",
          "partOfSpeech": "Noun (common and proper)",
          "dependencyEdge": {
            "headTokenIndex": 1,
            "label": "POBJ",
            "description": "Object of a preposition"
          }
        }
      ]
    }), {
      action: 'look',
      who: null,
      what: 'tire',
      num: null
    });
  });
});
