import { Meteor } from 'meteor/meteor';
import { keystore } from 'eth-lightwallet';
import { Contracts } from '../../api/contracts/contracts.js';
import { Instances } from '../../api/instances/instances.js';
import { getBalance } from '../../ethereum/ethereum-contracts.js';
import { logger } from '../../utils/logger.js';


// if the database is empty on server start, create some sample data.
Meteor.startup(() => {
  const loadContract = (_name) => {
    const _artifact = JSON.parse(Assets.getText(`build/contracts/${_name}.json`));
    const _doc = { name: 'Cryptocase', artifact: _artifact };
    const _networks = _artifact.networks;

    Contracts.insert(_doc, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Contract is created ${res}`);
        const _contractId = res;
        const _instance = {
          contract: _contractId,
          createdAt: new Date(),
          networks: _networks,
        };
        Instances.insert(_instance, (error, result) => {
          if (error) {
            console.log(err);
          } else {
            console.log(`Instance is created ${result}`);
          }
        });
      }
    });
  };

  logger('load-contracts', new Date());
  if (Contracts.find().count() === 0) {
    logger('load-contracts', 'create contract database : Cryptocase, SaleClockAuction, ERC20Adapter');
    loadContract('Cryptocase');
    loadContract('SaleClockAuction');
    loadContract('ERC20Adapter');
  } else {
    keystore.createVault({
      password: Meteor.settings.password,
      seedPhrase: Meteor.settings.mnemonic, // Optionally provide a 12-word seed phrase
      salt: Meteor.settings.salt, // Optionally provide a salt.
                                  // A unique salt will be generated otherwise.
      hdPathString: "m/0'/0'/0'", // Optional custom HD Path String
    }, (err, ks) => {
      // Some methods will require providing the `pwDerivedKey`,
      // Allowing you to only decrypt private keys on an as-needed basis.
      // You can generate that value with this convenient method:
      ks.keyFromPassword(Meteor.settings.password, (error, pwDerivedKey) => {
        if (error) throw error;
        // generate five new address/private key pairs
        // the corresponding private keys are also encrypted
        ks.generateNewAddress(pwDerivedKey, 5);
        const addr = ks.getAddresses();
        logger('load-contracts:create keystore:accounts', addr);
        logger('load-contracts:create keystore:pwDerivedKey', pwDerivedKey);
        getBalance(addr[0]).then((balance) => { logger('load-contracts:create keystore:balance', balance); });
        Meteor.addresses = addr;
        Meteor.keystore = ks;
        ks.passwordProvider = (callback) => {
          const pw = Meteor.settings.password;
          logger('load-contracts:passwordProvider:passworf', pw);
          callback(null, pw);
        };
        // Now set ks as transaction_signer in the hooked web3 provider
        // and you can start using web3 using the keys/addresses in ks!
      });
    });
  }
});
