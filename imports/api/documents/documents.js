import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Factory} from 'meteor/dburles:factory';

const Documents = new Mongo.Collection('Documents');
export default Documents;

Documents.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

Documents.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

//TODO: duplication of schemas, more in the method
Documents.schema = new SimpleSchema({
  title: {
    type: String,
    label: 'The title of the document.'
  },
  body: {
    type: String,
    label: 'The body of the document.',
    optional: true
  },
  customerID: {
    type: String,
    label: 'The customer id of the document.'
  },
  date: {
    type: Number,
    label: 'The date of the document.',
    optional: true
  },
  "items.oil.quantity": {
    type: Number,
    label: 'The oil items of the document',
    optional: true
  },
  "items.tire.quantity": {
    type: Number,
    label: 'The wheel items of the document',
    optional: true
  },
  "items.hour.quantity": {
    type: Number,
    label: 'The hours items of the document',
    optional: true
  },
  "attachment.type": {
    type: String,
    label: 'The type of the attachment.',
    optional: true
  },
  "attachment.url": {
    type: String,
    label: 'The url of the attachment.',
    optional: true
  }
});

Documents.attachSchema(Documents.schema);

//TODO: why is the factory needed
Factory.define('document', Documents, {
  title: () => 'Factory Title',
  body: () => 'Factory Body'
});
