import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import Settings from './settings';
import rateLimit from '../../modules/rate-limit.js';

export const upsertSetting = new ValidatedMethod({
  name: 'settings.upsert',
  validate: new SimpleSchema({
    _id: {
      type: String,
      optional: true
    },
    language: {
      type: String,
      optional: true
    }
  }).validator(),
  run(document) {
    return Settings.upsert({
      _id: document._id
    }, {$set: document});
  }
});

rateLimit({methods: [upsertSetting], limit: 5, timeRange: 1000});
