import { deployContract } from "./utils";
const web3 = require('web3');

//npx hardhat run deploy/deploy.ts --network zkSyncSepoliaTestnet


function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}

var explorerUrl = "https://sepolia.explorer.zksync.io/address/"
var _tokenAddress = '0x61e3BE234D7EE7b1e2a1fA84027105c733b91545'
var _teamMultisigAddress = '0x5c84d7220d87E3De7FdBF9037bE8F48442F8e40A'//deployment wallet
var _reportingLock = 3600 * 12; // 12 hours
var _stakeAmountDollarTarget = web3.utils.toWei("150")
var _stakingTokenPrice = web3.utils.toWei("85");
var _minTRBstakeAmount = web3.utils.toWei("10")
var _autopayFee = 20 // '20' is 2%


// An example of a basic deploy script
// It will deploy a contract to selected network
// as well as verify it on Block Explorer if possible for the network
async function deploy () {

  var  _stakingTokenPriceQueryId = '0x5c13cd9c97dbb98f2429c101a2a8150e6c7a0ddaff6124ee176a3a411067ded0'

  const tellorflex = "TellorFlex"
  //const tellorflex = "tellorflex/contracts/TellorFlex.sol:TellorFlex"
  const flex = await deployContract(tellorflex,[_tokenAddress, _reportingLock, _stakeAmountDollarTarget, _stakingTokenPrice,_minTRBstakeAmount , _stakingTokenPriceQueryId])
  const flexaddress = await flex.getAddress()
  console.log("TellorFlex", explorerUrl, flexaddress)
  sleep_s(10)

  const governance = "Governance"
  //"governance/contracts/Governance.sol:Governance"
  const gov = await deployContract(governance,[flexaddress, _teamMultisigAddress])
  const govaddress = await gov.getAddress()
  console.log("Governance", explorerUrl, govaddress)
  sleep_s(10)

  //autopay/contracts/QueryDataStorage.sol:QueryDataStorage
  const querydata = "QueryDataStorage"
  const qd = await deployContract(querydata,[])
  const qdaddress = await qd.getAddress()
  console.log("QueryDataStorage", explorerUrl, qdaddress)
  sleep_s(10)

  //autopay/contracts/Autopay.sol:Autopay
  const autopay = "autopay/contracts/Autopay.sol:Autopay"
  const ap = await deployContract(autopay,[flexaddress, qdaddress, _autopayFee])
  const apaddress = await ap.getAddress()
  console.log("AutoPay", explorerUrl, apaddress)
  sleep_s(20)

    // init flex
    console.log('initializing flex...');
    await flex.init(govaddress)
    console.log('flex initialized');
   

}

deploy( )
    .then(() => process.exit(0))
    .catch(error => {
	  console.error(error);
	  process.exit(1);
  });