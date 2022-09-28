require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const { ethers } = require("hardhat");
const web3 = require("web3");
const h = require("../test/helpers/helpers");

// npx hardhat run scripts/manualChecks-afterDeploy.js --network rinkeby

// Update these values with newly deployed addresses
const flexAddress = "0x943fDA606fA75c2E8918b72A4cF92b68040a1671";
const govAddress = "0x5b58A793334aa4443775573ae6d47A931b5bde70";
const autopayAddress = "0x2D3d3842F5cF39411317f1E28F042fcE409db4B9";
const tellor360Address = "0xb4c938f5A5Db52Cf4A4B55d3439aAbc0944BCD63"; // newly deployed tellor360 address
const queryDataStorageAddress = "0xb31BEb76c906cf8655F94b165759E5807c759aA5";

// update these values on case by case basis
const tokenAddress = "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0";
const masterAddress = "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0";
const stakeAmountDollarTarget = web3.utils.toWei("2500");
const stakingTokenPrice = web3.utils.toWei("16");
const teamMultisigAddress = "0x2F51C4Bf6B66634187214A695be6CDd344d4e9d1"; // rinkeby

// Don't change these
const reportingLock = 3600 * 12; // 12 hours
const stakingTokenPriceQueryId = "0x5c13cd9c97dbb98f2429c101a2a8150e6c7a0ddaff6124ee176a3a411067ded0";
let passCount = 0;
let failCount = 0;

async function manualChecks(_network, _pk, _nodeURL) {
  console.log("running manual checks...");
  await run("compile");

  var net = _network;

  /////////////// Connect to the network
  let privateKey = _pk;
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


  ///////// TELLOR360
  console.log("\n\n*** Checking Tellor360 ***");


  // Flex address set in 360 storage
  console.log("\nChecking Flex address set in 360 storage...");
  verifyEquals(
    await tellor360.getAddressVars(h.hash("_ORACLE_CONTRACT_FOR_INIT")),
    flexAddress,
    "Flex address set in 360 storage"
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

manualChecks("rinkeby", process.env.TESTNET_PK, process.env.NODE_URL_RINKEBY)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
