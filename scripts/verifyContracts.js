require("hardhat-gas-reporter");
require('hardhat-contract-sizer');
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const web3 = require('web3');

// npx hardhat run scripts/verifyContracts.js --network goerli

// tellor flex arguments
//var tokenAddress = '0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0';//rinkeby and ethereum mainnet
//var tokenAddress = '0xce4e32fe9d894f8185271aa990d2db425df3e6be';//mumbai
//var tokenAddress = '0xE3322702BEdaaEd36CdDAb233360B939775ae5f1';//polygon
var tokenAddress = '0x51c59c6cAd28ce3693977F2feB4CfAebec30d8a2';//for goerli it will be the Master address

var reportingLock = 3600 * 12; // 12 hours
var stakeAmountDollarTarget = web3.utils.toWei("1500");
var stakingTokenPrice = web3.utils.toWei("15");
var minTRBstakeAmount = web3.utils.toWei("100")
var stakingTokenPriceQueryId = '0x5c13cd9c97dbb98f2429c101a2a8150e6c7a0ddaff6124ee176a3a411067ded0'

// governance arguments
// tellorOracleAddress
//var teamMultisigAddress = '0x2F51C4Bf6B66634187214A695be6CDd344d4e9d1' // rinkeby
//var teamMultisigAddress = '0x80fc34a2f9FfE86F41580F47368289C402DEc660'//mumbai
//var teamMultisigAddress = '0x3F0C1eB3FA7fCe2b0932d6d4D9E03b5481F3f0A7'//polygon
var teamMultisigAddress = '0x4A1099d4897fFcc8eC7cb014B1a7442B28C7940C'//goerli
var TellorFlex = '0x873DAEd52B52b826C000713de3DCdB77641F7756'
var Tellor360 = '0x8C9057FA16D3Debb703ADBac0A097d2E5577AA6b'
var Governance =  '0x199839a4907ABeC8240D119B606C98c405Bb0B33'
var QueryDataStorage = '0x49eE5818fcA3016728827ba473c44f9024A6EC88'
var Autopay = '0x7E7b96d13D75bc7DaF270A491e2f1e571147d4DA'

// tellor360 arguments
// tellorOracleAddress

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
    const flex = await ethers.getContractAt("tellorflex/contracts/TellorFlex.sol:TellorFlex",TellorFlex )
   console.log("TellorFlex contract deployed to: ", flex.address)

    //////////////// Governance
    console.log("Starting deployment for governance contract...")
    const governance = await ethers.getContractAt("polygongovernance/contracts/Governance.sol:Governance", Governance)
    console.log("Governance contract deployed to: ", governance.address)


    //////////////// Tellor360
    // console.log("Starting deployment for tellor360 contract...")
    // const tellor360 = await ethers.getContractFactory("tellor360/contracts/Tellor360.sol:Tellor360", Tellor360)
    // console.log("Tellor360 contract deployed to: ", tellor360.address)

     

    ///////////// QueryDataStorage
    console.log("Starting deployment for QueryDataStorage contract...")
    const qstorage = await ethers.getContractAt("autopay/contracts/QueryDataStorage.sol:QueryDataStorage", QueryDataStorage)
    console.log("QueryDataStorage contract deployed to: ", qstorage.address)

  

    //////////////// Autopay
    console.log("Starting deployment for Autopay contract...")
    const autopay = await ethers.getContractAt("autopay/contracts/Autopay.sol:Autopay", Autopay)
    console.log("Autopay contract deployed to: ", autopay.address)

    //////////////// Verify contracts

    // Wait for few confirmed transactions.
    // Otherwise the etherscan api doesn't find the deployed contract.
    // console.log('waiting for tellor360 tx confirmation...');

    // console.log('submitting contract for verification...');
    // await run("verify:verify",
    //     {
    //         address: tellor360.address,
    //         constructorArguments: [flex.address]
    //     },
    // )
    // console.log("Tellor360 contract verified")

    // Wait for few confirmed transactions.
    // Otherwise the etherscan api doesn't find the deployed contract.
 

    console.log('submitting flex contract for verification...');
    await run("verify:verify",
        {
            address: flex.address,
            constructorArguments: [_tokenAddress, _reportingLock, _stakeAmountDollarTarget, _stakingTokenPrice,_minTRBstakeAmount, _stakingTokenPriceQueryId]
        },
    )
    console.log("TellorFlex contract verified")

        // Wait for few confirmed transactions.
    // Otherwise the etherscan api doesn't find the deployed contract.
    console.log('waiting for autopay tx confirmation...');

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

    console.log('submitting query data storage contract for verification...');
    await run("verify:verify",
        {
            address: qstorage.address
        },
    )
    console.log("query data storage contract verified")

    console.log('waiting for flex tx confirmation...');
    // init flex
    console.log('initializing flex...');
    await flex.connect(wallet).init(governance.address)
    console.log('flex initialized');

}


deployTellor360("goerli", process.env.TESTNET_PK, process.env.NODE_URL_GOERLI, tokenAddress, reportingLock, stakeAmountDollarTarget, stakingTokenPrice, minTRBstakeAmount,stakingTokenPriceQueryId, teamMultisigAddress, autopayFee)
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });