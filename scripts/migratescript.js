require("hardhat-gas-reporter");
require('hardhat-contract-sizer');
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const web3 = require('web3');

// npx hardhat run scripts/migratescript.js --network goerli

var TellorMaster = '0x51c59c6cAd28ce3693977F2feB4CfAebec30d8a2';//for goerli it will be the Master address


async function deployTellor360(_network, _pk, _nodeURL) {
    console.log("migrating old tellor tokens to new tellor")
    await run("compile")

    var net = _network

        ///////////////Connect to the network
        let privateKey = _pk;
        var provider = new ethers.providers.JsonRpcProvider(_nodeURL)
        let wallet = new ethers.Wallet(privateKey, provider)

    //////////////// Tellor360
    console.log("Starting deployment for tellor360 contract...")
    const tellor360 = await ethers.getContractAt("tellor360/contracts/Tellor360.sol:Tellor360", TellorMaster)
    console.log("Tellor360 contract deployed to: ", tellor360.address)

    await tellor360.connect(wallet).migrate()
    console.log(" address migrated:", wallet.address) 

    

}


deployTellor360("goerli", process.env.TESTNET_PK, process.env.NODE_URL_GOERLI)
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });