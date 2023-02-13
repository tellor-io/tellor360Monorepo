/****************************************************************/
/*
/*
/*             Reporting before proposig the oracle
/*
/*
/***************************************************************/


/*
/* 1. Report USD/ETH
/* 2. Report TRB/USD
/* 3. Report AutoPay contract
/* 4. Report Oracle contract
/* 5. 12 hours later Run propose oracle
*/

require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
//const hre = require("hardhat");
const { ethers } = require("hardhat");
const web3 = require("web3");
const h = require("../test/helpers/helpers");

// npx hardhat run scripts/02_Reporting_before_propose.js --network goerli

async function manualReporting() {
    console.log("running manual checks...");
    await run("compile");

    var net = hre.network.name

    if (net == "goerli") {
      var flexAddress = "0xB3B662644F8d3138df63D2F43068ea621e2981f9";
      var autopayAddress = "0x1F033Cb8A2Df08a147BC512723fd0da3FEc5cCA7";
      var pubAddr = process.env.TESTNET_PUBLIC 
      var privateKey = process.env.TESTNET_PK
      var _nodeURL = hre.network.url
      
    } else if (net == "mainnet") {
      var flexAddress = "0xD9157453E2668B2fc45b7A803D3FEF3642430cC0";
      var autopayAddress = "0x9BE9B0CFA89Ea800556C6efbA67b455D336db1D0";
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

    //Deposit 4 stakes

    //Report:
    // 0x83a7f3d48786ac2667503a61e8c415438ed2922eb86a2906e4ee66d9a2ce4992
    // 0xcf0c5863be1cf3b948a9ff43290f931399765d051a60c3b23a4e098148b1f707
    //

    const abiCoder = new ethers.utils.AbiCoder();
    // generate queryData and queryId for eth/usd price
    const ETH_USD_QUERY_DATA_ARGS = abiCoder.encode(["string", "string"], ["eth", "usd"])
    const ETH_USD_QUERY_DATA = abiCoder.encode(["string", "bytes"], ["SpotPrice", ETH_USD_QUERY_DATA_ARGS])
    const ETH_USD_QUERY_ID = ethers.utils.keccak256(ETH_USD_QUERY_DATA)
    console.log(ETH_USD_QUERY_ID)
    //0x83A7F3D48786AC2667503A61E8C415438ED2922EB86A2906E4EE66D9A2CE4992
    
    // generate queryData and queryId for trb/usd price
    const TRB_USD_QUERY_DATA_ARGS = abiCoder.encode(["string", "string"], ["trb", "usd"])
    const TRB_USD_QUERY_DATA = abiCoder.encode(["string", "bytes"], ["SpotPrice", TRB_USD_QUERY_DATA_ARGS])
    const TRB_USD_QUERY_ID = ethers.utils.keccak256(TRB_USD_QUERY_DATA)
    // 0x5c13cd9c97dbb98f2429c101a2a8150e6c7a0ddaff6124ee176a3a411067ded0
    console.log(TRB_USD_QUERY_ID)

    // generate queryData and queryId for trb/usd price
    const AUTOPAY_QUERY_DATA_ARGS = abiCoder.encode(["bytes"], ["0x"])
    const AUTOPAY_QUERY_DATA = abiCoder.encode(["string", "bytes"], ["AutopayAddresses", AUTOPAY_QUERY_DATA_ARGS])
    const AUTOPAY_QUERY_ID = ethers.utils.keccak256(AUTOPAY_QUERY_DATA)
    // 0x3ab34a189e35885414ac4e83c5a7faa9d8f03a4d530728ef516d203d91d6309c
    console.log(AUTOPAY_QUERY_ID)
    autopayAddresses = ['0x1F033Cb8A2Df08a147BC512723fd0da3FEc5cCA7', autopayAddress]
    autopayAddressesEncoded = abiCoder.encode(["address[]"], [autopayAddresses])

   const ORACLE_QUERY_DATA_ARGS = abiCoder.encode(["bytes"], ["0x"])
   const ORACLE_QUERY_DATA = abiCoder.encode(["string", "bytes"], ["TellorOracleAddress", ORACLE_QUERY_DATA_ARGS])
   const ORACLE_QUERY_ID = ethers.utils.keccak256(ORACLE_QUERY_DATA)
   // 0xcf0c5863be1cf3b948a9ff43290f931399765d051a60c3b23a4e098148b1f707
   console.log(ORACLE_QUERY_ID)
   oracleAddress = flexAddress
   oracleAddressesEncoded = abiCoder.encode(["address"], [oracleAddress])

   reporters = [process.env.REP1,process.env.REP2, process.env.REP3, process.env.REP4 ]
   queryIds = [AUTOPAY_QUERY_ID,ORACLE_QUERY_ID]
   values = [autopayAddressesEncoded,oracleAddressesEncoded]
   queryData = [AUTOPAY_QUERY_DATA,ORACLE_QUERY_DATA]

   for (let i = 0; i <= 1; i++) {
      console.log("rep,queryid, value, querydata",reporters[i],",",queryIds[i],",",values[i],",",queryData[i] )
    // let reporter = new ethers.Wallet(reporters[i], provider);
    // await oracle.connect(reporter).depositStake(h.toWei("100"))
    // await oracle.connect(reporter).submitValue(queryIds[i], values[i], 0, queryData[i])
  }
}

manualReporting()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});