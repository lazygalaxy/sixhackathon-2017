import {assert} from 'meteor/practicalmeteor:chai';
import chatbot from './chatbot.js';

describe('Chatbot', function() {
  it('what do you mean', function() {
    assert.equal(chatbot({}), 'say what?!');
  });

  it('add item to invoice', function() {
    assert.deepEqual(chatbot({
      "language": "en",
      "sentiment": 0.10000000149011612,
      "entities": {
        "other": ["wheels"]
      },
      "sentences": ["add wheels"],
      "tokens": [
        {
          "tag": "VERB",
          "mood": "IMPERATIVE",
          "text": "add",
          "partOfSpeech": "Verb (all tenses and modes)",
          "dependencyEdge": {
            "headTokenIndex": 0,
            "label": "ROOT",
            "description": "Root"
          }
        }, {
          "tag": "NOUN",
          "number": "PLURAL",
          "text": "wheels",
          "partOfSpeech": "Noun (common and proper)",
          "dependencyEdge": {
            "headTokenIndex": 0,
            "label": "DOBJ",
            "description": "Direct object"
          }
        }
      ]
    }), {
      action: 'add',
      who: null,
      what: 'tire',
      num: null
    });
  });

  it('remove item from invoice', function() {
    assert.deepEqual(chatbot({
      "language": "en",
      "sentiment": 0.10000000149011612,
      "entities": {
        "other": ["oil"]
      },
      "sentences": ["remove oil"],
      "tokens": [
        {
          "tag": "VERB",
          "mood": "IMPERATIVE",
          "text": "remove",
          "partOfSpeech": "Verb (all tenses and modes)",
          "dependencyEdge": {
            "headTokenIndex": 0,
            "label": "ROOT",
            "description": "Root"
          }
        }, {
          "tag": "NOUN",
          "number": "SINGULAR",
          "text": "oil",
          "partOfSpeech": "Noun (common and proper)",
          "dependencyEdge": {
            "headTokenIndex": 0,
            "label": "DOBJ",
            "description": "Direct object"
          }
        }
      ]
    }), {
      action: 'remove',
      who: null,
      what: 'oil',
      num: null
    });
  });

  it('remove item from invoice with size', function() {
    assert.deepEqual(chatbot({
      "language": "en",
      "sentiment": 0.20000000298023224,
      "entities": {
        "other": ["tires"]
      },
      "sentences": ["add four tires"],
      "tokens": [
        {
          "tag": "VERB",
          "mood": "IMPERATIVE",
          "text": "add",
          "partOfSpeech": "Verb (all tenses and modes)",
          "dependencyEdge": {
            "headTokenIndex": 0,
            "label": "ROOT",
            "description": "Root"
          }
        }, {
          "tag": "NUM",
          "text": "four",
          "partOfSpeech": "Cardinal number",
          "dependencyEdge": {
            "headTokenIndex": 2,
            "label": "NUM",
            "description": "Numeric modifier of a noun"
          }
        }, {
          "tag": "NOUN",
          "number": "PLURAL",
          "text": "tires",
          "partOfSpeech": "Noun (common and proper)",
          "dependencyEdge": {
            "headTokenIndex": 0,
            "label": "DOBJ",
            "description": "Direct object"
          }
        }
      ]
    }), {
      action: 'add',
      who: null,
      what: 'tire',
      num: 4
    });
  });

  it('remove item from invoice with size', function() {
    assert.deepEqual(chatbot({
      "language": "en",
      "sentiment": 0.20000000298023224,
      "entities": {
        "other": ["tires"]
      },
      "sentences": ["remove 5 tires"],
      "tokens": [
        {
          "tag": "VERB",
          "mood": "IMPERATIVE",
          "text": "remove",
          "partOfSpeech": "Verb (all tenses and modes)",
          "dependencyEdge": {
            "headTokenIndex": 0,
            "label": "ROOT",
            "description": "Root"
          }
        }, {
          "tag": "NUM",
          "text": "5",
          "partOfSpeech": "Cardinal number",
          "dependencyEdge": {
            "headTokenIndex": 2,
            "label": "NUM",
            "description": "Numeric modifier of a noun"
          }
        }, {
          "tag": "NOUN",
          "number": "PLURAL",
          "text": "tires",
          "partOfSpeech": "Noun (common and proper)",
          "dependencyEdge": {
            "headTokenIndex": 0,
            "label": "DOBJ",
            "description": "Direct object"
          }
        }
      ]
    }), {
      action: 'remove',
      who: null,
      what: 'tire',
      num: 5
    });
  });
});
