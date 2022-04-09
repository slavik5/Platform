import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { parseEther } from "ethers/lib/utils";

task("register", "register")
    .addParam("account", "who")
    .addParam("ref", "referal")
    .setAction(async function (taskArgs, hre) {
        const network = hre.network.name;
        console.log(network);
        const [...addr] = await hre.ethers.getSigners();
        
        const token = await hre.ethers.getContractAt("Token", process.env.Token_CONTRACT as string);
        const platform = await hre.ethers.getContractAt("Platform", process.env.Platform_CONTRACT as string);
        
        await platform.connect(addr[1]).register(platform.address);
        //await platform.connect(addr[taskArgs.account]).register(addr[taskArgs.ref]);
        console.log('register task Done!');

    });
