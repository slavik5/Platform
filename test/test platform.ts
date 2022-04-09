import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { parseEther } from "ethers/lib/utils";

let addr: SignerWithAddress[];
let validator: SignerWithAddress;
let Token: ContractFactory;
let token: Contract;
let Platform: ContractFactory;
let platform: Contract;
let zeroAdd: string;

function skipTime(s: number) {
    ethers.provider.send("evm_increaseTime", [s]);
    ethers.provider.send("evm_mine", []);
}

describe("Platform contract", function () {


  beforeEach(async () => {
    addr = await ethers.getSigners();
    Token = await ethers.getContractFactory("Token");
    token = await Token.deploy();
    
    Platform=await ethers.getContractFactory("Platform");
    platform=await Platform.deploy(token.address,24*60*60,parseEther("0.00001"),parseEther("100000"),addr[0].address);

    //await dao.grantRole(await token1.DEFAULT_ADMIN_ROLE(), chain1.address);
    await token.grantRole(await token.DEFAULT_ADMIN_ROLE(), platform.address);
    zeroAdd = '0x0000000000000000000000000000000000000000';
  });
  
  describe("register", function () {
    it("register person with no referal", async function () {
        await platform.register(zeroAdd);
        expect(await platform.registrationCheck(addr[0].address)).to.equal(true);
        //console.log(await platform.duration())
    });
    it("register person with referal", async function () {
      
      await platform.connect(addr[2]).register(zeroAdd);
      await platform.connect(addr[1]).register(addr[2].address);
          
      expect(await platform.usersRefOf(addr[1].address)).to.equal(addr[2].address);
    });
    it("already register", async function () {
      await platform.connect(addr[2]).register(zeroAdd);
      await expect(platform.connect(addr[2]).register(zeroAdd)).to.be.revertedWith("already register");
      await platform.connect(addr[1]).register(addr[2].address);
      await expect(platform.connect(addr[1]).register(addr[2].address)).to.be.revertedWith("already register");
    });
    it("wrong ref", async function () {
      await platform.connect(addr[2]).register(zeroAdd);
      
      await expect(platform.connect(addr[1]).register(addr[3].address)).to.be.revertedWith("wrong ref");
    });
    
  });
  describe("startSaleRound", function () {
    it("startSaleRound first", async function () {
      await platform.startSaleRound();
      expect(await platform.statusOf()).to.equal(1);
      expect(await token.balanceOf(platform.address)).to.equal(parseEther("100000")) 
    });
    it("msg.sender not admin", async function () {
      await expect(platform.connect(addr[1]).startSaleRound()).to.be.revertedWith("msg.sender not admin");
    });
    it("second sale round", async function () {
      await platform.startSaleRound();
      await platform.connect(addr[2]).register(zeroAdd);    
      await platform.connect(addr[2]).buy(parseEther("10000"),{value:parseEther("10.0")});
      console.log(await platform.salePriceOf())
     
      skipTime(60*60*25)
      await platform.startTradeRound();
      await expect(platform.startSaleRound()).to.be.revertedWith("trade round not end");
      await token.connect(addr[2]).approve(platform.address, parseEther("10000"));
      await platform.connect(addr[2]).addOrder(parseEther("10000"),parseEther("1"))
      await platform.connect(addr[1]).redeemOrder(addr[2].address,parseEther("10000"),{value:parseEther("10")})
      await platform.howMuchToPay(parseEther("10000"))
      console.log(await platform.tradingVolumeOf())
      skipTime(60*60*24)
      await platform.startSaleRound()
      await expect(platform.startSaleRound()).to.be.revertedWith("sale round already started");
      
      console.log(await platform.salePriceOf())
      console.log(await platform.saleSupplyOf())
      
      
    });
  });
  describe("buy", function () {
    it("buy work right", async function () {
      await platform.startSaleRound();
      await platform.connect(addr[2]).register(zeroAdd);
      await platform.connect(addr[1]).register(addr[2].address);
      await platform.connect(addr[3]).register(addr[1].address);
      //console.log()
      
      await platform.connect(addr[2]).buy(parseEther("1"),{value:parseEther("10.1")});
      
      await platform.connect(addr[1]).buy(parseEther("3"),{value:parseEther("10.1")})
      await platform.connect(addr[3]).buy(parseEther("2"),{value:parseEther("10.1")})
      
      expect(await token.balanceOf(addr[2].address)).to.equal(parseEther("1")) 
      expect(await token.balanceOf(addr[1].address)).to.equal(parseEther("3")) 
      expect(await token.balanceOf(addr[3].address)).to.equal(parseEther("2")) 

      
      
      //await expect(await platform.connect(addr[2]).buy(parseEther("2"),{value:parseEther("10.0")}))
      //.to.changeEtherBalance(platform.address, platform.salePriceOf()*2);
      
    });
    it("check requires", async function () {
      await platform.startSaleRound();
      await platform.connect(addr[2]).register(zeroAdd);
      await platform.connect(addr[1]).register(addr[2].address);
      await platform.connect(addr[3]).register(addr[1].address);
      await expect(platform.connect(addr[2]).buy(parseEther("200000"))).to.be.revertedWith("not enoug tokens to sale");
      await expect(platform.connect(addr[2]).buy(parseEther("2"),{value:1})).to.be.revertedWith("not enough eth");
      skipTime(60*60*25)
      await expect(platform.connect(addr[2]).buy(parseEther("2"))).to.be.revertedWith("sale round end");
    });
    
  });
  describe("startTradeRound", function () {
    it("startTradeRound time", async function () {
      await platform.startSaleRound();
      await expect(platform.startTradeRound()).to.be.revertedWith("sale round not end");
      skipTime(60*60*25)
      await platform.startTradeRound();
      expect(await platform.statusOf()).to.equal(2);
      await expect(platform.startTradeRound()).to.be.revertedWith("trade round already started");
      expect(await token.balanceOf(platform.address)).to.equal(0)
     
    });
    it("startTradeRound supply", async function () {
      await platform.startSaleRound();
      await platform.connect(addr[2]).buy(parseEther("100000"),{value:parseEther("100.1")});
      
      await platform.startTradeRound();
      expect(await platform.statusOf()).to.equal(2);
      expect(await token.balanceOf(platform.address)).to.equal(0)
     
    });
    it("msg.sender not admin", async function () {
      await expect(platform.connect(addr[1]).startTradeRound()).to.be.revertedWith("msg.sender not admin");
    });
    
  });
  describe("addOrder", function () {
    it("addOrder work right", async function () {
      await platform.startSaleRound();
      await platform.connect(addr[2]).buy(parseEther("10"),{value:parseEther("100.1")});
      
     
      skipTime(60*60*25)
      await platform.startTradeRound();
      await platform.connect(addr[2]).addOrder(parseEther("5"),parseEther("0.001"))

      expect(await platform.orderPriceOf(addr[2].address)).to.equal(parseEther("0.001"))
      
    });
    it("check requires", async function () {
      await platform.startSaleRound();
      await platform.connect(addr[2]).buy(parseEther("10"),{value:parseEther("100.1")});
      
      await expect(platform.connect(addr[2]).addOrder(parseEther("5"),parseEther("0.001"))).to.be.revertedWith("not trade round");
      skipTime(60*60*25)
      await platform.startTradeRound();
      await expect(platform.connect(addr[2]).addOrder(parseEther("15"),parseEther("0.001"))).to.be.revertedWith("not enough tokens to order");
      await platform.connect(addr[2]).addOrder(parseEther("5"),parseEther("0.001"))
      await expect(platform.connect(addr[2]).addOrder(parseEther("5"),parseEther("0.001"))).to.be.revertedWith("already added");
    });
        
  });
  describe("removeOrder", function () {
    it("removeOrder work right", async function () {
      await platform.startSaleRound();
      await platform.connect(addr[2]).buy(parseEther("10"),{value:parseEther("100.1")});
      
     
      skipTime(60*60*25)
      await platform.startTradeRound();
      await platform.connect(addr[2]).addOrder(parseEther("5"),parseEther("0.001"))
      await platform.connect(addr[2]).removeOrder()
      expect(await platform.orderPriceOf(addr[2].address)).to.equal(0)
      
    });
    
        
  });
  describe("redeemOrder", function () {
    it("redeemOrder work right", async function () {
      await platform.startSaleRound();
      await platform.connect(addr[2]).register(zeroAdd);
      await platform.connect(addr[1]).register(addr[2].address);
      await platform.connect(addr[3]).register(addr[1].address);      
      await platform.connect(addr[2]).buy(parseEther("5"),{value:parseEther("1.0")});
      
      await platform.connect(addr[1]).buy(parseEther("3"),{value:parseEther("1.0")})
      await platform.connect(addr[3]).buy(parseEther("2"),{value:parseEther("1.0")})
      skipTime(60*60*25)
      await platform.startTradeRound();
      await token.connect(addr[2]).approve(platform.address, parseEther("5"));
      await platform.connect(addr[2]).addOrder(parseEther("5"),parseEther("0.0033"))
      await platform.connect(addr[1]).redeemOrder(addr[2].address,parseEther("5"),{value:parseEther("0.0033")})
      console.log(await platform.tradingVolumeOf())

      await token.connect(addr[1]).approve(platform.address, parseEther("5"));
      await platform.connect(addr[1]).addOrder(parseEther("3"),parseEther("0.002"))
      await platform.connect(addr[4]).redeemOrder(addr[1].address,parseEther("3"),{value:parseEther("1.0")})
      console.log(await platform.tradingVolumeOf())
      await token.connect(addr[3]).approve(platform.address, parseEther("5"));
      await platform.connect(addr[3]).addOrder(parseEther("2"),parseEther("0.001"))
      await platform.connect(addr[4]).redeemOrder(addr[3].address,parseEther("1"),{value:parseEther("1.0")})
      
      expect(await token.balanceOf(addr[2].address)).to.equal(parseEther("0")) 
      expect(await token.balanceOf(addr[1].address)).to.equal(parseEther("5")) 
      expect(await token.balanceOf(addr[4].address)).to.equal(parseEther("4")) 
      
    });
    
    it("check requires", async function () {
      await platform.startSaleRound();
      await platform.connect(addr[2]).register(zeroAdd);
          
      await platform.connect(addr[2]).buy(parseEther("5"),{value:parseEther("10.0")});
      
      await expect(platform.connect(addr[2]).redeemOrder(addr[2].address,parseEther("5"),{value:parseEther("1.0")})).to.be.revertedWith("not trade round");
      skipTime(60*60*25)
      await platform.startTradeRound();
      await token.connect(addr[2]).approve(platform.address, parseEther("5"));
      await platform.connect(addr[2]).addOrder(parseEther("5"),parseEther("10.0"))
      await expect(platform.connect(addr[1]).redeemOrder(addr[2].address,parseEther("15"),{value:parseEther("1.0")}))
      .to.be.revertedWith("order do not have enough tokens");
      await expect(platform.connect(addr[1]).redeemOrder(addr[2].address,parseEther("5"),{value:1}))
      .to.be.revertedWith("not enough eth");
      
      
      
      
     
     
      
    });
    
        
  });
});