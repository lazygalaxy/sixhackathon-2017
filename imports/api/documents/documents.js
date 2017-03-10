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
    label: 'The body of the document.'
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