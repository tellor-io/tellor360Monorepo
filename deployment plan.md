Deploy Tellor 360 Ehereum
1-Deploy flex (needs a governance address that will not exist yet)
2-Deploy autopay (with Flex address)
3-make sure you have a multis address for that network or deploy a multisig to get one
4-Deploy governance (with multisig and flex address)
5-Run INIT function on Flex to update the governance contract by owner only once 
6-Deploy 360 
8- Add staking rewards of 1 trb --add tx to monorepo deployment script

After deployment:
-Kick off vote 
-tallyVote
-executeVote
-init 360

What happens if there is a dispute right before the transition:
-governance tokens should have been transferred when 360 init is run
-figure out who won
-distribute dispute fee and stake amount

After the transition: 
-Report these to new oracle
-trb/usd
-proposed oracle address //fork test only
-autopay address // fork test only


-Setup montinors 
  *for the two query ids any time they are updated(trb/usd and autopay addresses)
  *monitor if anyone runs Tellor.FlexupdateStakeAmount

 


_queryId to track for notifications:
AutoPay addresses == "0xf68080e075e1f30766c3fc884c1ce4e6f99ed86d810d68ca9c7aed06eeb5f408"
Oracle address == "0x3594a64934b608e1e193a343f9827ab3923a636e6f52ca5e7ca72f0fd105ef83"
TRB/USD == "0x5c13cd9c97dbb98f2429c101a2a8150e6c7a0ddaff6124ee176a3a411067ded0"

Changes since last code review
- autopay(remove legacy queryids)
- 360 and transition (liquidy test and min stake amount, 3 month mint)
- Flex 
  * add staking rewards 1, 
  * staking reward rate could go down to zero on an edge case when it should not have (where a staker did not participate on all votes so their rewars were cut but instead it was set to zero so everyone else was not gettting paid out correctly)
Governance 
  * vote count before before penalizing so that when someone gets disputed they dont lose out on rewards bc they could not vote on their own dispute