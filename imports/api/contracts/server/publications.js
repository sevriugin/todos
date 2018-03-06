/* eslint-disable prefer-arrow-callback */
import { Meteor } from 'meteor/meteor';
import { Contracts } from '../contracts.js';

Meteor.publish('contracts.public', function contractsPublic() {
  return Contracts.find({}, {
    fields: Contracts.publicFields,
  });
});

Meteor.publish('contracts.private', function contractsPrivate() {
  if (!this.userId) {
    return this.ready();
  }

  return Contracts.find({}, {
    fields: Contracts.publicFields,
  });
});
