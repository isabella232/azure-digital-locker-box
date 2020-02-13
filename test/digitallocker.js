const DigitalLocker = artifacts.require("DigitalLocker")
const truffleAssert = require('truffle-assertions');

contract('DigitalLocker', accounts => {
    const owner = accounts[0];
    const bankAgent = accounts[1];

    it('should return a new instance of the contract with a bankAgent', async() => {
        const digitalLocker = await DigitalLocker.deployed();
        const owner = await digitalLocker.Owner();
        // const bankAgent = await digitalLocker.bankAgent();

        assert.notEqual(bankAgent, owner, 'owner not correctly set');
        // assert.equal(supplyChainObserver, observer, 'observer not correctly set');
    });

    it('someone should be able to begin review process', async() => {
        const digitalLocker = await DigitalLocker.deployed();
        const result = await digitalLocker.BeginReviewProcess({ from: bankAgent });
        const lockerStatus = await digitalLocker.LockerStatus();

        assert.equal(lockerStatus, "Pending", "locker not in correct pending state")
        truffleAssert.eventEmitted(result, 'LogContractUpdated', (ev) => {
            return ev.action == 'BeginReviewProcess';
        }, 'Contract should emit the correct message');

    });

    it('owner should not be able to begin review process', async() => {
        const digitalLocker = await DigitalLocker.deployed();

        await truffleAssert.reverts(digitalLocker.BeginReviewProcess({ from: owner }));
    });

    it('bank agent can reject application', async() => {
        const digitalLocker = await DigitalLocker.deployed();

        const result = await digitalLocker.RejectApplication("insufficient credit", { from: bankAgent });
        const lockerStatus = await digitalLocker.LockerStatus();

        assert.equal(lockerStatus, "Rejected", "locker not in correct Rejected state");
        truffleAssert.eventEmitted(result, 'LogContractUpdated', (ev) => {
            return ev.action == 'RejectApplication';
        }, 'Contract should emit the correct message');
    });

    it('non bank agent can not reject application', async() => {
        const digitalLocker = await DigitalLocker.deployed();

        await truffleAssert.reverts(digitalLocker.RejectApplication("insufficient credit", { from: owner }));
    });

    
});