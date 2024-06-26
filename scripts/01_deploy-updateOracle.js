require("hardhat-gas-reporter");
require('hardhat-contract-sizer');
require("@nomiclabs/hardhat-ethers");
//require("@nomiclabs/hardhat-etherscan");
//require("@nomicfoundation/hardhat-verify");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const web3 = require('web3');
const hre = require("hardhat"); 

function sleep_s(secs) {
    secs = (+new Date) + secs * 1000;
    while ((+new Date) < secs);
  }
// npx hardhat run scripts/01_deploy-updateOracle.js --network base_sepolia


var reportingLock = 3600 * 12; // 12 hours
var stakeAmountDollarTarget = web3.utils.toWei("150");
var stakingTokenPrice = web3.utils.toWei("50");
var minTRBstakeAmount = web3.utils.toWei("10")
var autopayFee = 20 // '20' is 2%


async function deployUpdateOracle( _reportingLock, _stakeAmountDollarTarget, _stakingTokenPrice,_minTRBstakeAmount , _autopayFee) {
    console.log("deploy UpdateOracle")
    await run("compile")

    var net = hre.network.name
    //var provider1 = hre.network.provider
    var  _stakingTokenPriceQueryId = '0x5c13cd9c97dbb98f2429c101a2a8150e6c7a0ddaff6124ee176a3a411067ded0'
    ///////////////Connect to the network
    try {
        if (net == "mainnet") {
            var network = "mainnet"
            var explorerUrl = "https://etherscan.io/address/"
            var _tokenAddress = '0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0'
            var _teamMultisigAddress = '0x39e419ba25196794b595b2a595ea8e527ddc9856'
            var pubAddr = process.env.PUBLIC_KEY
            var privateKey = process.env.PRIVATE_KEY
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_MAINNET)
        } else if (net == "sepolia") {
            var network = "sepolia"
            var explorerUrl = "https://sepolia.etherscan.io/address/"
            var _tokenAddress = '0x80fc34a2f9FfE86F41580F47368289C402DEc660'
            var _teamMultisigAddress = '0x34Fae97547E990ef0E05e05286c51E4645bf1A85'
            var pubAddr = process.env.TESTNET_PUBLIC
            var privateKey = process.env.TESTNET_PK
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_SEPOLIA)
        } else if (net == "goerli") {
            var network = "goerli"
            var explorerUrl = "https://sepolia.etherscan.io/address/"
            var _tokenAddress = '0x80fc34a2f9FfE86F41580F47368289C402DEc660'
            var _teamMultisigAddress = '0x34Fae97547E990ef0E05e05286c51E4645bf1A85'
            var pubAddr = process.env.TESTNET_PUBLIC
            var privateKey = process.env.TESTNET_PK
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_GOERLI)

        } else if (net == "polygon") {
            var network = "polygon"
            var explorerUrl = "https://polygonscan.com/address/"
            var _tokenAddress = '0xE3322702BEdaaEd36CdDAb233360B939775ae5f1'
            var _teamMultisigAddress = '0xa3fe6d88f2ea92be357663ba9e747301e4cfc39B'
            var pubAddr = process.env.PUBLIC_KEY
            var privateKey = process.env.PRIVATE_KEY
            //var provider = provider1
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_MATIC)
        } else if (net == "mumbai") {
            var network = "mumbai"
            var explorerUrl = "https://mumbai.polygonscan.com/address/"
            //var _tokenAddress = '0xce4e32fe9d894f8185271aa990d2db425df3e6be'  //bridged TRB
            var _tokenAddress = '0x3251838bd813fdf6a97D32781e011cce8D225d59'  //playground
            var _teamMultisigAddress = '0x80fc34a2f9FfE86F41580F47368289C402DEc660'
            var pubAddr = process.env.PUBLIC_KEY
            var privateKey = process.env.PRIVATE_KEY
            //var provider = provider1
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_MUMBAI)
            

        } else if (net == "chiado") {
            var network = "chiado"
            var explorerUrl = "https://blockscout.chiadochain.net/address/"
            var _tokenAddress = '0xe7147C5Ed14F545B4B17251992D1DB2bdfa26B6d'
            var _teamMultisigAddress = '0x15e6Cc0D69A162151Cadfba035aa10b82b12b970'
            var pubAddr = process.env.TESTNET_PUBLIC
            var privateKey = process.env.TESTNET_PK
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_CHIADO) 
                      
        } else if (net == "gnosis") {
            var network = "gnosis"
            var explorerUrl = "https://gnosisscan.io/address/"
            var _tokenAddress = '0xaad66432d27737ecf6ed183160adc5ef36ab99f2'
            var _teamMultisigAddress = '0x9d119edeeF320f285704736f362cabC180a66f54'
            var pubAddr = process.env.PUBLIC_KEY 
            var privateKey = process.env.PRIVATE_KEY
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_GNOSIS)


        } else if (net == "optimism_sepolia") {
            var network = "optimism_sepolia"
            var explorerUrl = "https://sepolia-optimism.etherscan.io/"
            var _tokenAddress = ''
            var _teamMultisigAddress = ''
            var pubAddr = process.env.TESTNET_PUBLIC
            var privateKey = process.env.TESTNET_PK
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_OPTIMISM_SEPOLIA)
        } else if (net == "optimism") {
            var network = "optimism"
            var explorerUrl = "https://optimistic.etherscan.io//address/"
            var _tokenAddress = '0xaf8ca653fa2772d58f4368b0a71980e9e3ceb888'
            var _teamMultisigAddress = '0xd57Aa8f0Ccb32a33Ab9Fe4e4a5f425c343733f7c'
            var pubAddr = process.env.PUBLIC_KEY
            var privateKey = process.env.PRIVATE_KEY
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_OPTIMISM)

        } else if (net == "arbitrum_testnet") {
            var network = "arbitrum_testnet"
            var explorerUrl = "https://goerli.arbiscan.io/address/"
            var _tokenAddress = '0x8d1bB5eDdFce08B92dD47c9871d1805211C3Eb3C'
            var _teamMultisigAddress = '0xd71F72C18767083e4e3FE84F9c62b8038C1Ef4f6'
            var pubAddr = process.env.TESTNET_PUBLIC
            var privateKey = process.env.TESTNET_PK
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_ARBITRUM_TESTNET)
        } else if (net == "arbitrum") {
            var network = "arbitrum"
            var explorerUrl = "https://arbiscan.io/address/"
            var _tokenAddress = '0xd58D345Fd9c82262E087d2D0607624B410D88242'
            var _teamMultisigAddress = '0x455bc171046301284144ACeA69D026Ea680A759e'
            var pubAddr = process.env.PUBLIC_KEY
            var privateKey = process.env.PRIVATE_KEY
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_ARBITRUM)

        } else if (net == "tfilecoin") {
            var network = "tfilecoin"
            var explorerUrl = "https://hyperspace.filfox.info/en/address/"
            var _tokenAddress = '0xe7147C5Ed14F545B4B17251992D1DB2bdfa26B6d'
            var _teamMultisigAddress = '0x15e6Cc0D69A162151Cadfba035aa10b82b12b970'
            var pubAddr = process.env.TESTNET_PUBLIC
            var privateKey = process.env.TESTNET_PK
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_FILECOIN_TESTNET)
        } else if (net == "filecoin") {
            var network = "filecoin"
            var explorerUrl = "https://filfox.info/en/address/"
            var _tokenAddress = '0x045CE60839d108B43dF9e703d4b25402a6a28a0d'
            var _teamMultisigAddress = '0x34Fae97547E990ef0E05e05286c51E4645bf1A85'
            var pubAddr = process.env.PUBLIC_KEY
            var privateKey = process.env.PRIVATE_KEY
            var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_FILECOIN)

 
       } else if (net == "manta_testnet") {
                var network = "manta_testnet"
                var explorerUrl = "https://manta-testnet.calderaexplorer.xyz/address/"
                var _tokenAddress = '0x896419Ed2E0dC848a1f7d2814F4e5Df4b9B9bFcc'
                var _teamMultisigAddress = '0x34Fae97547E990ef0E05e05286c51E4645bf1A85'
                var pubAddr = process.env.TESTNET_PUBLIC
                var privateKey = process.env.TESTNET_PK
        } else if (net == "manta") {
                var network = "manta"
                var explorerUrl = "https://manta-testnet.calderaexplorer.xyz/address/"
                var _tokenAddress = '0x8d7090ddda057f48fdbbb2abcea22d1113ab566a'
                var _teamMultisigAddress = '0x34Fae97547E990ef0E05e05286c51E4645bf1A85'
                var pubAddr = process.env.TESTNET_PUBLIC
                var privateKey = process.env.TESTNET_PK
                var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_MANTA)
                       
        } else if (net == "base_testnet") {
                    var network = "base_testnet"
                    var explorerUrl = "https://goerli.basescan.org/address/"
                    var _tokenAddress = '0x34Fae97547E990ef0E05e05286c51E4645bf1A85'
                    var _teamMultisigAddress = '0x0Ef525200c778d74b6751fb289cbCe2D9FeFC0E5'
                    var pubAddr = process.env.TESTNET_PUBLIC
                    var privateKey = process.env.TESTNET_PK
                    var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_BASE_TESTNET)
        
        } else if (net == "mantle_testnet") {
                    var network = "mantle_testnet"
                    var explorerUrl = "https://explorer.testnet.mantle.xyz/address/"
                    var _tokenAddress = '0x46038969D7DC0b17BC72137D07b4eDe43859DA45'
                    var _teamMultisigAddress = '0x34Fae97547E990ef0E05e05286c51E4645bf1A85'
                    var pubAddr = process.env.TESTNET_PUBLIC
                    var privateKey = process.env.TESTNET_PK
                    var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_MANTLE_TESTNET)          
        } else if (net == "zkevm_testnet") {
                    var network = "zkevm_testnet"
                    var explorerUrl = "https://cardona-zkevm.polygonscan.com/address/"
                    var _tokenAddress = '0x896419Ed2E0dC848a1f7d2814F4e5Df4b9B9bFcc'
                    var _teamMultisigAddress = '0x34Fae97547E990ef0E05e05286c51E4645bf1A85'
                    var pubAddr = process.env.TESTNET_PUBLIC
                    var privateKey = process.env.TESTNET_PK
                    var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_ZKEVM_TESTNET)          
        } else if (net == "zkevm") {
                    var network = "zkevm"
                    var explorerUrl = "https://zkevm.polygonscan.com/address/"
                    var _tokenAddress = '0x03346b2f4bc23fd7f4935f74e70c7a7febc45313'
                    var _teamMultisigAddress = '0xf23deabeD07E47e13462acE41B069c3eC5368E03'
                    var pubAddr = process.env.TESTNET_PUBLIC
                    var privateKey = process.env.TESTNET_PK
                    var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_ZKEVM_POLYGON)  
                    
                    
        } else if (net == "linea_testnet") {
                    var network = "linea_testnet"
                    var explorerUrl = "https://goerli.lineascan.build/address/"
                    var _tokenAddress = '0x896419Ed2E0dC848a1f7d2814F4e5Df4b9B9bFcc'
                    var _teamMultisigAddress = '0x34Fae97547E990ef0E05e05286c51E4645bf1A85'
                    var pubAddr = process.env.TESTNET_PUBLIC
                    var privateKey = process.env.TESTNET_PK
                    var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_LINEA_TESTNET)          
        } else if (net == "linea") {
                    var network = "linea"
                    var explorerUrl = "https://lineascan.build/address/"
                    var _tokenAddress = '0x35482B93941B439dEA2244Cc30A20D1Ed862DF86'
                    var _teamMultisigAddress = '0x34Fae97547E990ef0E05e05286c51E4645bf1A85'
                    var pubAddr = process.env.TESTNET_PUBLIC
                    var privateKey = process.env.TESTNET_PK
                    var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_LINEA)          
        } else if (net == "europa_testnet") {
                    var network = "europa_testnet"
                    var explorerUrl = "https://juicy-low-small-testnet.explorer.testnet.skalenodes.com/address/"
                    // var _tokenAddress = '0x34Fae97547E990ef0E05e05286c51E4645bf1A85'//playground
                    var _tokenAddress = '0x92732c3E59aF2ea6Aa2E886DA5959Fe952Ce2D24'//bridged trb
                    var _teamMultisigAddress = '0x896419Ed2E0dC848a1f7d2814F4e5Df4b9B9bFcc'
                    var pubAddr = process.env.TESTNET_PUBLIC
                    var privateKey = process.env.TESTNET_PK
                    var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_SKALE_EUROPA_TESTNET)          
        } else if (net == "europa") {
                    var network = "europa"
                    var explorerUrl = "https://elated-tan-skat.explorer.mainnet.skalenodes.com/address/"
                    var _tokenAddress = ' '
                    var _teamMultisigAddress = ''
                    var pubAddr = process.env.TESTNET_PUBLIC
                    var privateKey = process.env.TESTNET_PK
                    var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_SKALE_EUROPA)          
        } else if (net == "fraxtal_testnet") {
                    var network = "fraxtal_testnet"
                    var explorerUrl = "https://holesky.fraxscan.com/address/"
                    var _tokenAddress = '0xC866DB9021fe81856fF6c5B3E3514BF9D1593D81'
                    var _teamMultisigAddress = '0xCEa3a146A34aF31Ed20d01ADa2E8169cc49bDA34'
                    var pubAddr = process.env.TESTNET_PUBLIC
                    var privateKey = process.env.TESTNET_PK
                    var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_FRAXTAL_TESTNET)          
        } else if (net == "fraxtal") {
                    var network = "fraxtal"
                    var explorerUrl = "https://fraxscan.com/address/"
                    var _tokenAddress = '0xf4Fee0A3aa10abD90b2E03Cf9aB4C221d8348157'
                    var _teamMultisigAddress = '0x28Adc1f33796de0F9e4cffeb28eF23aB17B02323'
                    var pubAddr = process.env.TESTNET_PUBLIC
                    var privateKey = process.env.TESTNET_PK
                    var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_FRAXTAL)          
        } else if (net == "kyoto_testnet") {
                    var network = "kyoto_testnet"
                    var explorerUrl = "https://testnet.kyotoscan.io/address/"
                    var _tokenAddress = '0x896419Ed2E0dC848a1f7d2814F4e5Df4b9B9bFcc'
                    var _teamMultisigAddress = '0x34Fae97547E990ef0E05e05286c51E4645bf1A85'
                    var pubAddr = process.env.TESTNET_PUBLIC
                    var privateKey = process.env.TESTNET_PK
                    var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_KYOTO_TESTNET)          
        } else if (net == "polygon_amoy") {
                    var network = "polygon_amoy"
                    var explorerUrl = "https://amoy.polygonscan.com/address/"
                    var _tokenAddress = '0xC866DB9021fe81856fF6c5B3E3514BF9D1593D81'
                    var _teamMultisigAddress = '0x896419Ed2E0dC848a1f7d2814F4e5Df4b9B9bFcc'
                    var pubAddr = process.env.TESTNET_PUBLIC
                    var privateKey = process.env.TESTNET_PK
                    var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_POLYGON_AMOY)          
        } else if (net == "optimism_sepolia") {
                    var network = "optimism_sepolia"
                    var explorerUrl = "https://sepolia-optimism.etherscan.io/address/"
                    var _tokenAddress = "0x896419Ed2E0dC848a1f7d2814F4e5Df4b9B9bFcc"
                    var _teamMultisigAddress = "0x34Fae97547E990ef0E05e05286c51E4645bf1A85"
                    var pubAddr = process.env.TESTNET_PUBLIC
                    var privateKey = process.env.TESTNET_PK
                    var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_OPTIMISM_SEPOLIA)          
        } else if (net == "arbitrum_sepolia") {
                    var network = "arbitrum_sepolia"
                    var explorerUrl = "https://sepolia.arbiscan.io/address/"
                    var _tokenAddress = "0xC866DB9021fe81856fF6c5B3E3514BF9D1593D81"
                    var _teamMultisigAddress = "0x896419Ed2E0dC848a1f7d2814F4e5Df4b9B9bFcc"
                    var pubAddr = process.env.TESTNET_PUBLIC
                    var privateKey = process.env.TESTNET_PK
                    var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_ARBITRUM_SEPOLIA)
        } else if (net == "mantle_sepolia") {
                    var network = "mantle_sepolia"
                    var explorerUrl = "https://explorer.sepolia.mantle.xyz/address/"
                    var _tokenAddress = "0x896419Ed2E0dC848a1f7d2814F4e5Df4b9B9bFcc"
                    var _teamMultisigAddress = "0x34Fae97547E990ef0E05e05286c51E4645bf1A85"
                    var pubAddr = process.env.TESTNET_PUBLIC
                    var privateKey = process.env.TESTNET_PK
                    var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_MANTLE_SEPOLIA)          
        } else if (net == "base_sepolia") {
                    var network = "base_sepolia"
                    var explorerUrl = "https://sepolia.basescan.org/address/"
                    var _tokenAddress = "0x896419Ed2E0dC848a1f7d2814F4e5Df4b9B9bFcc"
                    var _teamMultisigAddress = "0x28Adc1f33796de0F9e4cffeb28eF23aB17B02323"
                    var pubAddr = process.env.TESTNET_PUBLIC
                    var privateKey = process.env.TESTNET_PK
                    var provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL_BASE_SEPOLIA)          
                      
        
        
                } else {
           console.log( "network not defined")
        }
 
        console.log("Tellor Address: ", _tokenAddress)
        console.log("nework", network)
        console.log("deploying from: ", pubAddr)
        
        
    } catch (error) {
        console.error(error)
        console.log("network error or environment not defined")
        process.exit(1)
    }
    let wallet = new ethers.Wallet(privateKey, provider)
    

    ////////////// TellorFlex
    console.log("Starting deployment for flex contract...")
    const flexfac = await ethers.getContractFactory("tellorflex/contracts/TellorFlex.sol:TellorFlex", wallet)
    const flex = await flexfac.deploy(_tokenAddress, _reportingLock, _stakeAmountDollarTarget, _stakingTokenPrice,_minTRBstakeAmount , _stakingTokenPriceQueryId)
          
    await flex.deployed()
    console.log("TellorFlex contract deployed to: ", flex.address)
    console.log(explorerUrl + flex.address)
    await flex.deployTransaction.wait(7)
    sleep_s(10)



    //////////////// Governance
    console.log("Starting deployment for governance contract...")
    const govfac = await ethers.getContractFactory("polygongovernance/contracts/Governance.sol:Governance", wallet)
    const governance = await govfac.deploy(flex.address, _teamMultisigAddress)
    
    await governance.deployed()
    console.log("Governance contract deployed to: ", governance.address)
    console.log(explorerUrl + governance.address);

    await governance.deployTransaction.wait(10)
    sleep_s(20)

 
    ///////////// QueryDataStorage
    console.log("Starting deployment for QueryDataStorage contract...")
    const qstoragefac = await ethers.getContractFactory("autopay/contracts/QueryDataStorage.sol:QueryDataStorage", wallet)
    const qstorage = await qstoragefac.deploy()
    console.log("QueryDataStorage contract deployed to: ", qstorage.address)

    await qstorage.deployed();
    console.log(explorerUrl + qstorage.address);
    await qstorage.deployTransaction.wait(10)
    sleep_s(20)


    //////////////// Autopay
    console.log("Starting deployment for Autopay contract...")
    const autopayfac = await ethers.getContractFactory("autopay/contracts/Autopay.sol:Autopay", wallet)
    const autopay = await autopayfac.deploy(flex.address, qstorage.address, _autopayFee) // tellorOracleAddress, queryDataStorageAddress, autopayFee
    

    await autopay.deployed()
    console.log("Autopay contract deployed to: ", autopay.address)
    console.log(explorerUrl + autopay.address);
    await autopay.deployTransaction.wait(10)
    sleep_s(20)

       
    // init flex
    console.log('initializing flex...');
    await flex.init(governance.address )
    console.log('flex initialized');
    sleep_s(10)

    //////////////// Verify contracts


    //Wait for few confirmed transactions.
    //Otherwise the etherscan api doesn't find the deployed contract.


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
    //await flex.deployTransaction.wait(7)

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
   // await autopay.deployTransaction.wait(7)

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
    //await qstorage.deployTransaction.wait(7)

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


}


deployUpdateOracle (reportingLock, stakeAmountDollarTarget, stakingTokenPrice, minTRBstakeAmount, autopayFee)
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });