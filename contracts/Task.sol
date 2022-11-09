pragma solidity 0.8.17;

// Find a way to add your address in `winners`.
contract Task {
    bool locked;
    address[] public winners;

    function add(address winner) public {
        locked = false;

        msg.sender.call("");

        require(locked);
        winners.push(winner);
    }

    function lock() public {
        locked = true;
    }
}
