require("hardhat-gas-reporter");
require('hardhat-contract-sizer');
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const web3 = require('web3');

// npx hardhat run scripts/deploy-updateOracle.js --network goerli

// tellor flex arguments
var tokenAddress = '0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0';//goerli and ethereum mainnet
// var tokenAddress = '0xce4e32fe9d894f8185271aa990d2db425df3e6be';//mumbai
//var tokenAddress = '0xE3322702BEdaaEd36CdDAb233360B939775ae5f1';//polygon
//var tokenAddress = '0x51c59c6cAd28ce3693977F2feB4CfAebec30d8a2';//for goerli it will be the Master address

var reportingLock = 3600 * 12; // 12 hours
var stakeAmountDollarTarget = web3.utils.toWei("1500");
var stakingTokenPrice = web3.utils.toWei("15");
var minTRBstakeAmount = web3.utils.toWei("100")
var stakingTokenPriceQueryId = '0x5c13cd9c97dbb98f2429c101a2a8150e6c7a0ddaff6124ee176a3a411067ded0'

// governance arguments
// tellorOracleAddress
//var teamMultisigAddress = '0x2F51C4Bf6B66634187214A695be6CDd344d4e9d1' // goerli
//var teamMultisigAddress = '0x80fc34a2f9FfE86F41580F47368289C402DEc660'//mumbai
//var teamMultisigAddress = '0x3F0C1eB3FA7fCe2b0932d6d4D9E03b5481F3f0A7'//polygon
var teamMultisigAddress = '0x4A1099d4897fFcc8eC7cb014B1a7442B28C7940C'//goerli

// query data storage arguments
// none

// autopay arguments
// tellorAddress
// queryDataStorageAddress
var autopayFee = 20 // '20' is 2%


async function deployTellor360(_network, _pk, _nodeURL, _tokenAddress, _reportingLock, _stakeAmountDollarTarget, _stakingTokenPrice,_minTRBstakeAmount , _stakingTokenPriceQueryId, _teamMultisigAddress, _autopayFee) {
    console.log("deploy tellor 360")
    await run("compile")

    var net = _network

    ///////////////Connect to the network
    let privateKey = _pk;
    var provider = new ethers.providers.JsonRpcProvider(_nodeURL)
    let wallet = new ethers.Wallet(privateKey, provider)



    ////////////// Deploy Tellor 360

    //////////////// TellorFlex
    console.log("Starting deployment for flex contract...")
    const flexfac = await ethers.getContractFactory("tellorflex/contracts/TellorFlex.sol:TellorFlex", wallet)
    const flex = await flexfac.deploy(_tokenAddress, _reportingLock, _stakeAmountDollarTarget, _stakingTokenPrice,_minTRBstakeAmount , _stakingTokenPriceQueryId)
    console.log("TellorFlex contract deployed to: ", flex.address)

    await flex.deployed()

    if (net == "mainnet") {
        console.log("https://etherscan.io/address/" + flex.address);
    } else if (net == "goerli") {
        console.log("https://goerli.etherscan.io/address/" + flex.address);
    } else {
        console.log("Please add network explorer details")
    }



    //////////////// Governance
    console.log("Starting deployment for governance contract...")
    const govfac = await ethers.getContractFactory("polygongovernance/contracts/Governance.sol:Governance", wallet)
    const governance = await govfac.deploy(flex.address, _teamMultisigAddress)
    console.log("Governance contract deployed to: ", governance.address)

    await governance.deployed()

    if (net == "mainnet") {
        console.log("https://etherscan.io/address/" + governance.address);
    } else if (net == "goerli") {
        console.log("https://goerli.etherscan.io/address/" + governance.address);
    } else {
        console.log("Please add network explorer details")
    }

    

    ///////////// QueryDataStorage
    console.log("Starting deployment for QueryDataStorage contract...")
    const qstoragefac = await ethers.getContractFactory("autopay/contracts/QueryDataStorage.sol:QueryDataStorage", wallet)
    const qstorage = await qstoragefac.deploy()
    console.log("QueryDataStorage contract deployed to: ", qstorage.address)

    await qstorage.deployed();

    if (net == "mainnet") {
        console.log("https://etherscan.io/address/" + qstorage.address);
    } else if (net == "goerli") {
        console.log("https://goerli.etherscan.io/address/" + qstorage.address);
    } else {
        console.log("Please add network explorer details")
    }


    //////////////// Autopay
    console.log("Starting deployment for Autopay contract...")
    const autopayfac = await ethers.getContractFactory("autopay/contracts/Autopay.sol:Autopay", wallet)
    const autopay = await autopayfac.deploy(flex.address, qstorage.address, _autopayFee) // tellorOracleAddress, queryDataStorageAddress, autopayFee
    console.log("Autopay contract deployed to: ", autopay.address)

    await autopay.deployed()

    if (net == "mainnet") {
        console.log("https://etherscan.io/address/" + autopay.address);
    } else if (net == "goerli") {
        console.log("https://goerli.etherscan.io/address/" + autopay.address);
    } else {
        console.log("Please add network explorer details")
    }


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

    // init flex
    console.log('initializing flex...');
    await flex.init(governance.address)
    console.log('flex initialized');
}


deployTellor360("goerli", process.env.TESTNET_PK, process.env.NODE_URL_GOERLI, tokenAddress, reportingLock, stakeAmountDollarTarget, stakingTokenPrice, minTRBstakeAmount,stakingTokenPriceQueryId, teamMultisigAddress, autopayFee)
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });