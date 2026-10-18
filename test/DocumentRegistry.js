
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DocumentRegistry", function () {
  let registry;
  let owner;
  let anotherUser;

  const documentHash = ethers.keccak256(
    ethers.toUtf8Bytes("sample-document-hash")
  );

  beforeEach(async function () {
    [owner, anotherUser] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory(
      "DocumentRegistry"
    );

    registry = await Registry.deploy();
    await registry.waitForDeployment();
  });

  it("should register a document", async function () {
    await registry.registerDocument(documentHash);

    const result = await registry.verifyDocument(documentHash);

    expect(result.isRegistered).to.equal(true);
    expect(result.owner).to.equal(owner.address);
    expect(result.registeredAt).to.be.greaterThan(0n);
  });

  it("should reject duplicate registrations", async function () {
    await registry.registerDocument(documentHash);

    await expect(
      registry.registerDocument(documentHash)
    ).to.be.revertedWith("Document already registered");
  });

  it("should reject an empty hash", async function () {
    await expect(
      registry.registerDocument(ethers.ZeroHash)
    ).to.be.revertedWith("Invalid document hash");
  });

  it("should return false for an unknown document", async function () {
    const unknownHash = ethers.keccak256(
      ethers.toUtf8Bytes("unknown-document")
    );

    const result = await registry.verifyDocument(unknownHash);

    expect(result.isRegistered).to.equal(false);
    expect(result.owner).to.equal(ethers.ZeroAddress);
    expect(result.registeredAt).to.equal(0n);
  });

  it("should record the address of the registering user", async function () {
    await registry.connect(anotherUser).registerDocument(documentHash);

    const result = await registry.verifyDocument(documentHash);

    expect(result.owner).to.equal(anotherUser.address);
  });
});
