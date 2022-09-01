require("hardhat-gas-reporter");
require('hardhat-contract-sizer');
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const web3 = require('web3');

// npx hardhat run scripts/deploy.js --network rinkeby

// tellor flex arguments
var tokenAddress = '0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0';
var reportingLock = 3600 * 12; // 12 hours
var stakeAmountDollarTarget = web3.utils.toWei("2500");
var stakingTokenPrice = web3.utils.toWei("20");
var stakingTokenPriceQueryId = '0x5c13cd9c97dbb98f2429c101a2a8150e6c7a0ddaff6124ee176a3a411067ded0'

// governance arguments
// tellorOracleAddress
var teamMultisigAddress = '0x2F51C4Bf6B66634187214A695be6CDd344d4e9d1' // rinkeby

// tellor360 arguments
// tellorOracleAddress

// query data storage arguments
// none

// autopay arguments
// tellorAddress
// queryDataStorageAddress
var autopayFee = 20 // '20' is 2%


async function deployTellor360(_network, _pk, _nodeURL, _tokenAddress, _reportingLock, _stakeAmountDollarTarget, _stakingTokenPrice, _stakingTokenPriceQueryId, _teamMultisigAddress, _autopayFee) {
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
    // const flexfac = await ethers.getContractFactory("contracts/tellor3/Extension.sol:Extension", wallet)
    const flexfac = await ethers.getContractFactory("tellorflex/contracts/TellorFlex.sol:TellorFlex", wallet)
    const flex = await flexfac.deploy(_tokenAddress, _reportingLock, _stakeAmountDollarTarget, _stakingTokenPrice, _stakingTokenPriceQueryId)
    console.log("TellorFlex contract deployed to: ", flex.address)

    await flex.deployed()

    if (net == "mainnet") {
        console.log("TellorFlex contract deployed to:", "https://etherscan.io/address/" + flex.address);
        console.log("   TellorFlex transaction hash:", "https://etherscan.io/tx/" + flex.deployTransaction.hash);
    } else if (net == "rinkeby") {
        console.log("TellorFlex contract deployed to:", "https://rinkeby.etherscan.io/address/" + flex.address);
        console.log("    TellorFlex transaction hash:", "https://rinkeby.etherscan.io/tx/" + flex.deployTransaction.hash);
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
        console.log("Governance contract deployed to:", "https://etherscan.io/address/" + governance.address);
        console.log("   Governance transaction hash:", "https://etherscan.io/tx/" + governance.deployTransaction.hash);
    } else if (net == "rinkeby") {
        console.log("Governance contract deployed to:", "https://rinkeby.etherscan.io/address/" + governance.address);
        console.log("    Governance transaction hash:", "https://rinkeby.etherscan.io/tx/" + governance.deployTransaction.hash);
    } else {
        console.log("Please add network explorer details")
    }



    //////////////// Tellor360
    console.log("Starting deployment for tellor360 contract...")
    const tellor360fac = await ethers.getContractFactory("tellor360/contracts/Tellor360.sol:Tellor360", wallet)
    const tellor360 = await tellor360fac.deploy(flex.address) // tellor oracle address
    console.log("Tellor360 contract deployed to: ", tellor360.address)

    await tellor360.deployed()

    if (net == "mainnet") {
        console.log("Governance contract deployed to:", "https://etherscan.io/address/" + tellor360.address);
        console.log("   Tellor360 transaction hash:", "https://etherscan.io/tx/" + tellor360.deployTransaction.hash);
    } else if (net == "rinkeby") {
        console.log("Tellor360 contract deployed to:", "https://rinkeby.etherscan.io/address/" + tellor360.address);
        console.log("    Tellor360 transaction hash:", "https://rinkeby.etherscan.io/tx/" + tellor360.deployTransaction.hash);
    } else {
        console.log("Please add network explorer details")
    }

    

    ///////////// QueryDataStorage
    console.log("Starting deployment for QueryDataStorage contract...")
    const qstoragefac = await ethers.getContractFactory("autopay/contracts/QueryDataStorage.sol:QueryDataStorage", wallet)
    const qstorage = await qstoragefac.deploy()

    await qstorage.deployed();

    if (net == "mainnet") {
        console.log("QueryDataStorage contract deployed to:", "https://etherscan.io/address/" + qstorage.address);
        console.log("    QueryDataStorage transaction hash:", "https://etherscan.io/tx/" + qstorage.deployTransaction.hash);
    } else if (net == "rinkeby") {
        console.log("QueryDataStorage contract deployed to:", "https://rinkeby.etherscan.io/address/" + qstorage.address);
        console.log("    QueryDataStorage transaction hash:", "https://rinkeby.etherscan.io/tx/" + qstorage.deployTransaction.hash);
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
        console.log("Autopay contract deployed to:", "https://etherscan.io/address/" + autopay.address);
        console.log("   Autopay transaction hash:", "https://etherscan.io/tx/" + autopay.deployTransaction.hash);
    } else if (net == "rinkeby") {
        console.log("Autopay contract deployed to:", "https://rinkeby.etherscan.io/address/" + autopay.address);
        console.log("    Autopay transaction hash:", "https://rinkeby.etherscan.io/tx/" + autopay.deployTransaction.hash);
    } else {
        console.log("Please add network explorer details")
    }


    


    //////////////// Verify contracts

    // Wait for few confirmed transactions.
    // Otherwise the etherscan api doesn't find the deployed contract.
    console.log('waiting for flex tx confirmation...');
    await flex.deployTransaction.wait(7)

    console.log('submitting contract for verification...');
    await run("verify:verify",
        {
            address: flex.address,
            constructorArguments: [_tokenAddress, _reportingLock, _stakeAmountDollarTarget, _stakingTokenPrice, _stakingTokenPriceQueryId]
        },
    )
    console.log("TellorFlex contract verified")

    // Wait for few confirmed transactions.
    // Otherwise the etherscan api doesn't find the deployed contract.
    console.log('waiting for governance tx confirmation...');
    await governance.deployTransaction.wait(7)

    console.log('submitting contract for verification...');

    await run("verify:verify",
        {
            address: governance.address,
            constructorArguments: [flex.address, teamMultisigAddress]
        },
    )
    console.log("Governance contract verified")


    // Wait for few confirmed transactions.
    // Otherwise the etherscan api doesn't find the deployed contract.
    console.log('waiting for tellor360 tx confirmation...');
    await tellor360.deployTransaction.wait(7)

    console.log('submitting contract for verification...');
    await run("verify:verify",
        {
            address: tellor360.address,
            constructorArguments: [flex.address]
        },
    )
    console.log("Tellor360 contract verified")

    // Wait for few confirmed transactions.
    // Otherwise the etherscan api doesn't find the deployed contract.
    console.log('waiting for query data storage tx confirmation...');
    await qstorage.deployTransaction.wait(7)

    console.log('submitting query data storage contract for verification...');
    await run("verify:verify",
        {
            address: qstorage.address
        },
    )
    console.log("query data storage contract verified")

    // Wait for few confirmed transactions.
    // Otherwise the etherscan api doesn't find the deployed contract.
    console.log('waiting for autopay tx confirmation...');
    await autopay.deployTransaction.wait(7)

    console.log('submitting autopay contract for verification...');
    await run("verify:verify",
        {
            address: autopay.address,
            constructorArguments: [flex.address, qstorage.address, _autopayFee]
        },
    )
    console.log("governance contract verified")

}


deployTellor360("rinkeby", process.env.TESTNET_PK, process.env.NODE_URL_RINKEBY, tokenAddress, reportingLock, stakeAmountDollarTarget, stakingTokenPrice, stakingTokenPriceQueryId, teamMultisigAddress, autopayFee)
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });