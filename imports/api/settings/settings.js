import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Factory} from 'meteor/dburles:factory';

const Settings = new Mongo.Collection('Settings');
export default Settings;

Settings.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

Settings.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

Settings.schema = new SimpleSchema({
  language: {
    type: String,
    label: 'The language of the user.'
  }
});

Settings.attachSchema(Settings.schema);

Factory.define('setting', Settings, {
  language: () => 'Factory Language'
});
