// SPDX-License-Identifier: MIT  
pragma solidity ^0.8.0;  

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";  

contract Link is ERC20 {  
    constructor() ERC20("ChainLink", "LINK") {  
        _mint(msg.sender, 10000 * 10 ** decimals()); // Initial mint to deployer  
    }  

    // Mint function available only to the owner (for testing purposes)  
    function mint(address to, uint256 amount) public  {  
        _mint(to, amount);  
    }  
}  