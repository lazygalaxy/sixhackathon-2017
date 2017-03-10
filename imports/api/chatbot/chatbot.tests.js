import {assert} from 'meteor/practicalmeteor:chai';
import chatbot from './chatbot.js';

describe('Chatbot', function() {
  it('responce to a simple message', function() {
    assert.equal(chatbot('hello'), 'hello');
  });

  it('responce to another simple message', function() {
    assert.equal(chatbot('goodbye'), 'goodbye');
  });
});
