var Cryptocase = artifacts.require("Cryptocase");
var SaleClockAuction = artifacts.require("SaleClockAuction");
var ERC20Adapter = artifacts.require("ERC20Adapter");

module.exports = function(deployer) {
  deployer.deploy(Cryptocase).then(function() {
    deployer.deploy(SaleClockAuction, Cryptocase.address, 100).then(function() {
      return deployer.deploy(ERC20Adapter, Cryptocase.address, "Cryptocase ERC20 Token","CCT",10);
    });
  }).catch(function(err) {console.log(err);});
};
