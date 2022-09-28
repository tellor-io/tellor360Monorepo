const { expect } = require("chai");
const h = require("./helpers/helpers");
var assert = require('assert');
const web3 = require('web3');
const { ethers } = require("hardhat");
const { keccak256 } = require("ethers/lib/utils");

describe("Forking Tests - Before Transition", function() {

  // tellor360 - update these
  const ORACLE360 = "0x09316E89e0D1BF40D21edc8Aba38980F3e711Ef6"
  const GOVERNANCE360 = "0x5bbE24d18F13047f4299dacA7e1435c4fec56384"
  const AUTOPAY360 = "0x97149c8CdE2a7baA71384BAA02c4814A35F9604e"
  const TELLOR360 = "0xF667Ed2BA355298649c7eb23ae7385cdc181B648"
  const QUERY_DATA_STORAGE = "0x638b138B5470DB078f6Ee0fC45935a38D2eEc1Cc"

  // rinkeby pre360 addresses
  const tellorMaster = "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0"
  const DEV_WALLET = "0x2F51C4Bf6B66634187214A695be6CDd344d4e9d1"
  const BIGWALLET = "0x41c5a04f61b865e084e5f502ff322ad624cad609"
  const CURR_GOV = "0xA64Bb0078eB80c97484f3f09Adb47b9B73CBcA00"
  const REPORTER = "0x0D4F81320d36d7B7Cf5fE7d1D547f63EcBD1a3E0"
  const TELLORX_ORACLE = "0x18431fd88adF138e8b979A7246eb58EA7126ea16"
  
  const abiCoder = new ethers.utils.AbiCoder();
  const AUTOPAY_QUERY_DATA_ARGS = abiCoder.encode(["bytes"], ["0x"])
  const AUTOPAY_QUERY_DATA = abiCoder.encode(["string", "bytes"], ["AutopayAddresses", AUTOPAY_QUERY_DATA_ARGS])
  const AUTOPAY_QUERY_ID = web3.utils.keccak256(AUTOPAY_QUERY_DATA)
  const TRB_QUERY_DATA_ARGS = abiCoder.encode(["string", "string"], ["trb", "usd"])
  const TRB_QUERY_DATA = abiCoder.encode(["string", "bytes"], ["SpotPrice", TRB_QUERY_DATA_ARGS])
  const TRB_QUERY_ID = web3.utils.keccak256(TRB_QUERY_DATA)
  

  let accounts = null
  let tellor = null
  let oracle = null
  let governance = null
  let autopay = null
  let queryDataStorage = null
  let tellor360 = null
  let oldGovernance = null
  let govSigner = null
  let devWallet = null

  beforeEach("deploy and setup Tellor360", async function() {

    await hre.network.provider.request({
      method: "hardhat_reset",
      params: [{forking: {
            jsonRpcUrl: hre.config.networks.hardhat.forking.url,
            blockNumber: 11384844
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
    oldGovernance = await ethers.getContractAt("tellor360/contracts/oldContracts/contracts/interfaces/ITellor.sol:ITellor", CURR_GOV)
    oldOracle = await ethers.getContractAt("tellor360/contracts/oldContracts/contracts/interfaces/ITellor.sol:ITellor", TELLORX_ORACLE)

    // 360
    oracle = await ethers.getContractAt("tellorflex/contracts/TellorFlex.sol:TellorFlex", ORACLE360)
    governance = await ethers.getContractAt("polygongovernance/contracts/Governance.sol:Governance", GOVERNANCE360)
    autopay = await ethers.getContractAt("autopay/contracts/Autopay.sol:Autopay", AUTOPAY360)
    tellor360 = await ethers.getContractAt("tellor360/contracts/Tellor360.sol:Tellor360", TELLOR360)

    // deploy usingtellor user
    const UsingTellorUser = await ethers.getContractFactory("UsingTellorUser")
    usingTellorUser = await UsingTellorUser.deploy(oracle.address)
    await usingTellorUser.deployed()
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
    await oracle.connect(accounts[1]).submitValue(h.uintTob32(1), h.uintTob32(1000), 0, '0x')
    blocky = await h.getBlock()

    let value = await oracle.retrieveData(h.uintTob32(1), blocky.timestamp)
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
    await oracle.connect(accounts[1]).submitValue(h.uintTob32(1), h.uintTob32(1000), 0, '0x')
    blocky = await h.getBlock()

    await governance.connect(accounts[2]).beginDispute(h.uintTob32(1), blocky.timestamp)
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
    await oracle.connect(accounts[1]).addStakingRewards(h.toWei("1000"))
    assert(await oracle.stakingRewardsBalance() >= h.toWei("1000"), "staking rewards not updated correctly")
  })

  it("setup autopay feed", async function() {
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("1000"))
    await tellor.connect(bigWallet).transfer(accounts[2].address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(oracle.address, h.toWei("1000"))
    await tellor.connect(accounts[2]).approve(autopay.address, h.toWei("1000"))
    await oracle.connect(accounts[1]).depositStake(h.toWei("1000"))

    blocky0 = await h.getBlock()
    feedId = web3.utils.keccak256(abiCoder.encode(["bytes32", "uint256", "uint256", "uint256", "uint256", "uint256", "uint256"], [h.uintTob32(1), h.toWei("1"), blocky0.timestamp, 3600, 600, 0, 0]))
    await autopay.connect(accounts[2]).setupDataFeed(h.uintTob32(1), h.toWei("1"), blocky0.timestamp, 3600, 600, 0, 0, '0x', h.toWei("100"))
    await oracle.connect(accounts[1]).submitValue(h.uintTob32(1), h.uintTob32(1000), 0, '0x')
    blocky1 = await h.getBlock()

    await h.advanceTime(86400/2)

    await autopay.connect(accounts[1]).claimTip(feedId, h.uintTob32(1), [blocky1.timestamp])
    expectedBalance = BigInt(h.toWei("1")) * BigInt(98) / BigInt(100)
    assert(await tellor.balanceOf(accounts[1].address) == expectedBalance, "balance not updated correctly")
  })
  
  it("autopay one time tip", async function() {
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("1000"))
    await tellor.connect(bigWallet).transfer(accounts[2].address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(oracle.address, h.toWei("1000"))
    await tellor.connect(accounts[2]).approve(autopay.address, h.toWei("1000"))
    await oracle.connect(accounts[1]).depositStake(h.toWei("1000"))

    await autopay.connect(accounts[2]).tip(h.uintTob32(1), h.toWei("1"), '0x')
    await oracle.connect(accounts[1]).submitValue(h.uintTob32(1), h.uintTob32(1000), 0, '0x')
    blocky1 = await h.getBlock()

    await h.advanceTime(86400/2)

    await autopay.connect(accounts[1]).claimOneTimeTip(h.uintTob32(1), [blocky1.timestamp])
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
    await autopay.connect(accounts[2]).setupDataFeed(h.uintTob32(1), h.toWei("1"), blocky0.timestamp, 3600, 600, 0, 0, '0x', h.toWei("1000"))

    await oracle.connect(accounts[1]).submitValue(h.uintTob32(1), h.uintTob32(1000), 0, '0x')
    blocky1 = await h.getBlock()

    await governance.connect(accounts[3]).beginDispute(h.uintTob32(1), blocky1.timestamp)

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
    await tellor.connect(bigWallet).transfer(accounts[2].address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(oracle.address, h.toWei("1000"))
    await tellor.connect(accounts[2]).approve(governance.address, h.toWei("1000"))
    await oracle.connect(accounts[1]).depositStake(h.toWei("1000"))

    // report trb/usd price
    await oracle.connect(accounts[1]).submitValue(TRB_QUERY_ID, h.uintTob32(h.toWei("2500")), 0, TRB_QUERY_DATA)
    await h.advanceTime(86400/2) 

    // update stake amount
    await oracle.connect(accounts[1]).updateStakeAmount()
    assert(await oracle.stakeAmount() == h.toWei("1"), "stake amount not updated correctly")
  })

  it("rewards go to zero, big reward added, 2 stakers stakes", async function() {
    // Setup
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("100"))
    await tellor.connect(bigWallet).transfer(accounts[2].address, h.toWei("100"))
    await tellor.connect(bigWallet).transfer(accounts[3].address, h.toWei("100"))
    await tellor.connect(bigWallet).transfer(accounts[10].address, h.toWei("6000"))
    await tellor.connect(accounts[1]).approve(oracle.address, h.toWei("1000000"))
    await tellor.connect(accounts[2]).approve(oracle.address, h.toWei("100"))
    await tellor.connect(accounts[3]).approve(oracle.address, h.toWei("100"))
    await tellor.connect(accounts[10]).approve(oracle.address, h.toWei("100000"))

    stakingRewardsBalance = await oracle.stakingRewardsBalance()
    assert(stakingRewardsBalance == h.toWei("1"), "stakingRewardsBalance should start at 1 TRB")
    await oracle.connect(accounts[10]).addStakingRewards(h.toWei("1000"))
    stakingRewardsBalance = await oracle.stakingRewardsBalance()
    assert(stakingRewardsBalance == h.toWei("1001"), "stakingRewardsBalance should be 1001 TRB")

    await oracle.connect(accounts[1]).depositStake(h.toWei("100"))

    rewardRate = await oracle.rewardRate()
    expectedRewardRate = BigInt(h.toWei("1001")) / BigInt(30 * 86400)
    assert(rewardRate == expectedRewardRate, "reward rate should be correct")

    await h.advanceTime(86400 * 30)

    await oracle.connect(accounts[1]).requestStakingWithdraw(h.toWei("100"))
    balanceStaker1 = await tellor.balanceOf(accounts[1].address)
    stakingRewardsBalance = await oracle.stakingRewardsBalance()
    assert(stakingRewardsBalance == 0, "stakingRewardsBalance should be 0 TRB")
    assert(balanceStaker1 == h.toWei("1001"), "staker 1 should have 1000 TRB reward")
    
    // stake more reporters, add more rewards
    await oracle.connect(accounts[2]).depositStake(h.toWei("100"))
    await oracle.connect(accounts[3]).depositStake(h.toWei("100"))
    await oracle.connect(accounts[10]).addStakingRewards(h.toWei("1000"))
    stakingRewardsBalance = await oracle.stakingRewardsBalance()
    assert(stakingRewardsBalance == h.toWei("1000"), "stakingRewardsBalance should be 1000 TRB")

    await h.advanceTime(86400 * 30)

    await oracle.connect(accounts[2]).requestStakingWithdraw(h.toWei("100"))
    await oracle.connect(accounts[3]).requestStakingWithdraw(h.toWei("100"))

    balanceStaker2 = await tellor.balanceOf(accounts[2].address)
    balanceStaker3 = await tellor.balanceOf(accounts[3].address)

    assert(balanceStaker2 == h.toWei("500"), "staker 2 should have 500 TRB reward")
    assert(balanceStaker3 == h.toWei("500"), "staker 3 should have 500 TRB reward")

    stakingRewardsBalance = await oracle.stakingRewardsBalance()
    assert(stakingRewardsBalance == 0, "stakingRewardsBalance should be 0 TRB")
    oracleBalance = await tellor.balanceOf(oracle.address)
    assert(oracleBalance == h.toWei("300"), "oracle should have 300 TRB")

    // fully withdraw stakes
    await h.advanceTime(86400 * 7)

    await oracle.connect(accounts[1]).withdrawStake()
    await oracle.connect(accounts[2]).withdrawStake()
    await oracle.connect(accounts[3]).withdrawStake()

    assert(await tellor.balanceOf(accounts[1].address) == BigInt(balanceStaker1) + BigInt(h.toWei("100")), "staker 1 balance should be correct")
    assert(await tellor.balanceOf(accounts[2].address) == BigInt(balanceStaker2) + BigInt(h.toWei("100")), "staker 2 balance should be correct")
    assert(await tellor.balanceOf(accounts[3].address) == BigInt(balanceStaker3) + BigInt(h.toWei("100")), "staker 3 balance should be correct")
  })

  it("stake 10 reporters, report 50 values, multiple times", async function() {
    this.timeout(20000000)
    oracleBalance = await tellor.balanceOf(oracle.address)
    totalStakeAmount = await oracle.totalStakeAmount()
    stakingRewardsBalance = await oracle.stakingRewardsBalance()
    timeBasedRewardsBalance = await oracle.getTotalTimeBasedRewardsBalance()

    // Setup
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("1000"))
    await tellor.connect(bigWallet).transfer(accounts[2].address, h.toWei("1000"))
    await tellor.connect(bigWallet).transfer(accounts[3].address, h.toWei("1000"))
    await tellor.connect(bigWallet).transfer(accounts[4].address, h.toWei("1000"))
    await tellor.connect(bigWallet).transfer(accounts[5].address, h.toWei("1000"))
    await tellor.connect(bigWallet).transfer(accounts[6].address, h.toWei("1000"))
    await tellor.connect(bigWallet).transfer(accounts[7].address, h.toWei("1000"))
    await tellor.connect(bigWallet).transfer(accounts[8].address, h.toWei("1000"))
    await tellor.connect(bigWallet).transfer(accounts[9].address, h.toWei("1000"))
    await tellor.connect(bigWallet).transfer(accounts[10].address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(oracle.address, h.toWei("1000000"))
    await tellor.connect(accounts[2]).approve(oracle.address, h.toWei("1000000"))
    await tellor.connect(accounts[3]).approve(oracle.address, h.toWei("1000000"))
    await tellor.connect(accounts[4]).approve(oracle.address, h.toWei("1000000"))
    await tellor.connect(accounts[5]).approve(oracle.address, h.toWei("1000000"))
    await tellor.connect(accounts[6]).approve(oracle.address, h.toWei("1000000"))
    await tellor.connect(accounts[7]).approve(oracle.address, h.toWei("1000000"))
    await tellor.connect(accounts[8]).approve(oracle.address, h.toWei("1000000"))
    await tellor.connect(accounts[9]).approve(oracle.address, h.toWei("1000000"))
    await tellor.connect(accounts[10]).approve(oracle.address, h.toWei("1000000"))
    await tellor.connect(bigWallet).approve(oracle.address, h.toWei("1000000"))

    for (let i = 1; i <= 10; i++) {
      await oracle.connect(accounts[i]).depositStake(h.toWei("200"))
    }

    for (i = 0; i<5; i++) {
      await tellor.connect(bigWallet).transfer(oracle.address, h.toWei("1")) // tb rewards

      await oracle.connect(accounts[1]).submitValue(h.uintTob32(1), h.uintTob32(100 + i), 0, '0x')
      await oracle.connect(accounts[2]).submitValue(h.uintTob32(2), h.uintTob32(200 + i), 0, '0x')
      await oracle.connect(accounts[3]).submitValue(h.uintTob32(3), h.uintTob32(300 + i), 0, '0x')
      await oracle.connect(accounts[4]).submitValue(h.uintTob32(4), h.uintTob32(400 + i), 0, '0x')
      await oracle.connect(accounts[5]).submitValue(h.uintTob32(5), h.uintTob32(500 + i), 0, '0x')
      await oracle.connect(accounts[6]).submitValue(h.uintTob32(6), h.uintTob32(600 + i), 0, '0x')
      await oracle.connect(accounts[7]).submitValue(h.uintTob32(7), h.uintTob32(700 + i), 0, '0x')
      await oracle.connect(accounts[8]).submitValue(h.uintTob32(8), h.uintTob32(800 + i), 0, '0x')
      await oracle.connect(accounts[9]).submitValue(h.uintTob32(9), h.uintTob32(900 + i), 0, '0x')
      await oracle.connect(accounts[10]).submitValue(h.uintTob32(10), h.uintTob32(1000 + i), 0, '0x')

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

    assert(await tellor.balanceOf(oracle.address) < 4000, "oracle balance should be 0")
    assert(totalStakeAmount == 0, "totalStakeAmount should be 0")
    assert(stakingRewardsBalance < 4000, "stakingRewardsBalance should be 0")
    assert(timeBasedRewardsBalance == 0, "timeBasedRewardsBalance should be 0")
    assert(oracleTokenPoolsSum == oracleBalance, "oracleTokenPoolsSum should be equal to oracleBalance")
    




    for (let i = 1; i <= 10; i++) {
      await oracle.connect(accounts[i]).depositStake(h.toWei("200"))
    }

    for (i = 0; i<5; i++) {
      await tellor.connect(bigWallet).transfer(oracle.address, h.toWei("1")) // tb rewards

      await oracle.connect(accounts[1]).submitValue(h.uintTob32(1), h.uintTob32(100 + i), 0, '0x')
      await oracle.connect(accounts[2]).submitValue(h.uintTob32(2), h.uintTob32(200 + i), 0, '0x')
      await oracle.connect(accounts[3]).submitValue(h.uintTob32(3), h.uintTob32(300 + i), 0, '0x')
      await oracle.connect(accounts[4]).submitValue(h.uintTob32(4), h.uintTob32(400 + i), 0, '0x')
      await oracle.connect(accounts[5]).submitValue(h.uintTob32(5), h.uintTob32(500 + i), 0, '0x')
      await oracle.connect(accounts[6]).submitValue(h.uintTob32(6), h.uintTob32(600 + i), 0, '0x')
      await oracle.connect(accounts[7]).submitValue(h.uintTob32(7), h.uintTob32(700 + i), 0, '0x')
      await oracle.connect(accounts[8]).submitValue(h.uintTob32(8), h.uintTob32(800 + i), 0, '0x')
      await oracle.connect(accounts[9]).submitValue(h.uintTob32(9), h.uintTob32(900 + i), 0, '0x')
      await oracle.connect(accounts[10]).submitValue(h.uintTob32(10), h.uintTob32(1000 + i), 0, '0x')

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

    assert(await tellor.balanceOf(oracle.address) < 4000, "oracle balance should be 0")
    assert(totalStakeAmount == 0, "totalStakeAmount should be 0")
    assert(stakingRewardsBalance < 4000, "stakingRewardsBalance should be 0")
    assert(timeBasedRewardsBalance == 0, "timeBasedRewardsBalance should be 0")
    assert(oracleTokenPoolsSum == oracleBalance, "oracleTokenPoolsSum should be equal to oracleBalance")


    for (let i = 1; i <= 10; i++) {
      await oracle.connect(accounts[i]).depositStake(h.toWei("200"))
    }

    for (i = 0; i<5; i++) {
      await tellor.connect(bigWallet).transfer(oracle.address, h.toWei("1")) // tb rewards

      await oracle.connect(accounts[1]).submitValue(h.uintTob32(1), h.uintTob32(100 + i), 0, '0x')
      await oracle.connect(accounts[2]).submitValue(h.uintTob32(2), h.uintTob32(200 + i), 0, '0x')
      await oracle.connect(accounts[3]).submitValue(h.uintTob32(3), h.uintTob32(300 + i), 0, '0x')
      await oracle.connect(accounts[4]).submitValue(h.uintTob32(4), h.uintTob32(400 + i), 0, '0x')
      await oracle.connect(accounts[5]).submitValue(h.uintTob32(5), h.uintTob32(500 + i), 0, '0x')
      await oracle.connect(accounts[6]).submitValue(h.uintTob32(6), h.uintTob32(600 + i), 0, '0x')
      await oracle.connect(accounts[7]).submitValue(h.uintTob32(7), h.uintTob32(700 + i), 0, '0x')
      await oracle.connect(accounts[8]).submitValue(h.uintTob32(8), h.uintTob32(800 + i), 0, '0x')
      await oracle.connect(accounts[9]).submitValue(h.uintTob32(9), h.uintTob32(900 + i), 0, '0x')
      await oracle.connect(accounts[10]).submitValue(h.uintTob32(10), h.uintTob32(1000 + i), 0, '0x')

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

    assert(await tellor.balanceOf(oracle.address) < 4000, "oracle balance should be 0")
    assert(totalStakeAmount == 0, "totalStakeAmount should be 0")
    assert(stakingRewardsBalance < 4000, "stakingRewardsBalance should be 0")
    assert(timeBasedRewardsBalance == 0, "timeBasedRewardsBalance should be 0")
    assert(oracleTokenPoolsSum == oracleBalance, "oracleTokenPoolsSum should be equal to oracleBalance")
  })

  it("usingtellor", async function() {
    // Setup
    await tellor.connect(bigWallet).transfer(accounts[1].address, h.toWei("2000"))
    await tellor.connect(accounts[1]).approve(oracle.address, h.toWei("1000"))
    await tellor.connect(accounts[1]).approve(governance.address, h.toWei("1000"))

    await oracle.connect(accounts[1]).depositStake(h.toWei("1000"))
    await oracle.connect(accounts[1]).submitValue(TRB_QUERY_ID, h.uintTob32(100), 0, TRB_QUERY_DATA)
    blocky0 = await h.getBlock()

    await h.advanceTime(86400)

    await oracle.connect(accounts[1]).submitValue(TRB_QUERY_ID, h.uintTob32(200), 0, TRB_QUERY_DATA)
    blocky1 = await h.getBlock()

    await h.advanceTime(86400)

    await oracle.connect(accounts[1]).submitValue(TRB_QUERY_ID, h.uintTob32(300), 0, TRB_QUERY_DATA)
    blocky2 = await h.getBlock()

    // test usingTellor functions

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
    assert(indexAfter[1] == 2, "indexAfter should be 2")

    // getIndexForDataBefore
    indexBefore = await usingTellorUser.getIndexForDataBefore(TRB_QUERY_ID, blocky1.timestamp)
    assert(indexBefore[0] == true, "found should be true")
    assert(indexBefore[1] == 0, "indexBefore should be 0")

    // getMultipleValuesBefore
    valuesBefore = await usingTellorUser.getMultipleValuesBefore(TRB_QUERY_ID, blocky2.timestamp, 86400*10, 3)
    assert(valuesBefore[0].length == 2)
    assert(valuesBefore[0][0] == h.uintTob32(100))
    assert(valuesBefore[0][1] == h.uintTob32(200))
    assert(valuesBefore[1].length == 2)
    assert(valuesBefore[1][0] == blocky0.timestamp)
    assert(valuesBefore[1][1] == blocky1.timestamp)

    // getNewValueCountbyQueryId
    newValueCount = await usingTellorUser.getNewValueCountbyQueryId(TRB_QUERY_ID)
    assert(newValueCount == 3, "newValueCount should be 3")

    // getReporterByTimestamp
    reporter = await usingTellorUser.getReporterByTimestamp(TRB_QUERY_ID, blocky1.timestamp)
    assert(reporter == accounts[1].address, "reporter address should be correct]")

    // getTimestampbyQueryIdandIndex
    timestamp = await usingTellorUser.getTimestampbyQueryIdandIndex(TRB_QUERY_ID, 1)
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

    oracleBalance = await tellor.balanceOf(oracle.address)
    totalStakeAmount = await oracle.totalStakeAmount()
    stakingRewardsBalance = await oracle.stakingRewardsBalance()
    timeBasedRewardsBalance = await oracle.getTotalTimeBasedRewardsBalance()
    oracleTokenPoolsSum = BigInt(totalStakeAmount) + BigInt(stakingRewardsBalance) + BigInt(timeBasedRewardsBalance)

    assert(oracleBalance < 2000, "oracleBalance should be less than min rounding error")
    assert(totalStakeAmount == 0, "totalStakeAmount should be 0")
    assert(stakingRewardsBalance < 2000, "stakingRewardsBalance should be less than min rounding error")
    assert(timeBasedRewardsBalance == 0, "timeBasedRewardsBalance should be 0")
    assert(oracleBalance == oracleTokenPoolsSum, "oracleBalance should be equal to oracleTokenPoolsSum")
  })
})



