const { expect } = require("chai");
const h = require("./helpers/helpers");
var assert = require('assert');
const web3 = require('web3');
const { ethers } = require("hardhat");
const { keccak256 } = require("ethers/lib/utils");

describe.only("Forking Tests - Oracle Upgrade after Deploy", function() {

// Tellor Address:  0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0
// nework mainnet
// TellorFlex contract deployed to:  0x8cFc184c877154a8F9ffE0fe75649dbe5e2DBEbf
// Governance contract deployed to:  0xB30b1B98d8276b80bC4f5aF9f9170ef3220EC27D
// QueryDataStorage contract deployed to:  0xdB1F3bF0B267A87A440D4b1234636b6BB8781F6d
// Autopay contract deployed to:  0x3b50dEc3CA3d34d5346228D86D29CF679EAA0Ccb

  // tellor360 NEW - mainnet
  const ORACLE_NEW = "0x8cFc184c877154a8F9ffE0fe75649dbe5e2DBEbf"
  const GOVERNANCE_NEW = "0xB30b1B98d8276b80bC4f5aF9f9170ef3220EC27D"
  const AUTOPAY_NEW = "0x3b50dEc3CA3d34d5346228D86D29CF679EAA0Ccb"
  const TELLOR360 = "0xD3b9A1DCAbd16c482785Fd4265cB4580B84cdeD7"
  const QUERY_DATA_STORAGE = "0xdB1F3bF0B267A87A440D4b1234636b6BB8781F6d"
 
  // before upgrade addresses - mainnet
  const tellorMaster = "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0"
  const DEV_WALLET = "0x39E419bA25196794B595B2a595Ea8E527ddC9856"
  const BIGWALLET = "0xC482997311Bb58b938BC6b9220B67Bd11582E7b9"
  const GOVERNANCE_OLD = "0x46038969D7DC0b17BC72137D07b4eDe43859DA45"
  const REPORTER = "0x0D4F81320d36d7B7Cf5fE7d1D547f63EcBD1a3E0"
  const ORACLE_OLD = "0xD9157453E2668B2fc45b7A803D3FEF3642430cC0"
  const PARACHUTE = "0x83eB2094072f6eD9F57d3F19f54820ee0BaE6084"

  // liquity - mainnet
  const LIQUITY_PRICE_FEED = "0x4c517D4e2C851CA76d7eC94B805269Df0f2201De"
  // ampleforth - mainnet
  const TELLOR_PROVIDER_AMPL = "0xf5b7562791114fB1A8838A9E8025de4b7627Aa79"
  const MEDIAN_ORACLE_AMPL = "0x99C9775E076FDF99388C029550155032Ba2d8914"


  // // tellor360 NEW - goerli
  // const ORACLE_NEW = ""
  // const GOVERNANCE_NEW = ""
  // const AUTOPAY_NEW = ""
  // const TELLOR360 = ""
  // const QUERY_DATA_STORAGE = ""

  // // before upgrade addresses - goerli
  // const tellorMaster = ""
  // const DEV_WALLET = ""
  // const BIGWALLET = ""
  // const GOVERNANCE_OLD = ""
  // const REPORTER = ""
  // const ORACLE_OLD = ""
 
  
  const abiCoder = new ethers.utils.AbiCoder();
  const AUTOPAY_QUERY_DATA_ARGS = abiCoder.encode(["bytes"], ["0x"])
  const AUTOPAY_QUERY_DATA = abiCoder.encode(["string", "bytes"], ["AutopayAddresses", AUTOPAY_QUERY_DATA_ARGS])
  const AUTOPAY_QUERY_ID = web3.utils.keccak256(AUTOPAY_QUERY_DATA)
  const TRB_QUERY_DATA_ARGS = abiCoder.encode(["string", "string"], ["trb", "usd"])
  const TRB_QUERY_DATA = abiCoder.encode(["string", "bytes"], ["SpotPrice", TRB_QUERY_DATA_ARGS])
  const TRB_QUERY_ID = web3.utils.keccak256(TRB_QUERY_DATA)
  const ETH_QUERY_DATA_ARGS = abiCoder.encode(["string", "string"], ["eth", "usd"])
  const ETH_QUERY_DATA = abiCoder.encode(["string", "bytes"], ["SpotPrice", ETH_QUERY_DATA_ARGS])
  const ETH_QUERY_ID = keccak256(ETH_QUERY_DATA)
  const TELLOR_ORACLE_ADDRESS_QUERY_DATA_ARGS = abiCoder.encode(["bytes"], ["0x"])
  const TELLOR_ORACLE_ADDRESS_QUERY_DATA = abiCoder.encode(["string", "bytes"], ["TellorOracleAddress", TELLOR_ORACLE_ADDRESS_QUERY_DATA_ARGS])
  const TELLOR_ORACLE_ADDRESS_QUERY_ID = web3.utils.keccak256(TELLOR_ORACLE_ADDRESS_QUERY_DATA)
  const AMPL_QUERY_DATA_ARGS = abiCoder.encode(["bytes"], ["0x"])
  const AMPL_QUERY_DATA = abiCoder.encode(["string", "bytes"], ["AmpleforthCustomSpotPrice", AMPL_QUERY_DATA_ARGS]);
  const AMPL_QUERY_ID = web3.utils.keccak256(AMPL_QUERY_DATA);


  let accounts = null
  let tellor = null
  let oracle = null
  let governance = null
  let autopay = null
  let queryDataStorage = null
  let tellor360 = null
  let governanceOld = null
  let govSigner = null
  let devWallet = null

  beforeEach("deploy and setup Tellor360", async function() {

    await hre.network.provider.request({
      method: "hardhat_reset",
      params: [{forking: {
            jsonRpcUrl: hre.config.networks.hardhat.forking.url,
            blockNumber: 18393600 // mainnet - set block num to current real block num
            // blockNumber: 18377900  // goerli - set block num to current real block num
          },},],
      });

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [BIGWALLET]}
    )

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DEV_WALLET]
    })

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [REPORTER]
    })

    //account forks
    accounts = await ethers.getSigners()
    devWallet = await ethers.provider.getSigner(DEV_WALLET);
    bigWallet = await ethers.provider.getSigner(BIGWALLET);
    reporter = await ethers.provider.getSigner(REPORTER)

    // old contract forks
    tellor = await ethers.getContractAt("tellor360/contracts/oldContracts/contracts/interfaces/ITellor.sol:ITellor", tellorMaster)
    governanceOld = await ethers.getContractAt("polygongovernance/contracts/Governance.sol:Governance", GOVERNANCE_OLD)
    oracleOld = await ethers.getContractAt("tellorflex/contracts/TellorFlex.sol:TellorFlex", ORACLE_OLD)

    // 360
    oracle = await ethers.getContractAt("tellorflex/contracts/TellorFlex.sol:TellorFlex", ORACLE_NEW)
    governance = await ethers.getContractAt("polygongovernance/contracts/Governance.sol:Governance", GOVERNANCE_NEW)
    autopay = await ethers.getContractAt("autopay/contracts/Autopay.sol:Autopay", AUTOPAY_NEW)
    tellor360 = await ethers.getContractAt("tellor360/contracts/Tellor360.sol:Tellor360", TELLOR360)
    queryDataStorage = await ethers.getContractAt("autopay/contracts/QueryDataStorage.sol:QueryDataStorage", QUERY_DATA_STORAGE)

    // deploy usingtellor user
    const UsingTellorUser = await ethers.getContractFactory("UsingTellorUser")
    usingTellorUser = await UsingTellorUser.deploy(oracle.address)
    await usingTellorUser.deployed()

    // fund accounts with sufficient ether for testing
    const transactionHash = await accounts[10].sendTransaction({
      to: BIGWALLET,
      value: ethers.utils.parseEther("10.0"), 
    });
    await accounts[10].sendTransaction({
      to: DEV_WALLET,
      value: ethers.utils.parseEther("10.0"), 
    });

    // fast forward, call update oracle 
    await h.advanceTime(86400 * 6)
    await tellor.updateOracleAddress()
  });

  it("depositStake", async function() {
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(oracle.address, h.toWei("1000"))
    await oracle.connect(accounts[1]).depositStake(h.toWei("1000"))
    blocky = await h.getBlock()
    
    stakerInfo = await oracle.getStakerInfo(accounts[1].address)
    assert(stakerInfo[0] == blocky.timestamp, "stake start time not set correctly")
    assert(stakerInfo[1] == h.toWei("1000"), "stake amount incorrect")
  })

  it("submitValue", async function() {
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(oracle.address, h.toWei("1000"))
    await oracle.connect(accounts[1]).depositStake(h.toWei("1000"))
    await oracle.connect(accounts[1]).submitValue(keccak256(h.uintTob32(1)), h.uintTob32(1000), 0, h.uintTob32(1))
    blocky = await h.getBlock()

    let value = await oracle.retrieveData(keccak256(h.uintTob32(1)), blocky.timestamp)
    assert(value == h.uintTob32(1000), "value not reported correctly")
  })

  it("deposit stake, withdraw stake fully", async function() {
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(oracle.address, h.toWei("1000"))
    await oracle.connect(accounts[1]).depositStake(h.toWei("1000"))
    assert(await tellor.balanceOf(accounts[1].address) == 0, "balance not updated correctly")
    await oracle.connect(accounts[1]).requestStakingWithdraw(h.toWei("1000"))
    await h.advanceTime(86400 * 7)
    stakerBalanceBefore = await tellor.balanceOf(accounts[1].address)
    await oracle.connect(accounts[1]).withdrawStake()
    expectedBalance = BigInt(stakerBalanceBefore) + BigInt(h.toWei("1000"))
    assert(await tellor.balanceOf(accounts[1].address) == expectedBalance, "balance not updated correctly")
  })

  it("go through full dispute", async function() {
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("1000"))
    await tellor.connect(bigWallet).transfer(accounts[2].address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(oracle.address, h.toWei("1000"))
    await tellor.connect(accounts[2]).approve(governance.address, h.toWei("1000"))
    await oracle.connect(accounts[1]).depositStake(h.toWei("1000"))
    await oracle.connect(accounts[1]).submitValue(keccak256(h.uintTob32(1)), h.uintTob32(1000), 0, h.uintTob32(1))
    blocky = await h.getBlock()

    await governance.connect(accounts[2]).beginDispute(keccak256(h.uintTob32(1)), blocky.timestamp)
    await governance.connect(devWallet).vote(1, true, false)
    await governance.connect(bigWallet).vote(1, true, false)

    await h.advanceTime(86400 * 2)
    await governance.tallyVotes(1)
    await h.advanceTime(86400)
    await governance.executeVote(1)

    assert(await tellor.balanceOf(accounts[1].address) < h.toWei("1"), "balance not updated correctly")
  })

  it("addStakingRewards", async function() {
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(oracle.address, h.toWei("1000"))
    stakingRewardsBalBefore = await oracle.stakingRewardsBalance()
    await oracle.connect(accounts[1]).addStakingRewards(h.toWei("1000"))
    assert(BigInt(await oracle.stakingRewardsBalance()) - BigInt(stakingRewardsBalBefore) == BigInt(h.toWei("1000")), "staking rewards not updated correctly")
  })

  it("setup autopay feed", async function() {
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("1000"))
    await tellor.connect(bigWallet).transfer(accounts[2].address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(oracle.address, h.toWei("1000"))
    await tellor.connect(accounts[2]).approve(autopay.address, h.toWei("1000"))
    await oracle.connect(accounts[1]).depositStake(h.toWei("1000"))

    blocky0 = await h.getBlock()
    feedId = web3.utils.keccak256(abiCoder.encode(["bytes32", "uint256", "uint256", "uint256", "uint256", "uint256", "uint256"], [keccak256(h.uintTob32(1)), h.toWei("1"), blocky0.timestamp, 3600, 600, 0, 0]))
    await autopay.connect(accounts[2]).setupDataFeed(keccak256(h.uintTob32(1)), h.toWei("1"), blocky0.timestamp, 3600, 600, 0, 0, h.uintTob32(1), h.toWei("100"))
    await oracle.connect(accounts[1]).submitValue(keccak256(h.uintTob32(1)), h.uintTob32(1000), 0, h.uintTob32(1))
    blocky1 = await h.getBlock()

    await h.advanceTime(86400/2)

    await autopay.connect(accounts[1]).claimTip(feedId, keccak256(h.uintTob32(1)), [blocky1.timestamp])
    expectedBalance = BigInt(h.toWei("1")) * BigInt(98) / BigInt(100)
    assert(await tellor.balanceOf(accounts[1].address) == expectedBalance, "balance not updated correctly")
  })
  
  it("autopay one time tip", async function() {
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("1000"))
    await tellor.connect(bigWallet).transfer(accounts[2].address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(oracle.address, h.toWei("1000"))
    await tellor.connect(accounts[2]).approve(autopay.address, h.toWei("1000"))
    await oracle.connect(accounts[1]).depositStake(h.toWei("1000"))

    await autopay.connect(accounts[2]).tip(keccak256(h.uintTob32(1)), h.toWei("1"), h.uintTob32(1))
    await oracle.connect(accounts[1]).submitValue(keccak256(h.uintTob32(1)), h.uintTob32(1000), 0, h.uintTob32(1))
    blocky1 = await h.getBlock()

    await h.advanceTime(86400/2)

    await autopay.connect(accounts[1]).claimOneTimeTip(keccak256(h.uintTob32(1)), [blocky1.timestamp])
    expectedBalance = BigInt(h.toWei("1")) * BigInt(98) / BigInt(100)
    assert(await tellor.balanceOf(accounts[1].address) == expectedBalance, "balance not updated correctly")
  })

  it("vote with all stakeholder addresses", async function() {
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("1000"))
    await tellor.connect(bigWallet).transfer(accounts[2].address, h.toWei("1000"))
    await tellor.connect(bigWallet).transfer(accounts[3].address, h.toWei("1000"))
    await tellor.connect(bigWallet).transfer(accounts[4].address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(oracle.address, h.toWei("1000"))
    await tellor.connect(accounts[2]).approve(autopay.address, h.toWei("1000"))
    await tellor.connect(accounts[3]).approve(governance.address, h.toWei("1000"))
    await tellor.connect(accounts[4]).approve(oracle.address, h.toWei("1000"))
    await oracle.connect(accounts[1]).depositStake(h.toWei("1000"))
    await oracle.connect(accounts[4]).depositStake(h.toWei("1000"))

    // report autopay address array
    autopayAddresses = [autopay.address]
    autopayAddressesEncoded = abiCoder.encode(["address[]"], [autopayAddresses])
    await oracle.connect(accounts[4]).submitValue(AUTOPAY_QUERY_ID, autopayAddressesEncoded, 0, AUTOPAY_QUERY_DATA)
    await h.advanceTime(86400/2)

    blocky0 = await h.getBlock()
    await autopay.connect(accounts[2]).setupDataFeed(keccak256(h.uintTob32(1)), h.toWei("1"), blocky0.timestamp, 3600, 600, 0, 0, h.uintTob32(1), h.toWei("1000"))

    await oracle.connect(accounts[1]).submitValue(keccak256(h.uintTob32(1)), h.uintTob32(1000), 0, h.uintTob32(1))
    blocky1 = await h.getBlock()

    await governance.connect(accounts[3]).beginDispute(keccak256(h.uintTob32(1)), blocky1.timestamp)

    await governance.connect(accounts[2]).vote(1, true, false)
    await governance.connect(devWallet).vote(1, true, false)
    await governance.connect(accounts[4]).vote(1, true, false)

    await h.advanceTime(86400 * 2)
    await governance.tallyVotes(1)
    await h.advanceTime(86400)
    await governance.executeVote(1)

    devWalletBal = await tellor.balanceOf(DEV_WALLET)
    expectedTokenholders = BigInt(devWalletBal) + BigInt(h.toWei("1000"))

    voteInfo = await governance.getVoteInfo(1)
    assert(voteInfo[1][8] == h.toWei("1000"), "users doesSupport vote weight not updated correctly")
    assert(voteInfo[1][5] == expectedTokenholders, "tokenholders doesSupport vote weight not updated correctly")
    assert(voteInfo[1][14] == 1, "multisig doesSupport vote weight not updated correctly")
    assert(voteInfo[1][11] == 1, "reporters doesSupport vote weight not updated correctly")
  })

  it("report trb/usd and update stake amount", async function() {
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(oracle.address, h.toWei("1000"))
    await oracle.connect(accounts[1]).depositStake(h.toWei("1000"))

    // report trb/usd price below inflection price
    await oracle.connect(accounts[1]).submitValue(TRB_QUERY_ID, h.uintTob32(h.toWei("7.5")), 0, TRB_QUERY_DATA)
    await h.advanceTime(86400/2) 


    // update stake amount
    await oracle.connect(accounts[1]).updateStakeAmount()
    assert(await oracle.stakeAmount() == h.toWei("200"), "stake amount not updated correctly")

    // report trb/usd price above inflection price
    await oracle.connect(accounts[1]).submitValue(TRB_QUERY_ID, h.uintTob32(h.toWei("30")), 0, TRB_QUERY_DATA)
    await h.advanceTime(86400/2)

    // update stake amount
    await oracle.connect(accounts[1]).updateStakeAmount()
    assert(await oracle.stakeAmount() == h.toWei("100"), "stake amount not updated correctly")
  })

  it("rewards go to zero, big reward added, 2 stakers stakes", async function() {
    // Setup
    await h.advanceTime(86400 * 30)
    stakingRewardsBalBefore = BigInt(await oracle.stakingRewardsBalance())
    totalStakeAmountBefore = BigInt(await oracle.totalStakeAmount())
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("100"))
    await tellor.connect(bigWallet).transfer(accounts[2].address, h.toWei("100"))
    await tellor.connect(bigWallet).transfer(accounts[3].address, h.toWei("100"))
    await tellor.connect(bigWallet).transfer(accounts[10].address, h.toWei("6000"))
    await tellor.connect(accounts[1]).approve(oracle.address, h.toWei("1000000"))
    await tellor.connect(accounts[2]).approve(oracle.address, h.toWei("100"))
    await tellor.connect(accounts[3]).approve(oracle.address, h.toWei("100"))
    await tellor.connect(accounts[10]).approve(oracle.address, h.toWei("100000"))

    await oracle.connect(accounts[10]).addStakingRewards(h.toWei("1000"))
    stakingRewardsBalance = BigInt(await oracle.stakingRewardsBalance())
    expectedStakingRewardsBalance = stakingRewardsBalBefore + BigInt(h.toWei("1000"))
    assert(stakingRewardsBalance == expectedStakingRewardsBalance, "stakingRewardsBalance should be correct")

    await oracle.connect(accounts[1]).depositStake(h.toWei("100"))

    rewardRate = await oracle.rewardRate()
    expectedRewardRate = expectedStakingRewardsBalance / BigInt(30 * 86400)
    assert(rewardRate == expectedRewardRate, "reward rate should be correct")

    await h.advanceTime(86400 * 30)

    await oracle.connect(accounts[1]).requestStakingWithdraw(h.toWei("100"))

    // stake more reporters, add more rewards
    await oracle.connect(accounts[2]).depositStake(h.toWei("100"))
    await oracle.connect(accounts[3]).depositStake(h.toWei("100"))
    await oracle.connect(accounts[10]).addStakingRewards(h.toWei("1000"))
    stakingRewardsBalance = await oracle.stakingRewardsBalance()

    await h.advanceTime(86400 * 30)

    await oracle.connect(accounts[2]).requestStakingWithdraw(h.toWei("100"))
    await oracle.connect(accounts[3]).requestStakingWithdraw(h.toWei("100"))

    balanceStaker2 = await tellor.balanceOf(accounts[2].address)
    balanceStaker3 = await tellor.balanceOf(accounts[3].address)

    // fully withdraw stakes
    await h.advanceTime(86400 * 7)

    await oracle.connect(accounts[1]).withdrawStake()
    await oracle.connect(accounts[2]).withdrawStake()
    await oracle.connect(accounts[3]).withdrawStake()
  })

  it("stake 10 reporters, report 50 values, multiple times", async function() {
    this.timeout(20000000)
    oracleBalanceBefore = await tellor.balanceOf(oracle.address)
    totalStakeAmountBefore = await oracle.totalStakeAmount()
    stakingRewardsBalanceBefore = await oracle.stakingRewardsBalance()
    timeBasedRewardsBalanceBefore = await oracle.getTotalTimeBasedRewardsBalance()

    // Setup, stake 10 reporters
    for (let i = 1; i <= 10; i++) {
      await tellor.connect(bigWallet).transfer(accounts[i].address, h.toWei("1000"));
      await tellor.connect(accounts[i]).approve(oracle.address, h.toWei("1000000"));
  }
  await tellor.connect(bigWallet).approve(oracle.address, h.toWei("1000000"));

    for (let i = 1; i <= 10; i++) {
      await oracle.connect(accounts[i]).depositStake(h.toWei("200"))
    }

    // report 50 values and add staking rewards
    for (i = 0; i<5; i++) {
      await tellor.connect(bigWallet).transfer(oracle.address, h.toWei("1")) // tb rewards
      for (let j = 1; j <= 10; j++) {
        await oracle.connect(accounts[j]).submitValue(keccak256(h.uintTob32(j)), h.uintTob32(100 * j + i), 0, h.uintTob32(j));
      }
      await oracle.connect(bigWallet).addStakingRewards(h.toWei("1"))
      await h.advanceTime(86400/2)
    }

    for (let i = 1; i <= 10; i++) {
      await oracle.connect(accounts[i]).requestStakingWithdraw(h.toWei("100"))
    }

    for (let i = 1; i <= 10; i++) {
      await oracle.connect(accounts[i]).depositStake(h.toWei("200"))
    }

    await h.advanceTime(86400 * 40)

    for (let i = 1; i <= 10; i++) {
      await oracle.connect(accounts[i]).requestStakingWithdraw(h.toWei("300"))
    }

    await h.advanceTime(86400 * 7)

    for (let i = 1; i <= 10; i++) {
      await oracle.connect(accounts[i]).withdrawStake()
    }

    balanceStaker2 = await tellor.balanceOf(accounts[2].address)
    balanceStaker10 = await tellor.balanceOf(accounts[10].address)
    diff = BigInt(balanceStaker2) - BigInt(balanceStaker10)

    assert(diff < h.toWei("0.0001"), "diff should be less than 0.0001")

    oracleBalance = await tellor.balanceOf(oracle.address)
    totalStakeAmount = await oracle.totalStakeAmount()
    stakingRewardsBalance = await oracle.stakingRewardsBalance()
    timeBasedRewardsBalance = await oracle.getTotalTimeBasedRewardsBalance()
    toWithDrawBalance = await oracle.toWithdraw()
    oracleTokenPoolsSum = BigInt(totalStakeAmount) + BigInt(stakingRewardsBalance) + BigInt(timeBasedRewardsBalance) + BigInt(toWithDrawBalance)
    console.log("oracle bal:            " + oracleBalance)
    console.log("oracle bal before:     " + oracleBalanceBefore)
    console.log("diff:                  " + (BigInt(oracleBalance) - BigInt(oracleBalanceBefore)))
    assert(BigInt(oracleBalance) - BigInt(oracleBalanceBefore) < BigInt(h.toWei("10")), "oracle balance incorrect")  // originalBal + 10 stakingRewards added
    assert(BigInt(totalStakeAmount) - BigInt(totalStakeAmountBefore) == 0, "totalStakeAmount should equal original bal")
    assert(BigInt(stakingRewardsBalance) - BigInt(stakingRewardsBalanceBefore) < BigInt(h.toWei("10")) , "stakingRewardsBalance should be 0")
    assert(BigInt(timeBasedRewardsBalance) - BigInt(timeBasedRewardsBalanceBefore) == 0, "timeBasedRewardsBalance should be 0")
    assert(oracleTokenPoolsSum == oracleBalance, "oracleTokenPoolsSum should be equal to oracleBalance")

    for (let i = 1; i <= 10; i++) {
      await oracle.connect(accounts[i]).depositStake(h.toWei("200"))
    }

    for (i = 0; i < 5; i++) {
      await tellor.connect(bigWallet).transfer(oracle.address, h.toWei("1")) // tb rewards
    
      for (let j = 1; j <= 10; j++) {
        await oracle.connect(accounts[j]).submitValue(keccak256(h.uintTob32(j)), h.uintTob32(100 * j + i), 0, h.uintTob32(j));
      }
  
      await oracle.connect(bigWallet).addStakingRewards(h.toWei("1"))
      await h.advanceTime(86400/2)
    }

    for (let i = 1; i <= 10; i++) {
      await oracle.connect(accounts[i]).requestStakingWithdraw(h.toWei("100"))
    }

    for (let i = 1; i <= 10; i++) {
      await oracle.connect(accounts[i]).depositStake(h.toWei("200"))
    }

    await h.advanceTime(86400 * 40)

    for (let i = 1; i <= 10; i++) {
      await oracle.connect(accounts[i]).requestStakingWithdraw(h.toWei("300"))
    }

    await h.advanceTime(86400 * 7)

    for (let i = 1; i <= 10; i++) {
      await oracle.connect(accounts[i]).withdrawStake()
    }

    balanceStaker2 = await tellor.balanceOf(accounts[2].address)
    balanceStaker10 = await tellor.balanceOf(accounts[10].address)
    diff = BigInt(balanceStaker2) - BigInt(balanceStaker10)

    assert(diff < h.toWei("0.0001"), "diff should be less than 0.0001")

    oracleBalance = await tellor.balanceOf(oracle.address)
    totalStakeAmount = await oracle.totalStakeAmount()
    stakingRewardsBalance = await oracle.stakingRewardsBalance()
    timeBasedRewardsBalance = await oracle.getTotalTimeBasedRewardsBalance()
    oracleTokenPoolsSum = BigInt(totalStakeAmount) + BigInt(stakingRewardsBalance) + BigInt(timeBasedRewardsBalance)

    assert(BigInt(oracleBalance) - BigInt(oracleBalanceBefore) < BigInt(h.toWei("10")), "oracle balance incorrect")  // originalBal + 10 stakingRewards added
    assert(BigInt(totalStakeAmount) - BigInt(totalStakeAmountBefore) == 0, "totalStakeAmount should equal original bal")
    assert(BigInt(stakingRewardsBalance) - BigInt(stakingRewardsBalanceBefore) < BigInt(h.toWei("10")) , "stakingRewardsBalance should be 0")
    assert(BigInt(timeBasedRewardsBalance) - BigInt(timeBasedRewardsBalanceBefore) == 0, "timeBasedRewardsBalance should be 0")
    assert(oracleTokenPoolsSum == oracleBalance, "oracleTokenPoolsSum should be equal to oracleBalance")

    for (let i = 1; i <= 10; i++) {
      await oracle.connect(accounts[i]).depositStake(h.toWei("200"))
    }

    for (i = 0; i < 5; i++) {
      await tellor.connect(bigWallet).transfer(oracle.address, h.toWei("1")) // tb rewards
    
      for (let j = 1; j <= 10; j++) {
        await oracle.connect(accounts[j]).submitValue(keccak256(h.uintTob32(j)), h.uintTob32(100 * j + i), 0, h.uintTob32(j));
      }
    
      await oracle.connect(bigWallet).addStakingRewards(h.toWei("1"))
      await h.advanceTime(86400/2)
    }
    

    for (let i = 1; i <= 10; i++) {
      await oracle.connect(accounts[i]).requestStakingWithdraw(h.toWei("100"))
    }

    for (let i = 1; i <= 10; i++) {
      await oracle.connect(accounts[i]).depositStake(h.toWei("200"))
    }

    await h.advanceTime(86400 * 40)

    for (let i = 1; i <= 10; i++) {
      await oracle.connect(accounts[i]).requestStakingWithdraw(h.toWei("300"))
    }

    await h.advanceTime(86400 * 7)

    for (let i = 1; i <= 10; i++) {
      await oracle.connect(accounts[i]).withdrawStake()
    }

    balanceStaker2 = await tellor.balanceOf(accounts[2].address)
    balanceStaker10 = await tellor.balanceOf(accounts[10].address)
    diff = BigInt(balanceStaker2) - BigInt(balanceStaker10)

    assert(diff < h.toWei("0.0001"), "diff should be less than 0.0001")

    oracleBalance = await tellor.balanceOf(oracle.address)
    totalStakeAmount = await oracle.totalStakeAmount()
    stakingRewardsBalance = await oracle.stakingRewardsBalance()
    timeBasedRewardsBalance = await oracle.getTotalTimeBasedRewardsBalance()
    oracleTokenPoolsSum = BigInt(totalStakeAmount) + BigInt(stakingRewardsBalance) + BigInt(timeBasedRewardsBalance)

    assert(BigInt(oracleBalance) - BigInt(oracleBalanceBefore) < BigInt(h.toWei("10")), "oracle balance incorrect")  // originalBal + 10 stakingRewards added
    assert(BigInt(totalStakeAmount) - BigInt(totalStakeAmountBefore) == 0, "totalStakeAmount should equal original bal")
    assert(BigInt(stakingRewardsBalance) - BigInt(stakingRewardsBalanceBefore) < BigInt(h.toWei("10")) , "stakingRewardsBalance should be 0")
    assert(BigInt(timeBasedRewardsBalance) - BigInt(timeBasedRewardsBalanceBefore) == 0, "timeBasedRewardsBalance should be 0")
    assert(oracleTokenPoolsSum == oracleBalance, "oracleTokenPoolsSum should be equal to oracleBalance")
  })

  it("usingtellor", async function() {
    // Setup
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("2000"))
    await tellor.connect(accounts[1]).approve(oracle.address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(governance.address, h.toWei("1000"))

    await oracle.connect(accounts[1]).depositStake(h.toWei("1000"))

    newValueCountBefore = await usingTellorUser.getNewValueCountbyQueryId(TRB_QUERY_ID)

    await oracle.connect(accounts[1]).submitValue(TRB_QUERY_ID, h.uintTob32(100), 0, TRB_QUERY_DATA)
    blocky0 = await h.getBlock()

    await h.advanceTime(86400)

    await oracle.connect(accounts[1]).submitValue(TRB_QUERY_ID, h.uintTob32(200), 0, TRB_QUERY_DATA)
    blocky1 = await h.getBlock()

    await h.advanceTime(86400)

    await oracle.connect(accounts[1]).submitValue(TRB_QUERY_ID, h.uintTob32(300), 0, TRB_QUERY_DATA)
    blocky2 = await h.getBlock()

    // test usingTellor functions

    // getNewValueCountbyQueryId
    newValueCount = await usingTellorUser.getNewValueCountbyQueryId(TRB_QUERY_ID)
    console.log("newValueCount: " + newValueCount)
    console.log("newValueCountBefore: " + newValueCountBefore)
    expect(newValueCount).to.equal(3 + Number(newValueCountBefore))

    // getDataAfter
    dataAfter = await usingTellorUser.getDataAfter(TRB_QUERY_ID, blocky1.timestamp)
    assert(dataAfter[0] == h.uintTob32(300), "dataAfter should be 300")
    assert(dataAfter[1] == blocky2.timestamp, "dataAfter should be blocky2 timestamp")

    // getDataBefore
    dataBefore = await usingTellorUser.getDataBefore(TRB_QUERY_ID, blocky1.timestamp)
    assert(dataBefore[0] == h.uintTob32(100), "dataBefore should be 100")
    assert(dataBefore[1] == blocky0.timestamp, "dataBefore should be blocky1 timestamp")

    // getIndexForDataAfter
    indexAfter = await usingTellorUser.getIndexForDataAfter(TRB_QUERY_ID, blocky1.timestamp)
    assert(indexAfter[0] == true, "found should be true")
    assert(indexAfter[1] == 2 + Number(newValueCountBefore), "indexAfter should be 2 plus original count")

    // getIndexForDataBefore
    indexBefore = await usingTellorUser.getIndexForDataBefore(TRB_QUERY_ID, blocky2.timestamp)
    assert(indexBefore[0] == true, "found should be true")
    assert(indexBefore[1] == 1 + Number(newValueCountBefore), "indexBefore should be 1 plus original count")

    // getMultipleValuesBefore
    valuesBefore = await usingTellorUser.getMultipleValuesBefore(TRB_QUERY_ID, blocky2.timestamp, 86400*10, 2)
    assert(valuesBefore[0].length == 2)
    assert(valuesBefore[0][0] == h.uintTob32(100))
    assert(valuesBefore[0][1] == h.uintTob32(200))
    assert(valuesBefore[1].length == 2)
    assert(valuesBefore[1][0] == blocky0.timestamp)
    assert(valuesBefore[1][1] == blocky1.timestamp)

    // getReporterByTimestamp
    reporter = await usingTellorUser.getReporterByTimestamp(TRB_QUERY_ID, blocky1.timestamp)
    assert(reporter == accounts[1].address, "reporter address should be correct]")

    // getTimestampbyQueryIdandIndex
    timestamp = await usingTellorUser.getTimestampbyQueryIdandIndex(TRB_QUERY_ID, 1 + Number(newValueCountBefore))
    assert(timestamp == blocky1.timestamp, "timestamp should be correct")

    // isInDispute
    await h.advanceTime(86400)
    await oracle.connect(accounts[1]).submitValue(TRB_QUERY_ID, h.uintTob32(400), 0, TRB_QUERY_DATA)
    blocky3 = await h.getBlock()
    await governance.connect(accounts[1]).beginDispute(TRB_QUERY_ID, blocky3.timestamp)
    isInDispute = await usingTellorUser.isInDispute(TRB_QUERY_ID, blocky3.timestamp)
    assert(isInDispute == true, "isInDispute should be true")

    // retrieveData
    data = await usingTellorUser.retrieveData(TRB_QUERY_ID, blocky1.timestamp)
    assert(data == h.uintTob32(200), "data should be 200")

    // setIdMappingContract
    const MappingContract = await ethers.getContractFactory("MappingContractExample")
    mappingContract = await MappingContract.deploy()
    await mappingContract.deployed()
    await usingTellorUser.setIdMappingContract(mappingContract.address)
    retrievedMappingContract = await usingTellorUser.idMappingContract()
    assert(retrievedMappingContract == mappingContract.address, "mapping contract should be correct")

    // valueFor
    const ETH_USD_EIP2362_ID = "0xdfaa6f747f0f012e8f2069d6ecacff25f5cdf0258702051747439949737fc0b5"
    const ETH_USD_QUERY_DATA_ARGS = abiCoder.encode(["string", "string"], ["eth", "usd"])
    const ETH_USD_QUERY_DATA = abiCoder.encode(["string", "bytes"], ["SpotPrice", ETH_USD_QUERY_DATA_ARGS])
    const ETH_USD_QUERY_ID = keccak256(ETH_USD_QUERY_DATA)
    await h.advanceTime(86400)
    await oracle.connect(accounts[1]).submitValue(ETH_USD_QUERY_ID, h.uintTob32(1000), 0, ETH_USD_QUERY_DATA)
    blocky4 = await h.getBlock()
    valueRetrieved = await usingTellorUser.valueFor(ETH_USD_EIP2362_ID)
    assert(valueRetrieved[0] == 1000, "value should be 1000")
    assert(valueRetrieved[1] == blocky4.timestamp, "found should be true")
    assert(valueRetrieved[2] == 200, "status code should be 200")
  })

  it("stakingRewards rounding error", async function() {
    this.timeout(20000000)
    await h.advanceTime(86400 * 30)
    oracleBalBefore = BigInt(await tellor.balanceOf(oracle.address))
    totalStakeAmountBefore = BigInt(await oracle.totalStakeAmount())
    timeBasedRewardsBalBefore = await oracle.getTotalTimeBasedRewardsBalance()
    // Setup
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("1000"))
    await tellor.connect(bigWallet).transfer(accounts[2].address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(oracle.address, h.toWei("1000000000"))
    await tellor.connect(accounts[2]).approve(oracle.address, h.toWei("1000000000"))
    await tellor.connect(bigWallet).approve(oracle.address, h.toWei("1000000"))

    for(let i = 0; i < 50; i++) {
      await oracle.connect(bigWallet).addStakingRewards(h.toWei("1"))
      await h.advanceTime(86400)
      await oracle.connect(accounts[1]).depositStake(h.toWei("1000"))
      await h.advanceTime(86400)
      await oracle.connect(accounts[2]).depositStake(h.toWei("1000"))
      await h.advanceTime(86400 * 40)
      await oracle.connect(accounts[1]).requestStakingWithdraw(h.toWei("1000"))
      await h.advanceTime(86400)
      await oracle.connect(accounts[2]).requestStakingWithdraw(h.toWei("1000"))
      await h.advanceTime(86400 * 8)
      await oracle.connect(accounts[1]).withdrawStake()
      await oracle.connect(accounts[2]).withdrawStake()
    }

    oracleBalance = BigInt(await tellor.balanceOf(oracle.address))
    totalStakeAmount = BigInt(await oracle.totalStakeAmount())
    stakingRewardsBalance = await oracle.stakingRewardsBalance()
    timeBasedRewardsBalance = await oracle.getTotalTimeBasedRewardsBalance()
    toWithdrawBalance = await oracle.toWithdraw()
    oracleTokenPoolsSum = BigInt(totalStakeAmount) + BigInt(stakingRewardsBalance) + BigInt(timeBasedRewardsBalance) + BigInt(toWithdrawBalance)
    console.log("oracle bal:            " + oracleBalance)
    console.log("oracle bal before:     " + oracleBalBefore)
    console.log("diff:                  " + (BigInt(oracleBalance) - BigInt(oracleBalBefore)))
    assert(totalStakeAmount - totalStakeAmountBefore == 0, "totalStakeAmount should be 0")
    assert(timeBasedRewardsBalance - timeBasedRewardsBalBefore == 0, "timeBasedRewardsBalance should be 0")
    assert(oracleBalance == oracleTokenPoolsSum, "oracleBalance should be equal to oracleTokenPoolsSum")
  })

  it("read query data from query data storage", async function() {
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("1000"))
    await tellor.connect(bigWallet).transfer(accounts[2].address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(oracle.address, h.toWei("1000"))
    await tellor.connect(accounts[2]).approve(autopay.address, h.toWei("1000"))
    await oracle.connect(accounts[1]).depositStake(h.toWei("1000"))

    await autopay.connect(accounts[2]).tip(TRB_QUERY_ID, h.toWei("1"), TRB_QUERY_DATA)

    storedQueryData = await queryDataStorage.getQueryData(TRB_QUERY_ID)
    assert(storedQueryData == TRB_QUERY_DATA, "Stored query data should be correct")
  })

  it("full upgrade process", async function() {
    //assert the _ORACLE_CONTRACT is new flex
    oracleContract = await tellor.getAddressVars(h.hash("_ORACLE_CONTRACT"))
    expect(oracleContract).to.equal(oracle.address)
  })

  it("dispute fee capped at stake amount, one report", async function() {
    reporter1 = accounts[9]
    disputer = accounts[5]
    await tellor.connect(bigWallet).transfer(reporter1.address, h.toWei("1000"))
    await tellor.connect(bigWallet).transfer(disputer.address, h.toWei("1000"))

    await tellor.connect(reporter1).approve(oracle.address, h.toWei("1000"))
    await oracle.connect(reporter1).depositStake(h.toWei("1000"))
    await oracle.connect(reporter1).submitValue(ETH_QUERY_ID, h.bytes(100), 0, ETH_QUERY_DATA)
    blocky = await h.getBlock()
    assert(await oracle.getStakeAmount() == h.toWei("100"), "Stake amount should be correct")
    assert(await tellor.balanceOf(disputer.address) == h.toWei("1000"), "Disputer should have correct balance")
    await tellor.connect(disputer).approve(governance.address, h.toWei("10"))
    await governance.connect(disputer).beginDispute(ETH_QUERY_ID, blocky.timestamp)
    assert(await tellor.balanceOf(disputer.address) == h.toWei("990"), "Disputer should have correct balance")
    voteInfo = await governance.getVoteInfo(1)
    assert(voteInfo[1][3] == h.toWei("10"), "Dispute fee should be correct")

    await h.advanceTime(86400 * 1)
    await governance.tallyVotes(1)
    await tellor.connect(disputer).approve(governance.address, h.toWei("20"))
    await governance.connect(disputer).beginDispute(ETH_QUERY_ID, blocky.timestamp)
    assert(await tellor.balanceOf(disputer.address) == h.toWei("970"), "Disputer should have correct balance")
    voteInfo = await governance.getVoteInfo(2)
    assert(voteInfo[1][3] == h.toWei("20"), "Dispute fee should be correct")

    await h.advanceTime(86400 * 2)
    await governance.tallyVotes(2)
    await tellor.connect(disputer).approve(governance.address, h.toWei("40"))
    await governance.connect(disputer).beginDispute(ETH_QUERY_ID, blocky.timestamp)
    assert(await tellor.balanceOf(disputer.address) == h.toWei("930"), "Disputer should have correct balance")
    voteInfo = await governance.getVoteInfo(3)
    assert(voteInfo[1][3] == h.toWei("40"), "Dispute fee should be correct")

    await h.advanceTime(86400 * 3)
    await governance.tallyVotes(3)
    await tellor.connect(disputer).approve(governance.address, h.toWei("80"))
    await governance.connect(disputer).beginDispute(ETH_QUERY_ID, blocky.timestamp)
    assert(await tellor.balanceOf(disputer.address) == h.toWei("850"), "Disputer should have correct balance")
    voteInfo = await governance.getVoteInfo(4)
    assert(voteInfo[1][3] == h.toWei("80"), "Dispute fee should be correct")

    await h.advanceTime(86400 * 4)
    await governance.tallyVotes(4)
    await tellor.connect(disputer).approve(governance.address, h.toWei("100"))
    await governance.connect(disputer).beginDispute(ETH_QUERY_ID, blocky.timestamp)
    assert(await tellor.balanceOf(disputer.address) == h.toWei("750"), "Disputer should have correct balance")
    voteInfo = await governance.getVoteInfo(5)
    assert(voteInfo[1][3] == h.toWei("100"), "Dispute fee should be correct")

    await h.advanceTime(86400 * 5)
    await governance.tallyVotes(5)
    await tellor.connect(disputer).approve(governance.address, h.toWei("100"))
    await governance.connect(disputer).beginDispute(ETH_QUERY_ID, blocky.timestamp)
    assert(await tellor.balanceOf(disputer.address) == h.toWei("650"), "Disputer should have correct balance")
    voteInfo = await governance.getVoteInfo(6)
    assert(voteInfo[1][3] == h.toWei("100"), "Dispute fee should be correct")
  })

  it("time based rewards don't steal from stakes pending withdrawal", async function() {
    await tellor.connect(bigWallet).transfer(accounts[0].address, h.toWei("1000"))
    await tellor.approve(oracle.address, h.toWei("1000"))
    await oracle.depositStake(h.toWei("1000"))
    assert(await oracle.getTotalTimeBasedRewardsBalance() == 0, "total time based rewards balance should be 0")
    assert(await oracle.toWithdraw() == 0, "toWithdraw should be 0")
    await oracle.requestStakingWithdraw(h.toWei("100"))
    assert(await oracle.getTotalTimeBasedRewardsBalance() == 0, "total time based rewards balance should be 0")
    assert(await oracle.toWithdraw() == h.toWei("100"), "toWithdraw should be correct")
	})

  it("mint to oracle works with new oracle", async function() {
    // report new oracle address to old oracle
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(oracleOld.address, h.toWei("1000"))
    await oracleOld.connect(accounts[1]).depositStake(h.toWei("1000"))
    newOracleAddressEncoded = abiCoder.encode(["address"], [oracle.address])
    await oracleOld.connect(accounts[1]).submitValue(TELLOR_ORACLE_ADDRESS_QUERY_ID, newOracleAddressEncoded, 0, TELLOR_ORACLE_ADDRESS_QUERY_DATA)

    // wait 12 hours
    await h.advanceTime(43200)

    // call updateOracleAddress function at tellor master, 1st time
    await tellor.connect(accounts[1]).updateOracleAddress()

    // report ETH/USD price to new oracle
    await tellor.connect(bigWallet).transfer(accounts[2].address, h.toWei("1000"))
    await tellor.connect(accounts[2]).approve(oracle.address, h.toWei("1000"))
    await oracle.connect(accounts[2]).depositStake(h.toWei("1000"))
    await oracle.connect(accounts[2]).submitValue(ETH_QUERY_ID, h.uintTob32(100), 0, ETH_QUERY_DATA)
    
    // wait 7 days
    await h.advanceTime(86400 * 7)

    // call updateOracleAddress function at tellor master, 2nd time
    await tellor.connect(accounts[1]).updateOracleAddress()

    timeBasedRewardsBalBefore = await oracle.getTotalTimeBasedRewardsBalance()
    await tellor.mintToOracle()
    timeBasedRewardsBalAfter = await oracle.getTotalTimeBasedRewardsBalance()
    assert(timeBasedRewardsBalAfter > timeBasedRewardsBalBefore, "Time based rewards bal should be greater after minting to oracle")
  })

  it("Manually verify that Liquity reads from new oracle", async function() {
    // ****** upgrade to new oracle ******
    // report new oracle address to old oracle
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(oracleOld.address, h.toWei("1000"))
    await oracleOld.connect(accounts[1]).depositStake(h.toWei("1000"))
    newOracleAddressEncoded = abiCoder.encode(["address"], [oracle.address])
    await oracleOld.connect(accounts[1]).submitValue(TELLOR_ORACLE_ADDRESS_QUERY_ID, newOracleAddressEncoded, 0, TELLOR_ORACLE_ADDRESS_QUERY_DATA)

    // wait 12 hours
    await h.advanceTime(43200)

    // call updateOracleAddress function at tellor master, 1st time
    await tellor.connect(accounts[1]).updateOracleAddress()

    // report ETH/USD price to new oracle
    await tellor.connect(bigWallet).transfer(accounts[2].address, h.toWei("1000"))
    await tellor.connect(accounts[2]).approve(oracle.address, h.toWei("1000"))
    await oracle.connect(accounts[2]).depositStake(h.toWei("1000"))
    await oracle.connect(accounts[2]).submitValue(ETH_QUERY_ID, h.uintTob32(100), 0, ETH_QUERY_DATA)
    
    // wait 7 days
    await h.advanceTime(86400 * 7)

    // call updateOracleAddress function at tellor master, 2nd time
    await tellor.connect(accounts[1]).updateOracleAddress()


    // ****** ensure liquity can read from new oracle ******
    let liquityPriceFeed = await ethers.getContractAt("contracts/testing/liquity/IPriceFeed.sol:IPriceFeed", LIQUITY_PRICE_FEED)

    await tellor.connect(bigWallet).transfer(accounts[10].address, BigInt(1000E18))
    await tellor.connect(accounts[10]).approve(oracle.address, BigInt(1000E18))
    await oracle.connect(accounts[10]).depositStake(BigInt(1000E18))
    await oracle.connect(accounts[10]).submitValue(ETH_QUERY_ID,h.uintTob32(h.toWei("2095.15")),0,ETH_QUERY_DATA)
    await h.advanceTime(60 * 15 + 1)
    await liquityPriceFeed.fetchPrice()
    lastGoodPrice = await liquityPriceFeed.lastGoodPrice()
    expect(lastGoodPrice).to.eq("2095150000000000000000", "Liquity ether price should be correct")

    await h.advanceTime(60*60*12)
    await oracle.connect(accounts[10]).submitValue(ETH_QUERY_ID,h.uintTob32(h.toWei("3395.16")),0,ETH_QUERY_DATA)
    await h.advanceTime(60 * 15 + 1)
    await liquityPriceFeed.fetchPrice()
    lastGoodPrice = await liquityPriceFeed.lastGoodPrice()
    expect(lastGoodPrice).to.eq("3395160000000000000000", "Liquity ether price should be correct")

    await h.advanceTime(60*60*12)
    await oracle.connect(accounts[10]).submitValue(ETH_QUERY_ID,h.uintTob32(h.toWei("3395.17")),0,ETH_QUERY_DATA)
    await h.advanceTime(60 * 15 + 1)
    await liquityPriceFeed.fetchPrice()
    lastGoodPrice = await liquityPriceFeed.lastGoodPrice()
    assert(lastGoodPrice == "3395170000000000000000", "Liquity ether price should be correct")
  });

  it("Another liquity test", async function() {
    // ****** upgrade to new oracle ******
    // report new oracle address to old oracle
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(oracleOld.address, h.toWei("1000"))
    await oracleOld.connect(accounts[1]).depositStake(h.toWei("1000"))
    newOracleAddressEncoded = abiCoder.encode(["address"], [oracle.address])
    await oracleOld.connect(accounts[1]).submitValue(TELLOR_ORACLE_ADDRESS_QUERY_ID, newOracleAddressEncoded, 0, TELLOR_ORACLE_ADDRESS_QUERY_DATA)

    // wait 12 hours
    await h.advanceTime(43200)

    // call updateOracleAddress function at tellor master, 1st time
    await tellor.connect(accounts[1]).updateOracleAddress()

    // report ETH/USD price to new oracle
    await tellor.connect(bigWallet).transfer(accounts[2].address, h.toWei("1000"))
    await tellor.connect(accounts[2]).approve(oracle.address, h.toWei("1000"))
    await oracle.connect(accounts[2]).depositStake(h.toWei("1000"))
    await oracle.connect(accounts[2]).submitValue(ETH_QUERY_ID, h.uintTob32(100), 0, ETH_QUERY_DATA)
    
    // wait 7 days
    await h.advanceTime(86400 * 7)

    // call updateOracleAddress function at tellor master, 2nd time
    await tellor.connect(accounts[1]).updateOracleAddress()


    let liquityPriceFeed = await ethers.getContractAt("contracts/testing/liquity/IPriceFeed.sol:IPriceFeed", LIQUITY_PRICE_FEED)
    const TellorCallerTest = await ethers.getContractFactory("contracts/testing/liquity/TellorCaller.sol:TellorCaller")
    let tellorCallerTest = await TellorCallerTest.deploy(tellor.address)

    await tellor.connect(bigWallet).transfer(accounts[10].address, BigInt(1009E18))
    await tellor.connect(accounts[10]).approve(oracle.address, BigInt(1000E18))
    await oracle.connect(accounts[10]).depositStake(BigInt(1000E18))
    await oracle.connect(accounts[10]).submitValue(ETH_QUERY_ID,h.uintTob32(h.toWei("2095.15")),0,ETH_QUERY_DATA)
    blocky0 = await h.getBlock()
    await h.advanceTime(60 * 15 + 1)

    retrievedVal = await tellor["retrieveData(uint256,uint256)"](1, 0);
    assert(retrievedVal == 2095150000, "retrieved data should be correct")

    await liquityPriceFeed.fetchPrice()
    lastGoodPrice = await liquityPriceFeed.lastGoodPrice()
    expect(lastGoodPrice).to.equal("2095150000000000000000", "Liquity ether price should be correct")
    currentVal = await tellorCallerTest.getTellorCurrentValue(1)
    assert(currentVal[0] == true, "ifRetrieve should be correct")
    assert(currentVal[1] == 2095150000, "current value should be correct")
    assert(currentVal[2] == blocky0.timestamp, "current timestamp should be correct")

    await h.advanceTime(60*60*12)
    await oracle.connect(accounts[10]).submitValue(ETH_QUERY_ID,h.uintTob32(h.toWei("3395.16")),0,ETH_QUERY_DATA)
    blocky1 = await h.getBlock()
    
    // fetch price without advancing time
    await liquityPriceFeed.fetchPrice()
    lastGoodPrice = await liquityPriceFeed.lastGoodPrice()
    expect(lastGoodPrice).to.equal("2095150000000000000000", "Liquity ether price should be correct")
    currentVal = await tellorCallerTest.getTellorCurrentValue(1)
    assert(currentVal[0] == true, "ifRetrieve should be correct")
    assert(currentVal[1] == 2095150000, "current value should be correct")
    assert(currentVal[2] == blocky0.timestamp, "current timestamp should be correct")
    
    await h.advanceTime(60 * 15 + 1)
    await liquityPriceFeed.fetchPrice()
    lastGoodPrice = await liquityPriceFeed.lastGoodPrice()
    currentVal = await tellorCallerTest.getTellorCurrentValue(1)
    expect(lastGoodPrice).to.eq("3395160000000000000000", "Liquity ether price should be correct")
    currentVal = await tellorCallerTest.getTellorCurrentValue(1)
    assert(currentVal[0] == true, "ifRetrieve should be correct")
    assert(currentVal[1] == 3395160000, "current value should be correct")
    assert(currentVal[2] == blocky1.timestamp, "current timestamp should be correct")

    await h.advanceTime(60*60*12)
    await oracle.connect(accounts[10]).submitValue(ETH_QUERY_ID,h.uintTob32(h.toWei("3395.17")),0,ETH_QUERY_DATA)
    await h.advanceTime(60 * 15 + 1)
    await liquityPriceFeed.fetchPrice()
    lastGoodPrice = await liquityPriceFeed.lastGoodPrice()
    assert(lastGoodPrice == "3395170000000000000000", "Liquity ether price should be correct")
  })

  it("ampl can read from TellorMaster", async function() {
    // ****** upgrade to new oracle ******
    // report new oracle address to old oracle
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(oracleOld.address, h.toWei("1000"))
    await oracleOld.connect(accounts[1]).depositStake(h.toWei("1000"))
    newOracleAddressEncoded = abiCoder.encode(["address"], [oracle.address])
    await oracleOld.connect(accounts[1]).submitValue(TELLOR_ORACLE_ADDRESS_QUERY_ID, newOracleAddressEncoded, 0, TELLOR_ORACLE_ADDRESS_QUERY_DATA)

    // wait 12 hours
    await h.advanceTime(43200)

    // call updateOracleAddress function at tellor master, 1st time
    await tellor.connect(accounts[1]).updateOracleAddress()

    // report ETH/USD price to new oracle
    await tellor.connect(bigWallet).transfer(accounts[2].address, h.toWei("1000"))
    await tellor.connect(accounts[2]).approve(oracle.address, h.toWei("1000"))
    await oracle.connect(accounts[2]).depositStake(h.toWei("1000"))
    await oracle.connect(accounts[2]).submitValue(ETH_QUERY_ID, h.uintTob32(100), 0, ETH_QUERY_DATA)
    
    // wait 7 days
    await h.advanceTime(86400 * 7)

    // call updateOracleAddress function at tellor master, 2nd time
    await tellor.connect(accounts[1]).updateOracleAddress()


    // ********************************************************
    // *    ensure ampleforth can read from new oracle        *
    // ********************************************************
    let tellorProviderAmpl = await ethers.getContractAt("contracts/testing/TellorProvider.sol:TellorProvider", TELLOR_PROVIDER_AMPL)
    let medianOracleAmpl = await ethers.getContractAt("contracts/testing/MedianOracle.sol:MedianOracle", MEDIAN_ORACLE_AMPL)

    // submit ampl value to 360 oracle
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(oracle.address, h.toWei("1000"))
    await oracle.connect(accounts[1]).depositStake(h.toWei("1000"))
    await oracle.connect(accounts[1]).submitValue(AMPL_QUERY_ID, h.uintTob32(web3.utils.toWei("1.23")), 0, AMPL_QUERY_DATA)
    blocky2 = await h.getBlock()        

    // advance time
    await h.advanceTime(86400)

    // push tellor value to ampl provider
    await tellorProviderAmpl.pushTellor()

    // ensure correct timestamp pushed to tellor provider
    tellorReport = await tellorProviderAmpl.tellorReport()
    assert(tellorReport[0] == blocky2.timestamp || tellorReport[1] == blocky2.timestamp, "tellor report not pushed")

    // ensure correct oracle value pushed to medianOracle contract
    providerReports0 = await medianOracleAmpl.providerReports(tellorProviderAmpl.address, 0)
    providerReports1 = await medianOracleAmpl.providerReports(tellorProviderAmpl.address, 1)
    assert(providerReports0.payload == web3.utils.toWei("1.23") || providerReports1.payload == web3.utils.toWei("1.23"), "tellor report not pushed")
    
    await oracle.connect(accounts[1]).submitValue(AMPL_QUERY_ID, h.uintTob32(web3.utils.toWei(".99")), 1, AMPL_QUERY_DATA)
    blocky1 = await h.getBlock()

    // advance time
    await h.advanceTime(86400)
    // push tellor value to ampl provider
    await tellorProviderAmpl.pushTellor()
    
    // ensure correct timestamp pushed to tellor provider
    tellorReport = await tellorProviderAmpl.tellorReport()
    assert(tellorReport[0] == blocky1.timestamp || tellorReport[1] == blocky1.timestamp, "tellor report not pushed")

    // ensure correct oracle value pushed to medianOracle contract
    providerReports0 = await medianOracleAmpl.providerReports(tellorProviderAmpl.address, 0)
    providerReports1 = await medianOracleAmpl.providerReports(tellorProviderAmpl.address, 1)
    assert(providerReports0.payload == web3.utils.toWei(".99") || providerReports1.payload == web3.utils.toWei(".99"), "tellor report not pushed")
  })

  it("test parachute", async function() {
    // test parachute
    parachute = await ethers.getContractAt("tellor360/contracts/oldContracts/contracts/interfaces/ITellor.sol:ITellor", PARACHUTE, devWallet);
    deityAddr = await tellor.getAddressVars(h.hash("_DEITY"))
    assert(deityAddr == PARACHUTE, "deity should be parachute")
    await parachute.rescueBrokenDataReporting()
    deityAddr = await tellor.getAddressVars(h.hash("_DEITY"))
    assert(deityAddr == PARACHUTE, "deity should be parachute")

    // report ETH/USD price to new oracle
    await tellor.connect(bigWallet).transfer(accounts[2].address, h.toWei("1000"))
    await tellor.connect(accounts[2]).approve(oracle.address, h.toWei("1000"))
    await oracle.connect(accounts[2]).depositStake(h.toWei("1000"))
    await oracle.connect(accounts[2]).submitValue(ETH_QUERY_ID, h.uintTob32(200), 0, ETH_QUERY_DATA)
    await h.advanceTime(86400 * 7)
    await parachute.rescueBrokenDataReporting()
    deityAddr = await tellor.getAddressVars(h.hash("_DEITY"))
    assert(deityAddr == PARACHUTE, "deity should be parachute")

    await h.advanceTime(86400 * 7 + 1)
    await parachute.rescueBrokenDataReporting()
    deityAddr = await tellor.getAddressVars(h.hash("_DEITY"))
    assert(deityAddr == DEV_WALLET, "deity should be devWallet")

    await h.expectThrow(parachute.rescueFailedUpdate(), "rescueFailedUpdate should throw")
  })
})



