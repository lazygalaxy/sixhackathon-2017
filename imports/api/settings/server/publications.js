import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import Settings from '../settings';

Meteor.publish('settings.view', (_id) => {
  check(_id, String);
  return Settings.find();
});
