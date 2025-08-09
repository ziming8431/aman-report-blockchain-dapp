    import { expect } from "chai";
    import { ethers } from "hardhat";
    import { ConfidentialReporter } from "../typechain-types/";
    
    describe("ConfidentialReporter", function () {
    let confidentialReporter: ConfidentialReporter;
    let owner: any, user1: any, user2: any, lawyer: any;

    // This `beforeEach` block runs before each `it` test block.
    // It deploys a fresh contract for every test to ensure they are isolated.
    beforeEach(async function () {
        [owner, user1, user2, lawyer] = await ethers.getSigners();
        const ConfidentialReporterFactory = await ethers.getContractFactory("ConfidentialReporter");
        confidentialReporter = await ConfidentialReporterFactory.deploy();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
        expect(await confidentialReporter.owner()).to.equal(owner.address);
        });

        it("Should start with zero reports", async function () {
        expect(await confidentialReporter.totalReportCount()).to.equal(0);
        });
    });

    describe("Submitting Reports", function () {
        it("Should allow a user to submit a report", async function () {
        const chatLog = '{"message":"This is a test report."}';
        
        // The `connect(user1)` part makes `user1` the `msg.sender` for this transaction.
        await expect(confidentialReporter.connect(user1).submitReport(chatLog))
            .to.emit(confidentialReporter, "ReportSubmitted")
            .withArgs(0, user1.address); // We expect reportId 0 for owner user1

        expect(await confidentialReporter.totalReportCount()).to.equal(1);
        });
    });

    describe("Access Control", function () {
        const chatLog = '{"message":"Sensitive information."}';

        beforeEach(async function () {
        // User1 submits a report before each access control test.
        await confidentialReporter.connect(user1).submitReport(chatLog);
        });

        it("Should allow the report owner to view their own report", async function () {
        const retrievedLog = await confidentialReporter.connect(user1).getReportChatLog(0);
        expect(retrievedLog).to.equal(chatLog);
        });

        it("Should NOT allow another user to view the report", async function () {
        // We expect this transaction to fail with the specified error message.
        await expect(confidentialReporter.connect(user2).getReportChatLog(0))
            .to.be.revertedWith("Not authorized for this report.");
        });

        it("Should allow the owner to grant access to a lawyer", async function () {
        await expect(confidentialReporter.connect(user1).grantAccess(0, lawyer.address))
            .to.emit(confidentialReporter, "AccessGranted")
            .withArgs(0, user1.address, lawyer.address);

        // Now, the lawyer should be able to view the report.
        const retrievedLog = await confidentialReporter.connect(lawyer).getReportChatLog(0);
        expect(retrievedLog).to.equal(chatLog);
        });

        it("Should NOT allow a non-owner to grant access", async function () {
        await expect(confidentialReporter.connect(user2).grantAccess(0, lawyer.address))
            .to.be.revertedWith("Only owner can grant access.");
        });
    });
    });
