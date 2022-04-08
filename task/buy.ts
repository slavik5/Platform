import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { parseEther } from "ethers/lib/utils";

task("buy", "")
    .addParam("amount", "amount to buy")
    .addParam("account", "who buy")
    .addParam("eth", "eth to pay")
    .setAction(async function (taskArgs, hre) {
        const network = hre.network.name;
        console.log(network);
        const [...addr] = await hre.ethers.getSigners();
        
        const token = await hre.ethers.getContractAt("Token", process.env.Token_CONTRACT as string);
        const platform = await hre.ethers.getContractAt("Platform", process.env.Platform_CONTRACT as string);
        
        
        await platform.connect(addr[taskArgs.account]).buy(parseEther(taskArgs.amount),{value:parseEther(taskArgs.eth)});
        console.log('buy task Done!');

    });