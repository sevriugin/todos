import { Meteor } from 'meteor/meteor';

// Convert an NPM-style function returning a callback to one that returns a Promise.
export const logger = (name, msg) => {
  if (Meteor.settings.verb > 2) console.log(`${name} --> ${msg}`);
};
