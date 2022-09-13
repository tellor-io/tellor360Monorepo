const { expect } = require("chai");
const h = require("./helpers/helpers");
var assert = require('assert');
const web3 = require('web3');
const { ethers } = require("hardhat");
const { keccak256 } = require("ethers/lib/utils");

describe("Function Tests - BaseToken", function() {

  // rinkeby
  const tellorMaster = "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0"
  const DEV_WALLET = "0x2F51C4Bf6B66634187214A695be6CDd344d4e9d1"
  const BIGWALLET = "0x41c5a04f61b865e084e5f502ff322ad624cad609"
  const CURR_GOV = "0xA64Bb0078eB80c97484f3f09Adb47b9B73CBcA00"
  const REPORTER = "0x0D4F81320d36d7B7Cf5fE7d1D547f63EcBD1a3E0"
  const TELLORX_ORACLE = "0x18431fd88adF138e8b979A7246eb58EA7126ea16"
  // tellor360
  const ORACLE360 = "0x745fA45150e97Af36D665b69a7e79d27C860d276"
  const GOVERNANCE360 = "0x84BE96a2fc0FAe87Dd097A9C3353529981c88d91"
  const AUTOPAY360 = "0xc450bEBF13281cAC512dfc3DC4c01c241d3a6EBf"
  const TELLOR360 = "0x9c1cF6Ef70D42CC2449DE3E29C664F235D6D4470"
  const QUERY_DATA_STORAGE = "0x9F2D4C53ebE3fF84F1C456E3E96622cEb4584265"

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

  it("vote with autopay user address", async function() {
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

    devWalletBal = await tellor.balanceOf(devWallet.address)
    // expectedTokenholders = BigInt(await tellor.balanceOf(devWallet.address)) + BigInt(h.toWei("1000"))

    // voteInfo = await governance.getVoteInfo(1)
    // assert(voteInfo[1][8] == h.toWei("1000"), "users doesSupport vote weight not updated correctly")
    // assert(voteInfo[1][5] == expectedTokenholders, "tokenholders doesSupport vote weight not updated correctly")
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

  // it("vote on upgrade proposal", async function() {
  //   await 
  // })
})