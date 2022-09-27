// SPDX-License-Identifier: MIT
pragma solidity 0.8.3;

import { UsingTellor } from "usingtellor/contracts/UsingTellor.sol";
import { MappingContractExample } from "usingtellor/contracts/mocks/MappingContractExample.sol";

contract UsingTellorUser is UsingTellor {
    constructor(address payable _tellorAddress) UsingTellor(_tellorAddress) {}
}