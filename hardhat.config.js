/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
// require("solidity-coverage");
require("hardhat-gas-reporter");
require('hardhat-contract-sizer');
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.3",
        settings: {
          optimizer: {
            enabled: true,
            runs: 300
          }
        }
      }
    ]
  },
  networks: {
    hardhat: {
      // hardfork: process.env.CODE_COVERAGE ? "berlin" : "london",
      // initialBaseFeePerGas: 0,
      // accounts: {
      //   mnemonic:
      //     "nick lucian brenda kevin sam fiscal patch fly damp ocean produce wish",
      //   count: 40,
      // },
      forking: {
        url : "https://eth-mainnet.alchemyapi.io/v2/hP3lNPFpxPSwfwJtfaZi4ezZlPgimAnN", // mainnet
        // url: "https://eth-goerli.alchemyapi.io/v2/I-BlqR7R6s5-Skel3lnCwJzamDbmXHLF", // Goerli
        // blockNumber:  // rinkeby
      },
      allowUnlimitedContractSize: true
    },
    goerli: {
      url: `${process.env.NODE_URL_GOERLI}`,
      accounts: [process.env.TESTNET_PK],
      gas: 10000000 ,
      gasPrice: 50000000000
    },
      // mainnet: {
      //   url: `${process.env.NODE_URL_MAINNET}`,
      //   accounts: [process.env.PRIVATE_KEY],
      //   gas: 10000000 ,
      //   gasPrice: 50000000000
      // },
   mumbai: {
        url: `${process.env.NODE_URL_MUMBAI}`,
        accounts: [process.env.TESTNET_PK],
        gas: 5000000 ,
        gasPrice: 50000000000
      },
    polygon: {
      url: `${process.env.NODE_URL_MATIC}`,
      accounts: [process.env.PRIVATE_KEY],
      gas: 5000000 ,
      gasPrice: 250000000000
 
      //maxPriorityFeePerGas: ,
      //maxFeePerGas: 
    },
    chiado: {
      url: `${process.env.NODE_URL_CHIADO}`,
      accounts: [process.env.TESTNET_PK],
      gas: 5000000 ,
      gasPrice: 50000000000
    } ,
    gnosis: {
      url: `${process.env.NODE_URL_GNOSIS}`,
      accounts: [process.env.TESTNET_PK],
      gas: 5000000 ,
      gasPrice: 5000000000
    } 

  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    //apiKey: process.env.ETHERSCAN
    //apiKey: process.env.POLYSCAN
    apiKey: process.env.GNOSISSCAN
  },

  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },

  mocha: {
    grep: "@skip-on-coverage", // Find everything with this tag
    invert: true               // Run the grep's inverse set.
  }

};
