// SPDX-License-Identifier: MIT

import { Tellor360 } from "tellor360/contracts/Tellor360.sol";
import { TellorFlex } from "tellorflex/contracts/TellorFlex.sol";
import { Governance } from "polygongovernance/contracts/Governance.sol";
import { Autopay } from "autopay/contracts/Autopay.sol";
import { QueryDataStorage } from "autopay/contracts/QueryDataStorage.sol";
import { ITellor } from "tellor360/contracts/oldContracts/contracts/interfaces/ITellor.sol";
import { UsingTellorUser } from "./testing/UsingTellorUser.sol";

pragma solidity 0.8.3;

contract ImporterContract {}