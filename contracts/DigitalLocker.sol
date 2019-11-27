pragma solidity ^0.5.0;

contract DigitalLocker {
    enum StateType { Requested, DocumentReview, AvailableToShare, SharingRequestPending, SharingWithThirdParty, Terminated }
    address public Owner;
    address public BankAgent;
    string public LockerFriendlyName;
    string public LockerIdentifier;
    address public CurrentAuthorizedUser;
    string public ExpirationDate;
    string public Image;
    address public ThirdPartyRequestor;
    string public IntendedPurpose;
    string public LockerStatus;
    string public RejectionReason;
    StateType public State;
    string public ApplicationName;
    string public WorkflowName;

    event LogWorkbenchContractCreated(string applicationName, string workflowName, address originatingAddress);
    event LogWorkbenchContractUpdated (string applicationName, string workflowName, string action, address originatingAddress);

    constructor(string memory lockerFriendlyName, address bankAgent) public {
        Owner = msg.sender;
        LockerFriendlyName = lockerFriendlyName;
        ApplicationName = "DigitalLocker";
        WorkflowName = "DigitalLocker";

        State = StateType.DocumentReview; //////////////// should be StateType.Requested?

        BankAgent = bankAgent;

        emit LogWorkbenchContractCreated(ApplicationName, WorkflowName, msg.sender);
    }

    function BeginReviewProcess() public {
        /* Need to update, likely with registry to confirm sender is agent
        Also need to add a function to re-assign the agent.
        */
     if (Owner == msg.sender) {
            revert("owner cannot begin review process");
        }
        BankAgent = msg.sender;

        LockerStatus = "Pending";
        State = StateType.DocumentReview;
        emit LogWorkbenchContractUpdated(ApplicationName, WorkflowName, "BeginReviewProcess", msg.sender);
    }

    function RejectApplication(string memory rejectionReason) public {
     if (BankAgent != msg.sender) {
            revert("only bank agent can reject application");
        }

        RejectionReason = rejectionReason;
        LockerStatus = "Rejected";
        State = StateType.DocumentReview;
        emit LogWorkbenchContractUpdated(ApplicationName, WorkflowName, "RejectApplication", msg.sender);
    }

    function UploadDocuments(string memory lockerIdentifier, string memory image) public {
        if (BankAgent != msg.sender) {
            revert("only bank agent can upload documents");
        }
            LockerStatus = "Approved";
            Image = image;
            LockerIdentifier = lockerIdentifier;
            State = StateType.AvailableToShare;
            emit LogWorkbenchContractUpdated(ApplicationName, WorkflowName, "UploadDocuments", msg.sender);
    }

    function ShareWithThirdParty(address thirdPartyRequestor, string memory expirationDate, string memory intendedPurpose) public {
        if (Owner != msg.sender) {
            revert("only owner can share with third party");
        }

        ThirdPartyRequestor = thirdPartyRequestor;
        CurrentAuthorizedUser = ThirdPartyRequestor;

        LockerStatus = "Shared";
        IntendedPurpose = intendedPurpose;
        ExpirationDate = expirationDate;
        State = StateType.SharingWithThirdParty;
        emit LogWorkbenchContractUpdated(ApplicationName, WorkflowName, "ShareWithThirdParty", msg.sender);
    }

    function AcceptSharingRequest() public {
        if (Owner != msg.sender) {
            revert("only owner can accept sharing request");
        }

        CurrentAuthorizedUser = ThirdPartyRequestor;
        State = StateType.SharingWithThirdParty;
        emit LogWorkbenchContractUpdated(ApplicationName, WorkflowName, "AcceptSharingRequest", msg.sender);
    }

    function RejectSharingRequest() public {
        if (Owner != msg.sender) {
            revert("only owner can reject sharing request");
        }
            LockerStatus = "Available";
            CurrentAuthorizedUser = address(0x000);
            State = StateType.AvailableToShare;
            emit LogWorkbenchContractUpdated(ApplicationName, WorkflowName, "RejectSharingRequest", msg.sender);
    }

    function RequestLockerAccess(string memory intendedPurpose) public {
        if (Owner == msg.sender) {
            revert("owner cannot request access to its own locker");
        }

        ThirdPartyRequestor = msg.sender;
        IntendedPurpose = intendedPurpose;
        State = StateType.SharingRequestPending;
                emit LogWorkbenchContractUpdated(ApplicationName, WorkflowName, "RequestLockerAccess", msg.sender);
    }

    function ReleaseLockerAccess() public {

        if (CurrentAuthorizedUser != msg.sender) {
            revert("only current authorized user can release locker access");
        }
        LockerStatus = "Available";
        ThirdPartyRequestor = 0x0;
        CurrentAuthorizedUser = 0x0;
        IntendedPurpose = "";
        State = StateType.AvailableToShare;
        emit LogWorkbenchContractUpdated(ApplicationName, WorkflowName, "AvailableToShare", msg.sender);
    }
    function RevokeAccessFromThirdParty() public {
        if (Owner != msg.sender) {
            revert("only owner can revoke access from third party");
        }
            LockerStatus = "Available";
            CurrentAuthorizedUser = address(0x000);
            State = StateType.AvailableToShare;
            emit LogWorkbenchContractUpdated(ApplicationName, WorkflowName, "RevokeAccessFromThirdParty", msg.sender);
    }
    function Terminate() public {
        if (Owner != msg.sender) {
            revert("only owner can terminate");
        }
        CurrentAuthorizedUser = address(0x000);
        State = StateType.Terminated;
        emit LogWorkbenchContractUpdated(ApplicationName, WorkflowName, "Terminate", msg.sender);
    }
}
