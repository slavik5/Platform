import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

let addr: SignerWithAddress[];
let owner: SignerWithAddress;
let Token: ContractFactory;
let token: Contract;
let zeroAdd: string;


describe("token contract", function () {


  beforeEach(async () => {
    addr = await ethers.getSigners();
    owner = addr[0];
    Token = await ethers.getContractFactory("Token");
    token = await Token.deploy();

    
    zeroAdd = '0x0000000000000000000000000000000000000000';
  });
  describe("name", function () {
    it("should return name", async function () {

      const Name = await token.name();
      expect("SlavkaToken").to.equal(Name);
    });
  });
  describe("symbol", function () {
    it("should return symbol", async function () {

      const Symbol = await token.symbol();
      expect("ST").to.equal(Symbol);
    });
  });
  describe("decimals", function () {
    it("should return decimals", async function () {

      const Decimals = await token.decimals();
      expect(18).to.equal(Decimals);
    });
  });
  describe("totalSupply", function () {
    it("should return totalSupply", async function () {

      const bal = await token.totalSupply();
      expect(await token.balanceOf(owner.address)).to.equal(bal);
    });
  });
  describe("transfer", function () {
    it("should transfer on account balance", async function () {
      await token.mint(addr[1].address, 10);
      await token.connect(addr[1]).transfer(addr[2].address, 10);
      expect(await token.balanceOf(addr[2].address)).to.equal(10);
    });
    it("transfer on zero address", async function () {
      await expect(token.transfer(zeroAdd, 10)).to.be.revertedWith("zero address");

    });
    it("not enough tokens on balance", async function () {
      await expect(token.connect(addr[2]).transfer(addr[1].address, 10)).to.be.revertedWith("not enough tokens");

    });
  });
  describe("approve", function () {
    it("give allowance", async function () {
      await token.mint(addr[1].address, 10);
      await token.connect(addr[1]).approve(addr[2].address, 10);
      expect(await token.allowance(addr[1].address, addr[2].address)).to.equal(10);
    });
    it("spender- zero address", async function () {
      await expect(token.connect(addr[2]).approve(zeroAdd, 10)).to.be.revertedWith("spender- zero address");

    });
  });
  describe("transferFrom", function () {
    it("should transfer between accounts", async function () {
      await token.mint(addr[1].address, 10);
      await token.connect(addr[1]).approve(owner.address, 10);
      await token.transferFrom(addr[1].address, addr[2].address, 10);
      expect(await token.balanceOf(addr[2].address)).to.equal(10);
    });
    it("not enough tokens on balance", async function () {
      await token.mint(addr[1].address, 10);

      await expect(token.transferFrom(addr[1].address, addr[2].address, 15)).to.be.revertedWith("not enough tokens on balance");
    });
    it("not enough tokens on allowance", async function () {
      await token.mint(addr[1].address, 10);

      await expect(token.transferFrom(addr[1].address, addr[2].address, 5)).to.be.revertedWith("not enough tokens on allowance");
    });
    it("from- zero address", async function () {
      await expect(token.transferFrom(zeroAdd, addr[1].address, 10)).to.be.revertedWith("from- zero address");

    });
    it("to-zero address", async function () {
      await expect(token.transferFrom(addr[1].address, zeroAdd, 10)).to.be.revertedWith("to-zero address");

    });
  });
  describe("increaseAllowance", function () {
    it("should transfer on account balance", async function () {

      await token.approve(addr[2].address, 10);
      await token.increaseAllowance(addr[2].address, 10);

      expect(await token.allowance(owner.address, addr[2].address)).to.equal(20);

    });
    it("spender - zero address", async function () {
      await expect(token.increaseAllowance(zeroAdd, 10)).to.be.revertedWith("spender - zero address");

    });
  });
  describe("mint", function () {
    it("msg.sender not owner", async function () {

      await expect ( token.connect(addr[2]).mint(addr[1].address, 10)).to.be.revertedWith("msg.sender not owner"); 

    });
    it("mint on zero address", async function () {
      await expect(token.mint(zeroAdd, 10)).to.be.revertedWith("account - zero address");

    });
  });
  describe("burn", function () {
    it("msg.sender not owner", async function () {

      await token.mint(addr[1].address, 10);

      await expect(token.connect(addr[2]).burn(addr[1].address, 10)).to.be.revertedWith("msg.sender not owner");

    });
    it("burn on zero address", async function () {
      await expect(token.burn(zeroAdd, 10)).to.be.revertedWith("account - zero address");

    });
    it("not enough tokens on account", async function () {

      await token.mint(addr[1].address, 5);
      await expect(token.burn(addr[1].address, 10)).to.be.revertedWith("not enough tokens on account");

    });
    it("burn works right", async function () {

      await token.mint(addr[1].address, 15);
      token.burn(addr[1].address, 10)
      expect(await token.balanceOf(addr[1].address)).to.be.equal(5);

    });
  });
  describe("decreaseAllowance", function () {
    it("should transfer on account balance", async function () {

      await token.approve(addr[2].address, 10);
      await token.decreaseAllowance(addr[2].address, 5);

      expect(await token.allowance(owner.address, addr[2].address)).to.equal(5);

    });
    it("spender - zero address", async function () {
      await expect(token.decreaseAllowance(zeroAdd, 10)).to.be.revertedWith("spender - zero address");

    });
    it("not enough for allowance", async function () {

      await token.approve(addr[2].address, 10);
      await expect(token.decreaseAllowance(addr[2].address, 15)).to.be.revertedWith("not enough for allowance");

    });
  });

});
