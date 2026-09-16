// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 public value;
    constructor(uint256 _v) {
        value = _v;
    }
    function set(uint256 _v) public {
        value = _v;
    }
}
