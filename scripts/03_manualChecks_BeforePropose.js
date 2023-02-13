/****************************************************************/
/*
/*
/*             Manual checks before proposig the oracle
/*
/*
/***************************************************************/

require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const hre = require("hardhat");
const { ethers } = require("hardhat");
const web3 = require("web3");
const h = require("../test/helpers/helpers");

// npx hardhat run scripts/manualChecks-afterDeploy.js --network goerli

// Don't change these
const reportingLock = 3600 * 12; // 12 hours
const stakingTokenPriceQueryId = "0x5c13cd9c97dbb98f2429c101a2a8150e6c7a0ddaff6124ee176a3a411067ded0";
let passCount = 0;
let failCount = 0;

async function manualChecks() {
  console.log("running manual checks...");
  await run("compile");

  var net = hre.network.name;

  if (net == "goerli") {
    var flexAddress = "0xB3B662644F8d3138df63D2F43068ea621e2981f9";
    var govAddress = "0x02803dcFD7Cb32E97320CFe7449BFb45b6C931b8";
    var autopayAddress = "0x1F033Cb8A2Df08a147BC512723fd0da3FEc5cCA7";
    var tellor360Address = "0xD3b9A1DCAbd16c482785Fd4265cB4580B84cdeD7"; 
    var queryDataStorageAddress = "0xA33ca1062762c8591E29E65bf7aC7ae8EC88b183";
    var teamMultisigAddress = "0x4A1099d4897fFcc8eC7cb014B1a7442B28C7940C"; 
    var tokenAddress = "0x51c59c6cAd28ce3693977F2feB4CfAebec30d8a2";
    var masterAddress = "0x51c59c6cAd28ce3693977F2feB4CfAebec30d8a2";
    var stakeAmountDollarTarget = web3.utils.toWei("1500");
    var stakingTokenPrice = web3.utils.toWei("15");
    var pubAddr = process.env.TESTNET_PUBLIC 
    var privateKey = process.env.TESTNET_PK
    var _nodeURL = hre.network.url
    
  } else if (net == "mainnet") {
    var flexAddress = "";
    var govAddress = "";
    var autopayAddress = "";
    var tellor360Address = ""; // newly deployed tellor360 address
    var queryDataStorageAddress = "";
    var teamMultisigAddress = "0x39e419ba25196794b595b2a595ea8e527ddc9856"; 
    var tokenAddress = "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0";
    var masterAddress = "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0";
    var stakeAmountDollarTarget = web3.utils.toWei("1500");
    var stakingTokenPrice = web3.utils.toWei("15");
    var pubAddr = process.env.TESTNET_PUBLIC 
    var privateKey = process.env.PRIVATE_KEY
    var _nodeURL = hre.network.url
  } else {
    console.log("No network name ", net, " found")
    process.exit(1)
  }
  console.log("public address",pubAddr )

  /////////////// Connect to the network
  
  var provider = new ethers.providers.JsonRpcProvider(_nodeURL);
  let wallet = new ethers.Wallet(privateKey, provider);


  /////////////// Connect to contracts
  const flex = await ethers.getContractAt(
    "tellorflex/contracts/TellorFlex.sol:TellorFlex",
    flexAddress,
    wallet
  );
  const token = await ethers.getContractAt(
    "tellor360/contracts/BaseToken.sol:BaseToken",
    tokenAddress,
    wallet
  );
  const gov = await ethers.getContractAt(
    "polygongovernance/contracts/Governance.sol:Governance",
    govAddress,
    wallet
  );
  const autopay = await ethers.getContractAt(
    "autopay/contracts/Autopay.sol:Autopay",
    autopayAddress,
    wallet
  );
  const storage = await ethers.getContractAt(
    "autopay/contracts/QueryDataStorage.sol:QueryDataStorage",
    queryDataStorageAddress,
    wallet
  );
  const tellor360 = await ethers.getContractAt(
    "tellor360/contracts/Tellor360.sol:Tellor360",
    tellor360Address,
    wallet
  );

  // *************************************
  // *
  // * After Deploy
  // *
  // *************************************
  console.log("\n\nAfter deploy checks:");

  ///////// TELLORFLEX
  console.log("\n\n*** Checking TellorFlex ***");

  // Governance address set
  console.log("\nChecking governance address set in flex...");
  verifyEquals(
    await flex.governance(),
    govAddress,
    "Governance address set in flex"
  );

  // Token address set
  console.log("\nChecking token address set in flex...");
  verifyEquals(await flex.token(), tokenAddress, "Token address set in flex");

  // Staking token target price set
  console.log("\n Checking staking token target price set in flex...");
  verifyEquals(
    await flex.stakeAmountDollarTarget(),
    stakeAmountDollarTarget,
    "Stake amount dollar target set in flex"
  );

  // Reporting lock set
  console.log("\nChecking reporting lock set in flex...");
  verifyEquals(
    await flex.reportingLock(),
    reportingLock,
    "Reporting lock set in flex"
  );

  // Staking token queryId
  console.log("\nChecking staking token query ID set in flex...");
  verifyEquals(
    await flex.stakingTokenPriceQueryId(),
    stakingTokenPriceQueryId,
    "Staking token price query ID set in flex"
  );

  console.log("\nChecking initial stake amount set in flex...");
  verifyEquals(
    await flex.stakeAmount(),
    BigInt(stakeAmountDollarTarget) * BigInt(1e18) / BigInt(stakingTokenPrice),
    "Initial stake amount set in flex"
  );

  ///////// GOVERNANCE
  console.log("\n\n*** Checking Governance ***");


  // Flex address set in governance
  console.log("\nChecking Flex address set in governance...");
  verifyEquals(
    await gov.oracle(),
    flexAddress,
    "Flex address set in governance"
  );

  // Multisig address set in governance
  console.log("\nChecking Multisig address set in governance...");
  verifyEquals(
    await gov.teamMultisig(),
    teamMultisigAddress,
    "Multisig address set in governance"
  );

  ///////// AUTOPAY
  console.log("\n\n*** Checking Autopay ***");


  // Flex address set in autopay
  console.log("\nChecking Flex address set in autopay...");
  verifyEquals(
    await autopay.tellor(),
    flexAddress,
    "Flex address set in governance"
  );

  // QueryDataStorage address set in autopay
  console.log("\nChecking QueryDataStorage address set in autopay...");
  verifyEquals(
    await autopay.queryDataStorage(),
    queryDataStorageAddress,
    "QueryDataStorage address set in autopay"
  );

  

  console.log(
    "\n" + passCount + "/" + (passCount + failCount) + " checks passed"
  );
}

function verifyEquals(firstVal, secondVal, name) {
  if (firstVal == secondVal) {
    console.log(name + " " + "passes");
    passCount++;
  } else {
    console.log(
      name + " " + "fails. expected:" + secondVal + " actual:" + firstVal
    );
    failCount++;
  }
}

function verifyGreaterThan(firstVal, secondVal, name) {
  if (firstVal > secondVal) {
    console.log(name + " " + "passes");
    passCount++;
  } else {
    console.log(
      name +
        " " +
        "fails. expected greater than:" +
        secondVal +
        " actual:" +
        firstVal
    );
    failCount++;
  }
}

function verifyGreaterThanOrEqualTo(firstVal, secondVal, name) {
  if (firstVal >= secondVal) {
    console.log(name + " " + "passes");
    passCount++;
  } else {
    console.log(
      name +
        " " +
        "fails. expected greater than or equal to:" +
        secondVal +
        " actual:" +
        firstVal
    );
    failCount++;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

manualChecks()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
