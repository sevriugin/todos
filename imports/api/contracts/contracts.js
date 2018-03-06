import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const checkDependencies = {
  beforeInsert(doc) {
    if (!doc) { return false; }
    return true;
  },
  beforeUpdate(selector) {
    if (!selector) { return false; }
    return true;
  },
  beforeRemove(selector) {
    if (!selector) { return false; }
    return true;
  },
};

class ContractsCollection extends Mongo.Collection {
  insert(doc, callback) {
    const ourDoc = doc;
    ourDoc.createdAt = ourDoc.createdAt || new Date();
    const check = checkDependencies.beforeInsert(ourDoc);
    if (check) {
      return super.insert(ourDoc, callback);
    }
    return check;
  }
  update(selector, modifier) {
    const check = checkDependencies.beforeUpdate(selector);
    if (check) {
      return super.update(selector, modifier);
    }
    return check;
  }
  remove(selector) {
    const check = checkDependencies.beforeUpdate(selector);
    if (check) {
      return super.remove(selector);
    }
    return check;
  }
}

export const Contracts = new ContractsCollection('contracts');

// Deny all client-side updates since we will be using methods to manage this collection
Contracts.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Contracts.schema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  name: {
    type: String,
    max: 48,
  },
  version: {
    type: String,
    max: 32,
    defaultValue: '0.0.1',
    optional: true,
  },
  createdAt: {
    type: Date,
    denyUpdate: true,
  },
  deployed: {
    type: Boolean,
    defaultValue: true,
    optional: true,
  },
  artifact: {
    type: Object,
    blackbox: true,
  },
});

Contracts.attachSchema(Contracts.schema);

// This represents the keys from Lists objects that should be published
// to the client. If we add secret properties to List objects, don't list
// them here to keep them private to the server.
Contracts.publicFields = {
  _id: 1,
  name: 1,
  version: 1,
  createdAt: 1,
  deployed: 1,
  artifact: 1,
};
