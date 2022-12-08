const { expect } = require("chai");

describe("StreaX Token Contract Tests", async () => {

  let initMint = 1000000;
  let Token;
  let contract;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addrs;

  beforeEach(async () => {
    Token = await ethers.getContractFactory("StreaX");
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();

    contract = await Token.deploy();
  });

  describe("Deployment", () => {
    it("Should set the right owner", async () => {
      expect(await contract.owner()).to.deep.equal(owner.address);
    });

    it("should return the name of the contract", async () => {
      expect(await contract.name()).to.deep.equal("StreaX");
    });

  });

  describe("Minting", () => {
    it("Should mint tokens to the owner", async () => {
      await contract.mint(owner.address, initMint);
      const ownerBalance = await contract.balanceOf(owner.address);
      expect(ownerBalance).to.equal(initMint);
    });

    it("Should mint tokens to the addr1", async () => {
      await contract.mint(addr1.address, initMint);
      const addr1Balance = await contract.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(initMint);
    });

    it("should revert if not owner", async () => {
      await expect(
        contract.connect(addr1).mint(addr1.address, initMint)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Transactions", async () => {

    beforeEach(async () => {
      await contract.mint(owner.address, initMint);
      await contract.mint(addr1.address, initMint);
    });

    it("Should transfer tokens between accounts", async () => {
      const ownerBalance = await contract.balanceOf(owner.address);

        // Transfer 50 tokens from owner to addr1
      await contract.transfer(addr2.address, 50);
      const addr2Balance = await contract.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      await contract.connect(addr1).transfer(addr3.address, 50);
      const addr3Balance = await contract.balanceOf(addr3.address);
      expect(addr3Balance).to.equal(50);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await contract.balanceOf(owner.address);

      await expect(
        contract.connect(addr2).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Owner balance shouldn't have changed.
      expect(await contract.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });
});