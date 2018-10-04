var DigitalLocker = artifacts.require('DigitalLocker');

module.exports = (deployer) => {
    deployer.deploy(DigitalLocker);
}