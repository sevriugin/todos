import { Meteor } from 'meteor/meteor';
import { Contracts } from '../../api/contracts/contracts.js';
import { Instances } from '../../api/instances/instances.js';
import { createKeystore } from '../../ethereum/ethereum-services.js';
import { smartcontract, getAccounts, getBalance } from '../../ethereum/ethereum-contracts.js';

// if the database is empty on server start, create some sample data.
Meteor.startup(() => {
  if (Contracts.find().count() === 0) {
    const artifact = JSON.parse(Assets.getText('build/contracts/Cryptocase.json'));
    // const artifact = { name: 'test contract', contract: 'test contract' };
    const doc = { name: 'Cryptocase', artifact: artifact };
    const networks = artifact.networks;

    Contracts.insert(doc, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Contract is created ${res}`);
        const contractId = res;
        const instance = {
          contract: contractId,
          createdAt: new Date(),
          networks: networks,
        };
        Instances.insert(instance, (error, result) => {
          if (error) {
            console.log(err);
          } else {
            console.log(`Instance is created ${result}`);
          }
        });
      }
    });
  } else {
    createKeystore(
      Meteor.settings.alias,
      Meteor.settings.email,
      Meteor.settings.password,
      Meteor.settings.salt,
      Meteor.settings.mnemonic
    ).then((keystore) => {
      Meteor.keystore = keystore;
      getAccounts().then((accounts) => { console.log(`Account --> ${accounts[0]}`); }).catch((err) => { console.log(err); });
      getBalance(Meteor.keystore.username).then((balance) => { console.log(`Account balance --> ${balance}`); });
    });
  }
});
