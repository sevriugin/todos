/* eslint-disable prefer-arrow-callback */
import { Meteor } from 'meteor/meteor';
import { Instances } from '../instances.js';

Meteor.publish('instances.public', function instancesPublic() {
  return Instances.find({}, {
    fields: Instances.publicFields,
  });
});

Meteor.publish('instances.private', function instancesPrivate() {
  if (!this.userId) {
    return this.ready();
  }

  return Instances.find({}, {
    fields: Instances.publicFields,
  });
});
