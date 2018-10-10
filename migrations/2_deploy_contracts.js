var DigitalLocker = artifacts.require('DigitalLocker');

module.exports = (deployer, network, accounts) => {
    deployer.deploy(DigitalLocker, "lockername", accounts[0]);
};