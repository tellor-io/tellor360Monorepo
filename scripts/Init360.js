require("hardhat-gas-reporter");
require('hardhat-contract-sizer');
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const web3 = require('web3');

// npx hardhat run scripts/Init360.js --network goerli

//Goerli
var TellorMaster = '0x51c59c6cAd28ce3693977F2feB4CfAebec30d8a2'//for goerli it will be the Master address
var TellorFlex = '0xB3B662644F8d3138df63D2F43068ea621e2981f9'//goerli flex


async function deployTellor360(_network, _pk, _nodeURL) {
    console.log("migrating old tellor tokens to new tellor")
    await run("compile")

    var net = _network

    ///////////////Connect to the network
    let privateKey = _pk;
    var provider = new ethers.providers.JsonRpcProvider(_nodeURL)
    let wallet = new ethers.Wallet(privateKey, provider)

    //////////////// TellorFlex
    console.log("Starting deployment for flex contract...")
    const flex = await ethers.getContractAt("tellorflex/contracts/TellorFlex.sol:TellorFlex",TellorFlex )
   console.log("TellorFlex contract deployed to: ", flex.address)

    //////////////// Tellor360
    console.log("Starting deployment for tellor360 contract...")
    const tellor360 = await ethers.getContractAt("tellor360/contracts/Tellor360.sol:Tellor360", TellorMaster)
    console.log("Tellor360 contract deployed to: ", tellor360.address)

    await tellor360.connect(wallet).init()
    console.log(" 360 init") 
    await tellor360.connect(wallet).mintToOracle({ gasPrice:50000000000, gasLimit:500000 })
    console.log(" mint to oracle")
    await tellor360.connect(wallet).transferOutOfContract({ gasPrice:50000000000, gasLimit:500000 }) 
    console.log(" tranfer out of contract")
    

}

deployTellor360("goerli", process.env.TESTNET_PK, process.env.NODE_URL_GOERLI)
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });