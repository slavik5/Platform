import "@nomiclabs/hardhat-waffle";
import "solidity-coverage"
import "@nomiclabs/hardhat-etherscan";
import * as dotenv from "dotenv";
dotenv.config();
import "./task/buy"
import "./task/register"
import "./task/addOrder"
import "./task/redeemOrder"
import "./task/startSaleRound"
import "./task/startTradeRound"


module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: process.env.ALCHEMY_API_KEY,
      gas: "auto",
      gasPrice: 20000000000,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN,
  }
};
