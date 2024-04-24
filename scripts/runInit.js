require("hardhat-gas-reporter");
require('hardhat-contract-sizer');
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const web3 = require('web3');
const hre = require("hardhat");

// npx hardhat run scripts/runInit.js --network tfilecoin


async function deployTellor360() {
    console.log("deploy tellor 360")
    await run("compile")

    var net = hre.network.name

    ///////////////Connect to the network
    try {
        if (net == "mainnet") {
            var network = "mainnet"
            var explorerUrl = "https://etherscan.io/address/"
            var _tokenAddress = '0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0'
            var _teamMultisigAddress = '0x39e419ba25196794b595b2a595ea8e527ddc9856'
            var pubAddr = process.env.PUBLIC_KEY
            var privateKey = process.env.PRIVATE_KEY
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_MAINNET)
        } else if (net == "goerli") {
            var network = "goerli"
            var explorerUrl = "https://goerli.etherscan.io/address/"
            var _tokenAddress = '0x51c59c6cAd28ce3693977F2feB4CfAebec30d8a2'
            var _teamMultisigAddress = '0x4A1099d4897fFcc8eC7cb014B1a7442B28C7940C'
            var pubAddr = process.env.TESTNET_PUBLIC
            var privateKey = process.env.TESTNET_PK
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_GOERLI)           
        } else if (net == "polygon") {
            var network = "polygon"
            var explorerUrl = "https://polygonscan.com/address/"
            var _tokenAddress = '0xE3322702BEdaaEd36CdDAb233360B939775ae5f1'
            var _teamMultisigAddress = '0xa3fe6d88f2ea92be357663ba9e747301e4cfc39B'
            var pubAddr = process.env.TESTNET_PUBLIC
            var privateKey = process.env.TESTNET_PK
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_POLYGON)
        } else if (net == "mumbai") {
            var network = "mumbai"
            var explorerUrl = "https://mumbai.polygonscan.com/address/"
            var _tokenAddress = '0xce4e32fe9d894f8185271aa990d2db425df3e6be'
            var _teamMultisigAddress = '0x80fc34a2f9FfE86F41580F47368289C402DEc660'
            var pubAddr = process.env.TESTNET_PUBLIC
            var privateKey = process.env.TESTNET_PK
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_MUMBAI)
            
        } else if (net == "chiado") {
            var network = "chiado"
            var explorerUrl = "https://blockscout.chiadochain.net/address/"
            var _tokenAddress = '0xe7147C5Ed14F545B4B17251992D1DB2bdfa26B6d'
            var _teamMultisigAddress = '0x15e6Cc0D69A162151Cadfba035aa10b82b12b970'
            var pubAddr = process.env.TESTNET_PUBLIC
            var privateKey = process.env.TESTNET_PK
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_CHIADO)
            
        } else if (net == "gnosis") {
            var network = "gnosis"
            var explorerUrl = "https://gnosisscan.io/address/"
            var _tokenAddress = '0xaad66432d27737ecf6ed183160adc5ef36ab99f2'
            var _teamMultisigAddress = '0x9d119edeeF320f285704736f362cabC180a66f54'
            var pubAddr = process.env.TESTNET_PUBLIC
            var privateKey = process.env.TESTNET_PK
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_GNOSIS)

        } else if (net == "arbitrum_testnet") {
            var network = "arbitrum_testnet"
            var explorerUrl = "https://goerli.arbiscan.io/address/"
            var _tokenAddress = '0x8d1bB5eDdFce08B92dD47c9871d1805211C3Eb3C'
            var pubAddr = process.env.TESTNET_PUBLIC
            var privateKey = process.env.TESTNET_PK
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_ARBITRUM_TESTNET)
            
        } else if (net == "tfilecoin") {
            var network = "tfilecoin"
            var explorerUrl = "https://hyperspace.filfox.info/en/address/"
            var _tokenAddress = '0xe7147C5Ed14F545B4B17251992D1DB2bdfa26B6d'
            var pubAddr = process.env.TESTNET_PUBLIC
            var privateKey = process.env.TESTNET_PK
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_FILECOIN_TESTNET)
        } else {
           console.log( "network not defined")
        }

        console.log("Tellor Address: ", _tokenAddress)
        console.log("nework", network)
        console.log("deploying from: ", pubAddr)
        
    } catch (error) {
        console.error(error)
        console.log("network error or environment not defined")
        process.exit(1)
    }
    let wallet = new ethers.Wallet(privateKey, provider)


   //const flexfac = await ethers.getContractFactory("tellorflex/contracts/TellorFlex.sol:TellorFlex", wallet)
    let flex = await ethers.getContractAt("tellorflex/contracts/TellorFlex.sol:TellorFlex", tellorFlexAddress, wallet)

    // init flex
    console.log('initializing flex...');
    await flex.init(governanceAddress)
    console.log('flex initialized');
}


deployTellor360()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });