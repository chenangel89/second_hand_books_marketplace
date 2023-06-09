require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require('dotenv').config();
const fs = require('fs');
// const infuraId = fs.readFileSync(".infuraid").toString().trim() || "";

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});
const { PRIVATE_KEY } = process.env;
const { REACT_APP_ALCHEMY_API } = process.env;
module.exports = {
  defaultNetwork: "mumbai",
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${REACT_APP_ALCHEMY_API}`,
      accounts: [ PRIVATE_KEY ]
    },
    matic: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${REACT_APP_ALCHEMY_API}`,
      accounts: [ PRIVATE_KEY ]
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
