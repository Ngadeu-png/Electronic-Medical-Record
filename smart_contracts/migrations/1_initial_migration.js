const SimpleStorage = artifacts.require("SimpleStorage");

module.exports = function(deployer) {
    // Deploy a minimal contract first to verify Ganache accepts deployments
    deployer.deploy(SimpleStorage, 42);
};
