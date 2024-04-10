import { deployContract } from "./utils";
const web3 = require('web3');

//npx hardhat run deploy/deploy.ts --network zkSyncSepoliaTestnet


function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}

var explorerUrl = "https://testnet.kyotoscan.io/address/"
var _tokenAddress = '0x896419Ed2E0dC848a1f7d2814F4e5Df4b9B9bFcc'
var _teamMultisigAddress = '0x34Fae97547E990ef0E05e05286c51E4645bf1A85'
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

  const tellorflex = "TellorFlex";
  const flex = await deployContract(tellorflex,[_tokenAddress, _reportingLock, _stakeAmountDollarTarget, _stakingTokenPrice,_minTRBstakeAmount , _stakingTokenPriceQueryId])
  const flexaddress = await flex.getAddress()
  sleep_s(10)

  const governance = "Governance"
  const gov = await deployContract(governance,[flexaddress, _teamMultisigAddress])
  const govaddress = await gov.getAddress()
  sleep_s(10)

  const querydata = "QueryData"
  const qd = await deployContract(querydata,[])
  const qdaddress = await qd.getAddress()
  sleep_s(10)

  const autopay = "Governance"
  const ap = await deployContract(autopay,[flexaddress, qdaddress, _autopayFee])
  const apaddress = await ap.getAddress()
  sleep_s(10)

    // init flex
    console.log('initializing flex...');
    await flex.init(govaddress)
    console.log('flex initialized');
     sleep_s(10)

}

deploy( )
    .then(() => process.exit(0))
    .catch(error => {
	  console.error(error);
	  process.exit(1);
  });