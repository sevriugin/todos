import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Instances } from './instances.js';
import { smartcontract, getNetwork } from '../../ethereum/ethereum-contracts.js';
import { Contracts } from '../contracts/contracts.js';
import { logger } from '../../utils/logger.js';

export const insert = new ValidatedMethod({
  name: 'instances.insert',
  validate: Instances.simpleSchema().pick(['contract', 'networks']).validator({ clean: true, filter: false }),
  run({ contract, networks }) {
    const instance = {
      contract,
      networks,
      deployed: true,
      createdAt: new Date(),
    };

    Instances.insert(instance);
  },
});

export const remove = new ValidatedMethod({
  name: 'instances.remove',
  validate: new SimpleSchema({
    instanceId: Instances.simpleSchema().schema('_id'),
  }).validator({ clean: true, filter: false }),
  run({ instanceId }) {
    Instances.remove(instanceId);
  },
});

export const cryptocaseStatus = new ValidatedMethod({
  name: 'instances.cryptocaseStatus',
  validate: new SimpleSchema({
    instanceId: Instances.simpleSchema().schema('_id'),
  }).validator({ clean: true, filter: false }),
  run({ instanceId }) {
    const instance = Instances.findOne(instanceId);
    logger('cryptocaseStatus instance', instance);
    getNetwork()
      .then((id) => {
        logger('cryptocaseStatus networkId', id);
        const address = instance.networks[id].address;
        logger('cryptocaseStatus address', address);
        const contract = Contracts.findOne(instance.contract);
        logger('cryptocaseStatus contract.name', contract.name);
        smartcontract(contract.name)
          .then((sc) => {
            sc.state.call()
              .then((state) => {
                console.log(`cryptocaseStatus Status is ----> ${state}`);
              });
          })
          .catch((error) => { console.log(`cryptocaseStatus error-->${error}`); });
      })
      .catch((err) => { console.log(`cryptocaseStatus error-->${err}`); });
  },
});

// Get list of all method names on contracts
const INSTANCES_METHODS = _.pluck([
  insert,
  remove,
  cryptocaseStatus,
], 'name');

if (Meteor.isServer) {
  // Only allow 5 contracts operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(INSTANCES_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 5, 1000);
}
