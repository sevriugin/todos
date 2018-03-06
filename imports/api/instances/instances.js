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

class InstancesCollection extends Mongo.Collection {
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

export const Instances = new InstancesCollection('instances');

// Deny all client-side updates since we will be using methods to manage this collection
Instances.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Instances.schema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  contract: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  createdAt: {
    type: Date,
    denyUpdate: true,
  },
  networks: {
    type: Object,
    blackbox: true,
  },
});

Instances.attachSchema(Instances.schema);

// This represents the keys from Lists objects that should be published
// to the client. If we add secret properties to List objects, don't list
// them here to keep them private to the server.
Instances.publicFields = {
  _id: 1,
  contract: 1,
  networks: 1,
};
