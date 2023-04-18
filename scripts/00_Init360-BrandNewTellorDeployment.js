require("hardhat-gas-reporter");
require('hardhat-contract-sizer');
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const web3 = require('web3');

/************************BEFORE INITIATING 360*******************************
 * These two prices have to be reporter 12 hours befor initiating Tellor 360
 * 
 * ETH/USD
 * TRB/USD
 * ***************************IMPORTANT**************************************
*/

// npx hardhat run scripts/Init360-BrandNewTellorDeployment.js --network sepolia

//sepolia
var TellorMaster = '0x80fc34a2f9FfE86F41580F47368289C402DEc660'//sepolia
var TellorFlex = '0x199839a4907ABeC8240D119B606C98c405Bb0B33'//sepolia


async function deployTellor360( _pk, _nodeURL) {
    console.log("migrating old tellor tokens to new tellor")
    await run("compile")

    var net = hre.network.name

    if (net == "sepolia") {
        var network = "sepolia"
        var explorerUrl = "https://sepolia.etherscan.io/address/"
        var pubAddr = process.env.TESTNET_PUBLIC
        var privateKey = process.env.TESTNET_PK
        var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_SEPOLIA)
    } else {
        console.log( "network not defined")
    }

    console.log("nework", network)
    console.log("deploying from: ", pubAddr)

    ///////////////Connect to the network
    
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

deployTellor360(process.env.TESTNET_PK, process.env.NODE_URL_GOERLI)
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });