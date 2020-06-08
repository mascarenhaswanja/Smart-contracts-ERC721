const Vintage = artifacts.require("./VintageCar.sol");

module.exports = function(deployer) {
 // deployer.deploy(Vintage);
 deployer.deploy(Vintage,"Vintage Car", "VCAR");
};