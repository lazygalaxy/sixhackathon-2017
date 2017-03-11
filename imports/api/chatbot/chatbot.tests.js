import {assert} from 'meteor/practicalmeteor:chai';
import chatbot from './chatbot.js';

describe('Chatbot', function() {
  it('what do you mean', function() {
    assert.equal(chatbot({}), 'say what?!');
  });

  it('responce to a command', function() {
    assert.deepEqual(chatbot({
      "language": "en",
      "sentiment": 0.20000000298023224,
      "entities": {
        "other": ["invoice"],
        "people": ["alexis"]
      },
      "sentences": ["create invoice for alexis"],
      "tokens": [
        {
          "tag": "VERB",
          "mood": "IMPERATIVE",
          "text": "create",
          "partOfSpeech": "Verb (all tenses and modes)",
          "dependencyEdge": {
            "headTokenIndex": 0,
            "label": "ROOT",
            "description": "Root"
          }
        }, {
          "tag": "NOUN",
          "number": "SINGULAR",
          "text": "invoice",
          "partOfSpeech": "Noun (common and proper)",
          "dependencyEdge": {
            "headTokenIndex": 0,
            "label": "DOBJ",
            "description": "Direct object"
          }
        }, {
          "tag": "ADP",
          "text": "for",
          "partOfSpeech": "Adposition (preposition and postposition)",
          "dependencyEdge": {
            "headTokenIndex": 1,
            "label": "PREP",
            "description": "Prepositional modifier"
          }
        }, {
          "tag": "NOUN",
          "number": "SINGULAR",
          "proper": "PROPER",
          "text": "alexis",
          "partOfSpeech": "Noun (common and proper)",
          "dependencyEdge": {
            "headTokenIndex": 2,
            "label": "POBJ",
            "description": "Object of a preposition"
          }
        }
      ]
    }), {
      action: 'create',
      who: 'alexis',
      what: 'invoice'
    });
  });

  it('responce to a command', function() {
    assert.deepEqual(chatbot({
      "language": "en",
      "sentiment": 0.20000000298023224,
      "entities": {
        "other": ["invoice"],
        "people": ["john"]
      },
      "sentences": ["create invoice for john"],
      "tokens": [
        {
          "tag": "VERB",
          "mood": "IMPERATIVE",
          "text": "create",
          "partOfSpeech": "Verb (all tenses and modes)",
          "dependencyEdge": {
            "headTokenIndex": 0,
            "label": "ROOT",
            "description": "Root"
          }
        }, {
          "tag": "NOUN",
          "number": "SINGULAR",
          "text": "invoice",
          "partOfSpeech": "Noun (common and proper)",
          "dependencyEdge": {
            "headTokenIndex": 0,
            "label": "DOBJ",
            "description": "Direct object"
          }
        }, {
          "tag": "ADP",
          "text": "for",
          "partOfSpeech": "Adposition (preposition and postposition)",
          "dependencyEdge": {
            "headTokenIndex": 1,
            "label": "PREP",
            "description": "Prepositional modifier"
          }
        }, {
          "tag": "NOUN",
          "number": "SINGULAR",
          "text": "john",
          "partOfSpeech": "Noun (common and proper)",
          "dependencyEdge": {
            "headTokenIndex": 2,
            "label": "POBJ",
            "description": "Object of a preposition"
          }
        }
      ]
    }), {
      action: 'create',
      who: 'john',
      what: 'invoice'
    });
  });
});
