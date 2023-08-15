require("hardhat-gas-reporter");
require('hardhat-contract-sizer');
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const web3 = require('web3');
const hre = require("hardhat");

// npx hardhat run scripts/01_deploy-updateOracle.js --network filecoin

var reportingLock = 3600 * 12; // 12 hours
var stakeAmountDollarTarget = web3.utils.toWei("1500");
var stakingTokenPrice = web3.utils.toWei("15");
var minTRBstakeAmount = web3.utils.toWei("100")
var autopayFee = 20 // '20' is 2%


async function deployTellor360( _reportingLock, _stakeAmountDollarTarget, _stakingTokenPrice,_minTRBstakeAmount , _autopayFee) {
    console.log("deploy tellor 360")
    await run("compile")

    var net = hre.network.name
    var  _stakingTokenPriceQueryId = '0x5c13cd9c97dbb98f2429c101a2a8150e6c7a0ddaff6124ee176a3a411067ded0'
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

        } else if (net == "optimism_goerli") {
            var network = "optimism_goerli"
            var explorerUrl = "https://gnosisscan.io/address/"
            var _tokenAddress = ''
            var _teamMultisigAddress = ''
            var pubAddr = process.env.TESTNET_PUBLIC
            var privateKey = process.env.TESTNET_PK
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_GNOSIS)
        } else if (net == "arbitrum_testnet") {
            var network = "arbitrum_testnet"
            var explorerUrl = "https://goerli.arbiscan.io/address/"
            var _tokenAddress = '0x8d1bB5eDdFce08B92dD47c9871d1805211C3Eb3C'
            var _teamMultisigAddress = '0xd71F72C18767083e4e3FE84F9c62b8038C1Ef4f6'
            var pubAddr = process.env.TESTNET_PUBLIC
            var privateKey = process.env.TESTNET_PK
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_ARBITRUM_TESTNET)
            
        } else if (net == "tfilecoin") {
            var network = "tfilecoin"
            var explorerUrl = "https://hyperspace.filfox.info/en/address/"
            var _tokenAddress = '0xe7147C5Ed14F545B4B17251992D1DB2bdfa26B6d'
            var _teamMultisigAddress = '0x15e6Cc0D69A162151Cadfba035aa10b82b12b970'
            var pubAddr = process.env.TESTNET_PUBLIC
            var privateKey = process.env.TESTNET_PK
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_FILECOIN_TESTNET)
        } else if (net == "filecoin") {
            var network = "filecoin"
            var explorerUrl = "https://filfox.info/en/address/"
            var _tokenAddress = '0x045CE60839d108B43dF9e703d4b25402a6a28a0d'
            var _teamMultisigAddress = '0x34Fae97547E990ef0E05e05286c51E4645bf1A85'
            var pubAddr = process.env.TESTNET_PUBLIC
            var privateKey = process.env.TESTNET_PK
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_FILECOIN)
        } else if (net == "sepolia") {
                var network = "sepolia"
                var explorerUrl = "https://sepolia.etherscan.io/address/"
                var _tokenAddress = '0x80fc34a2f9FfE86F41580F47368289C402DEc660'
                var _teamMultisigAddress = '0x34Fae97547E990ef0E05e05286c51E4645bf1A85'
                var pubAddr = process.env.TESTNET_PUBLIC
                var privateKey = process.env.TESTNET_PK
                var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_SEPOLIA)
       } else if (net == "manta_testnet") {
                var network = "manta_testnet"
                var explorerUrl = "https://manta-testnet.calderaexplorer.xyz/address/"
                var _tokenAddress = '0x896419Ed2E0dC848a1f7d2814F4e5Df4b9B9bFcc'
                var _teamMultisigAddress = '0x34Fae97547E990ef0E05e05286c51E4645bf1A85'
                var pubAddr = process.env.TESTNET_PUBLIC
                var privateKey = process.env.TESTNET_PK
                var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_MANTA_TESTNET)
                           
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
    

    //////////////// TellorFlex
    console.log("Starting deployment for flex contract...")
    const flexfac = await ethers.getContractFactory("tellorflex/contracts/TellorFlex.sol:TellorFlex", wallet)
    const flex = await flexfac.deploy(_tokenAddress, _reportingLock, _stakeAmountDollarTarget, _stakingTokenPrice,_minTRBstakeAmount , _stakingTokenPriceQueryId)
    console.log("TellorFlex contract deployed to: ", flex.address)

    await flex.deployed()
    console.log(explorerUrl + flex.address)

    //////////////// Governance
    console.log("Starting deployment for governance contract...")
    const govfac = await ethers.getContractFactory("polygongovernance/contracts/Governance.sol:Governance", wallet)
    const governance = await govfac.deploy(flex.address, _teamMultisigAddress)
    console.log("Governance contract deployed to: ", governance.address)

    await governance.deployed()
    console.log(explorerUrl + governance.address);


    ///////////// QueryDataStorage
    console.log("Starting deployment for QueryDataStorage contract...")
    const qstoragefac = await ethers.getContractFactory("autopay/contracts/QueryDataStorage.sol:QueryDataStorage", wallet)
    const qstorage = await qstoragefac.deploy()
    console.log("QueryDataStorage contract deployed to: ", qstorage.address)

    await qstorage.deployed();
    console.log(explorerUrl + qstorage.address);

    //////////////// Autopay
    console.log("Starting deployment for Autopay contract...")
    const autopayfac = await ethers.getContractFactory("autopay/contracts/Autopay.sol:Autopay", wallet)
    const autopay = await autopayfac.deploy(flex.address, qstorage.address, _autopayFee) // tellorOracleAddress, queryDataStorageAddress, autopayFee
    console.log("Autopay contract deployed to: ", autopay.address)

    await autopay.deployed()
    console.log(explorerUrl + autopay.address);

    // init flex
    console.log('initializing flex...');
    await flex.init(governance.address)
    console.log('flex initialized');
    //////////////// Verify contracts


    // Wait for few confirmed transactions.
    // Otherwise the etherscan api doesn't find the deployed contract.
    console.log('waiting for governance tx confirmation...');
    await governance.deployTransaction.wait(7)
    console.log('submitting contract for verification...');

    try {
        await run("verify:verify",
            {
                address: governance.address,
                constructorArguments: [flex.address, _teamMultisigAddress]
            },
        )
        console.log("Governance contract verified")
    } catch (e) {
        console.log(e)
    }


    // Wait for few confirmed transactions.
    // Otherwise the etherscan api doesn't find the deployed contract.
    console.log('waiting for flex tx confirmation...');
    await flex.deployTransaction.wait(7)

    console.log('submitting contract for verification...');

    try {
        await run("verify:verify",
            {
                address: flex.address,
                constructorArguments: [_tokenAddress, _reportingLock, _stakeAmountDollarTarget, _stakingTokenPrice,_minTRBstakeAmount, _stakingTokenPriceQueryId]
            },
        )
        console.log("TellorFlex contract verified")
    } catch (e) {
        console.log(e)
    }


        // Wait for few confirmed transactions.
    // Otherwise the etherscan api doesn't find the deployed contract.
    console.log('waiting for autopay tx confirmation...');
    await autopay.deployTransaction.wait(7)

    console.log('submitting autopay contract for verification...');
    try {
        await run("verify:verify",
            {
                address: autopay.address,
                constructorArguments: [flex.address, qstorage.address, _autopayFee]
            },
        )
        console.log("autopay contract verified")
    } catch (e) {
        console.log(e)
    }


    // Wait for few confirmed transactions.
    // Otherwise the etherscan api doesn't find the deployed contract.
    console.log('waiting for query data storage tx confirmation...');
    await qstorage.deployTransaction.wait(7)

    console.log('submitting query data storage contract for verification...');
    try {
        await run("verify:verify",
            {
                address: qstorage.address
            },
        )
        console.log("query data storage contract verified")
    } catch (e) {
        console.log(e)
    }


}


deployTellor360(  reportingLock, stakeAmountDollarTarget, stakingTokenPrice, minTRBstakeAmount, autopayFee)
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });