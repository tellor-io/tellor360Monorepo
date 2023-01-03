require("hardhat-gas-reporter");
require('hardhat-contract-sizer');
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const web3 = require('web3');

// npx hardhat run scripts/nonEthDeployments.js --network mumbai

// tellor flex arguments

//var tokenAddress = '0xCE4e32fE9D894f8185271Aa990D2dB425DF3E6bE' //mumbai
//var tokenAddress = '0xE3322702BEdaaEd36CdDAb233360B939775ae5f1';//polygon
//var tokenAddress = "0xe7147C5Ed14F545B4B17251992D1DB2bdfa26B6d" //chiado
var tokenAddress = "0xaad66432d27737ecf6ed183160adc5ef36ab99f2" //gnosis chain
var stakeAmountDollarTarget = web3.utils.toWei("750");
var stakingTokenPrice = web3.utils.toWei("12");
var minTokenstakeAmount = web3.utils.toWei("50");

var reportingLock = 3600 * 12; // 12 hours
var stakingTokenPriceQueryId = '0x5c13cd9c97dbb98f2429c101a2a8150e6c7a0ddaff6124ee176a3a411067ded0'

// governance arguments
// tellorOracleAddress
//var teamMultisigAddress = '0x80fc34a2f9FfE86F41580F47368289C402DEc660' //mumbai
//var teamMultisigAddress = '0x3F0C1eB3FA7fCe2b0932d6d4D9E03b5481F3f0A7'//polygon
//var teamMultisigAddress = '0x15e6Cc0D69A162151Cadfba035aa10b82b12b970' //chiado
var teamMultisigAddress = '0x9d119edeeF320f285704736f362cabC180a66f54' //gnosis-chain
// query data storage arguments
// none

// autopay arguments
// tellorAddress
// queryDataStorageAddress
var autopayFee = 20 // '20' is 2%


async function deployTellor360(_network, _pk, _nodeURL, _tokenAddress, _reportingLock, _stakeAmountDollarTarget, _stakingTokenPrice,_minTokenstakeAmount, _stakingTokenPriceQueryId, _teamMultisigAddress, _autopayFee) {
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
    const flex = await flexfac.deploy(_tokenAddress, _reportingLock, _stakeAmountDollarTarget, _stakingTokenPrice, _minTokenstakeAmount,_stakingTokenPriceQueryId)
    console.log("TellorFlex contract deployed to: ", flex.address)

    await flex.deployed()

    if (net == "mainnet") {
        console.log("TellorFlex contract deployed to:", "https://etherscan.io/address/" + flex.address);
        console.log("   TellorFlex transaction hash:", "https://etherscan.io/tx/" + flex.deployTransaction.hash);
    } else if (net == "chiado") {
        console.log("TellorFlex contract deployed to:", "https://blockscout.chiadochain.net/address/" + flex.address);
        console.log("    TellorFlex transaction hash:", "https://blockscout.chiadochain.net/tx/" + flex.deployTransaction.hash);
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
    } else if (net == "chiado") {
        console.log("TellorFlex contract deployed to:", "https://blockscout.chiadochain.net/address/" + flex.address);
        console.log("    TellorFlex transaction hash:", "https://blockscout.chiadochain.net/tx/" + flex.deployTransaction.hash);
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
        console.log("QueryDataStorage contract deployed to:", "https://etherscan.io/address/" + qstorage.address);
        console.log("    QueryDataStorage transaction hash:", "https://etherscan.io/tx/" + qstorage.deployTransaction.hash);
    } else if (net == "chiado") {
        console.log("TellorFlex contract deployed to:", "https://blockscout.chiadochain.net/address/" + flex.address);
        console.log("    TellorFlex transaction hash:", "https://blockscout.chiadochain.net/tx/" + flex.deployTransaction.hash);
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
    } else if (net == "chiado") {
        console.log("TellorFlex contract deployed to:", "https://blockscout.chiadochain.net/address/" + flex.address);
        console.log("    TellorFlex transaction hash:", "https://blockscout.chiadochain.net/tx/" + flex.deployTransaction.hash);
      } else {
        console.log("Please add network explorer details")
    }


    


    //////////////// Verify contracts



    console.log('submitting contract for verification...');
    await run("verify:verify",
        {
            address: flex.address,
            constructorArguments: [_tokenAddress, _reportingLock, _stakeAmountDollarTarget, _stakingTokenPrice, _minTokenstakeAmount,_stakingTokenPriceQueryId]
        },
    )
    console.log("TellorFlex contract verified")



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
    console.log("autopay contract verified")





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
    console.log('waiting for flex tx confirmation...');
    await flex.deployTransaction.wait(7)

      // init flex
      console.log('initializing flex...');
      await flex.init(governance.address)
      console.log('flex initialized');


}


deployTellor360("gnosis", process.env.TESTNET_PK, process.env.NODE_URL_GNOSIS, tokenAddress, reportingLock, stakeAmountDollarTarget, stakingTokenPrice, minTokenstakeAmount,stakingTokenPriceQueryId, teamMultisigAddress, autopayFee)
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });