import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Contracts } from './contracts.js';

export const insert = new ValidatedMethod({
  name: 'contracts.insert',
  validate: Contracts.simpleSchema().pick(['name', 'version', 'artifact']).validator({ clean: true, filter: false }),
  run({ name, version, artifact }) {
    const contract = {
      name,
      version,
      artifact,
      deployed: true,
      createdAt: new Date(),
    };

    Contracts.insert(contract);
  },
});

export const updateArtifact = new ValidatedMethod({
  name: 'contracts.updateArtifact',
  validate: new SimpleSchema({
    contractId: Contracts.simpleSchema().schema('_id'),
    newArtifact: Contracts.simpleSchema().schema('artifact'),
    newVersion: Contracts.simpleSchema().schema('version'),
  }).validator({ clean: true, filter: false }),
  run({ contractId, newArtifact, newVersion }) {
    Contracts.update(contractId, {
      $set: {
        artifact: newArtifact,
        version: (_.isUndefined(newVersion) ? '0.0.1' : newVersion),
      },
    });
  },
});

export const remove = new ValidatedMethod({
  name: 'contracts.remove',
  validate: new SimpleSchema({
    contractId: Contracts.simpleSchema().schema('_id'),
  }).validator({ clean: true, filter: false }),
  run({ contractId }) {
    Contracts.remove(contractId);
  },
});

// Get list of all method names on contracts
const CONTRACTS_METHODS = _.pluck([
  insert,
  updateArtifact,
  remove,
], 'name');

if (Meteor.isServer) {
  // Only allow 5 contracts operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(CONTRACTS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 5, 1000);
}
