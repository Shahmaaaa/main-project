// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BlockAidToken
 * @dev ERC20 token for Block-Aid disaster relief donations
 */
contract BlockAidToken is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("BlockAid", "BAID") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
