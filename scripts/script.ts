import {ethers} from "hardhat";
import { parseEther } from "ethers/lib/utils";

async function main() {
  
  const Platform = await ethers.getContractFactory("Platform");
  //"0x38702D04D5C7f2d817a367f1061b1ec9CF0503C0" - contract address
  //"0xC55d74a292ABB9F85DD9D550590a1F86D6706307" - admin address
  // 24*60*60= 1 day 
  //parseEther("0.00001") salePrice
  const platform = await Platform.deploy("0x38702D04D5C7f2d817a367f1061b1ec9CF0503C0",24*60*60,parseEther("0.00001"),parseEther("100000"),"0xC55d74a292ABB9F85DD9D550590a1F86D6706307");
  await platform.deployed();
  
  
  console.log("Platform deployed to:", platform.address);  
  
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
