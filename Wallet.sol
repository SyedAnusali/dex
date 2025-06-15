pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Wallet {
    using SafeMath for uint256;

    struct Token {
        bytes32 ticker;
        address tokenAddress;
    }

    bytes32[] public tokenList;
    mapping(bytes32 => Token) public tokenMapping;
    mapping(address => mapping(bytes32 => uint256)) public balances;

    function addToken(bytes32 ticker, address tokenAddress) external {
        tokenMapping[ticker] = Token(ticker, tokenAddress);
        tokenList.push(ticker);
    }

    function deposit(uint256 amount, bytes32 ticker) external {
        require(tokenMapping[ticker].tokenAddress != address(0), "Token not found");
        IERC20(tokenMapping[ticker].tokenAddress).transferFrom(msg.sender, address(this), amount);
        balances[msg.sender][ticker] = balances[msg.sender][ticker].add(amount);
    }

    function withdrawal(uint256 amount, bytes32 ticker) external {
        require(tokenMapping[ticker].tokenAddress != address(0), "Token not found");
        require(balances[msg.sender][ticker] >= amount, "Insufficient balance");
        IERC20(tokenMapping[ticker].tokenAddress).transfer(msg.sender, amount);
        balances[msg.sender][ticker] = balances[msg.sender][ticker].sub(amount);
    }
  
  event ETHDeposited(address indexed user, uint amount);  
 // Function to deposit ETH into the contract  
    function depositETH() external payable {  
        require(msg.value > 0, "Must send some ether");  
        
        // Update the balance mapping for the user  
        balances[msg.sender]["ETH"] += msg.value;  
        
        // Emit an event to log the deposit  
        emit ETHDeposited(msg.sender, msg.value);  
    }  

        


    }


