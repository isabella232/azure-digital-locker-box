const DigitalLocker = artifacts.require("DigitalLocker")
const truffleAssert = require('truffle-assertions');

contract('DigitalLocker', accounts => {
    const owner = accounts[0];
    const bankAgent = accounts[1];
    const thirdParty = accounts[2];

    it('should return a new instance of the contract with a bankAgent', async() => {
        const digitalLocker = await DigitalLocker.deployed();
        const owner = await digitalLocker.Owner();

        assert.notEqual(bankAgent, owner, 'owner not correctly set');
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

    it('bank agent can upload documents', async() => {
        const digitalLocker = await DigitalLocker.deployed();

        const result = await digitalLocker.UploadDocuments("locker", "image", { from: bankAgent });
        const lockerStatus = await digitalLocker.LockerStatus();

        assert.equal(lockerStatus, "Approved", "locker not in correct Approved state");
        truffleAssert.eventEmitted(result, 'LogContractUpdated', (ev) => {
            return ev.action == 'UploadDocuments';
        }, 'Contract should emit the correct message');
    });

    it('non bank agent can not upload documents', async() => {
        const digitalLocker = await DigitalLocker.deployed();

        await truffleAssert.reverts(digitalLocker.UploadDocuments("locker", "image", { from: owner }));
    });

    it('owner can share with third party', async() => {
        const digitalLocker = await DigitalLocker.deployed();

        const result = await digitalLocker.ShareWithThirdParty(thirdParty, "02/20/2020", "testing", { from: owner });
        const lockerStatus = await digitalLocker.LockerStatus();
        const requester = await digitalLocker.ThirdPartyRequestor();

        assert.equal(lockerStatus, "Shared", "locker not in correct Shared state");
        assert.equal(requester, thirdParty)
        truffleAssert.eventEmitted(result, 'LogContractUpdated', (ev) => {
            return ev.action == 'ShareWithThirdParty';
        }, 'Contract should emit the correct message');
    });

    it('non owner can not share with third party', async() => {
        const digitalLocker = await DigitalLocker.deployed();

        await truffleAssert.reverts(digitalLocker.ShareWithThirdParty(thirdParty, "02/20/2020", "testing", { from: bankAgent }));
    });

    it('owner can revoke access with third party', async() => {
        const digitalLocker = await DigitalLocker.deployed();

        const result = await digitalLocker.RevokeAccessFromThirdParty({ from: owner });
        const lockerStatus = await digitalLocker.LockerStatus();

        assert.equal(lockerStatus, "Available", "locker not in correct Available state");
        truffleAssert.eventEmitted(result, 'LogContractUpdated', (ev) => {
            return ev.action == 'RevokeAccessFromThirdParty';
        }, 'Contract should emit the correct message');
    });

    it('non owner can not revoke access with third party', async() => {
        const digitalLocker = await DigitalLocker.deployed();

        await truffleAssert.reverts(digitalLocker.RevokeAccessFromThirdParty({ from: bankAgent }));
    });

    it('owner can accept share access with third party', async() => {
        const digitalLocker = await DigitalLocker.deployed();

        const result = await digitalLocker.AcceptSharingRequest({ from: owner });

        truffleAssert.eventEmitted(result, 'LogContractUpdated', (ev) => {
            return ev.action == 'AcceptSharingRequest';
        }, 'Contract should emit the correct message');
    });

    it('non owner can not accept share access with third party', async() => {
        const digitalLocker = await DigitalLocker.deployed();

        await truffleAssert.reverts(digitalLocker.AcceptSharingRequest({ from: bankAgent }));
    });

    it('owner can reject share access with third party', async() => {
        const digitalLocker = await DigitalLocker.deployed();

        const result = await digitalLocker.RejectSharingRequest({ from: owner });
        const lockerStatus = await digitalLocker.LockerStatus();

        assert.equal(lockerStatus, "Available", "locker not in correct Available state");
        truffleAssert.eventEmitted(result, 'LogContractUpdated', (ev) => {
            return ev.action == 'RejectSharingRequest';
        }, 'Contract should emit the correct message');
    });

    it('non owner can not reject share access with third party', async() => {
        const digitalLocker = await DigitalLocker.deployed();

        await truffleAssert.reverts(digitalLocker.RejectSharingRequest({ from: bankAgent }));
    });

    it('someone can request access', async() => {
        const digitalLocker = await DigitalLocker.deployed();

        const result = await digitalLocker.RequestLockerAccess("testing", { from: thirdParty });

        truffleAssert.eventEmitted(result, 'LogContractUpdated', (ev) => {
            return ev.action == 'RequestLockerAccess';
        }, 'Contract should emit the correct message');
    });

    it('owner can not request access', async() => {
        const digitalLocker = await DigitalLocker.deployed();

        await truffleAssert.reverts(digitalLocker.RequestLockerAccess("testing", { from: owner }));
    });

    it('owner can terminate', async() => {
        const digitalLocker = await DigitalLocker.deployed();

        const result = await digitalLocker.Terminate({ from: owner });

        truffleAssert.eventEmitted(result, 'LogContractUpdated', (ev) => {
            return ev.action == 'Terminate';
        }, 'Contract should emit the correct message');
    });

    it('non owner can not terminate', async() => {
        const digitalLocker = await DigitalLocker.deployed();

        await truffleAssert.reverts(digitalLocker.Terminate({ from: bankAgent }));
    });
});