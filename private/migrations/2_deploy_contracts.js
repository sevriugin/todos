var Cryptocase = artifacts.require("Cryptocase");

module.exports = function(deployer) {
  deployer.deploy(Cryptocase,"https://rega.life/ccase.png");
};
