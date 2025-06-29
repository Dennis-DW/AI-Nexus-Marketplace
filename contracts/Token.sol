// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AINexusToken is ERC20, Ownable {
    uint256 public constant TOKENS_PER_ETH = 1000 * 10**18; // 1000 tokens per ETH

    constructor() ERC20("AINexusToken", "ANX") {}

    // Anyone can buy tokens by sending ETH
    function buyTokens() public payable {
        require(msg.value > 0, "Send ETH to buy tokens");
        uint256 amount = msg.value * TOKENS_PER_ETH / 1 ether;
        _mint(msg.sender, amount);
    }

    // Owner can mint tokens to any address (for testing/demo)
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Owner can withdraw collected ETH
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
} 