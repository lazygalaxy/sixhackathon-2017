import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import Documents from './documents';
import rateLimit from '../../modules/rate-limit.js';

export const upsertDocument = new ValidatedMethod({
  name: 'documents.upsert',
  validate: new SimpleSchema({
    _id: {
      type: String,
      optional: true
    },
    title: {
      type: String,
      optional: true
    },
    body: {
      type: String,
      optional: true
    },
    customerID: {
      type: String,
      optional: true
    },
    "items.oil.quantity": {
      type: Number,
      optional: true
    },
    "items.tire.quantity": {
      type: Number,
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
  }).validator(),
  run(document) {
    return Documents.upsert({
      _id: document._id
    }, {$set: document});
  }
});

export const removeDocument = new ValidatedMethod({
  name: 'documents.remove',
  validate: new SimpleSchema({
    _id: {
      type: String
    }
  }).validator(),
  run({_id}) {
    Documents.remove(_id);
  }
});

rateLimit({
  methods: [
    upsertDocument, removeDocument
  ],
  limit: 5,
  timeRange: 1000
});
