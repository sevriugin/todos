import { Meteor } from 'meteor/meteor';
import { Promise } from 'meteor/promise';
import contract from 'truffle-contract';
import Web3 from 'web3';

import { Contracts } from '../api/contracts/contracts.js';
import { logger } from '../utils/logger.js';

export const getWeb3 = function () {
  let web3Provider;
  // Is there an injected web3 instance?
  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    // If no injected web3 instance is detected, fall back to Ganache
    web3 = new Web3(new Web3.providers.HttpProvider('HTTP://127.0.0.1:7545'));
  }
  return web3;
};

export const getNetwork = function () {
  let _resolve;
  let _reject;

  const callback = (error, netId) => {
    if (error) {
      _reject(error);
    } else {
      _resolve(netId);
    }
  };

  return new Promise((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;
    const w3 = getWeb3();
    logger('getNetwork w3', w3);
    logger('getNetwork version', w3.version);
    logger('getNetwork network', w3.version.network);
    w3.version.getNetwork(callback);
  });
};

export const getAccounts = function () {
  let _resolve;
  let _reject;

  const callback = (error, accounts) => {
    if (error) {
      _reject(error);
    } else {
      _resolve(accounts);
    }
  };

  return new Promise((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;
    if (Meteor.isServer) {
      if (typeof Meteor.keystore !== 'undefined') {
        callback(null, [Meteor.keystore.username]);
      } else {
        callback(new Error('need to create keystore'), null);
      }
    } else {
      const w3 = getWeb3();
      logger('getNetwork w3', w3);
      w3.eth.getAccounts(callback);
    }
  });
};

export const getBalance = (address) => {
  let _resolve;
  let _reject;

  const callback = (error, balance) => {
    if (error) {
      _reject(error);
    } else {
      _resolve(balance);
    }
  };
  return new Promise((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;
    const w3 = getWeb3();
    w3.eth.getBalance(address, callback);
  });
};

export const smartcontract = function (sc_name) {
  let _resolve;
  let _reject;

  const callbackFind = (error, result) => {
    if (error) {
      _reject(error);
    } else {
      const artifact = result.artifact;
      const sc = contract(artifact);

      sc.setProvider(getWeb3().currentProvider);
      sc.defaults({
        gas: 4712388,
        gasPrice: 100000000000,
      });

      sc.deployed().then((instance) => {
        _resolve(instance);
      }).catch((err) => {
        _reject(err);
      });
    }
  };

  return new Promise((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;
    const mycontract = Contracts.find({ name: sc_name }, { limit: 1 }).fetch()[0];
    callbackFind(null, mycontract);
  });
};
