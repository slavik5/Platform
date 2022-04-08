import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { parseEther } from "ethers/lib/utils";

task("redeemOrder", "redeemOrder")
    .addParam("amount", "amount to addOrder")
    .addParam("account", "who addOrder")
    .addParam("which", "which Order")
    .setAction(async function (taskArgs, hre) {
        const network = hre.network.name;
        console.log(network);
        const [...addr] = await hre.ethers.getSigners();
        
        const token = await hre.ethers.getContractAt("Token", process.env.Token_CONTRACT as string);
        const platform = await hre.ethers.getContractAt("Platform", process.env.Platform_CONTRACT as string);
        
        
        await platform.connect(addr[taskArgs.account]).redeemOrder(taskArgs.which,parseEther(taskArgs.amount));
        console.log('redeemOrder task Done!');

    });