import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Instances } from './instances.js';
import { smartcontract, getNetwork, getAccounts, getWeb3 } from '../../ethereum/ethereum-contracts.js';
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


export const cryptocaseCreate = new ValidatedMethod({
  name: 'instances.cryptocaseCreate',
  validate: new SimpleSchema({
    instanceId: Instances.simpleSchema().schema('_id'),
  }).validator({ clean: true, filter: false }),
  run({ instanceId }) {
    const instance = Instances.findOne(instanceId);
    logger('cryptocaseCreate instance', instance);
    getAccounts()
      .then((accounts) => {
        logger('cryptocaseCreate accounts', accounts);
        const fromAccount = accounts[0];
        logger('cryptocaseCreate from_account', fromAccount);
        const contract = Contracts.findOne(instance.contract);
        logger('cryptocaseCreate contract.name', contract.name);
        smartcontract(contract.name)
          .then((sc) => {
            sc.createCase('img', 100, { from: fromAccount })
              .then((result) => {
                console.log(`cryptocaseCreate newcase ID ----> ${JSON.stringify(result.logs)}`);
              });
          })
          .catch((error) => { console.log(`cryptocaseCreate error-->${error}`); });
      })
      .catch((err) => { console.log(`cryptocaseCreate error-->${err}`); });
  },
});

export const cryptocaseOrder = new ValidatedMethod({
  name: 'instances.cryptocaseOrder',
  validate: new SimpleSchema({
    instanceId: Instances.simpleSchema().schema('_id'),
  }).validator({ clean: true, filter: false }),
  run({ instanceId }) {
    const instance = Instances.findOne(instanceId);
    logger('cryptocaseOrder instance', instance);
    getAccounts()
      .then((accounts) => {
        logger('cryptocaseOrder accounts', accounts);
        const fromAccount = accounts[0];
        logger('cryptocaseOrder from_account', fromAccount);
        const contract = Contracts.findOne(instance.contract);
        logger('cryptocaseOrder contract.name', contract.name);
        smartcontract(contract.name)
          .then((sc) => {
            const price = getWeb3().toWei(6, 'ether');
            sc.Order({ value: price, from: fromAccount })
              .then((result) => {
                console.log(`cryptocaseOrder tnx ----> ${result.tnx}`);
              });
          })
          .catch((error) => { console.log(`cryptocaseOrder error-->${error}`); });
      })
      .catch((err) => { console.log(`cryptocaseOrder error-->${err}`); });
  },
});


// Get list of all method names on contracts
const INSTANCES_METHODS = _.pluck([
  insert,
  remove,
  cryptocaseCreate,
  cryptocaseOrder,
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
