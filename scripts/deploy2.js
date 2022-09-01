require("hardhat-gas-reporter");
require('hardhat-contract-sizer');
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const web3 = require('web3');

//const dotenv = require('dotenv').config()
//npx hardhat run scripts/deploy.js --network rinkeby

var stake_amt = web3.utils.toWei("10");
var rep_lock = 43200; // 12 hours
var governanceAddress = '0x20bEC8F31dea6C13A016DC7fCBdF74f61DC8Ec2c'

// tellor flex arguments
var tokenAddress = '0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0';
var reportingLock = 3600 * 12; // 12 hours
var stakeAmountDollarTarget = web3.utils.toWei("2500");
var stakingTokenPrice = web3.utils.toWei("20");
var stakingTokenPriceQueryId = '0x5c13cd9c97dbb98f2429c101a2a8150e6c7a0ddaff6124ee176a3a411067ded0'

// governance arguments
// tellorAddress
var teamMultisigAddress = '0x2F51C4Bf6B66634187214A695be6CDd344d4e9d1' // rinkeby

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


    //////////////// Autopay
    console.log("Starting deployment for Autopay contract...")
    const autopayfac = await ethers.getContractFactory("autopay/contracts/Autopay.sol:Autopay", wallet)
    const autopay = await autopayfac.deploy(flex.address, flex.address, _autopayFee) // tellorOracleAddress, queryDataStorageAddress, autopayFee
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


    // /////////// Deploy Tellor X
    // console.log("deploy tellor X")

    // ////////////////Governance
    // console.log("Starting deployment for governance contract...")
    // const gfac = await ethers.getContractFactory("contracts/Governance.sol:Governance", wallet)
    // const gfacwithsigner = await gfac.connect(wallet)
    // const governance = await gfacwithsigner.deploy()
    // console.log("Governance contract deployed to: ", governance.address)

    // await governance.deployed()

    // if (net == "mainnet") {
    //     console.log("Governance contract deployed to:", "https://etherscan.io/address/" + governance.address);
    //     console.log("   Governance transaction hash:", "https://etherscan.io/tx/" + governance.deployTransaction.hash);
    // } else if (net == "rinkeby") {
    //     console.log("Governance contract deployed to:", "https://rinkeby.etherscan.io/address/" + governance.address);
    //     console.log("    Governance transaction hash:", "https://rinkeby.etherscan.io/tx/" + governance.deployTransaction.hash);
    // } else {
    //     console.log("Please add network explorer details")
    // }


    // /////////////Oracle
    // console.log("Starting deployment for Oracle contract...")
    // const ofac = await ethers.getContractFactory("contracts/Oracle.sol:Oracle", wallet)
    // const ofacwithsigner = await ofac.connect(wallet)
    // const oracle = await ofacwithsigner.deploy()
    // await oracle.deployed();


    // if (net == "mainnet") {
    //     console.log("oracle contract deployed to:", "https://etherscan.io/address/" + oracle.address);
    //     console.log("    oracle transaction hash:", "https://etherscan.io/tx/" + oracle.deployTransaction.hash);
    // } else if (net == "rinkeby") {
    //     console.log("oracle contract deployed to:", "https://rinkeby.etherscan.io/address/" + oracle.address);
    //     console.log("    oracle transaction hash:", "https://rinkeby.etherscan.io/tx/" + oracle.deployTransaction.hash);
    // } else {
    //     console.log("Please add network explorer details")
    // }

    // ///////////Treasury
    // console.log("Starting deployment for Treasury contract...")
    // const tfac = await ethers.getContractFactory("contracts/Treasury.sol:Treasury", wallet)
    // const tfacwithsigner = await tfac.connect(wallet)
    // const treasury = await tfacwithsigner.deploy()
    // await treasury.deployed()

    // if (net == "mainnet") {
    //     console.log("treasury contract deployed to:", "https://etherscan.io/address/" + treasury.address);
    //     console.log("    treasury transaction hash:", "https://etherscan.io/tx/" + treasury.deployTransaction.hash);
    // } else if (net == "rinkeby") {
    //     console.log("treasury contract deployed to:", "https://rinkeby.etherscan.io/address/" + treasury.address);
    //     console.log("    treasury transaction hash:", "https://rinkeby.etherscan.io/tx/" + treasury.deployTransaction.hash);
    // } else {
    //     console.log("Please add network explorer details")
    // }

    // console.log("treasury Contract verified")

    // //////////////Controler
    // console.log("Starting deployment for Controller contract...")
    // const cfac = await ethers.getContractFactory("contracts/Controller.sol:Controller", wallet)
    // const cfacwithsigners = await cfac.connect(wallet)
    // const controller = await cfacwithsigners.deploy(governance.address, oracle.address, treasury.address)
    // await controller.deployed()

    // if (net == "mainnet") {
    //     console.log("The controller contract was deployed to:", "https://etherscan.io/address/" + controller.address);
    //     console.log("    transaction hash:", "https://etherscan.io/tx/" + controller.deployTransaction.hash);
    // } else if (net == "rinkeby") {
    //     console.log("The controller contract was deployed to:", "https://rinkeby.etherscan.io/address/" + controller.address);
    //     console.log("    transaction hash:", "https://rinkeby.etherscan.io/tx/" + controller.deployTransaction.hash);
    // } else {
    //     console.log("Please add network explorer details")
    // }

    // tellorTest = await ethers.getContractAt("contracts/tellor3/Mocks/TellorTest.sol:TellorTest", master.address)
    // await tellorTest.connect(wallet).setBalanceTest(wallet.address, ethers.BigNumber.from("1000000000000000000000000"))
    // await master.connect(wallet).changeTellorContract(controller.address)
    // tellorNew = await ethers.getContractAt("contracts/Controller.sol:Controller", master.address)
    // await tellorNew.connect(wallet).init()

    // console.log("TellorX deployed! You have 1 million test TRB in your wallet.")

    // console.log('submitting extension contract for verification...');
    // await run("verify:verify",
    //     {
    //         address: extension.address,
    //     },
    // )
    // console.log("extension contract verified")

    // // Wait for few confirmed transactions.
    // // Otherwise the etherscan api doesn't find the deployed contract.
    // console.log('waiting for tx confirmation...');
    // await controller.deployTransaction.wait(7)

    // console.log('submitting contract for verification...');

    // await run("verify:verify",
    //     {
    //         address: controller.address,
    //         constructorArguments: [governance.address, oracle.address, treasury.address]
    //     },
    // )
    // console.log("Controller contract verified")


    // // Wait for few confirmed transactions.
    // // Otherwise the etherscan api doesn't find the deployed contract.
    // console.log('waiting for tellor tx confirmation...');
    // await tellor.deployTransaction.wait(7)

    // console.log('submitting tellor contract for verification...');
    // await run("verify:verify",
    //     {
    //         address: tellor.address,
    //         constructorArguments: [extension.address]
    //     },
    // )
    // console.log("tellor contract verified")

    // // Wait for few confirmed transactions.
    // // Otherwise the etherscan api doesn't find the deployed contract.
    // console.log('waiting for master tx confirmation...');
    // await master.deployTransaction.wait(7)

    // console.log('submitting master contract for verification...');
    // await run("verify:verify",
    //     {
    //         address: master.address,
    //         constructorArguments: [tellor.address, tellor.address]
    //     },
    // )
    // console.log("master contract verified")

    // // Wait for few confirmed transactions.
    // // Otherwise the etherscan api doesn't find the deployed contract.
    // console.log('waiting for governance tx confirmation...');
    // await governance.deployTransaction.wait(7)

    // console.log('submitting governance contract for verification...');
    // await run("verify:verify",
    //     {
    //         address: governance.address,
    //     },
    // )
    // console.log("governance contract verified")

    // // Wait for few confirmed transactions.
    // // Otherwise the etherscan api doesn't find the deployed contract.
    // console.log('waiting for treasury tx confirmation...');
    // await treasury.deployTransaction.wait(7)

    // console.log('submitting Treasury contract for verification...');

    // await run("verify:verify", {
    //     address: treasury.address,
    // },
    // )

    // // Wait for few confirmed transactions.
    // // Otherwise the etherscan api doesn't find the deployed contract.
    // console.log('waiting for Oracle tx confirmation...');
    // await oracle.deployTransaction.wait(7)

    // console.log('submitting Oracle contract for verification...');

    // await run("verify:verify",
    //     {
    //         address: oracle.address,
    //     },
    // )

    // console.log("Oracle contract verified")

}


deployTellor360("rinkeby", process.env.TESTNET_PK, process.env.NODE_URL_RINKEBY, tokenAddress, reportingLock, stakeAmountDollarTarget, stakingTokenPrice, stakingTokenPriceQueryId, teamMultisigAddress, autopayFee)
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });